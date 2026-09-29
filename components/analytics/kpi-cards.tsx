import type { KpiSummary } from "@/lib/social/kpis";
import { percentChange } from "@/lib/social/kpis";

const PLATFORM_LABEL: Record<string, string> = {
  all: "Todas las redes",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

function formatNumber(n: number) {
  return new Intl.NumberFormat("es-MX").format(Math.round(n));
}

function ChangeBadge({ current, previous }: { current: number; previous: number }) {
  const change = percentChange(current, previous);
  if (change === null) return <span className="text-[11px] text-stellar-white/40">sin datos previos</span>;
  const positive = change >= 0;
  return (
    <span className={`text-[11px] font-bold ${positive ? "text-stellar-green" : "text-stellar-red"}`}>
      {positive ? "▲" : "▼"} {Math.abs(change).toFixed(0)}% vs periodo anterior
    </span>
  );
}

export function KpiCards({ summary, windowDays }: { summary: KpiSummary; windowDays: number }) {
  const { current, previous, avgEngagementRate } = summary;

  return (
    <div className="rounded border border-line p-6">
      <p className="mb-4 text-xs uppercase tracking-widest text-stellar-white/50">
        {PLATFORM_LABEL[summary.platform] ?? summary.platform} · últimos {windowDays} días
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="font-demi text-2xl font-bold">{formatNumber(current.posts)}</p>
          <p className="text-xs text-stellar-white/50">publicaciones</p>
          <ChangeBadge current={current.posts} previous={previous.posts} />
        </div>
        <div>
          <p className="font-demi text-2xl font-bold">{formatNumber(current.reach)}</p>
          <p className="text-xs text-stellar-white/50">alcance total</p>
          <ChangeBadge current={current.reach} previous={previous.reach} />
        </div>
        <div>
          <p className="font-demi text-2xl font-bold">{formatNumber(current.interactions)}</p>
          <p className="text-xs text-stellar-white/50">interacciones</p>
          <ChangeBadge current={current.interactions} previous={previous.interactions} />
        </div>
        <div>
          <p className="font-demi text-2xl font-bold">
            {avgEngagementRate !== null ? `${(avgEngagementRate * 100).toFixed(1)}%` : "—"}
          </p>
          <p className="text-xs text-stellar-white/50">engagement rate promedio</p>
        </div>
      </div>
    </div>
  );
}
