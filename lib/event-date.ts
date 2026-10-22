import type { EventRecord } from "@/lib/events-types";
// Type-only import — erased at compile time, so this stays safe to pull
// into client bundles (ticket-order-form.tsx imports this module).
import type { WebOrder } from "@/lib/orders-db";

type Locale = "es" | "en";

type SessionOrder = Pick<WebOrder, "session_date_iso" | "items">;

/** Sum of `qty` across orders for one session, matched by real instant rather
 * than string equality — `session_date_iso` isn't always serialized with the
 * same UTC offset as the event's own `sessionDates` (admin form writes
 * -06:00, Supabase reads back +00:00 for the same moment). */
export function soldTicketQtyForSession(orders: SessionOrder[], sessionDateISO: string): number {
  const targetMs = new Date(sessionDateISO).getTime();
  return orders.reduce((sum, order) => {
    if (!order.session_date_iso || new Date(order.session_date_iso).getTime() !== targetMs) return sum;
    const qty = (order.items as { qty?: number } | null)?.qty;
    return sum + (typeof qty === "number" ? qty : 0);
  }, 0);
}

/** Session dates to treat as sold out in the booking UI: the manual toggle
 * plus any date whose sessionTicketLimits cap has been reached. */
export function effectiveSoldOutDates(
  event: Pick<EventRecord, "soldOutSessionDates" | "sessionTicketLimits">,
  orders: SessionOrder[],
): string[] {
  const manual = event.soldOutSessionDates ?? [];
  const limitHit = (event.sessionTicketLimits ?? [])
    .filter((limit) => soldTicketQtyForSession(orders, limit.sessionDateISO) >= limit.maxTickets)
    .map((limit) => limit.sessionDateISO);
  return [...new Set([...manual, ...limitHit])];
}

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

/** A session is still bookable if its start time hasn't passed yet. Used to hide/reject past dates from a multi-session event's picker. */
export function isUpcomingSession(iso: string, now: number = Date.now()): boolean {
  return new Date(iso).getTime() >= now;
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
