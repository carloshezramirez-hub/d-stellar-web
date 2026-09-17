import { NextResponse } from "next/server";
import { pickupOrderSchema } from "@/lib/pickup-schema";
import { generateOrderCode } from "@/lib/notifications/reservation-code";
import { emailEnv } from "@/lib/notifications/env";
import { sendMail } from "@/lib/notifications/mailer";
import { buildPickupCustomerEmail, buildPickupOwnerEmail } from "@/lib/notifications/templates";
import { isMercadoPagoConfigured } from "@/lib/payments/env";
import { createPickupPreference } from "@/lib/payments/mercadopago";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { website, locale, ...rest } = body as Record<string, unknown>;

  // Honeypot field: real users never fill it. Pretend success so bots move on.
  if (typeof website === "string" && website.length > 0) {
    return NextResponse.json({ ok: true, code: generateOrderCode("DS") });
  }

  const parsed = pickupOrderSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const code = generateOrderCode("DS");
  const safeLocale = locale === "en" ? "en" : "es";

  // With Mercado Pago configured, payment happens online first — the
  // "order received" / "new pickup order" emails only go out once the
  // webhook confirms the payment (see app/api/pickup/webhook/route.ts).
  // Without it, fall back to the original "pay at pickup" flow and notify
  // immediately, same as before this integration existed.
  if (isMercadoPagoConfigured()) {
    try {
      const { initPoint } = await createPickupPreference(data, code, safeLocale);
      return NextResponse.json({ ok: true, code, checkoutUrl: initPoint });
    } catch (err) {
      console.error("[api/pickup] mercadopago", err);
      return NextResponse.json({ error: "payment_setup_failed" }, { status: 502 });
    }
  }

  const ownerEmail = buildPickupOwnerEmail(data, code);
  const customerEmail = buildPickupCustomerEmail(data, code, safeLocale);

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
      console.error("[api/pickup]", result.reason);
    }
  }

  return NextResponse.json({ ok: true, code });
}
