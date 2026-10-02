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

/** Orden de qué tan accionable/confiable es cada métrica — desempata entre desviaciones de magnitud similar a favor de la que de verdad dice algo (engagement > alcance > qué tanto se ve el video > guardados > comentarios, que con pocos datos es ruidoso). */
const METRIC_PRIORITY = ["engagement", "reach", "completion", "watchTime", "saves", "comments"] as const;

interface Deviation {
  metric: (typeof METRIC_PRIORITY)[number];
  text: string;
  pct: number;
}

/** Ordena por prioridad de métrica (no por magnitud): comentarios/guardados son conteos chicos y su % se dispara con ruido, así que engagement/alcance/qué-tanto-se-ve siempre ganan como encabezado cuando también se movieron. */
function sortByPriority(deviations: Deviation[]): Deviation[] {
  return [...deviations].sort((a, b) => METRIC_PRIORITY.indexOf(a.metric) - METRIC_PRIORITY.indexOf(b.metric));
}

/** Compara `post` contra el promedio de `peers` (misma plataforma) y devuelve una desviación por métrica disponible, sin filtrar por umbral todavía. */
function buildPeerDeviations(post: FeedPost, peers: FeedPost[]): Deviation[] {
  const avg = (getter: (p: FeedPost) => number | null): number | null => {
    const values = peers.map(getter).filter((v): v is number => v !== null && v > 0);
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const deviations: Deviation[] = [];
  const pctOf = (value: number, base: number) => ((value - base) / base) * 100;

  const reachAvg = avg((p) => p.reach);
  if (reachAvg !== null && post.reach !== null) {
    const pct = pctOf(post.reach, reachAvg);
    deviations.push({
      metric: "reach",
      pct,
      text: pct >= 0 ? `Alcance ${pct.toFixed(0)}% arriba de tu promedio` : `Alcance ${Math.abs(pct).toFixed(0)}% abajo de tu promedio`,
    });
  }

  const rate = engagementRate(post);
  const rateAvg = avg((p) => engagementRate(p));
  if (rate !== null && rateAvg !== null) {
    const pct = pctOf(rate, rateAvg);
    deviations.push({
      metric: "engagement",
      pct,
      text: pct >= 0 ? `Engagement ${pct.toFixed(0)}% más fuerte de lo usual` : `Engagement ${Math.abs(pct).toFixed(0)}% más débil de lo usual`,
    });
  }

  if (post.completionRate !== null) {
    const completionAvg = avg((p) => p.completionRate);
    if (completionAvg !== null) {
      const pct = pctOf(post.completionRate, completionAvg);
      deviations.push({
        metric: "completion",
        pct,
        text:
          pct >= 0
            ? `Más gente vio el video completo que de costumbre`
            : `Menos gente llegó al final del video que de costumbre`,
      });
    }
  }

  if (post.saves !== null && post.reach) {
    const savesRate = post.saves / post.reach;
    const savesRateAvg = avg((p) => (p.saves != null && p.reach ? p.saves / p.reach : null));
    if (savesRateAvg !== null && savesRateAvg > 0) {
      const pct = pctOf(savesRate, savesRateAvg);
      deviations.push({
        metric: "saves",
        pct,
        text: pct >= 0 ? `Se guardó más de lo usual — buen contenido de referencia` : `Se guardó menos de lo usual`,
      });
    }
  }

  if (post.avgWatchTimeSeconds !== null) {
    const watchAvg = avg((p) => p.avgWatchTimeSeconds);
    if (watchAvg !== null) {
      const pct = pctOf(post.avgWatchTimeSeconds, watchAvg);
      deviations.push({
        metric: "watchTime",
        pct,
        text: pct >= 0 ? `La gente se quedó viendo más tiempo que en tus otros videos` : `La gente soltó el video más rápido que en tus otros videos`,
      });
    }
  }

  if (post.comments !== null) {
    const commentsAvg = avg((p) => p.comments);
    if (commentsAvg !== null && commentsAvg > 0) {
      const pct = pctOf(post.comments, commentsAvg);
      deviations.push({
        metric: "comments",
        pct,
        text: pct >= 0 ? `Generó más conversación (comentarios) de lo usual` : `Generó poca conversación comparado con tus otros posts`,
      });
    }
  }

  return deviations;
}

/** El post inmediatamente anterior (misma plataforma, por fecha) dentro del set dado. */
function findPreviousPost(post: FeedPost, samePlatform: FeedPost[]): FeedPost | null {
  if (!post.postedAt) return null;
  const earlier = samePlatform
    .filter((p) => p.postedAt && p.postedAt < post.postedAt!)
    .sort((a, b) => (a.postedAt! < b.postedAt! ? 1 : -1));
  return earlier[0] ?? null;
}

/** Detecta si este post y los 2 anteriores (misma plataforma) vienen todos por debajo del promedio de engagement del set — señal de que vale la pena cambiar de formato, no solo un tropiezo aislado. */
function detectDownwardStreak(post: FeedPost, samePlatform: FeedPost[]): boolean {
  const chronological = [...samePlatform, post]
    .filter((p) => p.postedAt)
    .sort((a, b) => (a.postedAt! < b.postedAt! ? -1 : 1));
  const idx = chronological.findIndex((p) => p.id === post.id);
  if (idx < 2) return false;

  const rates = chronological.map((p) => engagementRate(p)).filter((r): r is number => r !== null);
  if (rates.length < 4) return false;
  const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
  if (avgRate <= 0) return false;

  const lastThree = chronological.slice(idx - 2, idx + 1);
  return lastThree.every((p) => {
    const r = engagementRate(p);
    return r !== null && r <= avgRate * 0.7;
  });
}

/** "Quick facts" por post: compara sus métricas contra el promedio de sus posts pares (misma plataforma, mismo periodo), contra su publicación inmediata anterior, y detecta rachas — devuelve hasta 3 hallazgos priorizados (el más accionable primero). */
export function generatePostInsights(post: FeedPost, peers: FeedPost[]): PostInsight[] {
  const samePlatform = peers.filter((p) => p.platform === post.platform && p.id !== post.id);
  const insights: PostInsight[] = [];
  const THRESHOLD = 15; // % de desviación mínima para que valga la pena mencionarlo

  if (detectDownwardStreak(post, samePlatform)) {
    insights.push({
      kind: "bad",
      text: "Van 3 publicaciones seguidas por debajo de tu promedio — quizá sea buen momento para cambiar de formato",
    });
  }

  let engagementVsPeersPct: number | null = null;
  if (samePlatform.length >= 3) {
    const deviations = sortByPriority(buildPeerDeviations(post, samePlatform));
    engagementVsPeersPct = deviations.find((d) => d.metric === "engagement")?.pct ?? null;
    const strongest = deviations.find((d) => d.pct >= THRESHOLD);
    const weakest = deviations.find((d) => d.pct <= -THRESHOLD);

    if (strongest) insights.push({ kind: "good", text: strongest.text });
    if (weakest && weakest.text !== strongest?.text) insights.push({ kind: "bad", text: weakest.text });
  }

  const previous = findPreviousPost(post, samePlatform);
  if (previous && insights.length < 3) {
    const rate = engagementRate(post);
    const prevRate = engagementRate(previous);
    if (rate !== null && prevRate !== null && prevRate > 0) {
      const pct = ((rate - prevRate) / prevRate) * 100;
      // Si ya dijimos prácticamente lo mismo comparando contra el promedio, no lo repitamos con otras palabras.
      const redundant = engagementVsPeersPct !== null && Math.sign(pct) === Math.sign(engagementVsPeersPct) && Math.abs(pct - engagementVsPeersPct) < 20;
      if (Math.abs(pct) >= 25 && !redundant) {
        insights.push({
          kind: pct >= 0 ? "good" : "bad",
          text:
            pct >= 0
              ? `Engagement ${pct.toFixed(0)}% mejor que tu publicación anterior`
              : `Engagement ${Math.abs(pct).toFixed(0)}% peor que tu publicación anterior`,
        });
      }
    }
  }

  return insights.slice(0, 3);
}
