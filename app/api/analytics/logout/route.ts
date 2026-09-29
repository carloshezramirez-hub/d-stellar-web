import { NextResponse } from "next/server";
import { ANALYTICS_SESSION_COOKIE } from "@/lib/social/dashboard-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ANALYTICS_SESSION_COOKIE, "", { path: "/analytics", maxAge: 0 });
  return response;
}
