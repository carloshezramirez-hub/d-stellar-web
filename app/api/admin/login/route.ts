import { NextResponse } from "next/server";
import { analyticsDashboardEnv } from "@/lib/social/env";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE, createAdminSessionCookieValue } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const password = typeof body === "object" && body !== null ? (body as Record<string, unknown>).password : undefined;

  if (!analyticsDashboardEnv.password || password !== analyticsDashboardEnv.password) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const cookieValue = createAdminSessionCookieValue();
  if (!cookieValue) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}
