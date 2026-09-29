// Cliente de Meta Graph API (Instagram Insights + Facebook Page Insights) —
// usa el token del System User "d-stellar Analytics Bot" (no expira, ver
// memoria del proyecto). Ese token actúa como token de usuario: para leer
// posts/reacciones de la Página hace falta cambiarlo por un Page Access
// Token vía /{page-id}?fields=access_token (getPageAccessToken).
import { metaEnv } from "./env";

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

interface GraphInsightValue {
  name: string;
  values: { value: number }[];
}

interface GraphError {
  error?: { message?: string };
}

async function graphFetch<T>(url: string): Promise<T & GraphError> {
  const res = await fetch(url);
  const json = (await res.json()) as T & GraphError;
  if (!res.ok || json.error) {
    throw new Error(`meta_graph_error: ${json.error?.message ?? res.statusText}`);
  }
  return json;
}

/** Limita concurrencia para no disparar cientos de requests a la vez contra Graph API. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// ---------- Instagram ----------

export interface IgMedia {
  id: string;
  caption?: string;
  media_type: string;
  media_product_type: string; // "REELS" | "FEED" | "CAROUSEL_ALBUM" | ...
  timestamp: string;
  permalink: string;
  thumbnail_url?: string;
}

const REELS_METRICS =
  "views,reach,likes,comments,shares,saved,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time";
const FEED_METRICS = "reach,saved,likes,comments,shares,total_interactions";

/** Trae todos los media de la cuenta, paginando. Si se pasa sinceDate, corta en cuanto un post es más viejo (el edge viene ordenado del más nuevo al más viejo). */
export async function fetchInstagramMedia(sinceDate?: Date): Promise<IgMedia[]> {
  const accountId = metaEnv.igAccountId!;
  const items: IgMedia[] = [];
  let url: string | null =
    `${GRAPH_BASE}/${accountId}/media?fields=id,caption,media_type,media_product_type,timestamp,permalink,thumbnail_url&limit=50&access_token=${metaEnv.accessToken}`;

  while (url) {
    const json: { data: IgMedia[]; paging?: { next?: string } } = await graphFetch(url);
    let hitOlder = false;
    for (const item of json.data) {
      if (sinceDate && new Date(item.timestamp) < sinceDate) {
        hitOlder = true;
        break;
      }
      items.push(item);
    }
    if (hitOlder) break;
    url = json.paging?.next ?? null;
  }
  return items;
}

export interface IgInsightValues {
  views?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saved?: number;
  totalInteractions?: number;
  avgWatchTimeMs?: number;
  totalWatchTimeMs?: number;
}

/** Insights de un media individual. Devuelve {} si Graph API rechaza la métrica (posts viejos a veces no soportan todo) — no tumba el cron por un solo post. */
export async function fetchInstagramMediaInsights(media: IgMedia): Promise<IgInsightValues> {
  const metrics = media.media_product_type === "REELS" ? REELS_METRICS : FEED_METRICS;
  const url = `${GRAPH_BASE}/${media.id}/insights?metric=${metrics}&access_token=${metaEnv.accessToken}`;

  let json: { data: GraphInsightValue[] };
  try {
    json = await graphFetch<{ data: GraphInsightValue[] }>(url);
  } catch {
    return {};
  }

  const out: IgInsightValues = {};
  for (const m of json.data ?? []) {
    const value = m.values?.[0]?.value;
    if (value === undefined) continue;
    switch (m.name) {
      case "views":
        out.views = value;
        break;
      case "reach":
        out.reach = value;
        break;
      case "likes":
        out.likes = value;
        break;
      case "comments":
        out.comments = value;
        break;
      case "shares":
        out.shares = value;
        break;
      case "saved":
        out.saved = value;
        break;
      case "total_interactions":
        out.totalInteractions = value;
        break;
      case "ig_reels_avg_watch_time":
        out.avgWatchTimeMs = value;
        break;
      case "ig_reels_video_view_total_time":
        out.totalWatchTimeMs = value;
        break;
    }
  }
  return out;
}

export interface IgAccountStats {
  followersCount: number;
  mediaCount: number;
}

export async function fetchInstagramAccountStats(): Promise<IgAccountStats> {
  const json = await graphFetch<{ followers_count: number; media_count: number }>(
    `${GRAPH_BASE}/${metaEnv.igAccountId}?fields=followers_count,media_count&access_token=${metaEnv.accessToken}`,
  );
  return { followersCount: json.followers_count, mediaCount: json.media_count };
}

// ---------- Facebook ----------

let cachedPageToken: string | null = null;

async function getPageAccessToken(): Promise<string> {
  if (cachedPageToken) return cachedPageToken;
  const json = await graphFetch<{ access_token: string }>(
    `${GRAPH_BASE}/${metaEnv.pageId}?fields=access_token&access_token=${metaEnv.accessToken}`,
  );
  cachedPageToken = json.access_token;
  return cachedPageToken;
}

export interface FbPageStats {
  followersCount: number;
}

export async function fetchFacebookPageStats(): Promise<FbPageStats> {
  const pageToken = await getPageAccessToken();
  const json = await graphFetch<{ fan_count: number }>(
    `${GRAPH_BASE}/${metaEnv.pageId}?fields=fan_count&access_token=${pageToken}`,
  );
  return { followersCount: json.fan_count };
}

export interface FbPost {
  id: string;
  message?: string;
  created_time: string;
  permalink_url: string;
}

export async function fetchFacebookPosts(sinceDate?: Date): Promise<FbPost[]> {
  const pageToken = await getPageAccessToken();
  const items: FbPost[] = [];
  let url: string | null =
    `${GRAPH_BASE}/${metaEnv.pageId}/posts?fields=id,message,created_time,permalink_url&limit=50&access_token=${pageToken}`;

  while (url) {
    const json: { data: FbPost[]; paging?: { next?: string } } = await graphFetch(url);
    let hitOlder = false;
    for (const item of json.data) {
      if (sinceDate && new Date(item.created_time) < sinceDate) {
        hitOlder = true;
        break;
      }
      items.push(item);
    }
    if (hitOlder) break;
    url = json.paging?.next ?? null;
  }
  return items;
}

export interface FbPostEngagement {
  reactions?: number;
  comments?: number;
  shares?: number;
  videoId?: string;
}

/** Reacciones/comments/shares vienen como field-edges del objeto post (no del endpoint /insights, que Meta deprecó para casi todas las métricas por-post en 2024). */
export async function fetchFacebookPostEngagement(postId: string): Promise<FbPostEngagement> {
  const pageToken = await getPageAccessToken();
  const url = `${GRAPH_BASE}/${postId}?fields=reactions.summary(true).limit(0),comments.summary(true).limit(0),shares,attachments{type,target}&access_token=${pageToken}`;

  interface FbPostEngagementResponse {
    reactions?: { summary?: { total_count?: number } };
    comments?: { summary?: { total_count?: number } };
    shares?: { count?: number };
    attachments?: { data?: { type?: string; target?: { id?: string } }[] };
  }

  let json: FbPostEngagementResponse;
  try {
    json = await graphFetch<FbPostEngagementResponse>(url);
  } catch {
    return {};
  }

  const attachment = json.attachments?.data?.[0];
  const videoId = attachment?.type === "video_inline" ? attachment.target?.id : undefined;

  return {
    reactions: json.reactions?.summary?.total_count,
    comments: json.comments?.summary?.total_count,
    shares: json.shares?.count,
    videoId,
  };
}

export interface FbVideoInsights {
  plays?: number;
  replays?: number;
}

/** Solo cubre reels (blue_reels_*) — Meta no expone tiempo de reproducción para reels de Facebook vía este edge, a diferencia de Instagram. */
export async function fetchFacebookVideoInsights(videoId: string): Promise<FbVideoInsights> {
  const pageToken = await getPageAccessToken();
  const url = `${GRAPH_BASE}/${videoId}/video_insights?metric=blue_reels_play_count,fb_reels_replay_count&access_token=${pageToken}`;

  let json: { data: GraphInsightValue[] };
  try {
    json = await graphFetch<{ data: GraphInsightValue[] }>(url);
  } catch {
    return {};
  }

  const out: FbVideoInsights = {};
  for (const m of json.data ?? []) {
    const value = m.values?.[0]?.value;
    if (value === undefined) continue;
    if (m.name === "blue_reels_play_count") out.plays = value;
    if (m.name === "fb_reels_replay_count") out.replays = value;
  }
  return out;
}
