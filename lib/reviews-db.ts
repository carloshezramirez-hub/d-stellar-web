import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ReviewQuote, ReviewStats } from "@/lib/reviews-types";

let _client: SupabaseClient | null = null;

function getReviewsDb(): SupabaseClient {
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

export function isReviewsDbConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

interface ReviewRow {
  id: string;
  author: string;
  rating: number;
  quote: string;
  sort_order: number;
}

function rowToReview(row: ReviewRow): ReviewQuote & { id: string } {
  return { id: row.id, author: row.author, rating: row.rating as 1 | 2 | 3 | 4 | 5, quote: row.quote };
}

export async function listReviews(): Promise<Array<ReviewQuote & { id: string }>> {
  if (!isReviewsDbConfigured()) return [];
  const db = getReviewsDb();
  const { data, error } = await db.from("reviews").select().order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data as ReviewRow[]) ?? []).map(rowToReview);
}

export async function getReviewStats(): Promise<ReviewStats> {
  if (!isReviewsDbConfigured()) return { average: 0, count: 0 };
  const db = getReviewsDb();
  const { data, error } = await db.from("review_stats").select().eq("id", 1).maybeSingle();
  if (error) throw error;
  return data ? { average: Number(data.average), count: Number(data.count) } : { average: 0, count: 0 };
}

export async function updateReviewStats(stats: ReviewStats): Promise<void> {
  const db = getReviewsDb();
  const { error } = await db
    .from("review_stats")
    .update({ average: stats.average, count: stats.count, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw error;
}

export async function createReview(input: ReviewQuote): Promise<void> {
  const db = getReviewsDb();
  const { data: existing } = await db.from("reviews").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const nextOrder = existing?.[0] ? Number(existing[0].sort_order) + 1 : 0;
  const { error } = await db.from("reviews").insert({ author: input.author, rating: input.rating, quote: input.quote, sort_order: nextOrder });
  if (error) throw error;
}

export async function updateReview(id: string, input: ReviewQuote): Promise<void> {
  const db = getReviewsDb();
  const { error } = await db
    .from("reviews")
    .update({ author: input.author, rating: input.rating, quote: input.quote, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const db = getReviewsDb();
  const { error } = await db.from("reviews").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderReviews(idsInOrder: string[]): Promise<void> {
  const db = getReviewsDb();
  await Promise.all(idsInOrder.map((id, index) => db.from("reviews").update({ sort_order: index }).eq("id", id)));
}

export type { ReviewQuote, ReviewStats } from "@/lib/reviews-types";
