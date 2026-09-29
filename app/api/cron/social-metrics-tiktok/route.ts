import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron-auth";
import { getSocialDb, upsertSocialAccount } from "@/lib/social/db";
import { tikTokEnv, isTikTokConfigured } from "@/lib/social/env";
import { fetchTikTokAccountStats } from "@/lib/social/tiktok";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = checkCronAuth(request);
  if (authError) return authError;

  if (!isTikTokConfigured()) {
    return NextResponse.json({ error: "tiktok_not_configured" }, { status: 501 });
  }

  const handle = tikTokEnv.handle!;
  const db = getSocialDb();

  const stats = await fetchTikTokAccountStats(handle);
  const account = await upsertSocialAccount("tiktok", handle);

  const { error } = await db.from("social_account_snapshots").insert({
    account_id: account.id,
    followers: stats.followerCount,
    total_likes: stats.heartCount,
    video_count: stats.videoCount,
  });
  if (error) throw error;

  return NextResponse.json({ ok: true, handle, stats });
}
