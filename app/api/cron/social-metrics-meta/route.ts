import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron-auth";
import { countPostsForAccount, insertAccountSnapshot, insertMetricsSnapshot, sumLatestLikesForAccount, upsertSocialAccount, upsertSocialPost } from "@/lib/social/db";
import { isMetaConfigured, metaEnv } from "@/lib/social/env";
import {
  fetchFacebookPageStats,
  fetchFacebookPostEngagement,
  fetchFacebookPosts,
  fetchFacebookVideoInsights,
  fetchInstagramAccountStats,
  fetchInstagramMedia,
  fetchInstagramMediaInsights,
  mapWithConcurrency,
} from "@/lib/social/meta";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Corridas diarias solo re-miden lo reciente (donde las métricas todavía se
// mueven). El histórico completo se sembró una vez con ?full=true — ver
// memoria del proyecto / PROJECT_NOTES.md.
const DEFAULT_WINDOW_DAYS = 60;
const CONCURRENCY = 5;

export async function GET(request: Request) {
  const authError = checkCronAuth(request);
  if (authError) return authError;

  if (!isMetaConfigured()) {
    return NextResponse.json({ error: "meta_not_configured" }, { status: 501 });
  }

  try {
    return await runIngestion(request);
  } catch (err) {
    // Cualquier throw no capturado aquí antes se traducía en un crash silencioso
    // del Lambda (502 Bad Gateway sin detalle) — con esto al menos queda un log.
    console.error("social-metrics-meta: fallo no capturado:", err);
    return NextResponse.json({ error: "unexpected_error", message: String(err) }, { status: 500 });
  }
}

async function runIngestion(request: Request) {
  const { searchParams } = new URL(request.url);
  const full = searchParams.get("full") === "true";
  const windowDays = Number(searchParams.get("days") ?? DEFAULT_WINDOW_DAYS);
  const sinceDate = full ? undefined : new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const igAccount = await upsertSocialAccount("instagram", "dstellarmx", metaEnv.igAccountId!);
  const fbAccount = await upsertSocialAccount("facebook", "dstellar", metaEnv.pageId!);

  const igMedia = await fetchInstagramMedia(sinceDate);
  let igOk = 0;
  let igFailed = 0;
  await mapWithConcurrency(igMedia, CONCURRENCY, async (media) => {
    try {
      const post = await upsertSocialPost(igAccount.id, media.id, {
        permalink: media.permalink,
        caption: media.caption ?? null,
        media_type: media.media_product_type,
        posted_at: media.timestamp,
        thumbnail_url: media.thumbnail_url ?? null,
      });
      const insights = await fetchInstagramMediaInsights(media);
      await insertMetricsSnapshot(post.id, {
        views: insights.views ?? null,
        reach: insights.reach ?? null,
        likes: insights.likes ?? null,
        comments: insights.comments ?? null,
        shares: insights.shares ?? null,
        saves: insights.saved ?? null,
        avg_watch_time_seconds: insights.avgWatchTimeMs != null ? insights.avgWatchTimeMs / 1000 : null,
        total_watch_time_seconds: insights.totalWatchTimeMs != null ? insights.totalWatchTimeMs / 1000 : null,
      });
      igOk++;
    } catch (err) {
      igFailed++;
      console.error(`social-metrics-meta: fallo en IG media ${media.id}:`, err);
    }
  });

  const fbPosts = await fetchFacebookPosts(sinceDate);
  let fbOk = 0;
  let fbFailed = 0;
  await mapWithConcurrency(fbPosts, CONCURRENCY, async (fbPost) => {
    try {
      const post = await upsertSocialPost(fbAccount.id, fbPost.id, {
        permalink: fbPost.permalink_url,
        caption: fbPost.message ?? null,
        media_type: null,
        posted_at: fbPost.created_time,
        thumbnail_url: null,
      });
      const engagement = await fetchFacebookPostEngagement(fbPost.id);
      let plays: number | null = null;
      if (engagement.videoId) {
        const videoInsights = await fetchFacebookVideoInsights(engagement.videoId);
        plays = videoInsights.plays ?? null;
      }
      await insertMetricsSnapshot(post.id, {
        views: plays,
        likes: engagement.reactions ?? null,
        comments: engagement.comments ?? null,
        shares: engagement.shares ?? null,
      });
      fbOk++;
    } catch (err) {
      fbFailed++;
      console.error(`social-metrics-meta: fallo en FB post ${fbPost.id}:`, err);
    }
  });

  // Foto de cuenta (seguidores/likes totales/# posts) — mismo patrón que el cron de TikTok,
  // para que las tarjetas de resumen se vean iguales en las 3 plataformas.
  try {
    const igStats = await fetchInstagramAccountStats();
    const igLikes = await sumLatestLikesForAccount(igAccount.id);
    await insertAccountSnapshot(igAccount.id, {
      followers: igStats.followersCount,
      total_likes: igLikes,
      video_count: igStats.mediaCount,
    });
  } catch (err) {
    console.error("social-metrics-meta: fallo en snapshot de cuenta IG:", err);
  }

  try {
    const fbStats = await fetchFacebookPageStats();
    const fbLikes = await sumLatestLikesForAccount(fbAccount.id);
    const fbPostCount = await countPostsForAccount(fbAccount.id);
    await insertAccountSnapshot(fbAccount.id, {
      followers: fbStats.followersCount,
      total_likes: fbLikes,
      video_count: fbPostCount,
    });
  } catch (err) {
    console.error("social-metrics-meta: fallo en snapshot de cuenta FB:", err);
  }

  return NextResponse.json({
    ok: true,
    instagram: { total: igMedia.length, saved: igOk, failed: igFailed },
    facebook: { total: fbPosts.length, saved: fbOk, failed: fbFailed },
  });
}
