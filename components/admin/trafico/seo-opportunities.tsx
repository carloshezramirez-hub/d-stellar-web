import type { SearchQueryRow } from "@/lib/google/search-console";

function formatPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function isBranded(query: string) {
  return query.toLowerCase().includes("stellar");
}

/**
 * Dos oportunidades reales de SEO, calculadas sobre las queries reales de
 * Search Console (nunca inventadas): términos "casi en primera página"
 * (posición 11-20, con empujón real podrían subir) y términos donde ya
 * apareces pero nadie le da clic (título/descripción no convence).
 */
export function SeoOpportunities({ queries }: { queries: SearchQueryRow[] }) {
  const nonBranded = queries.filter((q) => !isBranded(q.query));
  const nearMiss = nonBranded.filter((q) => q.position > 10 && q.position <= 20).sort((a, b) => a.position - b.position);
  const zeroClick = nonBranded
    .filter((q) => q.clicks === 0 && q.impressions >= 2)
    .sort((a, b) => b.impressions - a.impressions);

  if (nearMiss.length === 0 && zeroClick.length === 0) return null;

  return (
    <div className="rounded-lg border border-stellar-pink/30 bg-stellar-pink/[0.03] p-4">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-stellar-pink">Oportunidades de SEO</p>
      <p className="mb-4 text-[11px] text-stellar-white/35">Calculado sobre tus búsquedas reales en Search Console, no genérico</p>

      {nearMiss.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold text-stellar-white/70">Casi en primera página (posición 11-20)</p>
          <div className="grid gap-1.5">
            {nearMiss.slice(0, 5).map((q) => (
              <div key={q.query} className="flex items-center justify-between text-sm">
                <span className="text-stellar-white/80">{q.query}</span>
                <span className="text-xs text-stellar-white/50">posición {q.position.toFixed(0)} · {q.impressions} vistas</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {zeroClick.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold text-stellar-white/70">Apareces pero nadie le da clic</p>
          <div className="grid gap-1.5">
            {zeroClick.slice(0, 5).map((q) => (
              <div key={q.query} className="flex items-center justify-between text-sm">
                <span className="text-stellar-white/80">{q.query}</span>
                <span className="text-xs text-stellar-white/50">{q.impressions} vistas · {formatPct(q.ctr)} CTR</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
