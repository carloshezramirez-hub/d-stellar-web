import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { updatePressMention, deletePressMention } from "@/lib/press-db";
import { revalidatePressPaths } from "@/lib/admin/revalidate-content";
import type { PressMention } from "@/lib/press-types";

async function requireSession() {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  let input: PressMention;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    await updatePressMention(id, input);
    revalidatePressPaths();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/press/:id] update", err);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    await deletePressMention(id);
    revalidatePressPaths();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/press/:id] delete", err);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
