import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { getLoyaltyMemberBySerial } from "@/lib/wallet/loyalty-db";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSession(session)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const serial = searchParams.get("serial");
  if (!serial) {
    return NextResponse.json({ error: "missing_serial" }, { status: 400 });
  }

  const member = await getLoyaltyMemberBySerial(serial);
  if (!member) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    name: member.name,
    stamps: member.stamps,
    stamps_required: member.stamps_required,
  });
}
