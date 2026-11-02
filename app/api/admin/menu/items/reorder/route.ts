import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { reorderMenuItems } from "@/lib/menu-db";
import { revalidateMenuPaths } from "@/lib/admin/revalidate-content";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let sectionSlug: string;
  let slugs: string[];
  try {
    ({ sectionSlug, slugs } = await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    await reorderMenuItems(sectionSlug, slugs);
    revalidateMenuPaths();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/menu/items/reorder]", err);
    return NextResponse.json({ error: "reorder_failed" }, { status: 500 });
  }
}
