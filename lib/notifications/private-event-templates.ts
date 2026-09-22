import type { PrivateEventInquiryValues } from "@/lib/private-event-schema";
import { row, wrapEmail } from "./email-layout";

type Locale = "es" | "en";

export function buildPrivateEventOwnerEmail(data: PrivateEventInquiryValues) {
  const rows = [
    row("Nombre", data.name),
    row("Email", data.email),
    row("Fecha tentativa", data.date?.trim() || "—"),
    row("Invitados", data.guests?.trim() || "—"),
    row("Mensaje", data.message),
  ].join("");

  return {
    subject: `Nueva solicitud de evento privado · ${data.name}`,
    html: wrapEmail(
      "Nueva solicitud de evento privado",
      "Se recibió una solicitud de renta del espacio desde la web. Responde con disponibilidad y costo.",
      rows,
      "Este correo se generó automáticamente desde la sección de eventos privados de d-stellar.co.",
    ),
  };
}

const CUSTOMER_STRINGS: Record<Locale, { subject: string; title: string; intro: string; footer: string }> = {
  es: {
    subject: "Recibimos tu solicitud de evento privado",
    title: "¡Solicitud recibida!",
    intro:
      "Gracias por escribirnos. Revisamos disponibilidad para la fecha que nos compartiste y te respondemos por este correo con costo y detalles.",
    footer: "d-stellar · Av. Nuevo León 217, Hipódromo Condesa, CDMX",
  },
  en: {
    subject: "We've received your private event request",
    title: "Request received!",
    intro:
      "Thanks for reaching out. We're checking availability for the date you shared and will follow up on this email with pricing and details.",
    footer: "d-stellar · Av. Nuevo León 217, Hipódromo Condesa, CDMX",
  },
};

export function buildPrivateEventCustomerEmail(data: PrivateEventInquiryValues, locale: Locale) {
  const strings = CUSTOMER_STRINGS[locale] ?? CUSTOMER_STRINGS.es;

  const rows = [
    row("Fecha tentativa", data.date?.trim() || "—"),
    row("Invitados", data.guests?.trim() || "—"),
    row("Tu mensaje", data.message),
  ].join("");

  return {
    subject: strings.subject,
    html: wrapEmail(strings.title, strings.intro, rows, strings.footer),
  };
}
