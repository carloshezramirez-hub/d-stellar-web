import { CampaignsChart } from "@/components/admin/ads/campaigns-chart";
import { CampaignCard } from "@/components/admin/ads/campaign-card";
import { CampaignsTable } from "@/components/admin/ads/campaigns-table";
import { LearningsPanel } from "@/components/admin/ads/learnings-panel";
import { ConsoleShell } from "@/components/admin/console-shell";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { KpiTile } from "@/components/admin/kpi-tile";
import { resolveDateRange, withinRange } from "@/lib/admin/date-range";
import { SECTION_THEME } from "@/lib/admin/section-theme";
import { AD_CAMPAIGNS } from "@/data/ads-campaigns";
import { buildAllEfficiency, buildLearnings, buildTotals } from "@/lib/ads/analysis";

const ACCENT = SECTION_THEME.anuncios.accent;

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("es-MX").format(Math.round(n));
}

interface PageProps {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

export default async function AdsDashboardPage({ searchParams }: PageProps) {
  const { range: rawRange, from, to } = await searchParams;
  // Default "Todo": hoy son solo 5 campañas en una semana — filtrar más angosto por defecto las escondería.
  const range = resolveDateRange(rawRange, "all", from, to);

  const campaigns = AD_CAMPAIGNS.filter((c) => withinRange(c.startedAt, range));
  const totals = buildTotals(campaigns);
  // "Qué aprendimos" siempre compara el set completo — son reglas pensadas
  // para 5 campañas específicas, filtrar rompería comparaciones con nombre propio.
  const learnings = buildLearnings();
  const efficiencies = buildAllEfficiency(campaigns);
  const efficiencyByCampaignId = new Map(efficiencies.map((e) => [e.campaign.id, e]));

  return (
    <main className="min-h-screen">
      <ConsoleShell />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="mb-1 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">Anuncios</p>
        <p className="mb-6 max-w-2xl text-sm text-stellar-white/60">
          Promociones de TikTok Ads (&quot;More video views&quot;) de @dstellarmx, cargadas a mano desde TikTok Ads
          Manager — sin cron automático, se actualiza cuando pegues los datos de nuevas campañas.
        </p>

        <DateRangeFilter basePath="/admin/anuncios" current={range.value} accent={ACCENT} from={from} to={to} />

        {campaigns.length === 0 ? (
          <p className="rounded border border-line p-6 text-sm text-stellar-white/60">
            No hay campañas dentro de este rango de fechas.
          </p>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <KpiTile icon="💸" value={formatMoney(totals.totalSpendMXN)} label="gastado total" accent={ACCENT} />
              <KpiTile icon="👁️" value={formatNumber(totals.totalViews)} label="reproducciones" accent={ACCENT} />
              <KpiTile icon="❤️" value={formatNumber(totals.totalLikes)} label="me gusta" accent={ACCENT} />
              <KpiTile icon="➕" value={String(totals.totalNewFollowers)} label="seguidores nuevos" accent={ACCENT} />
              <KpiTile icon="📊" value={formatMoney(totals.blendedCpmMXN)} label="CPM promedio" accent={ACCENT} />
            </div>

            <section className="mb-10">
              <CampaignsTable efficiencies={efficiencies} />
            </section>

            <section className="mb-10">
              <CampaignsChart efficiencies={efficiencies} />
            </section>
          </>
        )}

        <section className="mb-10">
          <h2 className="mb-1 font-demi text-xl font-bold">Qué aprendimos</h2>
          <p className="mb-4 text-sm text-stellar-white/50">
            Comparando las 5 campañas entre sí (siempre el histórico completo) — no son opiniones, son los números
            cruzados.
          </p>
          <LearningsPanel learnings={learnings} />
        </section>

        {campaigns.length > 0 && (
          <section>
            <h2 className="mb-4 font-demi text-xl font-bold">Campañas</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {campaigns.map((campaign) => {
                const efficiency = efficiencyByCampaignId.get(campaign.id);
                if (!efficiency) return null;
                return <CampaignCard key={campaign.id} campaign={campaign} efficiency={efficiency} />;
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
