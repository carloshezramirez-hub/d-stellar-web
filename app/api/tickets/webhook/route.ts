import { NextResponse } from "next/server";
import { WebhookSignatureValidator } from "mercadopago";
import { mercadoPagoEnv } from "@/lib/payments/env";
import { getPayment } from "@/lib/payments/mercadopago";
import { getMetadataValue } from "@/lib/payments/metadata";
import { sendPaymentMail } from "@/lib/notifications/resend-mailer";
import { emailEnv } from "@/lib/notifications/env";
import { buildTicketCustomerEmail, buildTicketOwnerEmail, type TicketOrderData } from "@/lib/notifications/ticket-templates";
import { insertOrderIfNew, updateEmailStatus } from "@/lib/orders-db";
import { buildTicketWebOrder } from "@/lib/orders-from-payment";
import { getEvent } from "@/data/events";
import { resolveOrderDateLabel } from "@/lib/event-date";

type NotificationBody = { type?: string; data?: { id?: string }; id?: string };

export async function POST(request: Request) {
  const url = new URL(request.url);
  let body: NotificationBody = {};
  try {
    body = await request.json();
  } catch {
    // Mercado Pago sometimes pings with an empty body; query params still
    // carry the type/id in that case.
  }

  const type = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? body.type;
  const paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? body.data?.id ?? body.id;

  if (type !== "payment" || !paymentId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (mercadoPagoEnv.webhookSecret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId: paymentId,
        secret: mercadoPagoEnv.webhookSecret,
        toleranceSeconds: 300,
      });
    } catch (err) {
      console.error("[api/tickets/webhook] invalid signature", err);
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  } else {
    console.warn("[api/tickets/webhook] MP_WEBHOOK_SECRET not set — skipping signature verification.");
  }

  let payment;
  try {
    payment = await getPayment(paymentId);
  } catch (err) {
    console.error("[api/tickets/webhook] fetch payment failed", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }

  if (payment.status !== "approved") {
    return NextResponse.json({ ok: true, status: payment.status });
  }

  const newOrder = buildTicketWebOrder(payment, paymentId);
  const { order, isNew } = await insertOrderIfNew(newOrder);

  if (!isNew) {
    // Mercado Pago ya reintentó este webhook y el pedido ya se procesó —
    // no reenviar los correos (antes esto causaba envíos duplicados).
    return NextResponse.json({ ok: true, code: newOrder.code, duplicate: true });
  }

  const metadata = (payment.metadata ?? {}) as Record<string, string>;
  const get = (key: string) => getMetadataValue(metadata, key);
  const safeLocale = get("locale") === "en" ? "en" : "es";
  const eventSlug = get("eventSlug");
  const email = get("email");
  const event = eventSlug ? getEvent(eventSlug) : undefined;
  const ticket = event?.tickets?.[Number(get("ticketIndex"))];

  if (!event || !ticket || !email) {
    console.error("[api/tickets/webhook] missing order metadata for payment", paymentId, metadata);
    return NextResponse.json({ ok: true, warning: "missing_metadata" });
  }

  const orderData: TicketOrderData = {
    eventTitle: event.title,
    ticketName: ticket.name[safeLocale],
    dateLabel: resolveOrderDateLabel(event, get("sessionDateISO") || undefined, safeLocale),
    qty: Number(get("qty")) || 1,
    unitPriceMXN: ticket.priceMXN,
    name: get("name") ?? "",
    email,
    phone: get("phone") ?? "",
    notes: get("notes") || undefined,
  };

  const paymentInfo = { amountMXN: payment.transaction_amount ?? 0, paymentId };
  const ownerEmail = buildTicketOwnerEmail(orderData, newOrder.code, paymentInfo);
  const customerEmail = buildTicketCustomerEmail(orderData, newOrder.code, safeLocale, paymentInfo);

  const [ownerResult, customerResult] = await Promise.allSettled([
    sendPaymentMail({
      to: emailEnv.notificationTo ?? "sweetuniversecompany@gmail.com",
      subject: ownerEmail.subject,
      html: ownerEmail.html,
      replyTo: orderData.email,
    }),
    sendPaymentMail({ to: orderData.email, subject: customerEmail.subject, html: customerEmail.html }),
  ]);

  const statusUpdate: Parameters<typeof updateEmailStatus>[1] = {};
  if (ownerResult.status === "fulfilled") {
    statusUpdate.email_owner_status = "sent";
    statusUpdate.email_owner_resend_id = ownerResult.value.id;
  } else {
    statusUpdate.email_owner_status = "failed";
    console.error("[api/tickets/webhook] owner email failed", ownerResult.reason);
  }
  if (customerResult.status === "fulfilled") {
    statusUpdate.email_customer_status = "sent";
    statusUpdate.email_customer_resend_id = customerResult.value.id;
  } else {
    statusUpdate.email_customer_status = "failed";
    console.error("[api/tickets/webhook] customer email failed", customerResult.reason);
  }

  try {
    await updateEmailStatus(order.id, statusUpdate);
  } catch (err) {
    console.error("[api/tickets/webhook] failed to update email status", err);
  }

  return NextResponse.json({ ok: true, code: newOrder.code });
}
