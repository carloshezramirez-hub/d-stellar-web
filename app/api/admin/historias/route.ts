import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { createMonthlyStory } from "@/lib/historias-db";
import type { MonthlyStory } from "@/lib/historias-types";

// Mismo gotcha que eventos/menú: "/historias" en español resuelve
// internamente como "/es/historias" por `localePrefix: "as-needed"`.
function revalidateHistoriaPaths(slug: string) {
  for (const path of ["/historias", "/es/historias", "/en/historias", `/historias/${slug}`, `/es/historias/${slug}`, `/en/historias/${slug}`]) {
    revalidatePath(path);
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let input: MonthlyStory;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    await createMonthlyStory(input);
    revalidateHistoriaPaths(input.slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/historias] create", err);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
