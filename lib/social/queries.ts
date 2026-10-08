import { getSocialDb, type SocialPlatform } from "./db";

export interface LatestAccountStats {
  platform: SocialPlatform;
  handle: string;
  followers: number | null;
  totalLikes: number | null;
  videoCount: number | null;
  capturedAt: string;
}

/** Última foto de cada cuenta rastreada, para las tarjetas de resumen del dashboard. */
export async function getLatestAccountStats(): Promise<LatestAccountStats[]> {
  const db = getSocialDb();

  const { data: accounts, error: accountsError } = await db.from("social_accounts").select("id, platform, handle");
  if (accountsError) throw accountsError;
  if (!accounts || accounts.length === 0) return [];

  const results: LatestAccountStats[] = [];
  for (const account of accounts) {
    const { data: snapshot, error } = await db
      .from("social_account_snapshots")
      .select("followers, total_likes, video_count, captured_at")
      .eq("account_id", account.id)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!snapshot) continue;

    results.push({
      platform: account.platform,
      handle: account.handle,
      followers: snapshot.followers,
      totalLikes: snapshot.total_likes,
      videoCount: snapshot.video_count,
      capturedAt: snapshot.captured_at,
    });
  }

  return results;
}

export interface FeedPost {
  id: string;
  platform: SocialPlatform;
  handle: string;
  platformPostId: string;
  permalink: string | null;
  caption: string | null;
  mediaType: string | null;
  postedAt: string | null;
  thumbnailUrl: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  reach: number | null;
  avgWatchTimeSeconds: number | null;
  totalWatchTimeSeconds: number | null;
  completionRate: number | null;
  skipRate: number | null;
}

/** Publicaciones ordenadas de más reciente a más vieja, con su última foto de métricas — para la vista día-por-día del dashboard. Ver la vista `social_posts_latest_metrics` en Supabase. */
export async function getPostsFeed(limit = 200): Promise<FeedPost[]> {
  const db = getSocialDb();
  const { data, error } = await db
    .from("social_posts_latest_metrics")
    .select(
      "id, platform, handle, platform_post_id, permalink, caption, media_type, posted_at, thumbnail_url, views, likes, comments, shares, saves, reach, avg_watch_time_seconds, total_watch_time_seconds, completion_rate, skip_rate",
    )
    .order("posted_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    platform: row.platform,
    handle: row.handle,
    platformPostId: row.platform_post_id,
    permalink: row.permalink,
    caption: row.caption,
    mediaType: row.media_type,
    postedAt: row.posted_at,
    thumbnailUrl: row.thumbnail_url,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    saves: row.saves,
    reach: row.reach,
    avgWatchTimeSeconds: row.avg_watch_time_seconds,
    totalWatchTimeSeconds: row.total_watch_time_seconds,
    completionRate: row.completion_rate,
    skipRate: row.skip_rate,
  }));
}
