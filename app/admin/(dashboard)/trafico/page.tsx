import { ChannelChart } from "@/components/admin/trafico/channel-chart";
import { SessionsChart } from "@/components/admin/trafico/sessions-chart";
import { ConsoleShell } from "@/components/admin/console-shell";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { KpiTile } from "@/components/admin/kpi-tile";
import { resolveRange } from "@/lib/admin/date-range";
import { fetchTrafficSummary } from "@/lib/google/analytics";
import { isGa4Configured, isSearchConsoleConfigured } from "@/lib/google/env";
import { fetchSearchSummary } from "@/lib/google/search-console";

function formatNumber(n: number) {
  return new Intl.NumberFormat("es-MX").format(Math.round(n));
}
function formatPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function TraficoPage({ searchParams }: PageProps) {
  const { range: rawRange } = await searchParams;
  const range = resolveRange(rawRange, "30");
  const days = range.days ?? 90;

  const ga4Ready = isGa4Configured();
  const gscReady = isSearchConsoleConfigured();

  if (!ga4Ready && !gscReady) {
    return (
      <main className="min-h-screen">
        <ConsoleShell />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <p className="font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">Tráfico</p>
          <p className="mt-4 text-sm text-stellar-white/60">
            Esta sección lee Google Analytics y Search Console — faltan las variables de entorno
            (GOOGLE_SERVICE_ACCOUNT_JSON / GA4_PROPERTY_ID / GSC_SITE_URL) en este ambiente.
          </p>
        </div>
      </main>
    );
  }

  const [traffic, search] = await Promise.all([
    ga4Ready ? fetchTrafficSummary(days) : Promise.resolve(null),
    gscReady ? fetchSearchSummary(days) : Promise.resolve(null),
  ]);

  return (
    <main className="min-h-screen">
      <ConsoleShell />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="mb-1 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">Tráfico</p>
        <p className="mb-6 max-w-2xl text-sm text-stellar-white/60">
          Google Analytics (GA4) + Search Console, en vivo — quién llega al sitio y qué busca para encontrarte.
        </p>

        <DateRangeFilter basePath="/admin/trafico" current={range.value} />

        {traffic && (
          <>
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KpiTile icon="👤" value={formatNumber(traffic.totalSessions)} label="sesiones" accent="blue" />
              <KpiTile icon="🧑‍🤝‍🧑" value={formatNumber(traffic.totalUsers)} label="usuarios" accent="purple" />
              {search && <KpiTile icon="🔍" value={formatNumber(search.totalClicks)} label="clics desde Google" accent="pink" />}
              {search && <KpiTile icon="📈" value={search.avgPosition.toFixed(1)} label="posición promedio" accent="green" />}
            </div>

            <div className="mb-10">
              <SessionsChart data={traffic.dailySeries} />
            </div>

            <div className="mb-10 grid gap-4 sm:grid-cols-2">
              <ChannelChart data={traffic.channels} />

              <div className="rounded-lg border border-line p-4">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Páginas más vistas</p>
                <div className="grid gap-2">
                  {traffic.topPages.slice(0, 8).map((p) => (
                    <div key={p.path} className="flex items-center justify-between gap-3 border-b border-line/40 pb-2 text-sm">
                      <span className="truncate text-stellar-white/80">{p.path}</span>
                      <span className="shrink-0 font-bold text-stellar-white">{formatNumber(p.views)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {search && (
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
        )}
      </div>
    </main>
  );
}
