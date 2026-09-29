import type { FeedPost } from "./queries";

const DAY_MS = 24 * 60 * 60 * 1000;

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
export function buildKpiSummaries(posts: FeedPost[], windowDays = 30): KpiSummary[] {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * DAY_MS);
  const prevStart = new Date(windowStart.getTime() - windowDays * DAY_MS);

  const platforms = Array.from(new Set(posts.map((p) => p.platform)));
  const groups: [string, FeedPost[]][] = [["all", posts], ...platforms.map((pl) => [pl, posts.filter((p) => p.platform === pl)] as [string, FeedPost[]])];

  return groups.map(([platform, group]) => {
    const current = sumTotals(inWindow(group, windowStart, now));
    const previous = sumTotals(inWindow(group, prevStart, windowStart));

    const currentWithReach = inWindow(group, windowStart, now).filter((p) => p.reach != null && p.reach > 0);
    const rates = currentWithReach.map((p) => {
      const interactions = (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.saves ?? 0);
      return interactions / (p.reach as number);
    });
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

/** Serie diaria (sumando todas las plataformas) para la gráfica de tendencia — solo días con al menos un post. */
export function buildDailySeries(posts: FeedPost[], windowDays = 60): DailyPoint[] {
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

/** Rating de un post individual contra el promedio de interacciones/reach de su propia plataforma, para señalar qué está jalando y qué necesita ajustes. */
export function ratePost(post: FeedPost, allPosts: FeedPost[]): "top" | "normal" | "low" | null {
  if (post.reach == null || post.reach === 0) return null;
  const interactions = (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0) + (post.saves ?? 0);
  const rate = interactions / post.reach;

  const peers = allPosts.filter((p) => p.platform === post.platform && p.reach != null && p.reach > 0);
  if (peers.length < 3) return null;
  const peerRates = peers.map((p) => {
    const i = (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.saves ?? 0);
    return i / (p.reach as number);
  });
  const avg = peerRates.reduce((a, b) => a + b, 0) / peerRates.length;

  if (rate >= avg * 1.3) return "top";
  if (rate <= avg * 0.6) return "low";
  return "normal";
}
