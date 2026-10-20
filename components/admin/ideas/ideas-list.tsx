import type { Idea } from "@/lib/insights/sales-ideas";

const SEVERITY_STYLE: Record<Idea["severity"], { border: string; icon: string }> = {
  win: { border: "border-stellar-green/40", icon: "✅" },
  fix: { border: "border-stellar-red/40", icon: "🛠️" },
  watch: { border: "border-stellar-pink/40", icon: "👀" },
};

const SOURCE_LABEL: Record<Idea["source"], string> = {
  ventas: "Ventas",
  anuncios: "Anuncios",
  eventos: "Eventos",
  fidelidad: "Fidelidad",
  pedidos: "Pedidos",
  redes: "Redes sociales",
};

export function IdeasList({ ideas }: { ideas: Idea[] }) {
  if (ideas.length === 0) {
    return (
      <p className="rounded border border-line p-6 text-sm text-stellar-white/60">
        Todavía no hay suficientes datos conectados para generar ideas confiables.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {ideas.map((idea, i) => {
        const style = SEVERITY_STYLE[idea.severity];
        return (
          <div key={i} className={`rounded-lg border ${style.border} bg-white/[0.02] p-5`}>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-stellar-white/50">
              <span>{style.icon}</span> {SOURCE_LABEL[idea.source]}
            </p>
            <p className="mb-1.5 font-demi text-sm font-bold text-stellar-white">{idea.title}</p>
            <p className="text-sm leading-relaxed text-stellar-white/70">{idea.body}</p>
          </div>
        );
      })}
    </div>
  );
}
