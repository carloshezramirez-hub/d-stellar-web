// Scraper de métricas PÚBLICAS de TikTok — lee el JSON que TikTok embebe
// server-side (para SEO) en la página de perfil. Solo cubre datos de
// cuenta (seguidores, likes totales, # videos): el desglose por video
// requiere una llamada interna (/api/post/item_list/) que TikTok firma y
// bloquea activamente ante peticiones automatizadas — confirmado incluso
// con un navegador real (Playwright) en 2026-09-23. No se scrapea ese
// endpoint; si en el futuro se consigue acceso a la API oficial de
// TikTok for Business, ahí se agregarían las métricas por video.

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export interface TikTokAccountStats {
  followerCount: number;
  heartCount: number;
  videoCount: number;
}

export async function fetchTikTokAccountStats(handle: string): Promise<TikTokAccountStats> {
  const res = await fetch(`https://www.tiktok.com/@${handle}`, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9" },
  });
  if (!res.ok) throw new Error(`tiktok_fetch_failed_${res.status}`);

  const html = await res.text();
  const match = html.match(
    /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error("tiktok_data_script_not_found");

  const json = JSON.parse(match[1]);
  const stats = json?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.stats;
  if (!stats) throw new Error("tiktok_stats_not_found");

  return {
    followerCount: Number(stats.followerCount) || 0,
    heartCount: Number(stats.heartCount) || 0,
    videoCount: Number(stats.videoCount) || 0,
  };
}
