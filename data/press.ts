export type PressMention = {
  outlet: string;
  // Official outlet logo, sourced from the outlet itself or Wikimedia
  // Commons — see PROJECT_NOTES.md for provenance. Rendered on a white
  // chip so dark-text marks (e.g. El Economista) stay legible on our
  // dark background. Omit only when no real logo could be sourced (e.g.
  // Nómada Capital's site lazy-loads its logo behind JS) — the card then
  // falls back to the outlet name as plain text, never a fabricated mark.
  logo?: string;
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
    logo: "/press-logos/el-economista.svg",
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
    logo: "/press-logos/cronista.png",
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
    logo: "/press-logos/almomento.png",
    title: "Emprender también es resistir: ¿apoyar negocios LGBT+ también es activismo?",
    url: "https://almomento.mx/emprender-tambien-es-resistir-apoyar-negocios-lgbt-tambien-es-activismo/",
    dateLabel: { es: "Junio 2026", en: "June 2026" },
    summary: {
      es: "d-stellar como caso central de un reportaje sobre emprendimiento LGBT+ como forma de activismo en México.",
      en: "d-stellar featured as the central case study in a piece on LGBT+ entrepreneurship as activism in Mexico.",
    },
  },
  {
    outlet: "Sociedad Noticias",
    logo: "/press-logos/sociedad-noticias.png",
    title: "Emprendedores LGBT+ enfrentan retos y buscan mayor apoyo",
    url: "https://sociedad-noticias.com/2026/06/28/emprendedores-lgbt-enfrentan-retos-y-buscan-mayor-apoyo/",
    dateLabel: { es: "Junio 2026", en: "June 2026" },
    summary: {
      es: "Eduardo de Castilla, cofundador de d-stellar, explica cómo el negocio nació para construir un espacio seguro donde la comunidad LGBTQ+ pueda sentirse protegida y auténtica.",
      en: "Eduardo de Castilla, d-stellar's co-founder, explains how the business was built to create a safe space where the LGBTQ+ community can feel protected and authentic.",
    },
  },
  {
    outlet: "Nómada Capital",
    title: "¿La mejor cookie shop de CDMX? D-Stellar conquista la Condesa con galletas que cambian cada mes",
    url: "https://nomada-capital.com/la-mejor-cookie-shop-de-cdmx-d-stellar-conquista-la-condesa-con-galletas-que-cambian-cada-mes/",
    dateLabel: { es: "Agosto 2026", en: "August 2026" },
    summary: {
      es: "Un perfil de d-stellar como la tienda conceptual en la Condesa que reinventa su menú cada mes, con la colección \"All Stars\" de julio como ejemplo de su propuesta inclusiva.",
      en: "A profile of d-stellar as the concept shop in Condesa that reinvents its menu every month, spotlighting July's \"All Stars\" collection as an example of its inclusive approach.",
    },
  },
  {
    outlet: "Style by ShockVisual",
    logo: "/press-logos/style-shockvisual.png",
    title: "Todo lo que debes saber de D-Stellar",
    url: "https://style.shockvisual.net/todo-lo-que-debes-saber-de-d-stellar/",
    dateLabel: { es: "Julio 2026", en: "July 2026" },
    summary: {
      es: "Una guía completa sobre d-stellar: la cookie shop conceptual de la Condesa que renueva su menú cada mes y combina repostería artesanal con watch parties y eventos comunitarios.",
      en: "A complete guide to d-stellar: the concept cookie shop in Condesa that renews its menu every month, blending artisanal baking with watch parties and community events.",
    },
  },
  {
    outlet: "Yahoo Noticias",
    logo: "/press-logos/yahoo.svg",
    title: "D-Stellar: más que un negocio de galletas, un espacio seguro para la comunidad LGBTQ+",
    url: "https://es-us.noticias.yahoo.com/d-stellar-negocio-galletas-espacio-130000468.html",
    dateLabel: { es: "Junio 2026", en: "June 2026" },
    summary: {
      es: "d-stellar presentado como un espacio seguro para la comunidad LGBTQ+ construido a partir de una cookie shop, incluyendo los retos financieros que ha enfrentado el negocio.",
      en: "d-stellar presented as a safe space for the LGBTQ+ community built out of a cookie shop, including the financial challenges the business has faced.",
    },
  },
  {
    outlet: "Monchi Time",
    logo: "/press-logos/monchi-time.png",
    title: "D-Stellar, la cookie shop mexicana que está conquistando a una creciente comunidad foodie",
    url: "https://monchitime.com/2026/07/d-stellar-la-cookie-shop-mexicana-que-esta-conquistando-a-una-creciente-comunidad-foodie/",
    dateLabel: { es: "Julio 2026", en: "July 2026" },
    summary: {
      es: "d-stellar como el emprendimiento de Condesa que se reinventa cada mes con colecciones temáticas de cookies artesanales, construyendo comunidad a través de experiencias que mezclan repostería y cultura pop.",
      en: "d-stellar as the Condesa venture that reinvents itself every month with themed artisanal cookie collections, building community through experiences that blend baking and pop culture.",
    },
  },
  {
    outlet: "Godínez Chilangxs",
    logo: "/press-logos/godin-chilango.png",
    title: "D-Stellar renueva su menú cada mes y se convierte en una parada obligada para los amantes de las cookies en CDMX",
    url: "https://godinchilango.com.mx/d-stellar-renueva-su-menu-cada-mes-y-se-convierte-en-una-parada-obligada-para-los-amantes-de-las-cookies-en-cdmx/",
    dateLabel: { es: "Julio 2026", en: "July 2026" },
    summary: {
      es: "d-stellar en Hipódromo Condesa, con su menú mensual y la colección \"All Stars\" de julio reuniendo las cinco cookies más populares según la comunidad.",
      en: "d-stellar in Hipódromo Condesa, spotlighting its monthly menu and July's \"All Stars\" collection, bringing together its five most popular cookies as chosen by the community.",
    },
  },
];
