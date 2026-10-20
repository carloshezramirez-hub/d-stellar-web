import { gscSearchAnalytics } from "@/lib/google/client";

export interface SearchQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchPageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchSummary {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  topQueries: SearchQueryRow[];
  topPages: SearchPageRow[];
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Qué busca la gente en Google para encontrar d-stellar, y en qué páginas aterriza — últimos `days` días. */
export async function fetchSearchSummary(days = 30): Promise<SearchSummary> {
  const startDate = isoDaysAgo(days);
  const endDate = isoDaysAgo(0);

  const [queriesRes, pagesRes] = await Promise.all([
    gscSearchAnalytics({ startDate, endDate, dimensions: ["query"], rowLimit: 15 }),
    gscSearchAnalytics({ startDate, endDate, dimensions: ["page"], rowLimit: 15 }),
  ]);

  const topQueries: SearchQueryRow[] = (queriesRes.rows ?? []).map((r: any) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));

  const topPages: SearchPageRow[] = (pagesRes.rows ?? []).map((r: any) => ({
    page: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));

  const totalClicks = topQueries.reduce((s, q) => s + q.clicks, 0);
  const totalImpressions = topQueries.reduce((s, q) => s + q.impressions, 0);

  return {
    totalClicks,
    totalImpressions,
    avgCtr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
    avgPosition: topQueries.length > 0 ? topQueries.reduce((s, q) => s + q.position, 0) / topQueries.length : 0,
    topQueries,
    topPages,
  };
}
