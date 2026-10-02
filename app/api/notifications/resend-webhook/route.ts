import { NextResponse } from "next/server";
import { verifyResendWebhook } from "@/lib/notifications/resend-webhook-verify";
import { markEmailStatusByResendId, type EmailDeliveryStatus } from "@/lib/orders-db";

type ResendEvent = {
  type: string;
  data?: { email_id?: string };
};

const EVENT_TO_STATUS: Record<string, EmailDeliveryStatus> = {
  "email.delivered": "sent",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.delivery_delayed": "pending",
};

/**
 * Recibe los eventos de entrega de Resend (solo para los correos de pago —
 * ver lib/notifications/resend-mailer.ts) y actualiza el estado en
 * web_orders por email_id, así /pedidos muestra "rebotó" o "va a spam" sin
 * que Carlos tenga que revisar la bandeja manualmente.
 *
 * Configurar en el dashboard de Resend: Webhooks → Add Endpoint →
 * https://www.d-stellar.co/api/notifications/resend-webhook, eventos
 * email.delivered / email.bounced / email.complained / email.delivery_delayed.
 * Copiar el "Signing Secret" (whsec_...) a RESEND_WEBHOOK_SECRET en Vercel.
 */
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[api/notifications/resend-webhook] RESEND_WEBHOOK_SECRET not set — ignoring event.");
    return NextResponse.json({ ok: true, ignored: true });
  }

  const payload = await request.text();
  const valid = verifyResendWebhook(
    payload,
    {
      svixId: request.headers.get("svix-id"),
      svixTimestamp: request.headers.get("svix-timestamp"),
      svixSignature: request.headers.get("svix-signature"),
    },
    secret,
  );

  if (!valid) {
    console.error("[api/notifications/resend-webhook] invalid signature");
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const status = EVENT_TO_STATUS[event.type];
  const emailId = event.data?.email_id;
  if (!status || !emailId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    await markEmailStatusByResendId(emailId, status);
  } catch (err) {
    console.error("[api/notifications/resend-webhook] failed to update order", err);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
