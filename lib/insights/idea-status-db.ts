import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getIdeaStatusDb(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase no está configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}

export type IdeaStatus = "pending" | "in_progress" | "done";

/** Mapa id→status — solo guarda el estado, nunca el texto de la idea (eso siempre se recalcula en vivo desde los datos reales). */
export async function listIdeaStatuses(): Promise<Record<string, IdeaStatus>> {
  const db = getIdeaStatusDb();
  const { data, error } = await db.from("idea_statuses").select("id, status");
  if (error) throw error;
  const map: Record<string, IdeaStatus> = {};
  for (const row of data ?? []) map[row.id] = row.status as IdeaStatus;
  return map;
}

export async function setIdeaStatus(id: string, status: IdeaStatus): Promise<void> {
  const db = getIdeaStatusDb();
  const { error } = await db.from("idea_statuses").upsert({ id, status, updated_at: new Date().toISOString() });
  if (error) throw error;
}
