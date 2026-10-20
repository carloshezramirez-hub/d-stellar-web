import { ga4RunReport } from "@/lib/google/client";

export interface TrafficDayPoint {
  key: string;
  label: string;
  sessions: number;
}

export interface ChannelPoint {
  channel: string;
  sessions: number;
}

export interface TopPage {
  path: string;
  views: number;
  sessions: number;
}

export interface TrafficSummary {
  totalSessions: number;
  totalUsers: number;
  dailySeries: TrafficDayPoint[];
  channels: ChannelPoint[];
  topPages: TopPage[];
}

function gaDateToLabel(yyyymmdd: string): { key: string; label: string } {
  const key = `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
  const label = new Date(`${key}T00:00:00Z`).toLocaleDateString("es-MX", { day: "numeric", month: "short", timeZone: "UTC" });
  return { key, label };
}

/** Tráfico real del sitio (GA4) de los últimos `days` días: sesiones por día, por canal, y páginas más vistas. */
export async function fetchTrafficSummary(days = 30): Promise<TrafficSummary> {
  const dateRange = { startDate: `${days}daysAgo`, endDate: "today" };

  const [daily, totals, channels, pages] = await Promise.all([
    ga4RunReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    ga4RunReport({ dateRanges: [dateRange], metrics: [{ name: "sessions" }, { name: "activeUsers" }] }),
    ga4RunReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    ga4RunReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    }),
  ]);

  const dailySeries: TrafficDayPoint[] = (daily.rows ?? []).map((r: any) => {
    const { key, label } = gaDateToLabel(r.dimensionValues[0].value);
    return { key, label, sessions: Number(r.metricValues[0].value) };
  });

  const channelRows: ChannelPoint[] = (channels.rows ?? []).map((r: any) => ({
    channel: r.dimensionValues[0].value,
    sessions: Number(r.metricValues[0].value),
  }));

  const topPages: TopPage[] = (pages.rows ?? []).map((r: any) => ({
    path: r.dimensionValues[0].value,
    views: Number(r.metricValues[0].value),
    sessions: Number(r.metricValues[1].value),
  }));

  const totalsRow = totals.rows?.[0]?.metricValues;

  return {
    totalSessions: totalsRow ? Number(totalsRow[0].value) : 0,
    totalUsers: totalsRow ? Number(totalsRow[1].value) : 0,
    dailySeries,
    channels: channelRows,
    topPages,
  };
}
