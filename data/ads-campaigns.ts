// Datos reales de las 5 promociones "More video views" de TikTok Ads
// (cuenta @dstellarmx), pegados por Carlos a mano desde TikTok Ads Manager
// el 2026-10-20. Cero cifras inventadas — cada número de aquí viene
// directo de la captura que él compartió. Si se agregan campañas nuevas,
// seguir el mismo patrón: pegar los números reales, no estimarlos.
//
// Nota: el conteo "Ad cost" que aparece en la lista superior de TikTok a
// veces difiere por centavos del que aparece en el detalle de cada
// promoción (redondeo de TikTok) — aquí se usó siempre el número del
// detalle, que es el más preciso.

export interface RetentionMetric {
  value: number; // porcentaje 0-100
  vsAverage: "above" | "below";
}

export interface AudienceAgeBracket {
  range: string;
  pct: number;
}

export interface AudienceRegion {
  region: string;
  pct: number;
}

export interface PostCampaignFollower {
  displayName: string;
  handle: string;
}

export interface AdCampaign {
  id: string;
  orderId: string | null;
  status: "active" | "closed" | "completed";
  statusLabel: string;
  actionLabel: string;
  videoCaption: string;
  videoDurationSec: number;
  startedAt: string; // ISO
  durationDays: number | null;
  budgetMXN: number | null;
  targeting: string;
  adCostMXN: number;
  videoViews: number;
  focusedViews: number | null;
  cpmMXN: number;
  timeSpentHours: number | null;
  newFollowers: number | null;
  likes: number;
  shares: number | null;
  buttonClicks: number | null;
  contentAnalysisNote: string;
  retention: {
    watched2s: RetentionMetric;
    watched6s: RetentionMetric;
    watchedFull: RetentionMetric;
    likeRate: RetentionMetric;
  };
  audienceAge: AudienceAgeBracket[];
  audienceRegion: AudienceRegion[] | "cdmx-100";
  closedManuallyReason?: string;
  flaggedIssue?: string;
  postCampaign7d?: {
    engagedFollowers: number;
    videoViews: number;
    profileViews: number;
    likes: number;
    topFollowers: PostCampaignFollower[];
  };
}

export const AD_CAMPAIGNS: AdCampaign[] = [
  {
    id: "top5-cookies",
    orderId: "1879493619087362",
    status: "closed",
    statusLabel: "Cerrado por Carlos",
    actionLabel: "Increase budget",
    videoCaption:
      "Vamos a probar todas las cookies de d-stellar! Así queda mi top 5; solo por ponerlas en orden; pero todas están bien perronas, pues yo soy el chef ¿ke no? 🥴🫦 1. Arde insurrection 2. Mañana también brilla 3. Lo que se ve no se pregunta 4. Veneno pasture piel 5. Por quienes brillaron antes #cdmx #cookies #galletas #coffee #café",
    videoDurationSec: 96,
    startedAt: "2026-10-19T17:46:00-06:00",
    durationDays: 2,
    budgetMXN: 40,
    targeting: "LATAM amplio (18 países, incl. México) · sexo: todos · edad: todas · intereses: todos",
    adCostMXN: 18.22,
    videoViews: 5652,
    focusedViews: 1888,
    cpmMXN: 3.22,
    timeSpentHours: 18.0,
    newFollowers: 4,
    likes: 17,
    shares: null,
    buttonClicks: 4,
    contentAnalysisNote:
      "Your video isn't doing as well as similar promotions. Explore content inspirations from other creators and test more engaging content to improve results.",
    retention: {
      watched2s: { value: 73.2, vsAverage: "above" },
      watched6s: { value: 34.1, vsAverage: "above" },
      watchedFull: { value: 0.5, vsAverage: "below" },
      likeRate: { value: 0.3, vsAverage: "below" },
    },
    audienceAge: [
      { range: "13-17", pct: 49 },
      { range: "18-24", pct: 21 },
      { range: "25-34", pct: 18 },
      { range: "35-44", pct: 7 },
      { range: "45-54", pct: 4 },
      { range: "55+", pct: 1 },
    ],
    audienceRegion: [
      { region: "Provincia de Santo Domingo (RD)", pct: 10 },
      { region: "Departamento de Santa Cruz (BO)", pct: 9 },
      { region: "Departamento de Guatemala (GT)", pct: 8 },
      { region: "Departamento Central (PY)", pct: 7 },
      { region: "Departamento de La Paz (BO)", pct: 5 },
      { region: "Otros", pct: 61 },
    ],
    closedManuallyReason:
      "Carlos lo cerró a mano por el problema de geografía del público: con targeting \"todo LATAM + todas las edades\", el 49% del público terminó siendo adolescentes de 13-17 años y las regiones top fueron República Dominicana, Bolivia, Guatemala y Paraguay — nada de esto es el mercado real de la tienda (CDMX, adultos).",
  },
  {
    id: "experimento",
    orderId: "1879493500277762",
    status: "active",
    statusLabel: "Activo",
    actionLabel: "Increase budget",
    videoCaption:
      "Este es el experimento. Durante las próximas semanas vamos a enseñar mucho más de lo que realmente pasa detrás de d-stellar. Y si alguno de estos videos termina trayéndote hasta acá, dinos dónde nos viste cuando vengas. Queremos comprobar si las redes realmente pueden cambiar lo que pasa dentro de un negocio pequeño. 📍Nuevo León 217, Hipódromo Condesa. #condesacdmx #café #cookies #emprendedores #cdmx",
    videoDurationSec: 55,
    startedAt: "2026-10-19T17:44:00-06:00",
    durationDays: 3,
    budgetMXN: 300,
    targeting: "CDMX - Zona amplia",
    adCostMXN: 91.17,
    videoViews: 9843,
    focusedViews: 2591,
    cpmMXN: 9.26,
    timeSpentHours: 18.0,
    newFollowers: 5,
    likes: 85,
    shares: 3,
    buttonClicks: 14,
    contentAnalysisNote:
      "People enjoy your content but they're not watching all the way through. Try shorter clips, grab attention with catchy hooks or trending sounds, and use text or captions to keep them watching.",
    retention: {
      watched2s: { value: 59.4, vsAverage: "above" },
      watched6s: { value: 26.7, vsAverage: "above" },
      watchedFull: { value: 2.2, vsAverage: "below" },
      likeRate: { value: 0.9, vsAverage: "above" },
    },
    audienceAge: [
      { range: "18-24", pct: 8 },
      { range: "25-34", pct: 32 },
      { range: "35-44", pct: 32 },
      { range: "45-54", pct: 28 },
      { range: "55+", pct: 0 },
    ],
    audienceRegion: "cdmx-100",
  },
  {
    id: "reserva-ahora",
    orderId: null,
    status: "closed",
    statusLabel: "Cerrado",
    actionLabel: "Promote again",
    videoCaption: "Reserva desde www.d-sellar.co #galletas #condesacdmx #cata #cafe #eventoscdmx",
    videoDurationSec: 47,
    startedAt: "2026-10-19T00:00:00-06:00",
    durationDays: null,
    budgetMXN: null,
    targeting: "CDMX (deducido del 100% Mexico City en el público; TikTok no mostró el bloque de audiencia completo para esta promoción)",
    adCostMXN: 29.25,
    videoViews: 2924,
    focusedViews: 844,
    cpmMXN: 10,
    timeSpentHours: null,
    newFollowers: 2,
    likes: 5,
    shares: null,
    buttonClicks: 1,
    contentAnalysisNote:
      "Your video isn't doing as well as similar promotions. Explore content inspirations from other creators and test more engaging content to improve results.",
    retention: {
      watched2s: { value: 70.0, vsAverage: "above" },
      watched6s: { value: 29.2, vsAverage: "above" },
      watchedFull: { value: 2.3, vsAverage: "below" },
      likeRate: { value: 0.2, vsAverage: "below" },
    },
    audienceAge: [
      { range: "18-24", pct: 7 },
      { range: "25-34", pct: 24 },
      { range: "35-44", pct: 31 },
      { range: "45-54", pct: 38 },
      { range: "55+", pct: 0 },
    ],
    audienceRegion: "cdmx-100",
    flaggedIssue:
      'El caption del video dice "www.d-sellar.co" (falta la "t" de "stellar") — el dominio real es www.d-stellar.co. Si alguien de los 844 que vieron el video con atención escribió esa URL a mano, no llega al sitio. Vale la pena revisar/corregir este video antes de volver a promocionarlo.',
  },
  {
    id: "idea-personal",
    orderId: null,
    status: "active",
    statusLabel: "Activo",
    actionLabel: "Increase budget",
    videoCaption:
      "d-stellar nació de una idea muy personal: construir un lugar para explorar sabores y sentirte parte. Cookies, cacao y café de autor en Hipódromo Condesa. Menú y horarios en www.d-stellar.co #condesacdmx #cdmx #café #galletas #cookies",
    videoDurationSec: 26,
    startedAt: "2026-10-19T00:00:00-06:00",
    durationDays: null,
    budgetMXN: null,
    targeting: "CDMX (deducido del 100% Mexico City en el público)",
    adCostMXN: 48.04,
    videoViews: 4772,
    focusedViews: 1054,
    cpmMXN: 10.06,
    timeSpentHours: 18.2,
    newFollowers: null,
    likes: 8,
    shares: null,
    buttonClicks: null,
    contentAnalysisNote:
      "Viewers are watching your video, but not many are liking it. Encourage people to \"Like\" to boost engagement and promotion results.",
    retention: {
      watched2s: { value: 66.2, vsAverage: "above" },
      watched6s: { value: 22.4, vsAverage: "above" },
      watchedFull: { value: 3.3, vsAverage: "above" },
      likeRate: { value: 0.2, vsAverage: "below" },
    },
    audienceAge: [
      { range: "18-24", pct: 9 },
      { range: "25-34", pct: 32 },
      { range: "35-44", pct: 33 },
      { range: "45-54", pct: 26 },
      { range: "55+", pct: 0 },
    ],
    audienceRegion: "cdmx-100",
  },
  {
    id: "detras-de-dstellar",
    orderId: null,
    status: "completed",
    statusLabel: "Completado",
    actionLabel: "Promote again",
    videoCaption:
      "Durante las próximas semanas vamos a enseñar mucho más de lo que realmente pasa detrás de d-stellar. Queremos comprobar si las redes realmente pueden cambiar lo que pasa dentro de un negocio pequeño. Nos encuentras en 📍Nuevo León 217, Hipódromo Condesa. #condesacdmx #café #cookies #emprendedores #cdmx",
    videoDurationSec: 57,
    startedAt: "2026-10-14T00:00:00-06:00",
    durationDays: null,
    budgetMXN: 150,
    targeting: "CDMX (deducido del 100% Mexico City en el público)",
    adCostMXN: 150,
    videoViews: 15611,
    focusedViews: 3361,
    cpmMXN: 9.6,
    timeSpentHours: null,
    newFollowers: 16,
    likes: 96,
    shares: 5,
    buttonClicks: 11,
    contentAnalysisNote:
      "People enjoy your content but they're not watching all the way through. Try shorter clips, grab attention with catchy hooks or trending sounds, and use text or captions to keep them watching.",
    retention: {
      watched2s: { value: 66.2, vsAverage: "above" },
      watched6s: { value: 21.8, vsAverage: "above" },
      watchedFull: { value: 1.4, vsAverage: "below" },
      likeRate: { value: 0.6, vsAverage: "above" },
    },
    audienceAge: [
      { range: "18-24", pct: 15 },
      { range: "25-34", pct: 42 },
      { range: "35-44", pct: 28 },
      { range: "45-54", pct: 15 },
      { range: "55+", pct: 0 },
    ],
    audienceRegion: "cdmx-100",
    postCampaign7d: {
      engagedFollowers: 16,
      videoViews: 29,
      profileViews: 5,
      likes: 11,
      topFollowers: [
        { displayName: "Devoción", handle: "devocion" },
        { displayName: "joshvelval", handle: "joshvelval" },
        { displayName: "Judith Gonzalez", handle: "judicina11" },
        { displayName: "aCr0207", handle: "acr0207" },
        { displayName: "Iram", handle: "elfumaderito" },
      ],
    },
  },
];
