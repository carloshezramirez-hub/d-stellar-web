import type { FeedPost } from "@/lib/social/queries";

const PLATFORM_GRADIENT: Record<string, string> = {
  tiktok: "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))",
  instagram: "linear-gradient(90deg, #ff70e0, #a21ffe)",
  facebook: "linear-gradient(90deg, #243ad2, #4d63e0)",
};

function formatCount(n: number) {
  return new Intl.NumberFormat("es-MX").format(Math.round(n));
}

interface FunnelStage {
  label: string;
  value: number;
}

/**
 * Embudo de retención construido SOLO con métricas agregadas reales
 * (alcance, reproducciones, skip_rate de IG, completion_rate de TikTok) —
 * nunca segundo a segundo, porque ninguna API de TikTok/Instagram expone
 * eso. Cada barra es un punto de control real, no una curva interpolada.
 */
export function RetentionFunnel({ post }: { post: FeedPost }) {
  const stages: FunnelStage[] = [];

  if (post.reach !== null && post.reach > 0) stages.push({ label: "Alcance", value: post.reach });
  if (post.views !== null && post.views > 0) stages.push({ label: "Reproducciones", value: post.views });

  if (post.skipRate !== null && post.views !== null) {
    stages.push({ label: "Se quedaron pasado el inicio", value: post.views * (1 - post.skipRate) });
  }
  if (post.completionRate !== null && post.views !== null) {
    stages.push({ label: "Vieron el video completo", value: post.views * post.completionRate });
  }

  if (stages.length < 2) {
    return <p className="text-sm text-stellar-white/40">No hay suficientes métricas de retención para este post.</p>;
  }

  const max = stages[0].value;
  const gradient = PLATFORM_GRADIENT[post.platform] ?? PLATFORM_GRADIENT.tiktok;

  return (
    <div className="grid gap-3">
      {stages.map((stage, i) => {
        const pctOfMax = max > 0 ? (stage.value / max) * 100 : 0;
        const pctOfPrevious = i > 0 && stages[i - 1].value > 0 ? (stage.value / stages[i - 1].value) * 100 : 100;
        return (
          <div key={stage.label}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="text-stellar-white/60">{stage.label}</span>
              <span className="font-demi font-bold text-stellar-white">
                {formatCount(stage.value)}
                {i > 0 && <span className="ml-1.5 text-stellar-white/40">({pctOfPrevious.toFixed(0)}%)</span>}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full motion-safe:animate-[growBar_0.6s_ease-out]"
                style={{ width: `${Math.max(pctOfMax, 2)}%`, background: gradient }}
              />
            </div>
          </div>
        );
      })}

      {post.avgWatchTimeSeconds !== null && (
        <p className="text-xs text-stellar-white/50">
          ⏱ En promedio la gente vio <span className="font-bold text-stellar-white">{post.avgWatchTimeSeconds.toFixed(1)}s</span> de este video.
        </p>
      )}

      <p className="border-t border-line pt-2 text-[10px] leading-relaxed text-stellar-white/30">
        Puntos de control reales de la plataforma, no una curva segundo a segundo — ni TikTok ni Instagram exponen
        eso vía API (solo dentro de su app nativa).
      </p>
    </div>
  );
}
