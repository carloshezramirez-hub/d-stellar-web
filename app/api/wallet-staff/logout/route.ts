import { NextResponse } from "next/server";
import { WALLET_STAFF_SESSION_COOKIE } from "@/lib/wallet/staff-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(WALLET_STAFF_SESSION_COOKIE, "", { path: "/wallet-staff", maxAge: 0 });
  return response;
}
