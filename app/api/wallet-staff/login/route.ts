import { NextResponse } from "next/server";
import { createStaffSessionCookieValue, walletStaffEnv, WALLET_STAFF_SESSION_COOKIE, WALLET_STAFF_SESSION_MAX_AGE } from "@/lib/wallet/staff-auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const password = typeof body === "object" && body !== null ? (body as Record<string, unknown>).password : undefined;

  if (!walletStaffEnv.password || password !== walletStaffEnv.password) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const cookieValue = createStaffSessionCookieValue();
  if (!cookieValue) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(WALLET_STAFF_SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: WALLET_STAFF_SESSION_MAX_AGE,
    path: "/wallet-staff",
  });
  return response;
}
