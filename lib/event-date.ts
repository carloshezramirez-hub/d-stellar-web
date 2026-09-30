import type { EventRecord } from "@/data/events";

type Locale = "es" | "en";

export function formatEventDate(
  event: Pick<EventRecord, "dateISO" | "timeKnown" | "monthLabel">,
  locale: Locale,
) {
  if (!event.dateISO) return event.monthLabel?.[locale] ?? "";
  return formatSessionDate(event.dateISO, locale, event.timeKnown);
}

/** Same formatting as formatEventDate, but for a single raw session ISO string — used for multi-session events once a specific date is known (ticket form, order emails). */
export function formatSessionDate(iso: string, locale: Locale, timeKnown?: boolean) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    // `timeKnown === false` means the day is real but the hour isn't —
    // don't fabricate a time, just drop it from the format.
    ...(timeKnown !== false && { hour: "numeric", minute: "2-digit" }),
    // Always show d-stellar's local time (CDMX), regardless of the
    // server's or the viewer's own timezone.
    timeZone: "America/Mexico_City",
  }).format(new Date(iso));
}

/** Resolves the date label for an order: the buyer-chosen session for multi-date events, or the event's single dateISO otherwise. */
export function resolveOrderDateLabel(
  event: Pick<EventRecord, "dateISO" | "timeKnown" | "monthLabel" | "sessionDates">,
  sessionDateISO: string | undefined,
  locale: Locale,
) {
  if (event.sessionDates?.length && sessionDateISO) {
    return formatSessionDate(sessionDateISO, locale, event.timeKnown);
  }
  return formatEventDate(event, locale);
}
