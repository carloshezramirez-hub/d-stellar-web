import { row, wrapEmail } from "./email-layout";

type Locale = "es" | "en";

export type TicketOrderData = {
  eventTitle: string;
  ticketName: string;
  dateLabel: string;
  qty: number;
  unitPriceMXN: number;
  name: string;
  email: string;
  phone: string;
  notes?: string;
};

export type PaymentInfo = { amountMXN: number; paymentId: string };

function total(data: TicketOrderData) {
  return data.qty * data.unitPriceMXN;
}

export function buildTicketOwnerEmail(data: TicketOrderData, code: string, payment?: PaymentInfo) {
  const rows = [
    row("Código", code),
    payment ? row("Pago", `Confirmado con Mercado Pago · $${payment.amountMXN} MXN · #${payment.paymentId}`) : null,
    row("Evento", data.eventTitle),
    row("Fecha", data.dateLabel),
    row("Boleto", `${data.qty}x ${data.ticketName} — $${total(data)} MXN`),
    row("Nombre", data.name),
    row("Email", data.email),
    row("Teléfono", data.phone),
    row("Notas", data.notes?.trim() || "—"),
  ]
    .filter((r): r is string => Boolean(r))
    .join("");

  return {
    subject: payment ? `Boleto PAGADO · ${code} · ${data.name}` : `Nueva reservación de boleto · ${code} · ${data.name}`,
    html: wrapEmail(
      payment ? "Boleto pagado y confirmado" : "Nueva reservación de evento",
      payment
        ? `El cliente ya pagó en línea con Mercado Pago para "${data.eventTitle}". Agrégalo a la lista de invitados.`
        : `Se recibió una nueva reservación para "${data.eventTitle}" desde la web. Confirma disponibilidad y envía los datos de pago.`,
      rows,
      "Este correo se generó automáticamente desde el módulo de boletos de d-stellar.co.",
    ),
  };
}

const CUSTOMER_STRINGS: Record<Locale, { subject: string; title: string; intro: string; footer: string; ticketLabel: string; totalLabel: string }> = {
  es: {
    subject: "Hemos recibido tu reservación",
    title: "¡Reservación recibida!",
    intro:
      "Gracias por tu reservación. Te confirmaremos disponibilidad y te enviaremos los datos para pagar antes del evento. Esto todavía no es un lugar confirmado.",
    footer: "d-stellar · Av. Nuevo León 217, Hipódromo Condesa, CDMX",
    ticketLabel: "Boleto",
    totalLabel: "Total estimado",
  },
  en: {
    subject: "We've received your reservation",
    title: "Reservation received!",
    intro:
      "Thanks for your reservation. We'll confirm availability and send you the payment details before the event. This is not a confirmed spot yet.",
    footer: "d-stellar · Av. Nuevo León 217, Hipódromo Condesa, CDMX",
    ticketLabel: "Ticket",
    totalLabel: "Estimated total",
  },
};

const PAID_CUSTOMER_STRINGS: Record<Locale, { subject: string; title: string; intro: string; footer: string; ticketLabel: string; totalLabel: string }> = {
  es: {
    subject: "¡Tu pago fue confirmado!",
    title: "Boleto pagado y confirmado",
    intro:
      "Recibimos tu pago con Mercado Pago. Tu lugar queda confirmado — te esperamos en Nuevo León 217 el día del evento.",
    footer: "d-stellar · Av. Nuevo León 217, Hipódromo Condesa, CDMX",
    ticketLabel: "Boleto",
    totalLabel: "Total pagado",
  },
  en: {
    subject: "Your payment was confirmed!",
    title: "Ticket paid and confirmed",
    intro:
      "We received your payment through Mercado Pago. Your spot is confirmed — see you at Nuevo León 217 on the day of the event.",
    footer: "d-stellar · Av. Nuevo León 217, Hipódromo Condesa, CDMX",
    ticketLabel: "Ticket",
    totalLabel: "Total paid",
  },
};

export function buildTicketCustomerEmail(
  data: TicketOrderData,
  code: string,
  locale: Locale,
  payment?: PaymentInfo,
) {
  const strings = payment
    ? (PAID_CUSTOMER_STRINGS[locale] ?? PAID_CUSTOMER_STRINGS.es)
    : (CUSTOMER_STRINGS[locale] ?? CUSTOMER_STRINGS.es);

  const rows = [
    row("Ref.", code),
    row("Evento", data.eventTitle),
    row("—", data.dateLabel),
    row(strings.ticketLabel, `${data.qty}x ${data.ticketName}`),
    row(strings.totalLabel, `$${total(data)} MXN`),
  ].join("");

  return {
    subject: `${strings.subject} · ${code}`,
    html: wrapEmail(strings.title, strings.intro, rows, strings.footer),
  };
}
