import type { Learning } from "@/lib/ads/analysis";

const SEVERITY_STYLE: Record<Learning["severity"], { border: string; icon: string; label: string }> = {
  win: { border: "border-stellar-green/40", icon: "✅", label: "Funcionó" },
  fix: { border: "border-stellar-red/40", icon: "🛠️", label: "Corregir" },
  watch: { border: "border-stellar-pink/40", icon: "👀", label: "Vigilar" },
};

export function LearningsPanel({ learnings }: { learnings: Learning[] }) {
  return (
    <div className="grid gap-3">
      {learnings.map((l, i) => {
        const style = SEVERITY_STYLE[l.severity];
        return (
          <div key={i} className={`rounded-lg border ${style.border} bg-white/[0.02] p-5`}>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-stellar-white/50">
              <span>{style.icon}</span> {style.label}
            </p>
            <p className="mb-1.5 font-demi text-sm font-bold text-stellar-white">{l.title}</p>
            <p className="text-sm leading-relaxed text-stellar-white/70">{l.body}</p>
          </div>
        );
      })}
    </div>
  );
}
