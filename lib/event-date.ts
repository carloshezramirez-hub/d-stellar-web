import type { EventRecord } from "@/data/events";

type Locale = "es" | "en";

export function formatEventDate(
  event: Pick<EventRecord, "dateISO" | "timeKnown" | "monthLabel">,
  locale: Locale,
) {
  if (!event.dateISO) return event.monthLabel?.[locale] ?? "";

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    // `timeKnown === false` means the day is real but the hour isn't —
    // don't fabricate a time, just drop it from the format.
    ...(event.timeKnown !== false && { hour: "numeric", minute: "2-digit" }),
    // Always show d-stellar's local time (CDMX), regardless of the
    // server's or the viewer's own timezone.
    timeZone: "America/Mexico_City",
  }).format(new Date(event.dateISO));
}
