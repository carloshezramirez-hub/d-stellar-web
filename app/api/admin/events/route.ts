import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { createEvent } from "@/lib/events-db";
import type { EventRecord } from "@/lib/events-types";

// El español es el locale por default con `localePrefix: "as-needed"`
// (routing.ts) — la URL pública es "/events" sin prefijo, pero el árbol de
// rutas real (app/[locale]/events) resuelve internamente como "/es/events".
// revalidatePath("/events") no estaba invalidando esa página porque el
// cache de Next se indexa por la ruta interna resuelta, no por la URL
// externa — por eso un evento nuevo aparecía en /en/events (ruta explícita)
// pero nunca en /events (el que de verdad ve casi todo el público).
function revalidateEventPaths(slug: string) {
  revalidatePath("/events");
  revalidatePath("/es/events");
  revalidatePath("/en/events");
  revalidatePath(`/events/${slug}`);
  revalidatePath(`/es/events/${slug}`);
  revalidatePath(`/en/events/${slug}`);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSession(session)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let input: EventRecord;
  try {
    input = (await request.json()) as EventRecord;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const event = await createEvent(input);
    revalidateEventPaths(event.slug);
    return NextResponse.json({ event });
  } catch (err) {
    console.error("[api/admin/events] create", err);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
