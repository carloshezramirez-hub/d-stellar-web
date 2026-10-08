import type { KpiSummary } from "@/lib/social/kpis";
import { percentChange } from "@/lib/social/kpis";

const PLATFORM_LABEL: Record<string, string> = {
  all: "Todas las redes",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

const PLATFORM_ICON: Record<string, string> = {
  all: "📊",
  instagram: "📸",
  facebook: "👍",
  tiktok: "🎵",
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
  if (change === null) return <span className="text-[10px] text-stellar-white/35">sin datos previos</span>;
  const positive = change >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${positive ? "text-stellar-green" : "text-stellar-red"}`}>
      {positive ? "▲" : "▼"} {Math.abs(change).toFixed(0)}%
    </span>
  );
}

const STAT_ICON = {
  posts: "🗓️",
  reach: "📡",
  interactions: "💬",
  engagement: "⚡",
} as const;

function Stat({
  icon,
  value,
  label,
  change,
}: {
  icon: string;
  value: string;
  label: string;
  change?: { current: number; previous: number };
}) {
  return (
    <div className="flex items-center gap-3 px-1 py-2 sm:flex-1 sm:flex-col sm:items-start sm:gap-1 sm:border-l sm:border-line sm:px-5 sm:py-0 sm:first:border-l-0 sm:first:pl-0">
      <span className="text-lg opacity-70 sm:hidden">{icon}</span>
      <div className="flex w-full items-baseline justify-between gap-2 sm:block">
        <p className="font-demi text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
        {change && <ChangeBadge current={change.current} previous={change.previous} />}
      </div>
      <p className="text-xs text-stellar-white/50">
        <span className="mr-1 hidden sm:inline">{icon}</span>
        {label}
      </p>
    </div>
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
      <div className="mb-5 flex items-center gap-2">
        <span
          className="flex size-7 items-center justify-center rounded-full text-sm"
          style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)` }}
        >
          {PLATFORM_ICON[summary.platform] ?? "📈"}
        </span>
        <p className="text-xs font-bold tracking-widest uppercase text-stellar-white/50">
          {PLATFORM_LABEL[summary.platform] ?? summary.platform} · últimos {windowDays} días
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:gap-0">
        <Stat icon={STAT_ICON.posts} value={formatNumber(current.posts)} label="publicaciones" change={{ current: current.posts, previous: previous.posts }} />
        <Stat icon={STAT_ICON.reach} value={formatNumber(current.reach)} label="alcance total" change={{ current: current.reach, previous: previous.reach }} />
        <Stat icon={STAT_ICON.interactions} value={formatNumber(current.interactions)} label="interacciones" change={{ current: current.interactions, previous: previous.interactions }} />
        <Stat
          icon={STAT_ICON.engagement}
          value={avgEngagementRate !== null ? `${(avgEngagementRate * 100).toFixed(1)}%` : "—"}
          label="engagement rate promedio"
        />
      </div>
    </div>
  );
}
