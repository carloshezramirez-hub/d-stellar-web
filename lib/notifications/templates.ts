import type { PickupOrderFormValues } from "@/lib/pickup-schema";
import { row, wrapEmail } from "./email-layout";

type Locale = "es" | "en";

function itemsRows(items: PickupOrderFormValues["items"]) {
  return items
    .map((line) => {
      const flavorNote = line.flavors?.length ? ` (${line.flavors.join(", ")})` : "";
      return row(`${line.qty}x`, `${line.name}${flavorNote} — $${line.qty * line.priceMXN} MXN`);
    })
    .join("");
}

function total(items: PickupOrderFormValues["items"]) {
  return items.reduce((sum, line) => sum + line.qty * line.priceMXN, 0);
}

export type PaymentInfo = { amountMXN: number; paymentId: string };

export function buildPickupOwnerEmail(data: PickupOrderFormValues, code: string, payment?: PaymentInfo) {
  const rows = [
    row("Código", code),
    payment ? row("Pago", `Confirmado con Mercado Pago · $${payment.amountMXN} MXN · #${payment.paymentId}`) : null,
    row("Recolección", `${data.date} · ${data.time}`),
    row("Nombre", data.name),
    row("Email", data.email),
    row("Teléfono", data.phone),
    itemsRows(data.items),
    row("Total estimado", `$${total(data.items)} MXN`),
    row("Notas", data.notes?.trim() || "—"),
  ]
    .filter((r): r is string => Boolean(r))
    .join("");

  return {
    subject: payment ? `Pedido PAGADO · ${code} · ${data.name}` : `Nuevo pedido de pickup · ${code} · ${data.name}`,
    html: wrapEmail(
      payment ? "Pedido pagado y confirmado" : "Nuevo pedido para recoger",
      payment
        ? "El cliente ya pagó en línea con Mercado Pago. Prepara el pedido para la hora indicada."
        : "Se recibió un nuevo pedido de pickup desde la web. Confirma el pedido y envía los datos de pago al cliente.",
      rows,
      "Este correo se generó automáticamente desde el módulo de pickup de d-stellar.co.",
    ),
  };
}

const CUSTOMER_STRINGS: Record<Locale, { subject: string; title: string; intro: string; footer: string; totalLabel: string }> = {
  es: {
    subject: "Hemos recibido tu pedido",
    title: "¡Pedido recibido!",
    intro:
      "Gracias por tu pedido. Te confirmaremos disponibilidad y te enviaremos los datos para pagar por transferencia o con un link de pago antes de que recojas. Esto todavía no es un pedido confirmado.",
    footer: "d-stellar · Av. Nuevo León 217, Hipódromo Condesa, CDMX",
    totalLabel: "Total estimado",
  },
  en: {
    subject: "We've received your order",
    title: "Order received!",
    intro:
      "Thanks for your order. We'll confirm availability and send you the details to pay by bank transfer or a payment link before you pick up. This is not a confirmed order yet.",
    footer: "d-stellar · Av. Nuevo León 217, Hipódromo Condesa, CDMX",
    totalLabel: "Estimated total",
  },
};

const PAID_CUSTOMER_STRINGS: Record<Locale, { subject: string; title: string; intro: string; footer: string; totalLabel: string }> = {
  es: {
    subject: "¡Tu pago fue confirmado!",
    title: "Pedido pagado y confirmado",
    intro:
      "Recibimos tu pago con Mercado Pago. Tu pedido queda confirmado — te esperamos en Nuevo León 217 en la fecha y hora que elegiste.",
    footer: "d-stellar · Av. Nuevo León 217, Hipódromo Condesa, CDMX",
    totalLabel: "Total pagado",
  },
  en: {
    subject: "Your payment was confirmed!",
    title: "Order paid and confirmed",
    intro:
      "We received your payment through Mercado Pago. Your order is confirmed — see you at Nuevo León 217 on the date and time you picked.",
    footer: "d-stellar · Av. Nuevo León 217, Hipódromo Condesa, CDMX",
    totalLabel: "Total paid",
  },
};

export function buildPickupCustomerEmail(
  data: PickupOrderFormValues,
  code: string,
  locale: Locale,
  payment?: PaymentInfo,
) {
  const strings = payment
    ? (PAID_CUSTOMER_STRINGS[locale] ?? PAID_CUSTOMER_STRINGS.es)
    : (CUSTOMER_STRINGS[locale] ?? CUSTOMER_STRINGS.es);

  const rows = [
    row("Ref.", code),
    row("—", `${data.date} · ${data.time}`),
    itemsRows(data.items),
    row(strings.totalLabel, `$${total(data.items)} MXN`),
  ].join("");

  return {
    subject: `${strings.subject} · ${code}`,
    html: wrapEmail(strings.title, strings.intro, rows, strings.footer),
  };
}
