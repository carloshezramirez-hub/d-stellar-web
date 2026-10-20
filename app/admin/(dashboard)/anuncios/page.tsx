import Link from "next/link";
import { CampaignCard } from "@/components/admin/ads/campaign-card";
import { LearningsPanel } from "@/components/admin/ads/learnings-panel";
import { AD_CAMPAIGNS } from "@/data/ads-campaigns";
import { buildAllEfficiency, buildLearnings, buildTotals } from "@/lib/ads/analysis";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("es-MX").format(Math.round(n));
}

export default function AdsDashboardPage() {
  const totals = buildTotals();
  const learnings = buildLearnings();
  const efficiencyByCampaignId = new Map(buildAllEfficiency().map((e) => [e.campaign.id, e]));

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <h1 className="font-demi text-sm font-bold uppercase tracking-widest text-stellar-white">d-stellar · Anuncios</h1>
          <Link href="/admin" className="text-xs text-stellar-white/60 underline underline-offset-4">
            ← Volver al panel
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-6">
        <p className="mb-8 max-w-2xl text-sm text-stellar-white/60">
          Promociones de TikTok Ads ("More video views") de @dstellarmx, cargadas a mano desde TikTok Ads Manager —
          esta sección no tiene cron automático todavía, se actualiza cuando pegues los datos de nuevas campañas.
          El objetivo: ver qué video/targeting funciona antes de poner más presupuesto.
        </p>

        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-lg border border-line p-5">
            <p className="font-demi text-2xl font-bold">{formatMoney(totals.totalSpendMXN)}</p>
            <p className="text-xs text-stellar-white/50">gastado total</p>
          </div>
          <div className="rounded-lg border border-line p-5">
            <p className="font-demi text-2xl font-bold">{formatNumber(totals.totalViews)}</p>
            <p className="text-xs text-stellar-white/50">reproducciones</p>
          </div>
          <div className="rounded-lg border border-line p-5">
            <p className="font-demi text-2xl font-bold">{formatNumber(totals.totalLikes)}</p>
            <p className="text-xs text-stellar-white/50">me gusta</p>
          </div>
          <div className="rounded-lg border border-line p-5">
            <p className="font-demi text-2xl font-bold">{totals.totalNewFollowers}</p>
            <p className="text-xs text-stellar-white/50">seguidores nuevos</p>
          </div>
          <div className="rounded-lg border border-line p-5">
            <p className="font-demi text-2xl font-bold">{formatMoney(totals.blendedCpmMXN)}</p>
            <p className="text-xs text-stellar-white/50">CPM promedio</p>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="mb-1 font-demi text-xl font-bold">Qué aprendimos</h2>
          <p className="mb-4 text-sm text-stellar-white/50">
            Comparando las 5 campañas entre sí — no son opiniones, son los números de arriba cruzados.
          </p>
          <LearningsPanel learnings={learnings} />
        </section>

        <section>
          <h2 className="mb-4 font-demi text-xl font-bold">Campañas</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {AD_CAMPAIGNS.map((campaign) => {
              const efficiency = efficiencyByCampaignId.get(campaign.id);
              if (!efficiency) return null;
              return <CampaignCard key={campaign.id} campaign={campaign} efficiency={efficiency} />;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
