import type { HoursException, SiteSettings } from "@/lib/site-settings-types";

// Genera los mismos textos de horario que antes vivían a mano en
// messages/es.json y en.json (footer.hours, visit.hoursBody, el ítem de
// horario en faq.items) — ahora derivados de site_settings.hours/
// hoursExceptions (editable en /admin/contenido/negocio), para que cambiar
// el horario desde el panel se refleje en todo el sitio sin tener que
// editar esos 3 textos a mano.

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type DayName = (typeof DAY_ORDER)[number];

const DAY_LABEL: Record<"es" | "en", Record<DayName, string>> = {
  // Minúsculas a propósito — en español solo el primer día de cada grupo
  // se capitaliza (inicio de oración), el resto va en minúscula.
  es: {
    Monday: "lunes",
    Tuesday: "martes",
    Wednesday: "miércoles",
    Thursday: "jueves",
    Friday: "viernes",
    Saturday: "sábado",
    Sunday: "domingo",
  },
  en: {
    Monday: "Monday",
    Tuesday: "Tuesday",
    Wednesday: "Wednesday",
    Thursday: "Thursday",
    Friday: "Friday",
    Saturday: "Saturday",
    Sunday: "Sunday",
  },
};

type HourGroup = { days: DayName[]; opens: string; closes: string };

function buildDayGroups(hours: SiteSettings["hours"], exceptions: HoursException[]): HourGroup[] {
  const perDay = {} as Record<DayName, { opens: string; closes: string }>;
  for (const day of DAY_ORDER) perDay[day] = hours;
  for (const ex of exceptions) {
    if ((DAY_ORDER as readonly string[]).includes(ex.dayOfWeek)) {
      perDay[ex.dayOfWeek as DayName] = { opens: ex.opens, closes: ex.closes };
    }
  }

  const groups: HourGroup[] = [];
  for (const day of DAY_ORDER) {
    const dh = perDay[day];
    const existing = groups.find((g) => g.opens === dh.opens && g.closes === dh.closes);
    if (existing) existing.days.push(day);
    else groups.push({ days: [day], opens: dh.opens, closes: dh.closes });
  }
  return groups;
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function joinDays(days: string[], locale: "es" | "en"): string {
  const conjunction = locale === "es" ? "y" : "and";
  const text = days.length === 1 ? days[0] : `${days.slice(0, -1).join(", ")} ${conjunction} ${days[days.length - 1]}`;
  return capitalizeFirst(text);
}

/** style "periods" -> "a.m."/"p.m." (self-terminating). "plain" -> "am"/"pm" (sin punto). */
function formatTime(time: string, style: "periods" | "plain"): string {
  const [hoursStr, minutesStr] = time.split(":");
  const hours24 = parseInt(hoursStr, 10);
  const isAM = hours24 < 12;
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  const suffix = style === "periods" ? (isAM ? "a.m." : "p.m.") : isAM ? "am" : "pm";
  return `${hours12}:${minutesStr} ${suffix}`;
}

/** Igual al footer/visit (una línea por grupo de días). */
export function formatHoursList(settings: SiteSettings, locale: "es" | "en"): string[] {
  const style = locale === "es" ? "periods" : "plain";
  return buildDayGroups(settings.hours, settings.hoursExceptions).map((group) => {
    const dayText = joinDays(
      group.days.map((d) => DAY_LABEL[locale][d]),
      locale,
    );
    const opens = formatTime(group.opens, style);
    const closes = formatTime(group.closes, style);
    const trailingPeriod = style === "plain" ? "." : "";
    return `${dayText}: ${opens} – ${closes}${trailingPeriod}`;
  });
}

/** Igual al ítem de horario en el FAQ (un solo párrafo). */
export function formatHoursParagraph(settings: SiteSettings, locale: "es" | "en"): string {
  const connector = locale === "es" ? "de" : "";
  const to = locale === "es" ? "a" : "to";
  return buildDayGroups(settings.hours, settings.hoursExceptions)
    .map((group) => {
      const dayText = joinDays(
        group.days.map((d) => DAY_LABEL[locale][d]),
        locale,
      );
      const opens = formatTime(group.opens, "periods");
      const closes = formatTime(group.closes, "periods");
      const prefix = connector ? `${connector} ` : "";
      return `${dayText} ${prefix}${opens} ${to} ${closes}`;
    })
    .join(" ");
}
