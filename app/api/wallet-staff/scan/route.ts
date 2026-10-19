import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { getLoyaltyMemberBySerial, incrementStamp, redeemAndReset } from "@/lib/wallet/loyalty-db";
import { getDevicesForMember } from "@/lib/wallet/device-db";
import { sendPassUpdatePushToAll } from "@/lib/wallet/apns";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSession(session)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { serial, action } = (body ?? {}) as Record<string, unknown>;
  if (typeof serial !== "string" || (action !== "stamp" && action !== "redeem")) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const existing = await getLoyaltyMemberBySerial(serial);
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const member = action === "redeem" ? await redeemAndReset(serial) : await incrementStamp(serial);
  if (!member) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Avisarle a Wallet que este pase cambió — best-effort, no bloquea la
  // respuesta al staff si algún push individual falla.
  const devices = await getDevicesForMember(member.id);
  if (devices.length > 0) {
    void sendPassUpdatePushToAll(devices.map((d) => d.push_token)).then((results) => {
      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) console.error("[api/wallet-staff/scan] push falló para", failed);
    });
  }

  return NextResponse.json({
    ok: true,
    member: { name: member.name, stamps: member.stamps, stamps_required: member.stamps_required },
  });
}
