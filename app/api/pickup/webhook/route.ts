import { NextResponse } from "next/server";
import { WebhookSignatureValidator } from "mercadopago";
import { mercadoPagoEnv } from "@/lib/payments/env";
import { getPickupPayment } from "@/lib/payments/mercadopago";
import { sendMail } from "@/lib/notifications/mailer";
import { emailEnv } from "@/lib/notifications/env";
import { buildPickupCustomerEmail, buildPickupOwnerEmail } from "@/lib/notifications/templates";
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
    payment = await getPickupPayment(paymentId);
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

  const ownerEmail = buildPickupOwnerEmail(data, code, paymentInfo);
  const customerEmail = buildPickupCustomerEmail(data, code, safeLocale, paymentInfo);

  const results = await Promise.allSettled([
    sendMail({
      to: emailEnv.notificationTo ?? "sweetuniversecompany@gmail.com",
      subject: ownerEmail.subject,
      html: ownerEmail.html,
      replyTo: data.email,
    }),
    sendMail({ to: data.email, subject: customerEmail.subject, html: customerEmail.html }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[api/pickup/webhook]", result.reason);
    }
  }

  return NextResponse.json({ ok: true, code });
}
