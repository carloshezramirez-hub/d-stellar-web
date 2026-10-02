import { NextResponse } from "next/server";
import { WebhookSignatureValidator } from "mercadopago";
import { mercadoPagoEnv } from "@/lib/payments/env";
import { getPayment } from "@/lib/payments/mercadopago";
import { sendPaymentMail } from "@/lib/notifications/resend-mailer";
import { emailEnv } from "@/lib/notifications/env";
import { buildPickupCustomerEmail, buildPickupOwnerEmail } from "@/lib/notifications/templates";
import { insertOrderIfNew, updateEmailStatus, type NewWebOrder } from "@/lib/orders-db";
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

  const metadata = (payment.metadata ?? {}) as Record<string, string>;
  const code = metadata.code || payment.external_reference || paymentId;

  let items: PickupOrderFormValues["items"] = [];
  try {
    items = JSON.parse(metadata.items ?? "[]");
  } catch {
    console.error("[api/pickup/webhook] could not parse items metadata for payment", paymentId);
  }

  // Pedido pagado pero con metadata incompleta (caso raro) — igual se deja
  // un registro mínimo en web_orders para que quede en el historial, en vez
  // de perderse en silencio como antes.
  if (!metadata.email || items.length === 0) {
    console.error("[api/pickup/webhook] missing order metadata for payment", paymentId);
    try {
      await insertOrderIfNew({
        kind: "pickup",
        code,
        payment_id: paymentId,
        amount_mxn: payment.transaction_amount ?? 0,
        currency: "MXN",
        concept: "Pickup · metadata incompleta (revisar manualmente)",
        items: metadata,
        event_slug: null,
        session_date_iso: null,
        customer_name: metadata.name || null,
        customer_email: metadata.email || "sin-email@d-stellar.co",
        customer_phone: metadata.phone || null,
        locale: metadata.locale === "en" ? "en" : "es",
        notes: metadata.notes || null,
        raw_metadata: metadata,
      });
    } catch (err) {
      console.error("[api/pickup/webhook] failed to persist degraded order", err);
    }
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
  const itemsSummary = items.map((line) => `${line.qty}x ${line.name}`).join(", ");

  const newOrder: NewWebOrder = {
    kind: "pickup",
    code,
    payment_id: paymentId,
    amount_mxn: paymentInfo.amountMXN,
    currency: "MXN",
    concept: `Pickup · ${itemsSummary}`,
    // date/time van dentro de items (no hay columna propia para eso) para
    // poder reconstruir el PickupOrderFormValues exacto al reenviar el
    // correo desde /pedidos.
    items: { date: data.date, time: data.time, lines: items },
    event_slug: null,
    session_date_iso: null,
    customer_name: data.name || null,
    customer_email: data.email,
    customer_phone: data.phone || null,
    locale: safeLocale,
    notes: data.notes || null,
    raw_metadata: metadata,
  };

  const { order, isNew } = await insertOrderIfNew(newOrder);

  if (!isNew) {
    // Mercado Pago ya reintentó este webhook y el pedido ya se procesó —
    // no reenviar los correos (antes esto causaba envíos duplicados).
    return NextResponse.json({ ok: true, code, duplicate: true });
  }

  const ownerEmail = buildPickupOwnerEmail(data, code, paymentInfo);
  const customerEmail = buildPickupCustomerEmail(data, code, safeLocale, paymentInfo);

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

  return NextResponse.json({ ok: true, code });
}
