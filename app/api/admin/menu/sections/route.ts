import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { createMenuSection } from "@/lib/menu-db";
import { revalidateMenuPaths } from "@/lib/admin/revalidate-content";
import type { MenuSection } from "@/lib/menu-types";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let input: Omit<MenuSection, "items">;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    await createMenuSection(input);
    revalidateMenuPaths();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/menu/sections] create", err);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
