import { NextResponse } from "next/server";
import { ORDERS_SESSION_COOKIE } from "@/lib/orders-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ORDERS_SESSION_COOKIE, "", { path: "/pedidos", maxAge: 0 });
  return response;
}
