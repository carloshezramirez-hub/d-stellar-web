// Backfill/refresh de métricas por-video de TikTok vía Supermetrics (conector
// "TikTok Organic" / TIKBA, report_type "videos") — ver PROJECT_NOTES.md.
// TikTok bloquea el scraping directo del listado de videos (lib/social/tiktok.ts
// solo cubre cuenta), así que esto no es un cron: se corre a mano cuando haya
// datos nuevos que traer de Supermetrics (no hay API key server-to-server todavía).
//
// Uso:
//   1. En una sesión con el MCP de Supermetrics conectado, pide el
//      data_query de ds_id=TIKBA, settings={report_type:"videos"},
//      ds_accounts="dstellarmx", con los fields listados en VIDEO_ROW_KEYS
//      abajo (nombres canónicos de campo, con prefijo "videos__").
//   2. Guarda el resultado como un array JSON de objetos (uno por video) en
//      un archivo, p.ej. tiktok-videos.json.
//   3. NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//        node scripts/import-tiktok-videos.mjs tiktok-videos.json
//
// Es seguro volver a correrlo: upsert por (account_id, platform_post_id), y
// cada corrida agrega una foto nueva de métricas (mismo patrón que los crons
// de Meta) en vez de sobreescribir el histórico.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const TIKTOK_HANDLE = "dstellarmx";

const [, , inputPath] = process.argv;
if (!inputPath) {
  console.error("Uso: node scripts/import-tiktok-videos.mjs <archivo.json>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const rows = JSON.parse(readFileSync(inputPath, "utf8"));
if (!Array.isArray(rows)) {
  console.error("El archivo debe contener un array JSON de videos.");
  process.exit(1);
}

const num = (v) => (v === null || v === undefined || v === "" ? null : Number(v));

const { data: account, error: accountError } = await db
  .from("social_accounts")
  .select("id")
  .eq("platform", "tiktok")
  .eq("handle", TIKTOK_HANDLE)
  .single();
if (accountError) throw accountError;

let ok = 0;
let failed = 0;

for (const row of rows) {
  const videoId = row["videos__video_id"];
  if (!videoId) continue;

  try {
    const { data: post, error: postError } = await db
      .from("social_posts")
      .upsert(
        {
          account_id: account.id,
          platform_post_id: videoId,
          permalink: row["videos__share_url"] ?? null,
          caption: row["videos__caption"] ?? null,
          media_type: "VIDEO",
          posted_at: row["videos__create_datetime"] ?? null,
          thumbnail_url: row["videos__thumbnail_url"] ?? null,
        },
        { onConflict: "account_id,platform_post_id" },
      )
      .select()
      .single();
    if (postError) throw postError;

    const views = num(row["videos__video_views"]);
    const likes = num(row["videos__likes"]);
    const comments = num(row["videos__comments"]);
    const shares = num(row["videos__shares"]);
    const reach = num(row["videos__reach"]);
    const saves = num(row["videos__favorites"]);
    const engagementRate =
      reach && reach > 0 ? ((likes ?? 0) + (comments ?? 0) + (shares ?? 0) + (saves ?? 0)) / reach : null;

    const { error: metricsError } = await db.from("social_metrics_snapshots").insert({
      post_id: post.id,
      views,
      likes,
      comments,
      shares,
      saves,
      reach,
      engagement_rate: engagementRate,
      avg_watch_time_seconds: num(row["videos__average_view_time"]),
      total_watch_time_seconds: num(row["videos__total_time_watched_sec"]),
      completion_rate: num(row["videos__video_completion_rate"]),
    });
    if (metricsError) throw metricsError;

    ok++;
  } catch (err) {
    failed++;
    console.error("Falló video", videoId, err.message ?? err);
  }
}

console.log(`Listo: ${ok} videos importados, ${failed} fallidos.`);
