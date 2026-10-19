import { NextResponse } from "next/server";
import { loyaltySignupSchema } from "@/lib/wallet/loyalty-schema";
import { createLoyaltyMember } from "@/lib/wallet/loyalty-db";
import { isAppleWalletConfigured } from "@/lib/wallet/env";

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

  const { website, ...rest } = body as Record<string, unknown>;

  // Honeypot field: real users never fill it. Pretend success so bots move on.
  if (typeof website === "string" && website.length > 0) {
    return NextResponse.json({ ok: true, passUrl: "/api/wallet/pass/00000000-0000-0000-0000-000000000000" });
  }

  const parsed = loyaltySignupSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }

  if (!isAppleWalletConfigured()) {
    return NextResponse.json({ error: "apple_wallet_not_configured" }, { status: 503 });
  }

  try {
    const member = await createLoyaltyMember(parsed.data);
    return NextResponse.json({ ok: true, passUrl: `/api/wallet/pass/${member.serial_number}` });
  } catch (err) {
    console.error("[api/wallet/signup]", err);
    return NextResponse.json({ error: "signup_failed" }, { status: 500 });
  }
}
