import type { KpiSummary } from "@/lib/social/kpis";
import { percentChange } from "@/lib/social/kpis";

const PLATFORM_LABEL: Record<string, string> = {
  all: "Todas las redes",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

const PLATFORM_ACCENT: Record<string, string> = {
  all: "var(--color-stellar-white)",
  instagram: "var(--color-stellar-pink)",
  facebook: "var(--color-stellar-blue)",
  tiktok: "var(--color-stellar-white)",
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
  const accent = PLATFORM_ACCENT[summary.platform] ?? "var(--color-stellar-white)";

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-line p-6 transition-colors hover:border-stellar-white/30"
      style={{ borderTopColor: accent, borderTopWidth: 2 }}
    >
      <div
        className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full opacity-[0.07] blur-2xl"
        style={{ background: accent }}
        aria-hidden="true"
      />
      <p className="mb-5 text-xs font-bold tracking-widest uppercase text-stellar-white/50">
        {PLATFORM_LABEL[summary.platform] ?? summary.platform} · últimos {windowDays} días
      </p>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <div>
          <p className="font-demi text-3xl font-bold tracking-tight">{formatNumber(current.posts)}</p>
          <p className="text-xs text-stellar-white/50">publicaciones</p>
          <ChangeBadge current={current.posts} previous={previous.posts} />
        </div>
        <div>
          <p className="font-demi text-3xl font-bold tracking-tight">{formatNumber(current.reach)}</p>
          <p className="text-xs text-stellar-white/50">alcance total</p>
          <ChangeBadge current={current.reach} previous={previous.reach} />
        </div>
        <div>
          <p className="font-demi text-3xl font-bold tracking-tight">{formatNumber(current.interactions)}</p>
          <p className="text-xs text-stellar-white/50">interacciones</p>
          <ChangeBadge current={current.interactions} previous={previous.interactions} />
        </div>
        <div>
          <p className="font-demi text-3xl font-bold tracking-tight">
            {avgEngagementRate !== null ? `${(avgEngagementRate * 100).toFixed(1)}%` : "—"}
          </p>
          <p className="text-xs text-stellar-white/50">engagement rate promedio</p>
        </div>
      </div>
    </div>
  );
}
