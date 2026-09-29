import type { FeedPost } from "./queries";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface DateRangeOption {
  value: string;
  label: string;
  days: number | null; // null = todo el histórico
}

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { value: "7", label: "7 días", days: 7 },
  { value: "30", label: "30 días", days: 30 },
  { value: "90", label: "90 días", days: 90 },
  { value: "all", label: "Todo", days: null },
];

export const DEFAULT_RANGE = "7";

export function resolveRangeDays(range: string, posts: FeedPost[]): number {
  const option = DATE_RANGE_OPTIONS.find((o) => o.value === range) ?? DATE_RANGE_OPTIONS[0];
  if (option.days !== null) return option.days;

  const oldest = posts.reduce<number | null>((min, p) => {
    if (!p.postedAt) return min;
    const t = new Date(p.postedAt).getTime();
    return min === null || t < min ? t : min;
  }, null);
  if (oldest === null) return 7;
  return Math.max(1, Math.ceil((Date.now() - oldest) / DAY_MS));
}

export interface PeriodTotals {
  posts: number;
  reach: number;
  interactions: number; // likes + comments + shares + saves
  views: number;
  avgWatchTimeSeconds: number | null;
}

export interface KpiSummary {
  platform: string;
  current: PeriodTotals;
  previous: PeriodTotals;
  avgEngagementRate: number | null; // interactions / reach, promedio de los posts del periodo actual que tienen reach
}

function sumTotals(posts: FeedPost[]): PeriodTotals {
  let reach = 0;
  let interactions = 0;
  let views = 0;
  const watchTimes: number[] = [];

  for (const p of posts) {
    reach += p.reach ?? 0;
    interactions += (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.saves ?? 0);
    views += p.views ?? 0;
    if (p.avgWatchTimeSeconds != null) watchTimes.push(p.avgWatchTimeSeconds);
  }

  return {
    posts: posts.length,
    reach,
    interactions,
    views,
    avgWatchTimeSeconds: watchTimes.length > 0 ? watchTimes.reduce((a, b) => a + b, 0) / watchTimes.length : null,
  };
}

function inWindow(posts: FeedPost[], start: Date, end: Date): FeedPost[] {
  return posts.filter((p) => {
    if (!p.postedAt) return false;
    const t = new Date(p.postedAt).getTime();
    return t >= start.getTime() && t < end.getTime();
  });
}

/** Compara los últimos `windowDays` contra los `windowDays` anteriores a esos, por plataforma y combinado ("all"). */
export function buildKpiSummaries(posts: FeedPost[], windowDays = 7): KpiSummary[] {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * DAY_MS);
  const prevStart = new Date(windowStart.getTime() - windowDays * DAY_MS);

  const platforms = Array.from(new Set(posts.map((p) => p.platform)));
  const groups: [string, FeedPost[]][] = [
    ["all", posts],
    ...platforms.map((pl) => [pl, posts.filter((p) => p.platform === pl)] as [string, FeedPost[]]),
  ];

  return groups.map(([platform, group]) => {
    const current = sumTotals(inWindow(group, windowStart, now));
    const previous = sumTotals(inWindow(group, prevStart, windowStart));

    const currentWithReach = inWindow(group, windowStart, now).filter((p) => p.reach != null && p.reach > 0);
    const rates = currentWithReach.map((p) => engagementRate(p) as number);
    const avgEngagementRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : null;

    return { platform, current, previous, avgEngagementRate };
  });
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0;
  return ((current - previous) / previous) * 100;
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  interactions: number;
  reach: number;
}

/** Serie diaria (sumando todas las plataformas) para la gráfica de tendencia, dentro de la ventana seleccionada. */
export function buildDailySeries(posts: FeedPost[], windowDays: number): DailyPoint[] {
  const cutoff = Date.now() - windowDays * DAY_MS;
  const byDay = new Map<string, DailyPoint>();

  for (const p of posts) {
    if (!p.postedAt) continue;
    const t = new Date(p.postedAt).getTime();
    if (t < cutoff) continue;
    const day = p.postedAt.slice(0, 10);
    const point = byDay.get(day) ?? { date: day, interactions: 0, reach: 0 };
    point.interactions += (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.saves ?? 0);
    point.reach += p.reach ?? 0;
    byDay.set(day, point);
  }

  return Array.from(byDay.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** Filtra posts a los últimos `windowDays` días — factorizado fuera de los componentes de página para no llamar Date.now() durante el render. */
export function filterPostsInWindow(posts: FeedPost[], windowDays: number): FeedPost[] {
  const cutoff = Date.now() - windowDays * DAY_MS;
  return posts.filter((p) => p.postedAt && new Date(p.postedAt).getTime() >= cutoff);
}

export function engagementRate(post: FeedPost): number | null {
  if (post.reach == null || post.reach === 0) return null;
  const interactions = (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0) + (post.saves ?? 0);
  return interactions / post.reach;
}

export interface Highlights {
  topId: string | null;
  lowId: string | null;
}

/** Elige UN solo post destacado y UN solo post flojo (por engagement rate) dentro del set dado — evita saturar el feed de badges. */
export function pickHighlights(posts: FeedPost[]): Highlights {
  const rated = posts
    .map((p) => ({ id: p.id, rate: engagementRate(p) }))
    .filter((r): r is { id: string; rate: number } => r.rate !== null);

  if (rated.length < 3) return { topId: null, lowId: null };

  rated.sort((a, b) => b.rate - a.rate);
  const best = rated[0];
  const worst = rated[rated.length - 1];

  const avg = rated.reduce((sum, r) => sum + r.rate, 0) / rated.length;

  return {
    topId: best.rate >= avg * 1.2 ? best.id : null,
    lowId: worst.id !== best.id && worst.rate <= avg * 0.7 ? worst.id : null,
  };
}

export interface PostInsight {
  kind: "good" | "bad";
  text: string;
}

/** "Quick facts" por post: compara sus métricas contra el promedio de sus posts pares (misma plataforma, mismo periodo) y devuelve hasta 2 hallazgos en lenguaje llano — lo bueno y lo que se puede mejorar. */
export function generatePostInsights(post: FeedPost, peers: FeedPost[]): PostInsight[] {
  const samePlatform = peers.filter((p) => p.platform === post.platform && p.id !== post.id);
  if (samePlatform.length < 3) return [];

  const avg = (getter: (p: FeedPost) => number | null): number | null => {
    const values = samePlatform.map(getter).filter((v): v is number => v !== null && v > 0);
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const deviations: { text: string; pct: number }[] = [];

  const reachAvg = avg((p) => p.reach);
  if (reachAvg !== null && post.reach !== null) {
    const pct = ((post.reach - reachAvg) / reachAvg) * 100;
    deviations.push({
      text: pct >= 0 ? `Alcance ${pct.toFixed(0)}% arriba de tu promedio` : `Alcance ${Math.abs(pct).toFixed(0)}% abajo de tu promedio`,
      pct,
    });
  }

  const rate = engagementRate(post);
  const rateAvg = avg((p) => engagementRate(p));
  if (rate !== null && rateAvg !== null) {
    const pct = ((rate - rateAvg) / rateAvg) * 100;
    deviations.push({
      text: pct >= 0 ? `Engagement ${pct.toFixed(0)}% más fuerte de lo usual` : `Engagement ${Math.abs(pct).toFixed(0)}% más débil de lo usual`,
      pct,
    });
  }

  if (post.saves !== null && post.reach) {
    const savesRate = post.saves / post.reach;
    const savesRateAvg = avg((p) => (p.saves != null && p.reach ? p.saves / p.reach : null));
    if (savesRateAvg !== null && savesRateAvg > 0) {
      const pct = ((savesRate - savesRateAvg) / savesRateAvg) * 100;
      deviations.push({
        text: pct >= 0 ? `Se guardó más de lo usual — buen contenido de referencia` : `Se guardó menos de lo usual`,
        pct,
      });
    }
  }

  if (post.avgWatchTimeSeconds !== null) {
    const watchAvg = avg((p) => p.avgWatchTimeSeconds);
    if (watchAvg !== null) {
      const pct = ((post.avgWatchTimeSeconds - watchAvg) / watchAvg) * 100;
      deviations.push({
        text: pct >= 0 ? `La gente se quedó viendo más tiempo que en tus otros videos` : `La gente soltó el video más rápido que en tus otros videos`,
        pct,
      });
    }
  }

  if (post.comments !== null) {
    const commentsAvg = avg((p) => p.comments);
    if (commentsAvg !== null && commentsAvg > 0) {
      const pct = ((post.comments - commentsAvg) / commentsAvg) * 100;
      deviations.push({
        text: pct >= 0 ? `Generó más conversación (comentarios) de lo usual` : `Generó poca conversación comparado con tus otros posts`,
        pct,
      });
    }
  }

  if (deviations.length === 0) return [];

  deviations.sort((a, b) => b.pct - a.pct);
  const strongest = deviations[0];
  const weakest = deviations[deviations.length - 1];

  const insights: PostInsight[] = [];
  const THRESHOLD = 15; // % de desviación mínima para que valga la pena mencionarlo

  if (strongest.pct >= THRESHOLD) insights.push({ kind: "good", text: strongest.text });
  if (weakest.pct <= -THRESHOLD && weakest.text !== strongest.text) insights.push({ kind: "bad", text: weakest.text });

  return insights;
}
