import { NextResponse } from "next/server";
import { getUpdatedSerialsForDevice } from "@/lib/wallet/device-db";
import { appleWalletEnv } from "@/lib/wallet/env";

type Params = { deviceLibraryIdentifier: string; passTypeIdentifier: string };

// GET .../registrations/{passTypeId}?passesUpdatedSince={tag} — le dice a
// Wallet qué pases de este dispositivo cambiaron desde la última vez.
export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { deviceLibraryIdentifier, passTypeIdentifier } = await params;
  const certs = appleWalletEnv();
  if (!certs || passTypeIdentifier !== certs.passTypeIdentifier) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("passesUpdatedSince");

  const { serialNumbers, lastUpdated } = await getUpdatedSerialsForDevice(deviceLibraryIdentifier, since);
  if (serialNumbers.length === 0) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ lastUpdated, serialNumbers });
}
