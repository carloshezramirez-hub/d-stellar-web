import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con service_role key — SOLO servidor (cron routes).
 * Nunca importar este módulo desde un componente cliente.
 */
let _client: SupabaseClient | null = null;

export function getSocialDb(): SupabaseClient {
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

export type SocialPlatform = "instagram" | "facebook" | "tiktok";

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  handle: string;
  external_id: string | null;
  created_at: string;
}

export interface SocialPost {
  id: string;
  account_id: string;
  platform_post_id: string;
  permalink: string | null;
  caption: string | null;
  media_type: string | null;
  posted_at: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface SocialMetricsSnapshot {
  id: string;
  post_id: string;
  captured_at: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  reach: number | null;
  engagement_rate: number | null;
  avg_watch_time_seconds: number | null;
  total_watch_time_seconds: number | null;
}

export interface SocialAccountSnapshot {
  id: string;
  account_id: string;
  captured_at: string;
  followers: number | null;
}

/** Encuentra o crea la cuenta rastreada para una plataforma+handle. */
export async function upsertSocialAccount(
  platform: SocialPlatform,
  handle: string,
  externalId?: string,
): Promise<SocialAccount> {
  const db = getSocialDb();
  const { data, error } = await db
    .from("social_accounts")
    .upsert({ platform, handle, external_id: externalId ?? null }, { onConflict: "platform,handle" })
    .select()
    .single();
  if (error) throw error;
  return data as SocialAccount;
}

/** Encuentra o crea el post rastreado (por account_id + id nativo de la plataforma) y actualiza sus metadatos. */
export async function upsertSocialPost(
  accountId: string,
  platformPostId: string,
  fields: Partial<Pick<SocialPost, "permalink" | "caption" | "media_type" | "posted_at" | "thumbnail_url">>,
): Promise<SocialPost> {
  const db = getSocialDb();
  const { data, error } = await db
    .from("social_posts")
    .upsert(
      { account_id: accountId, platform_post_id: platformPostId, ...fields },
      { onConflict: "account_id,platform_post_id" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as SocialPost;
}

/** Agrega una nueva foto de métricas para un post — cada corrida del cron inserta una fila nueva, nunca sobreescribe, para poder graficar tendencia. */
export async function insertMetricsSnapshot(
  postId: string,
  metrics: Partial<Omit<SocialMetricsSnapshot, "id" | "post_id" | "captured_at">>,
): Promise<void> {
  const db = getSocialDb();
  const { error } = await db.from("social_metrics_snapshots").insert({ post_id: postId, ...metrics });
  if (error) throw error;
}
