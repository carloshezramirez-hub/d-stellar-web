import { NextResponse } from "next/server";
import { privateEventInquirySchema } from "@/lib/private-event-schema";
import { emailEnv } from "@/lib/notifications/env";
import { sendMail } from "@/lib/notifications/mailer";
import { buildPrivateEventCustomerEmail, buildPrivateEventOwnerEmail } from "@/lib/notifications/private-event-templates";

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
    return NextResponse.json({ ok: true });
  }

  const parsed = privateEventInquirySchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const safeLocale = locale === "en" ? "en" : "es";

  const ownerEmail = buildPrivateEventOwnerEmail(data);
  const customerEmail = buildPrivateEventCustomerEmail(data, safeLocale);

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
      console.error("[api/private-events]", result.reason);
    }
  }

  return NextResponse.json({ ok: true });
}
