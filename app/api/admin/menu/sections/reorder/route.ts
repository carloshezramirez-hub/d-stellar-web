import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { reorderMenuSections } from "@/lib/menu-db";
import { revalidateMenuPaths } from "@/lib/admin/revalidate-content";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let slugs: string[];
  try {
    ({ slugs } = await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    await reorderMenuSections(slugs);
    revalidateMenuPaths();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/menu/sections/reorder]", err);
    return NextResponse.json({ error: "reorder_failed" }, { status: 500 });
  }
}
