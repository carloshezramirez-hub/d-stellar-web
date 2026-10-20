import type { AdCampaign } from "@/data/ads-campaigns";
import type { CampaignEfficiency } from "@/lib/ads/analysis";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

const STATUS_LABEL: Record<AdCampaign["status"], string> = { active: "Activa", closed: "Cerrada", completed: "Completada" };
const STATUS_COLOR: Record<AdCampaign["status"], string> = {
  active: "text-stellar-green",
  closed: "text-stellar-white/40",
  completed: "text-stellar-blue",
};

/** Vista de escaneo rápido — todas las campañas en una tabla, antes del detalle por tarjeta de abajo. */
export function CampaignsTable({ efficiencies }: { efficiencies: CampaignEfficiency[] }) {
  if (efficiencies.length === 0) return null;
  const best = [...efficiencies].sort((a, b) => b.likeRate - a.likeRate)[0];

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Campañas de un vistazo</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-widest text-stellar-white/40">
              <th className="py-2 pr-3">Campaña</th>
              <th className="py-2 pr-3">Estado</th>
              <th className="py-2 pr-3 text-right">Gasto</th>
              <th className="py-2 pr-3 text-right">Vistas</th>
              <th className="py-2 pr-3 text-right">Costo/like</th>
              <th className="py-2 pr-3 text-right">Clics</th>
            </tr>
          </thead>
          <tbody>
            {efficiencies.map((e) => (
              <tr key={e.campaign.id} className={`border-b border-line/30 ${e.campaign.id === best.campaign.id ? "bg-stellar-green/5" : ""}`}>
                <td className="py-2 pr-3 max-w-[220px] truncate text-stellar-white/80">
                  {e.campaign.id === best.campaign.id && "🏆 "}
                  {e.campaign.videoCaption.split(" ").slice(0, 5).join(" ")}…
                </td>
                <td className={`py-2 pr-3 font-bold ${STATUS_COLOR[e.campaign.status]}`}>{STATUS_LABEL[e.campaign.status]}</td>
                <td className="py-2 pr-3 text-right text-stellar-white">{formatMoney(e.campaign.adCostMXN)}</td>
                <td className="py-2 pr-3 text-right text-stellar-white/70">{e.campaign.videoViews.toLocaleString("es-MX")}</td>
                <td className="py-2 pr-3 text-right text-stellar-white/70">{e.costPerLike !== null ? formatMoney(e.costPerLike) : "—"}</td>
                <td className="py-2 pr-3 text-right text-stellar-white/70">{e.campaign.buttonClicks ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
