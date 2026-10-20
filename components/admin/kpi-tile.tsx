const ACCENT: Record<string, string> = {
  pink: "var(--color-stellar-pink)",
  green: "var(--color-stellar-green)",
  blue: "var(--color-stellar-blue)",
  red: "var(--color-stellar-red)",
  purple: "var(--color-stellar-purple)",
  white: "var(--color-stellar-white)",
};

/** Tile de KPI reusable — mismo lenguaje visual en todos los dashboards (hub, anuncios, pedidos, eventos, fidelidad). */
export function KpiTile({
  icon,
  value,
  label,
  accent = "white",
}: {
  icon: string;
  value: string;
  label: string;
  accent?: keyof typeof ACCENT;
}) {
  const color = ACCENT[accent];
  return (
    <div
      className="relative overflow-hidden rounded-lg border border-line bg-stellar-black-soft p-5"
      style={{ borderTopColor: color, borderTopWidth: 2 }}
    >
      <div
        className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full opacity-[0.08] blur-2xl"
        style={{ background: color }}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between">
        <p className="font-demi text-2xl font-bold sm:text-3xl">{value}</p>
        <span className="text-lg opacity-70">{icon}</span>
      </div>
      <p className="mt-1.5 text-xs text-stellar-white/50">{label}</p>
    </div>
  );
}
