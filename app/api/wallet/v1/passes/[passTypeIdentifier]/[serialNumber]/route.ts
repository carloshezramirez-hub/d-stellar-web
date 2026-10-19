import { NextResponse } from "next/server";
import { getLoyaltyMemberBySerial } from "@/lib/wallet/loyalty-db";
import { buildAppleLoyaltyPass } from "@/lib/wallet/apple-pass";
import { isValidPassAuth } from "@/lib/wallet/web-service-auth";
import { appleWalletEnv } from "@/lib/wallet/env";

export const runtime = "nodejs";

type Params = { passTypeIdentifier: string; serialNumber: string };

// GET .../passes/{passTypeId}/{serialNumber} — Wallet llama esto después de
// recibir el push silencioso, para bajar la versión más reciente del pase.
export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { passTypeIdentifier, serialNumber } = await params;
  const certs = appleWalletEnv();
  if (!certs || passTypeIdentifier !== certs.passTypeIdentifier) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const member = await getLoyaltyMemberBySerial(serialNumber);
  if (!member) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (!isValidPassAuth(request, member.auth_token)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const lastModified = new Date(member.updated_at);
  const ifModifiedSince = request.headers.get("if-modified-since");
  if (ifModifiedSince && new Date(ifModifiedSince) >= lastModified) {
    return new NextResponse(null, { status: 304 });
  }

  try {
    const buffer = await buildAppleLoyaltyPass(member);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Last-Modified": lastModified.toUTCString(),
      },
    });
  } catch (err) {
    console.error("[api/wallet/v1/passes]", err);
    return NextResponse.json({ error: "pass_generation_failed" }, { status: 500 });
  }
}
