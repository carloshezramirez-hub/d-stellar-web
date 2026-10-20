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
  avgDurationSeconds: number;
  engagementRate: number;
  bounceRate: number;
}

export interface DevicePoint {
  device: string;
  sessions: number;
  engagementRate: number;
}

export interface ConversionEvent {
  name: string;
  count: number;
}

export interface TrafficSummary {
  totalSessions: number;
  totalUsers: number;
  newUsers: number;
  avgSessionDurationSeconds: number;
  engagementRate: number;
  bounceRate: number;
  pagesPerSession: number;
  dailySeries: TrafficDayPoint[];
  channels: ChannelPoint[];
  topPages: TopPage[];
  devices: DevicePoint[];
  conversions: ConversionEvent[];
}

function gaDateToLabel(yyyymmdd: string): { key: string; label: string } {
  const key = `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
  const label = new Date(`${key}T00:00:00Z`).toLocaleDateString("es-MX", { day: "numeric", month: "short", timeZone: "UTC" });
  return { key, label };
}

// Eventos propios del sitio (ver components/analytics.tsx) que de verdad
// indican intención de compra/contacto — se excluyen los automáticos de
// GA4 (page_view, session_start, scroll, click genérico, etc.) para que la
// tabla de "acciones reales" no se llene de ruido.
const MEANINGFUL_EVENTS = new Set([
  "begin_checkout_ticket",
  "submit_ticket_order",
  "begin_checkout_pickup",
  "submit_pickup_order",
  "submit_loyalty_signup",
  "click_whatsapp",
  "click_phone",
  "click_directions",
  "click_event",
  "click_menu",
  "click_instagram",
  "click_tiktok",
]);

/** Tráfico real del sitio (GA4) de los últimos `days` días — todo lo útil en una sola función. */
export async function fetchTrafficSummary(days = 30): Promise<TrafficSummary> {
  const dateRange = { startDate: `${days}daysAgo`, endDate: "today" };

  const [daily, totals, channels, pages, devices, events] = await Promise.all([
    ga4RunReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    ga4RunReport({
      dateRanges: [dateRange],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "averageSessionDuration" },
        { name: "engagementRate" },
        { name: "bounceRate" },
        { name: "screenPageViewsPerSession" },
      ],
    }),
    ga4RunReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    ga4RunReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "sessions" },
        { name: "averageSessionDuration" },
        { name: "engagementRate" },
        { name: "bounceRate" },
      ],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 12,
    }),
    ga4RunReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }, { name: "engagementRate" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    ga4RunReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 30,
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
    avgDurationSeconds: Number(r.metricValues[2].value),
    engagementRate: Number(r.metricValues[3].value),
    bounceRate: Number(r.metricValues[4].value),
  }));

  const deviceRows: DevicePoint[] = (devices.rows ?? []).map((r: any) => ({
    device: r.dimensionValues[0].value,
    sessions: Number(r.metricValues[0].value),
    engagementRate: Number(r.metricValues[1].value),
  }));

  const conversions: ConversionEvent[] = (events.rows ?? [])
    .filter((r: any) => MEANINGFUL_EVENTS.has(r.dimensionValues[0].value))
    .map((r: any) => ({ name: r.dimensionValues[0].value, count: Number(r.metricValues[0].value) }));

  const t = totals.rows?.[0]?.metricValues;

  return {
    totalSessions: t ? Number(t[0].value) : 0,
    totalUsers: t ? Number(t[1].value) : 0,
    newUsers: t ? Number(t[2].value) : 0,
    avgSessionDurationSeconds: t ? Number(t[3].value) : 0,
    engagementRate: t ? Number(t[4].value) : 0,
    bounceRate: t ? Number(t[5].value) : 0,
    pagesPerSession: t ? Number(t[6].value) : 0,
    dailySeries,
    channels: channelRows,
    topPages,
    devices: deviceRows,
    conversions,
  };
}
