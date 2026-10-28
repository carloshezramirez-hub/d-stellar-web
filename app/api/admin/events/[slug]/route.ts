import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { updateEvent, deleteEvent } from "@/lib/events-db";
import type { EventRecord } from "@/lib/events-types";

// Mismo gotcha que en app/api/admin/events/route.ts: "/events" (español,
// sin prefijo por `localePrefix: "as-needed"`) resuelve internamente como
// "/es/events" — revalidatePath necesita esa ruta explícita o el cache de
// la versión en español nunca se invalida.
function revalidateEventPaths(slug: string) {
  revalidatePath("/events");
  revalidatePath("/es/events");
  revalidatePath("/en/events");
  revalidatePath(`/events/${slug}`);
  revalidatePath(`/es/events/${slug}`);
  revalidatePath(`/en/events/${slug}`);
}

async function requireSession() {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug: currentSlug } = await params;

  let input: EventRecord;
  try {
    input = (await request.json()) as EventRecord;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const event = await updateEvent(currentSlug, input);
    revalidateEventPaths(currentSlug);
    if (event.slug !== currentSlug) revalidateEventPaths(event.slug);
    return NextResponse.json({ event });
  } catch (err) {
    console.error("[api/admin/events/:slug] update", err);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await params;

  try {
    await deleteEvent(slug);
    revalidateEventPaths(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/events/:slug] delete", err);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
