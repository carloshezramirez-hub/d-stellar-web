import type { TopPage } from "@/lib/google/analytics";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatPct(n: number) {
  return `${(n * 100).toFixed(0)}%`;
}

/** Engagement >=50% se marca verde (página que retiene), bounce >=65% se marca rojo (página que pierde gente rápido) — esto responde directo "qué funciona y qué no". */
export function PagesTable({ pages }: { pages: TopPage[] }) {
  if (pages.length === 0) return null;

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Qué páginas funcionan y cuáles no</p>
      <p className="mb-4 text-[11px] text-stellar-white/35">Tiempo promedio en página y % de gente que se queda (engagement) vs. se va sin interactuar (rebote)</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-widest text-stellar-white/40">
              <th className="py-2 pr-3">Página</th>
              <th className="py-2 pr-3 text-right">Vistas</th>
              <th className="py-2 pr-3 text-right">Tiempo prom.</th>
              <th className="py-2 pr-3 text-right">Engagement</th>
              <th className="py-2 pr-3 text-right">Rebote</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.path} className="border-b border-line/30">
                <td className="py-2 pr-3 truncate text-stellar-white/80">{p.path}</td>
                <td className="py-2 pr-3 text-right text-stellar-white/80">{p.views}</td>
                <td className="py-2 pr-3 text-right text-stellar-white/70">{formatDuration(p.avgDurationSeconds)}</td>
                <td className={`py-2 pr-3 text-right font-bold ${p.engagementRate >= 0.5 ? "text-stellar-green" : "text-stellar-white/70"}`}>
                  {formatPct(p.engagementRate)}
                </td>
                <td className={`py-2 pr-3 text-right font-bold ${p.bounceRate >= 0.65 ? "text-stellar-red" : "text-stellar-white/70"}`}>
                  {formatPct(p.bounceRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
