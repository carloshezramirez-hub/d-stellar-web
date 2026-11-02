import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PressMention } from "@/lib/press-types";

let _client: SupabaseClient | null = null;

function getPressDb(): SupabaseClient {
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

export function isPressDbConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

interface PressRow {
  id: string;
  outlet: string;
  logo: string | null;
  title: string;
  url: string;
  date_label: { es: string; en: string };
  summary: { es: string; en: string };
  sort_order: number;
}

function rowToMention(row: PressRow): PressMention & { id: string } {
  return {
    id: row.id,
    outlet: row.outlet,
    logo: row.logo ?? undefined,
    title: row.title,
    url: row.url,
    dateLabel: row.date_label,
    summary: row.summary,
  };
}

export async function listPress(): Promise<Array<PressMention & { id: string }>> {
  if (!isPressDbConfigured()) return [];
  const db = getPressDb();
  const { data, error } = await db.from("press_mentions").select().order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data as PressRow[]) ?? []).map(rowToMention);
}

export async function createPressMention(input: PressMention): Promise<void> {
  const db = getPressDb();
  const { data: existing } = await db.from("press_mentions").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const nextOrder = existing?.[0] ? Number(existing[0].sort_order) + 1 : 0;
  const { error } = await db.from("press_mentions").insert({
    outlet: input.outlet,
    logo: input.logo ?? null,
    title: input.title,
    url: input.url,
    date_label: input.dateLabel,
    summary: input.summary,
    sort_order: nextOrder,
  });
  if (error) throw error;
}

export async function updatePressMention(id: string, input: PressMention): Promise<void> {
  const db = getPressDb();
  const { error } = await db
    .from("press_mentions")
    .update({
      outlet: input.outlet,
      logo: input.logo ?? null,
      title: input.title,
      url: input.url,
      date_label: input.dateLabel,
      summary: input.summary,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deletePressMention(id: string): Promise<void> {
  const db = getPressDb();
  const { error } = await db.from("press_mentions").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderPressMentions(idsInOrder: string[]): Promise<void> {
  const db = getPressDb();
  await Promise.all(idsInOrder.map((id, index) => db.from("press_mentions").update({ sort_order: index }).eq("id", id)));
}

export type { PressMention } from "@/lib/press-types";
