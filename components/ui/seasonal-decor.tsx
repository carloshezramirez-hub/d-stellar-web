/**
 * Decoración de temporada — Día de Muertos / Halloween (oct-nov 2026), atada
 * al mismo periodo que el menú temático y el evento "El Camino de Regreso"
 * (ver PROJECT_NOTES.md → "Monthly menu rotation"). Usa solo la paleta de
 * marca (blanco de línea + glow rosa), nada de naranja/negro genérico de
 * Halloween. Quitar o archivar este componente (y su mount en
 * app/[locale]/layout.tsx) cuando termine la temporada — no tiene
 * auto-expiración por fecha, mismo patrón manual que MENU_MONTH_LABEL.
 *
 * La vela va en bottom-24 (no bottom-4/6) porque MobileActionBar es una
 * barra fija z-50 pegada al fondo en móvil (<md) — cualquier offset menor
 * queda tapado detrás de ella.
 */

// Telaraña radial real: rayos desde un punto de anclaje en la esquina +
// anillos concéntricos con "pandeo" hacia el centro (como hilos reales bajo
// tensión), en vez de líneas sueltas sin estructura.
const WEB_ANCHOR = { x: 206, y: 8 };
const WEB_SPOKES = [
  { angle: 78, length: 150 },
  { angle: 102, length: 175 },
  { angle: 126, length: 192 },
  { angle: 150, length: 198 },
  { angle: 174, length: 188 },
  { angle: 198, length: 168 },
  { angle: 222, length: 142 },
];

function spokePoint(angleDeg: number, length: number, frac = 1) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: WEB_ANCHOR.x + Math.cos(rad) * length * frac,
    y: WEB_ANCHOR.y + Math.sin(rad) * length * frac,
  };
}

// Pétalo de cempasúchil, simplificado como roseta radial de elipses.
function Marigold({
  cx,
  cy,
  size,
  petal,
  center,
  rotate = 0,
}: {
  cx: number;
  cy: number;
  size: number;
  petal: string;
  center: string;
  rotate?: number;
}) {
  const petals = 9;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotate})`}>
      {Array.from({ length: petals }).map((_, i) => (
        <ellipse
          key={i}
          cx={0}
          cy={-size * 0.55}
          rx={size * 0.3}
          ry={size * 0.5}
          fill={petal}
          transform={`rotate(${(360 / petals) * i})`}
        />
      ))}
      <circle r={size * 0.3} fill={center} />
    </g>
  );
}

function webRingPath(frac: number, sag: number) {
  const pts = WEB_SPOKES.map(({ angle, length }) => spokePoint(angle, length, frac));
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = WEB_ANCHOR.x - mx;
    const dy = WEB_ANCHOR.y - my;
    const dist = Math.hypot(dx, dy) || 1;
    const cx = mx + (dx / dist) * sag;
    const cy = my + (dy / dist) * sag;
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}

const WEB_RINGS = [
  { frac: 0.22, sag: 3, opacity: 0.35 },
  { frac: 0.42, sag: 6, opacity: 0.45 },
  { frac: 0.64, sag: 9, opacity: 0.55 },
  { frac: 0.86, sag: 11, opacity: 0.5 },
];

export function SeasonalDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {/* Telaraña — esquina superior derecha */}
      <svg
        viewBox="0 0 220 220"
        className="absolute -top-6 -right-6 w-36 opacity-40 sm:w-52 sm:opacity-50"
        fill="none"
        stroke="var(--color-stellar-white)"
      >
        <g strokeWidth="1" strokeOpacity="0.75">
          {WEB_SPOKES.map(({ angle, length }) => {
            const p = spokePoint(angle, length);
            return <line key={angle} x1={WEB_ANCHOR.x} y1={WEB_ANCHOR.y} x2={p.x} y2={p.y} />;
          })}
        </g>
        <g strokeWidth="1">
          {WEB_RINGS.map((ring) => (
            <path key={ring.frac} d={webRingPath(ring.frac, ring.sag)} strokeOpacity={ring.opacity} />
          ))}
        </g>
      </svg>

      {/* Araña colgando de la telaraña */}
      <div
        className="absolute top-16 right-14 origin-top motion-safe:animate-[spiderSway_5s_ease-in-out_infinite] sm:top-24 sm:right-20"
        style={{ animationDelay: "-1.2s" }}
      >
        <div className="mx-auto h-6 w-px bg-stellar-white/50 sm:h-10" />
        <svg viewBox="0 0 32 24" className="w-4 opacity-80 sm:w-6" fill="var(--color-stellar-white)">
          <g stroke="var(--color-stellar-white)" strokeWidth="1" strokeOpacity="0.7">
            <line x1="10" y1="12" x2="2" y2="4" />
            <line x1="10" y1="14" x2="1" y2="14" />
            <line x1="10" y1="16" x2="2" y2="22" />
            <line x1="22" y1="12" x2="30" y2="4" />
            <line x1="22" y1="14" x2="31" y2="14" />
            <line x1="22" y1="16" x2="30" y2="22" />
          </g>
          <circle cx="16" cy="15" r="6.5" />
          <circle cx="16" cy="7" r="4" />
        </svg>
      </div>

      {/* Vela + cempasúchil — esquina inferior izquierda, en memoria de
          "El Camino de Regreso" (el altar marca el camino con pétalos de
          cempasúchil para guiar de vuelta a casa) */}
      <div className="absolute bottom-24 left-3 sm:left-5 md:bottom-6">
        {/* Pétalos de cempasúchil, a los pies de la vela */}
        <svg
          viewBox="0 0 90 30"
          className="pointer-events-none absolute -bottom-2 left-1/2 w-20 -translate-x-1/2 opacity-90 sm:w-24"
        >
          <Marigold cx={16} cy={20} size={11} petal="#f2a33c" center="#b5591f" rotate={-8} />
          <Marigold cx={45} cy={24} size={8} petal="#f6c15a" center="#c96a24" rotate={14} />
          <Marigold cx={70} cy={19} size={10} petal="#ef9530" center="#a84e1a" rotate={6} />
        </svg>

        <div
          className="absolute bottom-6 left-1/2 size-12 -translate-x-1/2 rounded-full motion-safe:animate-[candleGlow_2.3s_ease-in-out_infinite] sm:size-14"
          style={{ background: "radial-gradient(circle, var(--color-stellar-pink), transparent 70%)" }}
        />
        <svg viewBox="0 0 40 70" className="relative w-7 sm:w-9">
          <path
            d="M20 18 C17 22 15 25 15 29 C15 24 18 21 20 18 C22 21 25 24 25 29 C25 25 23 22 20 18Z"
            fill="var(--color-stellar-pink)"
            className="motion-safe:animate-[candleFlicker_1.8s_ease-in-out_infinite]"
            style={{ transformOrigin: "20px 29px" }}
          />
          <line x1="20" y1="18" x2="20" y2="24" stroke="var(--color-stellar-white)" strokeWidth="1" opacity="0.6" />
          <rect x="11" y="28" width="18" height="38" rx="2" fill="var(--color-stellar-white)" opacity="0.85" />
          <path d="M11 30 Q20 26 29 30 L29 34 Q20 30 11 34 Z" fill="var(--color-stellar-white-soft)" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}
