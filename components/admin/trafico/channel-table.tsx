import type { ChannelPoint } from "@/lib/google/analytics";

const CHANNEL_LABEL: Record<string, string> = {
  Direct: "Directo",
  "Organic Search": "Búsqueda orgánica",
  "Organic Social": "Redes sociales",
  Referral: "Referidos",
  "Paid Social": "Anuncios sociales",
  "AI Assistant": "Asistentes de IA",
  Unassigned: "Sin clasificar",
};

function formatPct(n: number) {
  return `${(n * 100).toFixed(0)}%`;
}

/** Una sola tabla responde "de dónde viene la gente, cuánta, qué tan buena es esa visita y si va al alza o a la baja" — reemplaza al bar chart simple. */
export function ChannelTable({ channels }: { channels: ChannelPoint[] }) {
  if (channels.length === 0) return null;
  const totalSessions = channels.reduce((s, c) => s + c.sessions, 0);

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stellar-white/50">De dónde viene la gente</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-widest text-stellar-white/40">
              <th className="py-2 pr-3">Canal</th>
              <th className="py-2 pr-3 text-right">Sesiones</th>
              <th className="py-2 pr-3 text-right">% del tráfico</th>
              <th className="py-2 pr-3 text-right">Engagement</th>
              <th className="py-2 text-right">Variación</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((c) => {
              const pct = totalSessions > 0 ? c.sessions / totalSessions : 0;
              const variation =
                c.previousSessions !== null && c.previousSessions > 0 ? (c.sessions - c.previousSessions) / c.previousSessions : null;
              return (
                <tr key={c.channel} className="border-b border-line/30">
                  <td className="py-2 pr-3 text-stellar-white/80">{CHANNEL_LABEL[c.channel] ?? c.channel}</td>
                  <td className="py-2 pr-3 text-right font-bold text-stellar-white">{c.sessions}</td>
                  <td className="py-2 pr-3 text-right text-stellar-white/70">{formatPct(pct)}</td>
                  <td className="py-2 pr-3 text-right text-stellar-white/70">{formatPct(c.engagementRate)}</td>
                  <td className={`py-2 text-right font-bold ${variation === null ? "text-stellar-white/30" : variation >= 0 ? "text-stellar-green" : "text-stellar-red"}`}>
                    {variation === null ? "—" : `${variation >= 0 ? "▲" : "▼"} ${Math.abs(variation * 100).toFixed(0)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
