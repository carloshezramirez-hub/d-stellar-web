export type PressMention = {
  outlet: string;
  title: string;
  url: string;
  // Human-readable, deliberately not a precise ISO date — publish dates on
  // some of these outlets are ambiguous (published vs. updated timestamps).
  dateLabel: { es: string; en: string };
  summary: { es: string; en: string };
};

// Real coverage only — every entry here is a verified, live URL that
// actually mentions d-stellar by name. Do not add roundup/listicle links
// that don't name the shop just to pad this list (several were checked and
// discarded: Chilango, Time Out Mexico, El Universal, Food & Travel, The
// Infatuation, Yahoo Travel — none of them mention d-stellar). Verify a new
// URL actually names "d-stellar" before adding it here.
export const press: PressMention[] = [
  {
    outlet: "El Economista",
    title: "D-Stellar: el negocio de galletas que es un espacio seguro para la comunidad LGBTQ+",
    url: "https://www.eleconomista.com.mx/el-empresario/d-stellar-negocio-galletas-espacio-seguro-comunidad-lgbtq-20260630-820890.html",
    dateLabel: { es: "Junio 2026", en: "June 2026" },
    summary: {
      es: "Cómo d-stellar construyó, a partir de un negocio de galletas en la Condesa, un espacio seguro para la comunidad LGBTQ+.",
      en: "How d-stellar built a safe space for the LGBTQ+ community out of a cookie business in Condesa.",
    },
  },
  {
    outlet: "Cronista",
    title: "Galletas con propósito en la Condesa: así aplica D-Stellar la filosofía del consumo local para crecer",
    url: "https://www.cronista.com/mexico/finanzas-economia/galletas-con-proposito-en-la-condesa-asi-aplica-d-stellar-la-filosofia-del-consumo-local-para-crecer/",
    dateLabel: { es: "Agosto 2026", en: "August 2026" },
    summary: {
      es: "Un perfil de negocio sobre cómo d-stellar apuesta por el consumo local y las colecciones mensuales para crecer en la Condesa.",
      en: "A business profile on how d-stellar leans on local consumption and its monthly collections to grow in Condesa.",
    },
  },
  {
    outlet: "Almomento",
    title: "Emprender también es resistir: ¿apoyar negocios LGBT+ también es activismo?",
    url: "https://almomento.mx/emprender-tambien-es-resistir-apoyar-negocios-lgbt-tambien-es-activismo/",
    dateLabel: { es: "Junio 2026", en: "June 2026" },
    summary: {
      es: "d-stellar como caso central de un reportaje sobre emprendimiento LGBT+ como forma de activismo en México.",
      en: "d-stellar featured as the central case study in a piece on LGBT+ entrepreneurship as activism in Mexico.",
    },
  },
];
