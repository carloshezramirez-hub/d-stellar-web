import { NextResponse } from "next/server";
import { analyticsDashboardEnv } from "@/lib/social/env";
import { ORDERS_SESSION_COOKIE, ORDERS_SESSION_MAX_AGE, createOrdersSessionCookieValue } from "@/lib/orders-auth";

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

  const cookieValue = createOrdersSessionCookieValue();
  if (!cookieValue) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ORDERS_SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ORDERS_SESSION_MAX_AGE,
    path: "/pedidos",
  });
  return response;
}
