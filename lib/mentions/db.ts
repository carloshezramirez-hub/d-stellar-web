import { getSocialDb } from "@/lib/social/db";
import type { AlertMention } from "./google-alerts";

/** Inserta menciones nuevas — `url` es unique, así que una mención ya vista se ignora (no se actualiza, no se duplica). */
export async function upsertMentions(searchTerm: string, mentions: AlertMention[]): Promise<number> {
  if (mentions.length === 0) return 0;
  const db = getSocialDb();

  const { error, count } = await db
    .from("brand_mentions")
    .upsert(
      mentions.map((m) => ({
        source: "google_alert",
        search_term: searchTerm,
        title: m.title,
        url: m.url,
        domain: m.domain,
        snippet: m.snippet,
        published_at: m.publishedAt,
      })),
      { onConflict: "url", ignoreDuplicates: true, count: "exact" },
    );
  if (error) throw error;
  return count ?? 0;
}

export interface BrandMention {
  id: string;
  searchTerm: string;
  title: string | null;
  url: string;
  domain: string | null;
  snippet: string | null;
  publishedAt: string | null;
}

export async function getRecentMentions(limit = 50): Promise<BrandMention[]> {
  const db = getSocialDb();
  const { data, error } = await db
    .from("brand_mentions")
    .select("id, search_term, title, url, domain, snippet, published_at")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    searchTerm: row.search_term,
    title: row.title,
    url: row.url,
    domain: row.domain,
    snippet: row.snippet,
    publishedAt: row.published_at,
  }));
}
