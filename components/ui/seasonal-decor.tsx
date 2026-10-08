/**
 * Decoración de temporada — Día de Muertos / Halloween (oct-nov 2026), atada
 * al mismo periodo que el menú temático y el evento "El Camino de Regreso"
 * (ver PROJECT_NOTES.md → "Monthly menu rotation"). Usa solo la paleta de
 * marca (blanco de línea + glow rosa), nada de naranja/negro genérico de
 * Halloween. Quitar o archivar este componente (y su mount en
 * app/[locale]/layout.tsx) cuando termine la temporada — no tiene
 * auto-expiración por fecha, mismo patrón manual que MENU_MONTH_LABEL.
 */
export function SeasonalDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {/* Telaraña — esquina superior derecha */}
      <svg
        viewBox="0 0 220 220"
        className="absolute -top-6 -right-6 w-36 opacity-40 sm:w-52 sm:opacity-50"
        fill="none"
        stroke="var(--color-stellar-white)"
        strokeWidth="1"
      >
        <g strokeOpacity="0.8">
          <line x1="220" y1="0" x2="0" y2="220" />
          <line x1="220" y1="40" x2="70" y2="220" />
          <line x1="220" y1="80" x2="130" y2="220" />
          <line x1="220" y1="130" x2="180" y2="220" />
          <line x1="180" y1="0" x2="220" y2="180" />
          <line x1="130" y1="0" x2="220" y2="130" />
          <line x1="70" y1="0" x2="220" y2="70" />
        </g>
        <g strokeOpacity="0.6">
          <path d="M 220 14 Q 160 20 150 70" />
          <path d="M 220 48 Q 170 55 160 100" />
          <path d="M 220 86 Q 180 95 172 135" />
          <path d="M 220 124 Q 192 132 186 162" />
          <path d="M 180 220 Q 172 160 220 150" />
          <path d="M 130 220 Q 128 150 190 140" />
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

      {/* Vela — esquina inferior izquierda, en memoria de "El Camino de Regreso" */}
      <div className="absolute bottom-4 left-3 sm:bottom-6 sm:left-5">
        <div
          className="absolute bottom-6 left-1/2 size-10 -translate-x-1/2 rounded-full opacity-30 blur-xl motion-safe:animate-[candleFlicker_2.4s_ease-in-out_infinite] sm:size-14"
          style={{ background: "radial-gradient(circle, var(--color-stellar-pink), transparent 70%)" }}
        />
        <svg viewBox="0 0 40 70" className="relative w-6 sm:w-9">
          <path
            d="M20 18 C17 22 15 25 15 29 C15 24 18 21 20 18 C22 21 25 24 25 29 C25 25 23 22 20 18Z"
            fill="var(--color-stellar-pink)"
            className="motion-safe:animate-[candleFlicker_2.4s_ease-in-out_infinite]"
          />
          <line x1="20" y1="18" x2="20" y2="24" stroke="var(--color-stellar-white)" strokeWidth="1" opacity="0.6" />
          <rect x="11" y="28" width="18" height="38" rx="2" fill="var(--color-stellar-white)" opacity="0.85" />
          <path d="M11 30 Q20 26 29 30 L29 34 Q20 30 11 34 Z" fill="var(--color-stellar-white-soft)" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}
