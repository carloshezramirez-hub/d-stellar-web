import { NextResponse } from "next/server";
import { getLoyaltyMemberBySerial } from "@/lib/wallet/loyalty-db";
import { registerDevice, unregisterDevice } from "@/lib/wallet/device-db";
import { isValidPassAuth } from "@/lib/wallet/web-service-auth";
import { appleWalletEnv } from "@/lib/wallet/env";

type Params = { deviceLibraryIdentifier: string; passTypeIdentifier: string; serialNumber: string };

// Protocolo PassKit web service — ver
// https://developer.apple.com/documentation/walletpasses/add-a-web-service-to-update-passes
export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = await params;
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const pushToken = typeof body === "object" && body !== null ? (body as Record<string, unknown>).pushToken : undefined;
  if (typeof pushToken !== "string" || !pushToken) {
    return NextResponse.json({ error: "missing_push_token" }, { status: 400 });
  }

  const { alreadyRegistered } = await registerDevice({ deviceLibraryIdentifier, loyaltyMemberId: member.id, pushToken });
  return new NextResponse(null, { status: alreadyRegistered ? 200 : 201 });
}

export async function DELETE(request: Request, { params }: { params: Promise<Params> }) {
  const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = await params;
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

  await unregisterDevice({ deviceLibraryIdentifier, loyaltyMemberId: member.id });
  return new NextResponse(null, { status: 200 });
}
