import { getMetadataValue } from "@/lib/payments/metadata";
import { getEvent } from "@/data/events";
import { resolveOrderDateLabel } from "@/lib/event-date";
import type { NewWebOrder } from "@/lib/orders-db";
import type { PickupOrderFormValues } from "@/lib/pickup-schema";

export type PaymentLike = {
  transaction_amount?: number | null;
  external_reference?: string | null;
  metadata?: Record<string, unknown> | null;
};

/** Distingue boleto de pickup por la forma del metadata, sin asumir el tipo — usado tanto por los webhooks en vivo como por el backfill histórico. */
export function isTicketPayment(metadata: Record<string, unknown>) {
  return Boolean(getMetadataValue(metadata, "eventSlug"));
}
export function isPickupPayment(metadata: Record<string, unknown>) {
  return Boolean(getMetadataValue(metadata, "items"));
}

export function buildTicketWebOrder(payment: PaymentLike, paymentId: string): NewWebOrder {
  const metadata = (payment.metadata ?? {}) as Record<string, string>;
  const get = (key: string) => getMetadataValue(metadata, key);
  const code = get("code") || payment.external_reference || paymentId;
  const safeLocale = get("locale") === "en" ? "en" : "es";
  const eventSlug = get("eventSlug");
  const email = get("email");

  const event = eventSlug ? getEvent(eventSlug) : undefined;
  const ticket = event?.tickets?.[Number(get("ticketIndex"))];

  // Pedido pagado pero con metadata incompleta (caso raro) — igual se deja
  // un registro mínimo en web_orders para que quede en el historial, en vez
  // de perderse en silencio como antes.
  if (!event || !ticket || !email) {
    return {
      kind: "ticket",
      code,
      payment_id: paymentId,
      amount_mxn: payment.transaction_amount ?? 0,
      currency: "MXN",
      concept: "Boleto · metadata incompleta (revisar manualmente)",
      items: metadata,
      event_slug: eventSlug || null,
      session_date_iso: get("sessionDateISO") || null,
      customer_name: get("name") || null,
      customer_email: email || "sin-email@d-stellar.co",
      customer_phone: get("phone") || null,
      locale: safeLocale,
      notes: get("notes") || null,
      raw_metadata: metadata,
    };
  }

  const ticketName = ticket.name[safeLocale];
  const dateLabel = resolveOrderDateLabel(event, get("sessionDateISO") || undefined, safeLocale);
  const qty = Number(get("qty")) || 1;

  return {
    kind: "ticket",
    code,
    payment_id: paymentId,
    amount_mxn: payment.transaction_amount ?? 0,
    currency: "MXN",
    concept: `${event.title} · ${qty}x ${ticketName}`,
    // Guarda todo lo necesario para reconstruir el TicketOrderData exacto al
    // reenviar el correo desde /pedidos, sin depender de que data/events.ts
    // siga teniendo el mismo evento/boleto más adelante.
    items: {
      eventTitle: event.title,
      ticketName,
      dateLabel,
      qty,
      unitPriceMXN: ticket.priceMXN,
      eventSlug,
      ticketIndex: Number(get("ticketIndex")),
    },
    event_slug: eventSlug || null,
    session_date_iso: get("sessionDateISO") || null,
    customer_name: get("name") || null,
    customer_email: email,
    customer_phone: get("phone") || null,
    locale: safeLocale,
    notes: get("notes") || null,
    raw_metadata: metadata,
  };
}

export function buildPickupWebOrder(payment: PaymentLike, paymentId: string): NewWebOrder {
  const metadata = (payment.metadata ?? {}) as Record<string, string>;
  const code = metadata.code || payment.external_reference || paymentId;

  let items: PickupOrderFormValues["items"] = [];
  try {
    items = JSON.parse(metadata.items ?? "[]");
  } catch {
    // dejado vacío a propósito — cae al branch degradado de abajo
  }

  // Pedido pagado pero con metadata incompleta (caso raro) — igual se deja
  // un registro mínimo en web_orders para que quede en el historial, en vez
  // de perderse en silencio como antes.
  if (!metadata.email || items.length === 0) {
    return {
      kind: "pickup",
      code,
      payment_id: paymentId,
      amount_mxn: payment.transaction_amount ?? 0,
      currency: "MXN",
      concept: "Pickup · metadata incompleta (revisar manualmente)",
      items: metadata,
      event_slug: null,
      session_date_iso: null,
      customer_name: metadata.name || null,
      customer_email: metadata.email || "sin-email@d-stellar.co",
      customer_phone: metadata.phone || null,
      locale: metadata.locale === "en" ? "en" : "es",
      notes: metadata.notes || null,
      raw_metadata: metadata,
    };
  }

  const itemsSummary = items.map((line) => `${line.qty}x ${line.name}`).join(", ");

  return {
    kind: "pickup",
    code,
    payment_id: paymentId,
    amount_mxn: payment.transaction_amount ?? 0,
    currency: "MXN",
    concept: `Pickup · ${itemsSummary}`,
    // date/time van dentro de items (no hay columna propia para eso) para
    // poder reconstruir el PickupOrderFormValues exacto al reenviar el
    // correo desde /pedidos.
    items: { date: metadata.date ?? "", time: metadata.time ?? "", lines: items },
    event_slug: null,
    session_date_iso: null,
    customer_name: metadata.name || null,
    customer_email: metadata.email,
    customer_phone: metadata.phone || null,
    locale: metadata.locale === "en" ? "en" : "es",
    notes: metadata.notes || null,
    raw_metadata: metadata,
  };
}
