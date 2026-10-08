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

// La araña cuelga de un punto real sobre un rayo de la red (donde cruza el
// segundo anillo), dentro del mismo <svg> y viewBox que la telaraña — así
// queda siempre alineada con ella en cualquier breakpoint, en vez de usar
// coordenadas CSS sueltas que se desfasan si la red cambia de forma.
const SPIDER_SPOKE = WEB_SPOKES[3]; // angle: 150
const SPIDER_ATTACH = spokePoint(SPIDER_SPOKE.angle, SPIDER_SPOKE.length, 0.42);
const SPIDER_THREAD = 30;
const SPIDER_BODY = { x: SPIDER_ATTACH.x, y: SPIDER_ATTACH.y + SPIDER_THREAD };

export function SeasonalDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {/* Telaraña + araña — esquina superior derecha, un solo sistema de
          coordenadas para que la araña siempre cuelgue de la red real */}
      <svg
        viewBox="0 0 220 220"
        className="absolute top-36 -right-6 w-36 opacity-40 sm:top-44 sm:w-52 sm:opacity-50 md:top-48"
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

        <g
          className="motion-safe:animate-[spiderSway_5s_ease-in-out_infinite]"
          style={{ transformOrigin: `${SPIDER_ATTACH.x}px ${SPIDER_ATTACH.y}px`, animationDelay: "-1.2s" }}
        >
          <line
            x1={SPIDER_ATTACH.x}
            y1={SPIDER_ATTACH.y}
            x2={SPIDER_BODY.x}
            y2={SPIDER_BODY.y - 7}
            strokeWidth="1"
            strokeOpacity="0.6"
          />
          <g
            transform={`translate(${SPIDER_BODY.x - 11} ${SPIDER_BODY.y - 9})`}
            stroke="var(--color-stellar-white)"
            strokeWidth="1"
            strokeOpacity="0.75"
          >
            <line x1="10" y1="12" x2="2" y2="4" />
            <line x1="10" y1="14" x2="1" y2="14" />
            <line x1="10" y1="16" x2="2" y2="22" />
            <line x1="22" y1="12" x2="30" y2="4" />
            <line x1="22" y1="14" x2="31" y2="14" />
            <line x1="22" y1="16" x2="30" y2="22" />
            <circle cx="16" cy="15" r="6.5" fill="var(--color-stellar-white)" stroke="none" />
            <circle cx="16" cy="7" r="4" fill="var(--color-stellar-white)" stroke="none" />
          </g>
        </g>
      </svg>

      {/* Vela — esquina inferior izquierda, en memoria de "El Camino de
          Regreso" */}
      <div className="absolute bottom-24 left-3 sm:left-5 md:bottom-6">
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
