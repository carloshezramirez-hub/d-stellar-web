import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron-auth";
import { upsertMentions } from "@/lib/mentions/db";
import { isMentionsConfigured, mentionsEnv } from "@/lib/mentions/env";
import { fetchGoogleAlertFeed } from "@/lib/mentions/google-alerts";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = checkCronAuth(request);
  if (authError) return authError;

  if (!isMentionsConfigured()) {
    return NextResponse.json({ error: "mentions_not_configured" }, { status: 501 });
  }

  const results = await Promise.all(
    mentionsEnv.googleAlertFeeds.map(async ({ term, feedUrl }) => {
      try {
        const mentions = await fetchGoogleAlertFeed(feedUrl);
        const inserted = await upsertMentions(term, mentions);
        return { term, ok: true, found: mentions.length, inserted };
      } catch (err) {
        return { term, ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    }),
  );

  return NextResponse.json({ ok: results.every((r) => r.ok), results });
}
