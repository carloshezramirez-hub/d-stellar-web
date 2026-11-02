import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { reorderPressMentions } from "@/lib/press-db";
import { revalidatePressPaths } from "@/lib/admin/revalidate-content";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let ids: string[];
  try {
    ({ ids } = await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    await reorderPressMentions(ids);
    revalidatePressPaths();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/press/reorder]", err);
    return NextResponse.json({ error: "reorder_failed" }, { status: 500 });
  }
}
