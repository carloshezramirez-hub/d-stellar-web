const MX_TZ = "America/Mexico_City";
const DAY_MS = 24 * 60 * 60 * 1000;

export interface DateRangeOption {
  value: string;
  label: string;
}

/** Presets que cubre el selector compartido — "Personalizado" se resuelve aparte con from/to explícitos. */
export const DATE_RANGE_PRESETS: DateRangeOption[] = [
  { value: "today", label: "Hoy" },
  { value: "7", label: "7 días" },
  { value: "30", label: "30 días" },
  { value: "month", label: "Este mes" },
  { value: "last_month", label: "Mes anterior" },
  { value: "90", label: "90 días" },
  { value: "all", label: "Todo" },
  { value: "custom", label: "Personalizado" },
];

export interface ResolvedRange {
  value: string;
  label: string;
  /** null = sin límite inferior ("Todo") */
  start: Date | null;
  end: Date;
}

function startOfDayMx(d: Date): Date {
  // Medianoche en hora de CDMX, expresada como instante UTC real — se
  // arma a partir de las partes en esa zona (igual patrón que mxMonthKey).
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MX_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  // El offset CDMX es fijo (UTC-6, sin horario de verano desde 2022) — se
  // reconstruye el instante UTC de la medianoche local sumando ese offset.
  const localMidnightUtcMs = Date.UTC(Number(get("year")), Number(get("month")) - 1, Number(get("day")), 6, 0, 0);
  return new Date(localMidnightUtcMs);
}

function endOfDayMx(d: Date): Date {
  return new Date(startOfDayMx(d).getTime() + DAY_MS - 1);
}

function startOfMonthMx(d: Date): Date {
  const key = mxMonthKey(d); // "YYYY-MM"
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1, 6, 0, 0));
}

function endOfMonthMx(d: Date): Date {
  const start = startOfMonthMx(d);
  const nextMonth = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1, 6, 0, 0));
  return new Date(nextMonth.getTime() - 1);
}

/** Resuelve un preset (o "custom" con customFrom/customTo "YYYY-MM-DD") a un rango real de fechas. */
export function resolveDateRange(
  rawValue: string | undefined,
  fallback: string,
  customFrom?: string,
  customTo?: string,
): ResolvedRange {
  const value = DATE_RANGE_PRESETS.some((o) => o.value === rawValue) ? rawValue! : fallback;
  const preset = DATE_RANGE_PRESETS.find((o) => o.value === value)!;
  const now = new Date();

  switch (value) {
    case "today":
      return { value, label: preset.label, start: startOfDayMx(now), end: endOfDayMx(now) };
    case "7":
      return { value, label: preset.label, start: startOfDayMx(new Date(now.getTime() - 6 * DAY_MS)), end: endOfDayMx(now) };
    case "30":
      return { value, label: preset.label, start: startOfDayMx(new Date(now.getTime() - 29 * DAY_MS)), end: endOfDayMx(now) };
    case "90":
      return { value, label: preset.label, start: startOfDayMx(new Date(now.getTime() - 89 * DAY_MS)), end: endOfDayMx(now) };
    case "month":
      return { value, label: preset.label, start: startOfMonthMx(now), end: endOfDayMx(now) };
    case "last_month": {
      const lastMonthDate = new Date(startOfMonthMx(now).getTime() - DAY_MS);
      return { value, label: preset.label, start: startOfMonthMx(lastMonthDate), end: endOfMonthMx(lastMonthDate) };
    }
    case "custom": {
      const start = customFrom ? startOfDayMx(new Date(`${customFrom}T12:00:00Z`)) : null;
      const end = customTo ? endOfDayMx(new Date(`${customTo}T12:00:00Z`)) : endOfDayMx(now);
      return { value, label: preset.label, start, end };
    }
    case "all":
    default:
      return { value: "all", label: "Todo", start: null, end: endOfDayMx(now) };
  }
}

/** true si `iso` cae dentro del rango resuelto. */
export function withinRange(iso: string, range: ResolvedRange): boolean {
  const t = new Date(iso).getTime();
  if (range.start && t < range.start.getTime()) return false;
  return t <= range.end.getTime();
}

/** Número de días que cubre el rango — para fetchers que piden una ventana en días en vez de fechas explícitas. "Todo" cae de vuelta a `fallbackDays`. */
export function rangeWindowDays(range: ResolvedRange, fallbackDays = 180): number {
  if (!range.start) return fallbackDays;
  // +1ms porque `end` es fin-de-día y `start` es inicio-de-día — sin eso,
  // un mes de 30 días calcula 29.99... y se corre un día (ver mismo fix en lib/odoo/sales.ts).
  return Math.max(1, Math.round((range.end.getTime() - range.start.getTime() + 1) / DAY_MS));
}

/** "YYYY-MM" en hora de CDMX — para agrupar/comparar por mes calendario real, no UTC. */
export function mxMonthKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MX_TZ, year: "numeric", month: "2-digit" }).format(date);
}

/** "YYYY-MM-DD" en hora de CDMX — para pedirle fechas literales a GA4/Search Console (su property ya está en esa zona horaria). */
export function mxDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MX_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** Rango anterior de la misma duración, para comparar periodo contra periodo (ej. tabla de canales con variación). */
export function previousPeriod(range: ResolvedRange): ResolvedRange | null {
  if (!range.start) return null;
  const durationMs = range.end.getTime() - range.start.getTime();
  return { value: "previous", label: "Periodo anterior", start: new Date(range.start.getTime() - durationMs - 1), end: new Date(range.start.getTime() - 1) };
}

/** true si `iso` cae en el mismo mes calendario que hoy, en hora de CDMX. */
export function isCurrentMonth(iso: string): boolean {
  return mxMonthKey(new Date(iso)) === mxMonthKey(new Date());
}
