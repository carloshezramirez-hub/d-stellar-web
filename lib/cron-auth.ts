import { NextResponse } from "next/server";

/**
 * Verifica el llamador del cron contra CRON_SECRET, aceptando dos formas:
 * - header `x-cron-secret` (llamadas manuales)
 * - header `Authorization: Bearer <CRON_SECRET>` (formato que Vercel Cron
 *   Jobs manda automáticamente — ver vercel.json)
 */
export function checkCronAuth(request: Request): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const provided = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  const bearerMatches = authHeader === `Bearer ${expected}`;

  if (provided !== expected && !bearerMatches) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  return null;
}
