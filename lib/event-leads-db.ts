import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con service_role key — SOLO servidor (cron routes).
 * Nunca importar este módulo desde un componente cliente.
 */
let _client: SupabaseClient | null = null;

export function getEventLeadsDb(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Supabase no está configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    }
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}

export type EventLeadSegment = "marca" | "corporativo" | "comunidad" | "particulares";

export type EventLeadStatus =
  | "prospected"
  | "drafted"
  | "skipped_no_evidence"
  | "skipped_no_email"
  | "approved"
  | "sent"
  | "replied"
  | "rejected"
  | "booked";

export interface EventLead {
  id: string;
  place_id: string;
  business_name: string;
  category: string;
  segment: EventLeadSegment;
  formatted_address: string | null;
  lat: number | null;
  lng: number | null;
  website: string | null;
  phone: string | null;
  walking_distance_m: number | null;
  walking_duration_min: number | null;
  rating: number | null;
  review_count: number | null;
  contact_email: string | null;
  contact_name: string | null;
  ai_subject: string | null;
  ai_body: string | null;
  ai_evidence_line: string | null;
  ai_what_we_checked: string[] | null;
  ai_confidence: number | null;
  ai_gate_passed: boolean | null;
  ai_generated_at: string | null;
  status: EventLeadStatus;
  created_at: string;
  sent_at: string | null;
}
