// Snapshot de "Overview" de TikTok Studio Analytics (cuenta @dstellarmx) —
// pegado a mano por Claude el 2026-10-27, logueado con la sesión de Carlos.
// TikTok no tiene API pública para esto (ni Ads Manager ni Studio la
// exponen) — igual que data/ads-campaigns.ts, sin cron automático. Para
// refrescarlo: entrar a tiktok.com/tiktokstudio/analytics, pestaña
// "Overview", seleccionar el rango de fechas y volver a pegar los números
// reales de "Traffic source" y "Search queries".
//
// Nota: @cookiescdmx no está capturada todavía — esta sesión de Chrome solo
// tiene logueada la cuenta @dstellarmx en TikTok Studio (a diferencia de
// Meta Business Suite, TikTok no permite cambiar de cuenta desde el mismo
// panel). Hace falta que Carlos inicie sesión con esa cuenta aparte.

export interface DiscoveryShare {
  label: string;
  pct: number;
}

export interface TikTokDiscoverySnapshot {
  handle: string;
  capturedAt: string; // ISO
  periodLabel: string;
  periodDays: number;
  videoViews: number;
  videoViewsDeltaPct: number;
  profileViews: number;
  profileViewsDeltaPct: number;
  likes: number;
  likesDeltaPct: number;
  comments: number;
  commentsDeltaPct: number;
  shares: number;
  sharesDeltaPct: number;
  trafficSource: DiscoveryShare[];
  searchQueries: DiscoveryShare[];
}

export const TIKTOK_DISCOVERY: TikTokDiscoverySnapshot[] = [
  {
    handle: "dstellarmx",
    capturedAt: "2026-10-27T00:00:00-06:00",
    periodLabel: "Últimos 28 días",
    periodDays: 28,
    videoViews: 202400,
    videoViewsDeltaPct: 2811.3,
    profileViews: 3000,
    profileViewsDeltaPct: 3226.7,
    likes: 14100,
    likesDeltaPct: 4258.0,
    comments: 543,
    commentsDeltaPct: 13475.0,
    shares: 1000,
    sharesDeltaPct: 1908.0,
    trafficSource: [
      { label: "For You", pct: 98.1 },
      { label: "Perfil personal", pct: 1.3 },
      { label: "Búsqueda", pct: 0.4 },
      { label: "Siguiendo", pct: 0.2 },
      { label: "Sonido", pct: 0 },
    ],
    searchQueries: [
      { label: "Que visitar por abenida nuevo leon", pct: 0.1 },
      { label: "cafes cerca de metrobus alvaro obregon", pct: 0.1 },
      { label: "Lugares en la calle de nuevo leon en cdmx", pct: 0.1 },
      { label: "Cafeteria saludable", pct: 0.1 },
      { label: "avenida nuevo leon número 250 cdmx", pct: 0.1 },
    ],
  },
];
