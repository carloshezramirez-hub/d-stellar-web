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

export interface SearchDayPoint {
  key: string;
  label: string;
  clicks: number;
  impressions: number;
}

export interface SearchDevicePoint {
  device: string;
  clicks: number;
  impressions: number;
  ctr: number;
}

export interface SearchSummary {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  topQueries: SearchQueryRow[];
  topPages: SearchPageRow[];
  dailySeries: SearchDayPoint[];
  devices: SearchDevicePoint[];
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function dayLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("es-MX", { day: "numeric", month: "short", timeZone: "UTC" });
}

/** Qué busca la gente en Google para encontrar d-stellar, y en qué páginas aterriza — últimos `days` días. */
export async function fetchSearchSummary(days = 30): Promise<SearchSummary> {
  const startDate = isoDaysAgo(days);
  const endDate = isoDaysAgo(0);

  const [queriesRes, pagesRes, dailyRes, deviceRes] = await Promise.all([
    gscSearchAnalytics({ startDate, endDate, dimensions: ["query"], rowLimit: 15 }),
    gscSearchAnalytics({ startDate, endDate, dimensions: ["page"], rowLimit: 15 }),
    gscSearchAnalytics({ startDate, endDate, dimensions: ["date"], rowLimit: 200 }),
    gscSearchAnalytics({ startDate, endDate, dimensions: ["device"], rowLimit: 10 }),
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

  const dailySeries: SearchDayPoint[] = (dailyRes.rows ?? []).map((r: any) => ({
    key: r.keys[0],
    label: dayLabel(r.keys[0]),
    clicks: r.clicks,
    impressions: r.impressions,
  }));

  const devices: SearchDevicePoint[] = (deviceRes.rows ?? []).map((r: any) => ({
    device: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
  }));

  // Totales reales agregados de TODO el periodo (no solo el top 15 de queries, que subestimaría el total).
  const totalClicks = dailySeries.reduce((s, d) => s + d.clicks, 0);
  const totalImpressions = dailySeries.reduce((s, d) => s + d.impressions, 0);

  return {
    totalClicks,
    totalImpressions,
    avgCtr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
    avgPosition: topQueries.length > 0 ? topQueries.reduce((s, q) => s + q.position, 0) / topQueries.length : 0,
    topQueries,
    topPages,
    dailySeries,
    devices,
  };
}
