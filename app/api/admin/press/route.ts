import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { createPressMention } from "@/lib/press-db";
import { revalidatePressPaths } from "@/lib/admin/revalidate-content";
import type { PressMention } from "@/lib/press-types";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let input: PressMention;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    await createPressMention(input);
    revalidatePressPaths();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/press] create", err);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
