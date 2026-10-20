export interface DateRangeOption {
  value: string;
  label: string;
  days: number | null; // null = todo el histórico
}

/** Mismas opciones/semántica que lib/social/kpis.ts (el filtro de /analytics) — unificadas aquí para reusar en el resto de dashboards. */
export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { value: "7", label: "7 días", days: 7 },
  { value: "30", label: "30 días", days: 30 },
  { value: "90", label: "90 días", days: 90 },
  { value: "all", label: "Todo", days: null },
];

export function resolveRange(rawValue: string | undefined, fallback: string): DateRangeOption {
  const value = DATE_RANGE_OPTIONS.some((o) => o.value === rawValue) ? rawValue! : fallback;
  return DATE_RANGE_OPTIONS.find((o) => o.value === value)!;
}

/** true si `iso` (fecha ISO) cae dentro de los últimos `days` días — `days === null` ("Todo") siempre pasa. */
export function withinRange(iso: string, days: number | null): boolean {
  if (days === null) return true;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(iso).getTime() >= cutoff;
}

const MX_TZ = "America/Mexico_City";

/** "YYYY-MM" en hora de CDMX — para agrupar/comparar por mes calendario real, no UTC. */
export function mxMonthKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MX_TZ, year: "numeric", month: "2-digit" }).format(date);
}

/** true si `iso` cae en el mismo mes calendario que hoy, en hora de CDMX. */
export function isCurrentMonth(iso: string): boolean {
  return mxMonthKey(new Date(iso)) === mxMonthKey(new Date());
}
