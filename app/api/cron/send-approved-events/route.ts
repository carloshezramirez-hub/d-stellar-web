import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron-auth";
import { getEventLeadsDb, type EventLead } from "@/lib/event-leads-db";
import { sendEventOutreach } from "@/lib/prospecting/resend-mailer";

export const dynamic = "force-dynamic";

/**
 * Manda SOLO los leads que Carlos ya aprobó a mano (status='approved',
 * cambiado directamente en Supabase Studio tras revisar el borrador). El
 * cron de prospección nunca pone un lead en 'approved' — ese paso es
 * humano a propósito (ver plan de la sesión: "modo borrador primero").
 */
export async function GET(request: Request) {
  const authError = checkCronAuth(request);
  if (authError) return authError;

  const supabase = getEventLeadsDb();
  const { data: leads, error } = await supabase.from("event_leads").select("*").eq("status", "approved");

  if (error) {
    console.error("[cron/send-approved-events]", error.message);
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  let sent = 0;
  const failures: string[] = [];

  for (const lead of (leads ?? []) as EventLead[]) {
    if (!lead.contact_email || !lead.ai_subject || !lead.ai_body) {
      failures.push(`${lead.business_name}: falta email o correo generado`);
      continue;
    }

    try {
      await sendEventOutreach({
        to: lead.contact_email,
        subject: lead.ai_subject,
        body: lead.ai_body,
        leadId: lead.id,
      });

      await supabase.from("event_leads").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", lead.id);
      sent++;
    } catch (err) {
      console.error(`[cron/send-approved-events] ${lead.business_name}:`, err);
      failures.push(lead.business_name);
    }
  }

  return NextResponse.json({ sent, failures });
}
