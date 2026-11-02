import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { upsertMenuItem, deleteMenuItem } from "@/lib/menu-db";
import { revalidateMenuPaths } from "@/lib/admin/revalidate-content";
import type { MenuItem } from "@/lib/menu-types";

async function requireSession() {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function PUT(request: Request, { params }: { params: Promise<{ section: string; slug: string }> }) {
  if (!(await requireSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { section, slug } = await params;

  let item: MenuItem;
  try {
    item = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    await upsertMenuItem(section, slug, item);
    revalidateMenuPaths();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/menu/items/:section/:slug] update", err);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ section: string; slug: string }> }) {
  if (!(await requireSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { section, slug } = await params;

  try {
    await deleteMenuItem(section, slug);
    revalidateMenuPaths();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/menu/items/:section/:slug] delete", err);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
