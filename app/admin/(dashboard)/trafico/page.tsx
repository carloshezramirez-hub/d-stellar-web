import { ChannelTable } from "@/components/admin/trafico/channel-table";
import { ConversionsTable } from "@/components/admin/trafico/conversions-table";
import { DeviceChart } from "@/components/admin/trafico/device-chart";
import { MentionsFeed } from "@/components/admin/trafico/mentions-feed";
import { PagesTable } from "@/components/admin/trafico/pages-table";
import { SearchTrendChart } from "@/components/admin/trafico/search-trend-chart";
import { SeoOpportunities } from "@/components/admin/trafico/seo-opportunities";
import { SessionsChart } from "@/components/admin/trafico/sessions-chart";
import { ConsoleShell } from "@/components/admin/console-shell";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { KpiTile } from "@/components/admin/kpi-tile";
import { StatusBanner } from "@/components/admin/status-banner";
import { resolveDateRange, withinRange } from "@/lib/admin/date-range";
import { SECTION_THEME } from "@/lib/admin/section-theme";
import { fetchTrafficSummary, type TrafficSummary } from "@/lib/google/analytics";
import { isGa4Configured, isSearchConsoleConfigured } from "@/lib/google/env";
import { fetchSearchSummary, type SearchSummary } from "@/lib/google/search-console";
import { getRecentMentions } from "@/lib/mentions/db";
import { isMentionsConfigured } from "@/lib/mentions/env";
import { TIKTOK_DISCOVERY } from "@/data/tiktok-discovery";
import { LiveVisitorsBadge } from "@/components/ui/live-visitors-badge";

const ACCENT = SECTION_THEME.trafico.accent;

function formatNumber(n: number) {
  return new Intl.NumberFormat("es-MX").format(Math.round(n));
}
function formatPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}
function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
function formatDelta(pct: number) {
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
}

interface PageProps {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

export default async function TraficoPage({ searchParams }: PageProps) {
  const { range: rawRange, from, to } = await searchParams;
  const range = resolveDateRange(rawRange, "30", from, to);

  const ga4Ready = isGa4Configured();
  const gscReady = isSearchConsoleConfigured();
  const mentionsReady = isMentionsConfigured();

  let traffic: TrafficSummary | null = null;
  let trafficError = false;
  if (ga4Ready) {
    try {
      traffic = await fetchTrafficSummary(range);
    } catch {
      trafficError = true;
    }
  }

  let search: SearchSummary | null = null;
  let searchError = false;
  if (gscReady) {
    try {
      search = await fetchSearchSummary(range);
    } catch {
      searchError = true;
    }
  }

  const allMentions = mentionsReady ? await getRecentMentions() : [];
  const mentions = allMentions.filter((m) => range.value === "all" || (m.publishedAt && withinRange(m.publishedAt, range))).slice(0, 8);

  return (
    <main className="min-h-screen">
      <ConsoleShell />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="mb-1 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">Tráfico</p>
        <p className="mb-4 max-w-2xl text-sm text-stellar-white/60">
          Google Analytics + Search Console, en vivo — quién llega al sitio, cuánto se queda, qué funciona y qué
          busca para encontrarte.
        </p>

        <div className="mb-6">
          <LiveVisitorsBadge />
        </div>

        <DateRangeFilter basePath="/admin/trafico" current={range.value} accent={ACCENT} from={from} to={to} />

        {/* Google Analytics */}
        {!ga4Ready && <StatusBanner status="not_connected" message="Google Analytics no está conectado todavía." />}
        {ga4Ready && trafficError && <StatusBanner status="error" message="No se pudo cargar Google Analytics — intenta de nuevo en un momento." />}
        {ga4Ready && !trafficError && traffic && traffic.totalSessions === 0 && (
          <StatusBanner status="empty" message="No hay sesiones registradas en este rango de fechas." />
        )}

        {traffic && traffic.totalSessions > 0 && (
          <>
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KpiTile icon="👤" value={formatNumber(traffic.totalSessions)} label="sesiones" accent={ACCENT} />
              <KpiTile icon="⏱️" value={formatDuration(traffic.avgSessionDurationSeconds)} label="tiempo promedio en el sitio" accent={ACCENT} />
              <KpiTile icon="📄" value={traffic.pagesPerSession.toFixed(1)} label="páginas por visita" accent={ACCENT} />
              <KpiTile icon="↩️" value={formatPct(traffic.bounceRate)} label="se van sin interactuar" accent={traffic.bounceRate >= 0.6 ? "red" : "white"} />
            </div>

            <div className="mb-10">
              <SessionsChart data={traffic.dailySeries} />
            </div>

            <div className="mb-10">
              <ChannelTable channels={traffic.channels} />
            </div>

            <div className="mb-10 max-w-sm">
              <DeviceChart data={traffic.devices} />
            </div>

            <div className="mb-10">
              <PagesTable pages={traffic.topPages} />
            </div>

            {traffic.conversions.length > 0 && (
              <div className="mb-10">
                <ConversionsTable events={traffic.conversions} />
              </div>
            )}
          </>
        )}

        {/* Menciones de marca (antes en Redes sociales) */}
        <section className="mb-10">
          <h2 className="mb-1 font-demi text-lg font-bold">Menciones de la marca</h2>
          <p className="mb-4 text-sm text-stellar-white/50">Web (Google Alerts) + Instagram, cuando alguien te etiqueta.</p>
          {!mentionsReady ? (
            <StatusBanner status="not_connected" message="El rastreo de menciones no está conectado todavía." />
          ) : mentions.length === 0 ? (
            <StatusBanner
              status="empty"
              message={allMentions.length === 0 ? "Todavía no hay menciones registradas." : "No hay menciones dentro de este rango de fechas."}
            />
          ) : (
            <MentionsFeed mentions={mentions} hasAnyMentions={allMentions.length > 0} />
          )}
        </section>

        {/* Search Console */}
        {!gscReady && <StatusBanner status="not_connected" message="Search Console no está conectado todavía." />}
        {gscReady && searchError && <StatusBanner status="error" message="No se pudo cargar Search Console — intenta de nuevo en un momento." />}
        {gscReady && !searchError && search && search.totalImpressions === 0 && (
          <StatusBanner status="empty" message="No hay datos de búsqueda en este rango de fechas." />
        )}

        {search && search.totalImpressions > 0 && (
          <>
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KpiTile icon="🔍" value={formatNumber(search.totalImpressions)} label="vistas en Google" accent="white" />
              <KpiTile icon="🖱️" value={formatNumber(search.totalClicks)} label="clics desde Google" accent={ACCENT} />
              <KpiTile icon="📊" value={formatPct(search.avgCtr)} label="CTR promedio" accent={ACCENT} />
              <KpiTile icon="📈" value={search.avgPosition.toFixed(1)} label="posición promedio" accent={ACCENT} />
            </div>

            <div className="mb-10">
              <SearchTrendChart data={search.dailySeries} />
            </div>

            <div className="mb-10">
              <SeoOpportunities queries={search.topQueries} />
            </div>

            <div className="mb-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-line p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Qué busca la gente en Google</p>
                <p className="mb-4 text-[11px] text-stellar-white/35">Clics / impresiones / posición promedio</p>
                <div className="grid gap-2">
                  {search.topQueries.slice(0, 10).map((q) => (
                    <div key={q.query} className="flex items-center justify-between gap-3 border-b border-line/40 pb-2 text-sm">
                      <span className="truncate text-stellar-white/80">{q.query}</span>
                      <span className="shrink-0 text-xs text-stellar-white/50">
                        {q.clicks} clics · {q.impressions} vistas · pos. {q.position.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-line p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Páginas que más aparecen en Google</p>
                <p className="mb-4 text-[11px] text-stellar-white/35">CTR = qué tan seguido le dan clic cuando la ven</p>
                <div className="grid gap-2">
                  {search.topPages.slice(0, 10).map((p) => (
                    <div key={p.page} className="flex items-center justify-between gap-3 border-b border-line/40 pb-2 text-sm">
                      <span className="truncate text-stellar-white/80">{p.page.replace("https://www.d-stellar.co", "")}</span>
                      <span className="shrink-0 text-xs text-stellar-white/50">
                        {p.clicks} clics · {formatPct(p.ctr)} CTR
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TikTok — descubrimiento, pegado a mano desde TikTok Studio (sin API/cron) */}
        <section className="mb-10">
          <h2 className="mb-1 font-demi text-lg font-bold">Qué busca la gente en TikTok</h2>
          <p className="mb-4 text-sm text-stellar-white/50">
            Cargado a mano desde TikTok Studio (sin API ni cron) — se actualiza cuando se vuelve a pegar el snapshot.
          </p>

          {TIKTOK_DISCOVERY.length === 0 ? (
            <StatusBanner status="not_connected" message="Todavía no se ha capturado el snapshot de TikTok Studio." />
          ) : (
            TIKTOK_DISCOVERY.map((snap) => (
              <div key={snap.handle} className="mb-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-stellar-white/40">
                  @{snap.handle} · {snap.periodLabel}
                </p>

                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <KpiTile icon="👁️" value={formatNumber(snap.videoViews)} label={`reproducciones (${formatDelta(snap.videoViewsDeltaPct)})`} accent={ACCENT} />
                  <KpiTile icon="👤" value={formatNumber(snap.profileViews)} label={`visitas a perfil (${formatDelta(snap.profileViewsDeltaPct)})`} accent={ACCENT} />
                  <KpiTile icon="❤️" value={formatNumber(snap.likes)} label={`me gusta (${formatDelta(snap.likesDeltaPct)})`} accent={ACCENT} />
                  <KpiTile icon="💬" value={formatNumber(snap.comments)} label={`comentarios (${formatDelta(snap.commentsDeltaPct)})`} accent={ACCENT} />
                  <KpiTile icon="🔁" value={formatNumber(snap.shares)} label={`compartidos (${formatDelta(snap.sharesDeltaPct)})`} accent={ACCENT} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-line p-4">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-stellar-white/50">De dónde llegan las vistas</p>
                    <p className="mb-4 text-[11px] text-stellar-white/35">% de reproducciones por origen dentro de TikTok</p>
                    <div className="grid gap-2">
                      {snap.trafficSource.map((s) => (
                        <div key={s.label} className="flex items-center justify-between gap-3 border-b border-line/40 pb-2 text-sm">
                          <span className="truncate text-stellar-white/80">{s.label}</span>
                          <span className="shrink-0 text-xs text-stellar-white/50">{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-line p-4">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Qué busca la gente en TikTok</p>
                    <p className="mb-4 text-[11px] text-stellar-white/35">Términos que trajeron tráfico vía "Búsqueda"</p>
                    <div className="grid gap-2">
                      {snap.searchQueries.map((q) => (
                        <div key={q.label} className="flex items-center justify-between gap-3 border-b border-line/40 pb-2 text-sm">
                          <span className="truncate text-stellar-white/80">{q.label}</span>
                          <span className="shrink-0 text-xs text-stellar-white/50">{q.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
