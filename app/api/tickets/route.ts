import { NextResponse } from "next/server";
import { ticketOrderSchema } from "@/lib/ticket-schema";
import { generateOrderCode } from "@/lib/notifications/reservation-code";
import { emailEnv } from "@/lib/notifications/env";
import { sendMail } from "@/lib/notifications/mailer";
import { buildTicketCustomerEmail, buildTicketOwnerEmail, type TicketOrderData } from "@/lib/notifications/ticket-templates";
import { isMercadoPagoConfigured } from "@/lib/payments/env";
import { createTicketPreference } from "@/lib/payments/mercadopago";
import { getEvent } from "@/data/events";
import { formatEventDate } from "@/lib/event-date";

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
    return NextResponse.json({ ok: true, code: generateOrderCode("TIX") });
  }

  const parsed = ticketOrderSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }

  const { eventSlug, ticketIndex, qty, ...buyer } = parsed.data;
  const safeLocale = locale === "en" ? "en" : "es";

  // Look up the event and ticket server-side rather than trusting a
  // client-supplied price — the client only picks an index.
  const event = getEvent(eventSlug);
  const ticket = event?.tickets?.[ticketIndex];
  if (!event || !ticket || event.status !== "upcoming") {
    return NextResponse.json({ error: "invalid_ticket" }, { status: 400 });
  }

  const code = generateOrderCode("TIX");
  const orderData: TicketOrderData = {
    eventTitle: event.title,
    ticketName: ticket.name[safeLocale],
    dateLabel: formatEventDate(event, safeLocale),
    qty,
    unitPriceMXN: ticket.priceMXN,
    name: buyer.name,
    email: buyer.email,
    phone: buyer.phone,
    notes: buyer.notes,
  };

  // Same pattern as pickup: with Mercado Pago configured, payment happens
  // online first and the confirmation emails only go out once the webhook
  // confirms the payment. Without it, fall back to notifying immediately
  // so local dev keeps working without credentials.
  if (isMercadoPagoConfigured()) {
    try {
      const { initPoint } = await createTicketPreference(orderData, event.slug, ticketIndex, code, safeLocale);
      return NextResponse.json({ ok: true, code, checkoutUrl: initPoint });
    } catch (err) {
      console.error("[api/tickets] mercadopago", err);
      return NextResponse.json({ error: "payment_setup_failed" }, { status: 502 });
    }
  }

  const ownerEmail = buildTicketOwnerEmail(orderData, code);
  const customerEmail = buildTicketCustomerEmail(orderData, code, safeLocale);

  const results = await Promise.allSettled([
    sendMail({
      to: emailEnv.notificationTo ?? "sweetuniversecompany@gmail.com",
      subject: ownerEmail.subject,
      html: ownerEmail.html,
      replyTo: orderData.email,
    }),
    sendMail({ to: orderData.email, subject: customerEmail.subject, html: customerEmail.html }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[api/tickets]", result.reason);
    }
  }

  return NextResponse.json({ ok: true, code });
}
