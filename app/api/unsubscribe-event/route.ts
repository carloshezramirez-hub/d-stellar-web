import { NextResponse } from "next/server";
import { getEventLeadsDb } from "@/lib/event-leads-db";

/**
 * One-click unsubscribe (List-Unsubscribe header) para el outreach de
 * eventos privados. Marca el lead como 'rejected' — sin exponer ni
 * requerir nada más que su propio id, que ya venía en el link del correo.
 */
async function markRejected(leadId: string | null) {
  if (!leadId) return NextResponse.json({ error: "missing_lead" }, { status: 400 });

  const { error } = await getEventLeadsDb().from("event_leads").update({ status: "rejected" }).eq("id", leadId);
  if (error) {
    console.error("[api/unsubscribe-event]", error.message);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const leadId = new URL(request.url).searchParams.get("lead");
  return markRejected(leadId);
}

// List-Unsubscribe-Post: One-Click hace que los clientes de correo llamen
// con POST en vez de GET.
export async function POST(request: Request) {
  const leadId = new URL(request.url).searchParams.get("lead");
  return markRejected(leadId);
}
