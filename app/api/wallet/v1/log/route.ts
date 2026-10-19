import { NextResponse } from "next/server";

// Apple Wallet manda aquí sus logs de depuración cuando algo del protocolo
// falla del lado del dispositivo — solo los registramos, no hay nada que
// devolver.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const logs = typeof body === "object" && body !== null ? (body as Record<string, unknown>).logs : undefined;
    if (Array.isArray(logs)) {
      console.warn("[api/wallet/v1/log]", logs.join("\n"));
    }
  } catch {
    // ignore malformed payloads — this endpoint is best-effort
  }
  return new NextResponse(null, { status: 200 });
}
