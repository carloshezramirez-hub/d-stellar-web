import { NextResponse } from "next/server";
import { WebhookSignatureValidator } from "mercadopago";
import { mercadoPagoEnv } from "@/lib/payments/env";
import { getPayment } from "@/lib/payments/mercadopago";
import { sendPaymentMail } from "@/lib/notifications/resend-mailer";
import { emailEnv } from "@/lib/notifications/env";
import { buildPickupCustomerEmail, buildPickupOwnerEmail } from "@/lib/notifications/templates";
import { insertOrderIfNew, updateEmailStatus } from "@/lib/orders-db";
import { buildPickupWebOrder } from "@/lib/orders-from-payment";
import type { PickupOrderFormValues } from "@/lib/pickup-schema";

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
      console.error("[api/pickup/webhook] invalid signature", err);
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  } else {
    console.warn("[api/pickup/webhook] MP_WEBHOOK_SECRET not set — skipping signature verification.");
  }

  let payment;
  try {
    payment = await getPayment(paymentId);
  } catch (err) {
    console.error("[api/pickup/webhook] fetch payment failed", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }

  if (payment.status !== "approved") {
    return NextResponse.json({ ok: true, status: payment.status });
  }

  const newOrder = buildPickupWebOrder(payment, paymentId);
  const { order, isNew } = await insertOrderIfNew(newOrder);

  if (!isNew) {
    // Mercado Pago ya reintentó este webhook y el pedido ya se procesó —
    // no reenviar los correos (antes esto causaba envíos duplicados).
    return NextResponse.json({ ok: true, code: newOrder.code, duplicate: true });
  }

  const metadata = (payment.metadata ?? {}) as Record<string, string>;
  let items: PickupOrderFormValues["items"] = [];
  try {
    items = JSON.parse(metadata.items ?? "[]");
  } catch {
    console.error("[api/pickup/webhook] could not parse items metadata for payment", paymentId);
  }

  if (!metadata.email || items.length === 0) {
    console.error("[api/pickup/webhook] missing order metadata for payment", paymentId);
    return NextResponse.json({ ok: true, warning: "missing_metadata" });
  }

  const data: PickupOrderFormValues = {
    name: metadata.name ?? "",
    email: metadata.email,
    phone: metadata.phone ?? "",
    date: metadata.date ?? "",
    time: metadata.time ?? "",
    notes: metadata.notes || undefined,
    items,
  };

  const safeLocale = metadata.locale === "en" ? "en" : "es";
  const paymentInfo = { amountMXN: payment.transaction_amount ?? 0, paymentId };
  const ownerEmail = buildPickupOwnerEmail(data, newOrder.code, paymentInfo);
  const customerEmail = buildPickupCustomerEmail(data, newOrder.code, safeLocale, paymentInfo);

  const [ownerResult, customerResult] = await Promise.allSettled([
    sendPaymentMail({
      to: emailEnv.notificationTo ?? "sweetuniversecompany@gmail.com",
      subject: ownerEmail.subject,
      html: ownerEmail.html,
      replyTo: data.email,
    }),
    sendPaymentMail({ to: data.email, subject: customerEmail.subject, html: customerEmail.html }),
  ]);

  const statusUpdate: Parameters<typeof updateEmailStatus>[1] = {};
  if (ownerResult.status === "fulfilled") {
    statusUpdate.email_owner_status = "sent";
    statusUpdate.email_owner_resend_id = ownerResult.value.id;
  } else {
    statusUpdate.email_owner_status = "failed";
    console.error("[api/pickup/webhook] owner email failed", ownerResult.reason);
  }
  if (customerResult.status === "fulfilled") {
    statusUpdate.email_customer_status = "sent";
    statusUpdate.email_customer_resend_id = customerResult.value.id;
  } else {
    statusUpdate.email_customer_status = "failed";
    console.error("[api/pickup/webhook] customer email failed", customerResult.reason);
  }

  try {
    await updateEmailStatus(order.id, statusUpdate);
  } catch (err) {
    console.error("[api/pickup/webhook] failed to update email status", err);
  }

  return NextResponse.json({ ok: true, code: newOrder.code });
}
