export const SITE_URL = "https://www.d-stellar.co";

export const BUSINESS = {
  name: "d-stellar",
  legalName: "d-stellar — by The Sweet Universe Company",
  tagline: "Junt★s brillamos más",
  founders: ["Hernán Castilla", "Eduardo Hernández"],
  foundedYear: 2024,
  streetAddress: "Av. Nuevo León 217",
  addressLocality: "Hipódromo Condesa, Cuauhtémoc",
  addressRegion: "Ciudad de México",
  postalCode: "06100",
  addressCountry: "MX",
  neighborhood: "Pabellón Nuevo León",
  // Coordinates are approximate to the block (Nuevo León 217, Hipódromo) —
  // verify against Google Business Profile before relying on precise geo lookups.
  geo: { latitude: 19.4111, longitude: -99.1732 },
  // Horario, teléfono, WhatsApp, email y redes sociales se movieron a la
  // tabla `site_settings` (ver lib/site-settings-db.ts) — son editables
  // desde /admin/contenido/negocio sin redeploy. Lo que queda aquí
  // (dirección, geo, nombre legal, fundadores) son hechos fijos que no se
  // esperan cambios de rutina, ver CLAUDE.md.
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=d-stellar+Av+Nuevo+Leon+217+Hipodromo+Condesa+CDMX",
  attributes: {
    petFriendly: true,
    lgbtqFriendly: true,
    transSafeSpace: true,
    wifi: true,
    dineIn: true,
    takeaway: true,
    delivery: false,
    parking: "street",
  },
} as const;
