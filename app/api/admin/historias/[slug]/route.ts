import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { updateMonthlyStory, deleteMonthlyStory } from "@/lib/historias-db";
import type { MonthlyStory } from "@/lib/historias-types";

function revalidateHistoriaPaths(slug: string) {
  for (const path of ["/historias", "/es/historias", "/en/historias", `/historias/${slug}`, `/es/historias/${slug}`, `/en/historias/${slug}`]) {
    revalidatePath(path);
  }
}

async function requireSession() {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await requireSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { slug: currentSlug } = await params;

  let input: MonthlyStory;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    await updateMonthlyStory(currentSlug, input);
    revalidateHistoriaPaths(currentSlug);
    if (input.slug !== currentSlug) revalidateHistoriaPaths(input.slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/historias/:slug] update", err);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await requireSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { slug } = await params;

  try {
    await deleteMonthlyStory(slug);
    revalidateHistoriaPaths(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/historias/:slug] delete", err);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
