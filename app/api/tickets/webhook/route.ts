import { NextResponse } from "next/server";
import { WebhookSignatureValidator } from "mercadopago";
import { mercadoPagoEnv } from "@/lib/payments/env";
import { getPayment } from "@/lib/payments/mercadopago";
import { getMetadataValue } from "@/lib/payments/metadata";
import { sendPaymentMail } from "@/lib/notifications/resend-mailer";
import { emailEnv } from "@/lib/notifications/env";
import { buildTicketCustomerEmail, buildTicketOwnerEmail, type TicketOrderData } from "@/lib/notifications/ticket-templates";
import { insertOrderIfNew, updateEmailStatus, type NewWebOrder } from "@/lib/orders-db";
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

  const metadata = (payment.metadata ?? {}) as Record<string, string>;
  const get = (key: string) => getMetadataValue(metadata, key);
  const code = get("code") || payment.external_reference || paymentId;
  const safeLocale = get("locale") === "en" ? "en" : "es";
  const eventSlug = get("eventSlug");
  const email = get("email");

  const event = eventSlug ? getEvent(eventSlug) : undefined;
  const ticket = event?.tickets?.[Number(get("ticketIndex"))];

  // Pedido pagado pero con metadata incompleta (caso raro) — igual se deja
  // un registro mínimo en web_orders para que quede en el historial, en vez
  // de perderse en silencio como antes.
  if (!event || !ticket || !email) {
    console.error("[api/tickets/webhook] missing order metadata for payment", paymentId, metadata);
    try {
      await insertOrderIfNew({
        kind: "ticket",
        code,
        payment_id: paymentId,
        amount_mxn: payment.transaction_amount ?? 0,
        currency: "MXN",
        concept: "Boleto · metadata incompleta (revisar manualmente)",
        items: metadata,
        event_slug: eventSlug || null,
        session_date_iso: get("sessionDateISO") || null,
        customer_name: get("name") || null,
        customer_email: email || "sin-email@d-stellar.co",
        customer_phone: get("phone") || null,
        locale: safeLocale,
        notes: get("notes") || null,
        raw_metadata: metadata,
      });
    } catch (err) {
      console.error("[api/tickets/webhook] failed to persist degraded order", err);
    }
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

  const newOrder: NewWebOrder = {
    kind: "ticket",
    code,
    payment_id: paymentId,
    amount_mxn: paymentInfo.amountMXN,
    currency: "MXN",
    concept: `${orderData.eventTitle} · ${orderData.qty}x ${orderData.ticketName}`,
    // Guarda todo lo necesario para reconstruir el TicketOrderData exacto al
    // reenviar el correo desde /pedidos, sin depender de que data/events.ts
    // siga teniendo el mismo evento/boleto más adelante.
    items: {
      eventTitle: orderData.eventTitle,
      ticketName: orderData.ticketName,
      dateLabel: orderData.dateLabel,
      qty: orderData.qty,
      unitPriceMXN: orderData.unitPriceMXN,
      eventSlug,
      ticketIndex: Number(get("ticketIndex")),
    },
    event_slug: eventSlug || null,
    session_date_iso: get("sessionDateISO") || null,
    customer_name: orderData.name || null,
    customer_email: orderData.email,
    customer_phone: orderData.phone || null,
    locale: safeLocale,
    notes: orderData.notes || null,
    raw_metadata: metadata,
  };

  const { order, isNew } = await insertOrderIfNew(newOrder);

  if (!isNew) {
    // Mercado Pago ya reintentó este webhook y el pedido ya se procesó —
    // no reenviar los correos (antes esto causaba envíos duplicados).
    return NextResponse.json({ ok: true, code, duplicate: true });
  }

  const ownerEmail = buildTicketOwnerEmail(orderData, code, paymentInfo);
  const customerEmail = buildTicketCustomerEmail(orderData, code, safeLocale, paymentInfo);

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

  return NextResponse.json({ ok: true, code });
}
