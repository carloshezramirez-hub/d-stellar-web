import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidStaffSessionCookie, WALLET_STAFF_SESSION_COOKIE } from "@/lib/wallet/staff-auth";
import { listAllLoyaltyMembers } from "@/lib/wallet/loyalty-db";
import { tierForLifetimeStamps } from "@/lib/wallet/tiers";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(WALLET_STAFF_SESSION_COOKIE)?.value;
  if (!isValidStaffSessionCookie(session)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const members = await listAllLoyaltyMembers();

  return NextResponse.json({
    members: members.map((m) => ({
      name: m.name,
      phone: m.phone,
      email: m.email,
      locale: m.locale,
      stamps: m.stamps,
      stamps_required: m.stamps_required,
      lifetime_stamps: m.lifetime_stamps,
      tier: tierForLifetimeStamps(m.lifetime_stamps).label[m.locale],
      created_at: m.created_at,
    })),
  });
}
