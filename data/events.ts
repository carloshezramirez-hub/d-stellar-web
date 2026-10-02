export type EventTicket = {
  name: { es: string; en: string };
  priceMXN: number;
  includes: { es: string[]; en: string[] };
  // Short caption under this ticket's includes — e.g. clarifying a "duo"
  // ticket isn't only for romantic couples.
  note?: { es: string; en: string };
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

// PLACEHOLDER CONTENT — replace dates, capacity and price with the real
// details before publishing. See PROJECT_NOTES.md → "Crear un nuevo evento".
export const events: EventRecord[] = [
  {
    slug: "el-camino-de-regreso",
    title: "El camino de regreso",
    dateISO: "2026-10-09T19:00:00-06:00",
    endISO: "2026-10-09T20:30:00-06:00",
    // Narrowed from every Fri/Sat in October to these 7 confirmed dates —
    // see the official flyer added 2026-10-02 (public/images/events/
    // el-camino-de-regreso-flyer.webp). Zoe Valdez's existing Oct 9
    // reservation (TIX-691049) still falls on one of these, so no
    // outreach needed for that booking.
    sessionDates: [
      "2026-10-09T19:00:00-06:00",
      "2026-10-17T19:00:00-06:00",
      "2026-10-23T19:00:00-06:00",
      "2026-10-31T19:00:00-06:00",
      "2026-11-01T19:00:00-06:00",
      "2026-11-06T19:00:00-06:00",
      "2026-11-14T19:00:00-06:00",
    ],
    datesSummary: {
      es: "9, 17, 23 y 31 de octubre · 1, 6 y 14 de noviembre · 7:00 p.m.",
      en: "Oct 9, 17, 23 & 31 · Nov 1, 6 & 14 · 7:00 p.m.",
    },
    summary: {
      es: "Una ofrenda sensorial contada en cinco sabores — cata a ciegas del menú de octubre que despierta recuerdos de quienes ya no están.",
      en: "A sensory offering told in five flavors — a blind tasting of the October menu that awakens memories of those who are no longer with us.",
    },
    description: {
      es: [
        "El camino de regreso es una ofrenda sensorial contada en cinco sabores. Una cata a ciegas donde los aromas, las texturas y la narración despiertan recuerdos de quienes ya no están: las mesas que compartimos, los gestos que heredamos y el amor que sigue presente en nuestra manera de vivir.",
        "Hay recuerdos que todavía saben volver: el pan que alguien partía con las manos, una cocina encendida por la mañana, la voz que preguntaba si ya habías comido. A veces, lo que más extrañamos cabe en un gesto pequeño — y en esta experiencia, esos gestos se convierten en una ofrenda que puedes saborear.",
        "Cinco preparaciones acompañadas de una narración te invitan a recorrer la mesa compartida, los aromas de casa, las manos que nos cuidaron y todo lo que alguien dejó en nuestra forma de vivir. Cada tiempo abre un espacio para descubrir un sabor y, quizá, reconocer algo de tu propia historia.",
        "Puedes venir con alguien o regalarte este momento a solas. Lo que recuerdes te pertenece — no tendrás que compartir un nombre, explicar una ausencia ni contar nada que prefieras conservar para ti.",
        "Acceso únicamente con boleto previamente adquirido. Duración aproximada: 75–90 minutos. Elige tu fecha al reservar — hay funciones el 9, 17, 23 y 31 de octubre, y el 1, 6 y 14 de noviembre, cupo máximo 10 personas por noche.",
      ],
      en: [
        "El camino de regreso (\"The way back\") is a sensory offering told in five flavors — a blind tasting where aroma, texture and story awaken memories of those who are no longer with us: the tables we shared, the gestures we inherited, and the love that still lives in how we live.",
        "Some memories still know how to come back: the bread someone used to break by hand, a kitchen lit up in the morning, the voice that asked if you'd already eaten. Sometimes what we miss most fits inside a small gesture — and in this experience, those gestures become an offering you can taste.",
        "Five courses, guided by a narration, walk you through the shared table, the smells of home, the hands that cared for us, and everything someone left in the way we live now. Each course opens space to discover a flavor — and maybe recognize something of your own story.",
        "Come with someone, or give yourself this moment alone. Whatever you remember belongs to you — you won't have to share a name, explain an absence, or tell anyone anything you'd rather keep for yourself.",
        "Access is ticket-only, no walk-ins. The experience runs about 75–90 minutes. Pick your date when you reserve — sessions run Oct 9, 17, 23 & 31 and Nov 1, 6 & 14, max. 10 people per night.",
      ],
    },
    tickets: [
      {
        name: { es: "Experiencia Individual", en: "Solo Experience" },
        priceMXN: 450,
        includes: {
          es: [
            "Acceso para 1 persona",
            "Cata guiada de los 5 sabores de octubre",
            "Bebida durante la experiencia",
            "Experiencia con antifaz y ambientación musical",
            "Conversación y revelación de cada sabor",
            "3-Pack de cookies a elección para llevar",
          ],
          en: [
            "Access for 1 person",
            "Guided tasting of all 5 October flavors",
            "A drink served during the experience",
            "Blindfolded experience with music",
            "Conversation and reveal after each flavor",
            "3-Pack of cookies, your choice, to take home",
          ],
        },
      },
      {
        name: { es: "Experiencia Dúo", en: "Duo Experience" },
        priceMXN: 800,
        includes: {
          es: [
            "Acceso para 2 personas",
            "Cata guiada de los 5 sabores para ambas personas",
            "2 bebidas",
            "Experiencia con antifaz y ambientación musical",
            "Conversación y revelación de cada sabor",
            "1 5-Pack de cookies a elección para llevar",
          ],
          en: [
            "Access for 2 people",
            "Guided tasting of all 5 flavors for both people",
            "2 drinks",
            "Blindfolded experience with music",
            "Conversation and reveal after each flavor",
            "One 5-Pack of cookies, your choice, to take home",
          ],
        },
        note: {
          es: "Ven con quien quieras — no es solo para parejas.",
          en: "Come with anyone — it's not just for couples.",
        },
      },
    ],
    capacity: 10,
    coverImage: "/images/events/el-camino-de-regreso-flyer.webp",
    galleryImages: ["/images/promos/calabaza-cookie.webp", "/images/promos/calabaza-latte.webp"],
    imageAlt: {
      es: "Flyer oficial de El camino de regreso, cata a ciegas de Día de Muertos en d-stellar",
      en: "Official flyer for El camino de regreso, d-stellar's Día de Muertos blind tasting",
    },
    status: "upcoming",
  },
  {
    slug: "5-latidos",
    title: "5 Latidos",
    dateISO: "2026-09-25T19:00:00-06:00",
    endISO: "2026-09-25T20:30:00-06:00",
    summary: {
      es: "Cinco cookies. Cinco latidos. Una noche para sentirlas sin verlas — cata sensorial a ciegas del menú de septiembre de d-stellar.",
      en: "Five cookies. Five heartbeats. One night to feel them without seeing them — a blind sensory tasting of d-stellar's September menu.",
    },
    description: {
      es: [
        "5 Latidos es una experiencia gastronómica íntima creada alrededor de las cinco cookies que forman la colección de septiembre de d-stellar.",
        "Durante una noche, solo 10 personas probarán el menú completo de una manera distinta: con los ojos cubiertos, acompañadas por música y una guía sensorial diseñada para hacer que aroma, textura, temperatura, sabor y memoria ocupen el lugar que normalmente domina la vista.",
        "Cada cookie se convierte en un latido. Después de cada degustación, las personas podrán descubrir qué probaron, conversar sobre lo que percibieron y conocer la intención detrás de cada creación.",
        "Al terminar los cinco latidos, cada participante elegirá sus favoritas para llevarse una selección a casa.",
        "No buscamos hacer una cata técnica ni enseñar cuál es la respuesta correcta. Buscamos que cada persona descubra qué siente cuando deja de ver y empieza realmente a probar.",
        "Acceso únicamente con boleto previamente adquirido. Duración aproximada: 75–90 minutos. Escríbenos para apartar tu lugar (botón abajo) — cupo máximo 10 personas.",
      ],
      en: [
        "5 Latidos is an intimate tasting experience built around the five cookies in d-stellar's September collection.",
        "For one night, only 10 people will taste the full menu in a completely different way: blindfolded, guided by music and a sensory host designed to let aroma, texture, temperature, flavor and memory take the place vision usually holds.",
        "Each cookie becomes a heartbeat. After each tasting, guests uncover what they just ate, talk through what they noticed, and hear the story behind each creation.",
        "At the end of the five heartbeats, every guest picks their favorites to take home.",
        "This isn't a technical tasting, and there's no \"correct\" answer to find. It's about discovering what you actually feel once you stop looking and start truly tasting.",
        "Access is ticket-only, no walk-ins. The experience runs about 75–90 minutes — message us to reserve your spot (button below), max. 10 people.",
      ],
    },
    tickets: [
      {
        name: { es: "Experiencia Individual", en: "Solo Experience" },
        priceMXN: 450,
        includes: {
          es: [
            "Acceso para 1 persona",
            "Cata guiada de los 5 sabores de septiembre",
            "Hojicha durante la experiencia",
            "Experiencia con venda y ambientación musical",
            "Conversación y revelación de cada sabor",
            "3-Pack de cookies a elección para llevar",
          ],
          en: [
            "Access for 1 person",
            "Guided tasting of all 5 September flavors",
            "Hojicha served during the experience",
            "Blindfolded experience with music",
            "Conversation and reveal after each flavor",
            "3-Pack of cookies, your choice, to take home",
          ],
        },
      },
      {
        name: { es: "Experiencia Dúo", en: "Duo Experience" },
        priceMXN: 800,
        includes: {
          es: [
            "Acceso para 2 personas",
            "Cata guiada de los 5 sabores para ambas personas",
            "2 hojichas",
            "Experiencia con venda y ambientación musical",
            "Conversación y revelación de cada sabor",
            "1 5-Pack de cookies a elección para llevar",
          ],
          en: [
            "Access for 2 people",
            "Guided tasting of all 5 flavors for both people",
            "2 hojichas",
            "Blindfolded experience with music",
            "Conversation and reveal after each flavor",
            "One 5-Pack of cookies, your choice, to take home",
          ],
        },
        note: {
          es: "Ven con quien quieras — no es solo para parejas.",
          en: "Come with anyone — it's not just for couples.",
        },
      },
    ],
    capacity: 10,
    coverImage: "/images/products/cookie-display-lit.webp",
    imageAlt: {
      es: "Las cinco cookies de septiembre de d-stellar, listas para la cata a ciegas 5 Latidos",
      en: "d-stellar's five September cookies, ready for the 5 Latidos blind tasting",
    },
    status: "past",
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
