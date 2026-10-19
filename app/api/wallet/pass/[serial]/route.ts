import { NextResponse } from "next/server";
import { getLoyaltyMemberBySerial } from "@/lib/wallet/loyalty-db";
import { buildAppleLoyaltyPass } from "@/lib/wallet/apple-pass";
import { isAppleWalletConfigured } from "@/lib/wallet/env";

// passkit-generator firma con node-forge/crypto y lee archivos del disco —
// necesita el runtime de Node, no edge.
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ serial: string }> }) {
  const { serial } = await params;

  if (!isAppleWalletConfigured()) {
    return NextResponse.json({ error: "apple_wallet_not_configured" }, { status: 503 });
  }

  const member = await getLoyaltyMemberBySerial(serial);
  if (!member) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const buffer = await buildAppleLoyaltyPass(member);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": "attachment; filename=d-stellar-fidelidad.pkpass",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[api/wallet/pass]", err);
    return NextResponse.json({ error: "pass_generation_failed" }, { status: 500 });
  }
}
