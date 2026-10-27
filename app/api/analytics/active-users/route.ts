import { NextResponse } from "next/server";
import { isGa4Configured } from "@/lib/google/env";
import { fetchActiveUsers } from "@/lib/google/analytics";

// Pública a propósito (sin cookie de admin) — solo expone un conteo, nada
// sensible, para el badge "gente conectada" del home. Cacheada 20s para no
// pegarle a GA4 en cada render del widget mientras hace polling.
export const revalidate = 20;

export async function GET() {
  if (!isGa4Configured()) {
    return NextResponse.json({ activeUsers: null }, { status: 200 });
  }
  try {
    const activeUsers = await fetchActiveUsers();
    return NextResponse.json({ activeUsers });
  } catch (err) {
    console.error("[api/analytics/active-users]", err);
    return NextResponse.json({ activeUsers: null }, { status: 200 });
  }
}
