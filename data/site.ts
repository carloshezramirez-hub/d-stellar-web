export const SITE_URL = "https://d-stellar.com";

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
  // Only the daily range published on Instagram is verified. Confirm
  // day-by-day hours (and any Monday closure) against Google Business
  // Profile before publishing openingHoursSpecification with per-day rules.
  hours: { opens: "11:00", closes: "19:00" },
  // Published as the brand's own public contact number on official
  // identity collateral (business card / secondary logo lockup).
  phone: "+52 55 4633 2352",
  phoneHref: "+525546332352",
  email: "hernan@dstellar.com",
  social: {
    instagram: "https://www.instagram.com/dstellarmx",
    tiktok: "https://www.tiktok.com/@dstellarmx",
    facebook: "https://www.facebook.com/profile.php?id=61570406427384",
    linkedin: "https://www.linkedin.com/company/d-stellar/",
  },
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
