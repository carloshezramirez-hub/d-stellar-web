import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron-auth";
import { touchAllLoyaltyMembers } from "@/lib/wallet/loyalty-db";
import { getAllDevices } from "@/lib/wallet/device-db";
import { sendPassUpdatePushToAll } from "@/lib/wallet/apns";
import { isAppleWalletConfigured } from "@/lib/wallet/env";

export const runtime = "nodejs";

// Rota la "frase del día" del geofence (ver lib/wallet/relevant-phrases.ts)
// empujando a Wallet a volver a pedir cada pase ya instalado, aunque el
// conteo de sellos no haya cambiado — ver vercel.json para el horario.
export async function GET(request: Request) {
  const authError = checkCronAuth(request);
  if (authError) return authError;

  if (!isAppleWalletConfigured()) {
    return NextResponse.json({ ok: true, skipped: "apple_wallet_not_configured" });
  }

  await touchAllLoyaltyMembers();
  const devices = await getAllDevices();
  const results = await sendPassUpdatePushToAll(devices.map((d) => d.push_token));
  const failed = results.filter((r) => !r.ok);

  return NextResponse.json({ ok: true, devices: devices.length, failed: failed.length });
}
