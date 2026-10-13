import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron-auth";
import { upsertMentions, type MentionInput } from "@/lib/mentions/db";
import { isMentionsConfigured, mentionsEnv } from "@/lib/mentions/env";
import { fetchGoogleAlertFeed } from "@/lib/mentions/google-alerts";
import { isMetaConfigured } from "@/lib/social/env";
import { fetchInstagramTaggedMedia } from "@/lib/social/meta";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = checkCronAuth(request);
  if (authError) return authError;

  if (!isMentionsConfigured() && !isMetaConfigured()) {
    return NextResponse.json({ error: "mentions_not_configured" }, { status: 501 });
  }

  const webResults = await Promise.all(
    mentionsEnv.googleAlertFeeds.map(async ({ term, feedUrl }) => {
      try {
        const mentions = await fetchGoogleAlertFeed(feedUrl);
        const inserted = await upsertMentions("google_alert", term, mentions);
        return { term, ok: true, found: mentions.length, inserted };
      } catch (err) {
        return { term, ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    }),
  );

  const igResult = await (async () => {
    if (!isMetaConfigured()) return { term: "instagram_tags", ok: true, skipped: "meta_not_configured" };
    try {
      const tagged = await fetchInstagramTaggedMedia();
      const mentions: MentionInput[] = tagged.map((t) => ({
        title: t.username ? `@${t.username} te etiquetó en Instagram` : "Te etiquetaron en Instagram",
        url: t.permalink,
        domain: "instagram.com",
        snippet: t.caption ?? null,
        publishedAt: t.timestamp,
      }));
      const inserted = await upsertMentions("instagram_tag", "tagged_media", mentions);
      return { term: "instagram_tags", ok: true, found: tagged.length, inserted };
    } catch (err) {
      return { term: "instagram_tags", ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  })();

  const results = [...webResults, igResult];
  return NextResponse.json({ ok: results.every((r) => r.ok), results });
}
