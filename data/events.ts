export type EventRecord = {
  slug: string;
  title: string;
  dateISO: string; // start, ISO 8601 with timezone
  endISO?: string;
  doorsNote?: { es: string; en: string };
  summary: { es: string; en: string };
  description: { es: string[]; en: string[] };
  includes: { es: string[]; en: string[] };
  capacity: number;
  priceMXN?: number;
  coverImage: string;
  imageAlt: { es: string; en: string };
  status: "upcoming" | "past";
};

// PLACEHOLDER CONTENT — replace dates, capacity and price with the real
// details before publishing. See PROJECT_NOTES.md → "Crear un nuevo evento".
export const events: EventRecord[] = [
  {
    slug: "la-mas-draga-viewing-party",
    title: "La Más Draga — Viewing Party",
    dateISO: "2026-09-04T20:00:00-06:00",
    endISO: "2026-09-04T23:00:00-06:00",
    doorsNote: { es: "Cupo limitado, llega con tiempo.", en: "Limited capacity, arrive early." },
    summary: {
      es: "Pantalla, cacao caliente y la comunidad de Condesa reunida para ver el episodio en vivo.",
      en: "Big screen, hot cacao, and the Condesa community gathered to watch the episode live.",
    },
    description: {
      es: [
        "Una vez por temporada convertimos d-stellar en sala de proyección. Apagamos las luces, servimos bebidas de autor y vemos el episodio juntos, en pantalla grande.",
        "Es un evento chico a propósito — así se siente d-stellar: íntimo, ruidoso en las risas, cero pretensión.",
      ],
      en: [
        "Once a season we turn d-stellar into a screening room. Lights down, signature drinks flowing, watching the episode together on the big screen.",
        "It's small on purpose — that's how d-stellar feels: intimate, loud with laughter, zero pretension.",
      ],
    },
    includes: {
      es: ["Acceso a la proyección", "Una bebida de autor incluida", "Cookie de cortesía"],
      en: ["Screening access", "One signature drink included", "Complimentary cookie"],
    },
    capacity: 25,
    coverImage: "/images/events/la-mas-draga-viewing-party.svg",
    imageAlt: {
      es: "Interior de d-stellar preparado para viewing party con pantalla e iluminación cálida",
      en: "d-stellar's interior set up for a viewing party with screen and warm lighting",
    },
    status: "upcoming",
  },
  {
    slug: "pride-block-party",
    title: "Pride Block Party",
    dateISO: "2026-06-27T17:00:00-06:00",
    endISO: "2026-06-27T22:00:00-06:00",
    summary: {
      es: "Cerramos la banqueta de Nuevo León para celebrar el orgullo con toda la cuadra.",
      en: "We closed off Nuevo León to celebrate pride with the whole block.",
    },
    description: {
      es: [
        "Colaboramos con negocios vecinos del Pabellón Nuevo León para una tarde de música, cookies especiales y una barra de bebidas de edición limitada.",
      ],
      en: [
        "We teamed up with neighboring shops in Pabellón Nuevo León for an afternoon of music, special-edition cookies and a limited drinks bar.",
      ],
    },
    includes: {
      es: ["Entrada libre", "Cookie edición Pride mientras dure"],
      en: ["Free entry", "Pride-edition cookie while supplies last"],
    },
    capacity: 80,
    coverImage: "/images/events/pride-block-party.svg",
    imageAlt: {
      es: "Celebración de Pride afuera de d-stellar en Nuevo León 217",
      en: "Pride celebration outside d-stellar on Nuevo León 217",
    },
    status: "past",
  },
];

export function getEvent(slug: string) {
  return events.find((event) => event.slug === slug);
}

export function upcomingEvents() {
  return events.filter((event) => event.status === "upcoming");
}

export function pastEvents() {
  return events.filter((event) => event.status === "past");
}
