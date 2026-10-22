export type EventTicket = {
  name: { es: string; en: string };
  priceMXN: number;
  includes: { es: string[]; en: string[] };
  // Short caption under this ticket's includes — e.g. clarifying a "duo"
  // ticket isn't only for romantic couples.
  note?: { es: string; en: string };
};

export type SessionTicketLimit = {
  sessionDateISO: string;
  maxTickets: number;
};

export type EventRecord = {
  slug: string;
  title: string;
  // Start, ISO 8601 with timezone. Omit entirely only when even the day
  // isn't confirmed — use `monthLabel` instead (see idilio-taller-poesia).
  dateISO?: string;
  endISO?: string;
  // Set to false when the day is confirmed but the exact time isn't —
  // formatted date/time displays drop the time instead of guessing one.
  timeKnown?: boolean;
  // Human-readable fallback for events where not even the day is
  // confirmed (dateISO omitted). Ignored when dateISO is present.
  monthLabel?: { es: string; en: string };
  // For a recurring/multi-night run (e.g. every Fri/Sat in a month): the
  // full list of session start times, ISO 8601 with timezone. `dateISO`
  // should still point at the first session (used for JSON-LD/"add to
  // calendar"). When present, the ticket form requires the buyer to pick
  // one of these, and it flows through to the confirmation email instead
  // of the single dateISO.
  sessionDates?: string[];
  // Subset of `sessionDates` that are sold out. They stay listed (shown as
  // sold out, not selectable in the ticket form) and the tickets API
  // rejects them — toggled from /admin/eventos, no inventory tracking.
  soldOutSessionDates?: string[];
  // Optional per-session cap on ticket units sold (order `qty` summed, not
  // people — a Duo ticket still counts as 1). Unlike soldOutSessionDates
  // (an all-or-nothing manual toggle), this is enforced live: /api/tickets
  // rejects an order once the session's sold qty would exceed maxTickets,
  // and the public page treats a session as sold out once it's hit (see
  // lib/event-date.ts effectiveSoldOutDates).
  sessionTicketLimits?: SessionTicketLimit[];
  // Overrides the formatted-date display on the list/detail pages —
  // needed once there's more than one session (a single formatted
  // dateISO would misleadingly imply only one date). Ignored when
  // sessionDates isn't set.
  datesSummary?: { es: string; en: string };
  doorsNote?: { es: string; en: string };
  summary: { es: string; en: string };
  description: { es: string[]; en: string[] };
  includes?: { es: string[]; en: string[] };
  capacity?: number;
  priceMXN?: number;
  // Multiple ticket tiers (e.g. solo vs. duo) with their own price and
  // inclusions. When present, this takes over the tickets/price display
  // instead of the single `priceMXN` + `includes` pair.
  tickets?: EventTicket[];
  coverImage: string;
  // Extra hero images shown as additional carousel slides alongside
  // coverImage (e.g. seasonal menu artwork tied to the experience). Omit
  // for a single static cover image.
  galleryImages?: string[];
  imageAlt: { es: string; en: string };
  status: "upcoming" | "past";
  // Optional link to a real social post about the event (e.g. Instagram).
  externalUrl?: string;
};

// Lowest ticket price to show as "from $X MXN" — falls back to the plain
// single price for events that don't use `tickets`.
export function eventStartingPrice(event: EventRecord): number | undefined {
  if (event.tickets?.length) {
    return Math.min(...event.tickets.map((ticket) => ticket.priceMXN));
  }
  return event.priceMXN;
}
