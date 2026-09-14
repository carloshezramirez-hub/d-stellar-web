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
  doorsNote?: { es: string; en: string };
  summary: { es: string; en: string };
  description: { es: string[]; en: string[] };
  includes?: { es: string[]; en: string[] };
  capacity?: number;
  priceMXN?: number;
  coverImage: string;
  imageAlt: { es: string; en: string };
  status: "upcoming" | "past";
  // Optional link to a real social post about the event (e.g. Instagram).
  externalUrl?: string;
};

// PLACEHOLDER CONTENT — replace dates, capacity and price with the real
// details before publishing. See PROJECT_NOTES.md → "Crear un nuevo evento".
export const events: EventRecord[] = [
  {
    slug: "cata-galletas-septiembre",
    title: "Cata de Galletas — Septiembre",
    dateISO: "2026-09-25T00:00:00-06:00",
    timeKnown: false,
    summary: {
      es: "Una cata guiada de las cinco cookies de la colección de septiembre, maridadas con Chasen Hojicha Latte, y una caja de 3 para llevar al final.",
      en: "A guided tasting of all five cookies from the September collection, paired with a Chasen Hojicha Latte, ending with a 3-cookie box to take home.",
    },
    description: {
      es: [
        "El viernes 25 de septiembre abrimos una cata especial de la colección del mes: Primer Latido, Dulce Ceniza, Granada Nocturna, Milpa Negra y Alba Rosada, servidas una por una para probarlas con calma.",
        "Entre cookie y cookie, un Chasen Hojicha Latte — nuestro té hojicha tostado, batido a mano — funciona como acompañamiento para limpiar el paladar durante toda la experiencia.",
        "Al terminar la cata, cada asistente arma su propia caja con 3 cookies — las que más le hayan gustado de las cinco — para llevarse a casa.",
        "Cupo limitado, como todos los eventos en d-stellar. Escríbenos para apartar tu lugar (botón abajo).",
      ],
      en: [
        "On Friday, September 25 we're hosting a special tasting of this month's collection: Primer Latido, Dulce Ceniza, Granada Nocturna, Milpa Negra and Alba Rosada, served one at a time so you can really taste each one.",
        "Between cookies, a Chasen Hojicha Latte — our hand-whisked roasted hojicha tea — works as a palate cleanser throughout the experience.",
        "At the end of the tasting, each guest builds their own box of 3 cookies — whichever three they liked best — to take home.",
        "Limited capacity, like every d-stellar event. Message us to reserve your spot (button below).",
      ],
    },
    includes: {
      es: ["Cata de las 5 cookies de septiembre", "Chasen Hojicha Latte de acompañamiento", "Caja de 3 cookies a elegir, para llevar"],
      en: ["Tasting of all 5 September cookies", "Chasen Hojicha Latte pairing", "Take-home box of 3 cookies, your choice"],
    },
    priceMXN: 499,
    coverImage: "/images/events/cata-galletas-septiembre.svg",
    imageAlt: {
      es: "Colección de cookies de septiembre de d-stellar junto a una taza de hojicha, para la cata del 25 de septiembre",
      en: "d-stellar's September cookie collection next to a cup of hojicha, for the September 25 tasting",
    },
    status: "upcoming",
  },
  {
    slug: "la-mas-draga-viewing-party",
    title: "La Más Draga — Viewing Party",
    dateISO: "2026-08-15T20:00:00-06:00",
    endISO: "2026-08-15T23:00:00-06:00",
    doorsNote: { es: "Cupo limitado, llega con tiempo.", en: "Limited capacity, arrive early." },
    summary: {
      es: "Pantalla, cacao caliente y la comunidad de Condesa reunida para ver el episodio en vivo.",
      en: "Big screen, hot cacao, and the Condesa community gathered to watch the episode live.",
    },
    description: {
      es: [
        "Una vez por temporada convertimos d-stellar en sala de proyección. Apagamos las luces, servimos bebidas de autor y vemos el episodio junt★s, en pantalla grande.",
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
    capacity: 10,
    coverImage: "/images/events/la-mas-draga-viewing-party.svg",
    imageAlt: {
      es: "Interior de d-stellar preparado para viewing party con pantalla e iluminación cálida",
      en: "d-stellar's interior set up for a viewing party with screen and warm lighting",
    },
    status: "past",
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
  {
    slug: "todas-las-mas-2",
    title: "Todas las Más 2 — Transmisiones en vivo",
    dateISO: "2026-08-04T00:00:00-06:00",
    timeKnown: false,
    summary: {
      es: "Ocho martes seguidos, junt★s viendo cada episodio de La Más Draga 2 el día que salió al aire.",
      en: "Eight Tuesdays in a row, watching every La Más Draga 2 episode together the day it aired.",
    },
    description: {
      es: [
        "Todos los martes de junio y julio transmitimos en vivo los episodios de La Más Draga 2 en pantalla grande, con la comunidad de Condesa reunida para verlos junt★s.",
        "El line-up completo: La Más Diva (16 jun), La Más Típica (23 jun), La Más Antojable (30 jun), La Más Cachuda (7 jul), La Más Monja Coronada (14 jul), La Más Picada (21 jul), La Muy Más (28 jul) y Noche de Copas (4 ago).",
      ],
      en: [
        "Every Tuesday in June and July we live-streamed La Más Draga 2 episodes on the big screen, with the Condesa community gathered to watch together.",
        "The full lineup: La Más Diva (Jun 16), La Más Típica (Jun 23), La Más Antojable (Jun 30), La Más Cachuda (Jul 7), La Más Monja Coronada (Jul 14), La Más Picada (Jul 21), La Muy Más (Jul 28) and Noche de Copas (Aug 4).",
      ],
    },
    coverImage: "/images/events/todas-las-mas-2.webp",
    imageAlt: {
      es: "Público de d-stellar viendo la transmisión en vivo de La Más Draga 2 proyectada en pantalla grande",
      en: "d-stellar's crowd watching the La Más Draga 2 live broadcast projected on the big screen",
    },
    status: "past",
  },
  {
    slug: "presentacion-video-musical",
    title: "Presentación de video musical",
    dateISO: "2026-07-17T00:00:00-06:00",
    timeKnown: false,
    summary: {
      es: "Un evento privado para presentar en primicia un video musical, proyectado en pantalla grande bajo el techo estrellado.",
      en: "A private event to premiere a music video, projected on the big screen under the starry ceiling.",
    },
    description: {
      es: [
        "El 17 de julio abrimos d-stellar para un evento privado: la presentación en primicia de un video musical, proyectado en pantalla grande.",
      ],
      en: [
        "On July 17 we opened d-stellar for a private event: the premiere screening of a music video, projected on the big screen.",
      ],
    },
    coverImage: "/images/events/presentacion-video-musical.webp",
    imageAlt: {
      es: "Presentadora frente a la pantalla de d-stellar durante la presentación del video musical",
      en: "A presenter in front of d-stellar's screen during the music video premiere",
    },
    status: "past",
  },
  {
    slug: "idilio-taller-poesia",
    title: "Presentación del libro \"IDILIO\" y taller \"Las cosas que nunca dijimos\"",
    monthLabel: { es: "Julio 2026", en: "July 2026" },
    summary: {
      es: "Presentamos el libro IDILIO y dimos un taller de poesía abierto al público para escribir sobre las cosas que nunca dijimos.",
      en: "We hosted the IDILIO book presentation and an open poetry workshop about the things we never said.",
    },
    description: {
      es: [
        "En julio presentamos el libro IDILIO y dimos un taller de poesía abierto al público, con el objetivo de escribir sobre \"las cosas que nunca dijimos\".",
      ],
      en: [
        "In July we presented the IDILIO book and hosted an open poetry workshop, writing about \"the things we never said\".",
      ],
    },
    coverImage: "/images/events/idilio-taller-poesia.webp",
    imageAlt: {
      es: "Público de d-stellar viendo la presentación en pantalla durante el evento de IDILIO",
      en: "d-stellar's audience watching the on-screen presentation during the IDILIO event",
    },
    status: "past",
    externalUrl: "https://www.instagram.com/p/DbJLAt8AQeo/",
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
