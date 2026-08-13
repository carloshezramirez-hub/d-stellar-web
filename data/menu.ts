export type MenuItem = {
  slug: string;
  name: string;
  description: { es: string; en: string };
  /** MXN, whole pesos. Leave undefined until confirmed in-store — never guess a price. */
  priceMXN?: number;
  tags?: Array<"vegan" | "caffeine-free" | "seasonal" | "signature">;
};

export type MenuSection = {
  slug: string;
  title: { es: string; en: string };
  intro: { es: string; en: string };
  items: MenuItem[];
};

// Monthly rotation. To update: edit the `cookies` section below — everything
// else (packs, drinks) tends to stay stable month to month. Keep item names
// as proper nouns; only the description/tags should be translated or tuned.
export const MENU_MONTH_LABEL = { es: "Colección de agosto", en: "August collection" };

export const menu: MenuSection[] = [
  {
    slug: "cookies",
    title: { es: "Cookies del mes", en: "Cookies of the month" },
    intro: {
      es: "Cinco recetas de temporada, horneadas en tandas cortas durante el día. Cuando se acaban, se acaban.",
      en: "Five seasonal recipes, baked in short batches through the day. When they're gone, they're gone.",
    },
    items: [
      {
        slug: "nube-ambar",
        name: "Nube Ámbar",
        description: {
          es: "Masa de mantequilla dorada, centro suave y notas tostadas de caramelo.",
          en: "Browned-butter dough with a soft center and toasted caramel notes.",
        },
        tags: ["signature"],
      },
      {
        slug: "bruma-zarza",
        name: "Bruma Zarza",
        description: {
          es: "Frutos rojos de temporada sobre una base especiada.",
          en: "Seasonal red berries over a lightly spiced base.",
        },
        tags: ["seasonal"],
      },
      {
        slug: "aurora-rosada",
        name: "Aurora Rosada",
        description: {
          es: "Chocolate blanco, un toque cítrico y un final floral.",
          en: "White chocolate, a citrus edge and a floral finish.",
        },
      },
      {
        slug: "eclipse-rubi",
        name: "Eclipse Rubí",
        description: {
          es: "Doble chocolate oscuro con centro casi líquido.",
          en: "Double dark chocolate with an almost-molten center.",
        },
        tags: ["signature"],
      },
      {
        slug: "ultima-del-verano",
        name: "Última del Verano",
        description: {
          es: "La despedida de temporada: fruta de hueso caramelizada y vainilla.",
          en: "The season's send-off: caramelized stone fruit and vanilla.",
        },
        tags: ["seasonal"],
      },
    ],
  },
  {
    slug: "bebidas-de-autor",
    title: { es: "Bebidas de autor", en: "Signature drinks" },
    intro: {
      es: "Cacao, café y especias reinterpretados en clave d-stellar.",
      en: "Cacao, coffee and spice, reinterpreted the d-stellar way.",
    },
    items: [
      { slug: "cielo-ambar", name: "Cielo Ámbar", description: { es: "Espresso, cacao y caramelo salado.", en: "Espresso, cacao and salted caramel." } },
      { slug: "gota-amatista", name: "Gota Amatista", description: { es: "Matcha, lavanda y leche de la casa.", en: "Matcha, lavender and house-made milk." } },
      { slug: "moonbeam-latte", name: "Moonbeam Latte", description: { es: "Latte de vainilla y flor de azahar.", en: "Vanilla latte with orange blossom." } },
      { slug: "bergamota-rubi", name: "Bergamota Rubí", description: { es: "Té negro, bergamota y cítricos rojos.", en: "Black tea, bergamot and red citrus." } },
      { slug: "ultimo-atardecer", name: "Último Atardecer", description: { es: "Cacao oscuro, canela y chile de temporada.", en: "Dark cacao, cinnamon and seasonal chile." } },
    ],
  },
  {
    slug: "cafe-cacao-matcha",
    title: { es: "Café, cacao & matcha", en: "Coffee, cacao & matcha" },
    intro: { es: "Los clásicos, hechos como se debe.", en: "The classics, done right." },
    items: [
      { slug: "americano", name: "Americano", description: { es: "Espresso alargado con agua caliente.", en: "Espresso lengthened with hot water." } },
      { slug: "cappuccino", name: "Cappuccino", description: { es: "Espresso, leche vaporizada y espuma densa.", en: "Espresso, steamed milk and dense foam." } },
      { slug: "latte", name: "Latte", description: { es: "Espresso con leche vaporizada.", en: "Espresso with steamed milk." } },
      { slug: "cacao", name: "Cacao", description: { es: "Cacao de origen, poco dulce.", en: "Origin cacao, lightly sweetened." } },
      { slug: "mocha", name: "Mocha", description: { es: "Espresso, cacao y leche vaporizada.", en: "Espresso, cacao and steamed milk." } },
      { slug: "white-mocha", name: "White Mocha", description: { es: "Espresso, chocolate blanco y leche vaporizada.", en: "Espresso, white chocolate and steamed milk." } },
      { slug: "chai-latte", name: "Chai Latte", description: { es: "Té chai especiado con leche vaporizada.", en: "Spiced chai tea with steamed milk." } },
      { slug: "dirty-chai", name: "Dirty Chai", description: { es: "Chai latte con un shot de espresso.", en: "Chai latte with a shot of espresso." } },
      { slug: "organic-chasen-matcha", name: "Organic Chasen Matcha", description: { es: "Matcha orgánico batido a mano con chasen.", en: "Organic matcha, hand-whisked with a chasen." } },
    ],
  },
  {
    slug: "sin-cafeina",
    title: { es: "Sin cafeína", en: "Caffeine-free" },
    intro: { es: "Toda la ceremonia, sin la cafeína.", en: "All the ritual, none of the caffeine." },
    items: [
      { slug: "chasen-hojicha-latte", name: "Chasen Hojicha Latte", description: { es: "Té hojicha tostado, batido a mano.", en: "Roasted hojicha tea, hand-whisked." }, tags: ["caffeine-free"] },
      { slug: "taro-latte", name: "Taro Latte", description: { es: "Taro cremoso con leche vaporizada.", en: "Creamy taro with steamed milk." }, tags: ["caffeine-free"] },
      { slug: "leche-de-lavanda", name: "Leche de Lavanda", description: { es: "Leche vaporizada infusionada con lavanda.", en: "Steamed milk infused with lavender." }, tags: ["caffeine-free"] },
      { slug: "leche-para-cookies", name: "Leche para Cookies", description: { es: "Leche entera fría, hecha para acompañar.", en: "Cold whole milk, made for dunking." }, tags: ["caffeine-free"] },
    ],
  },
  {
    slug: "tonicos",
    title: { es: "Tónicos", en: "Tonics" },
    intro: { es: "Café y té sobre agua tónica, con hielo.", en: "Coffee and tea over tonic water, on ice." },
    items: [
      { slug: "espresso-tonic", name: "Espresso Tonic", description: { es: "Espresso doble sobre agua tónica.", en: "Double espresso over tonic water." } },
      { slug: "cold-brew-tonic", name: "Cold Brew Tonic", description: { es: "Cold brew de la casa sobre agua tónica.", en: "House cold brew over tonic water." } },
      { slug: "matcha-tonic", name: "Matcha Tonic", description: { es: "Matcha batido sobre agua tónica.", en: "Whisked matcha over tonic water." } },
      { slug: "chai-tonic", name: "Chai Tonic", description: { es: "Concentrado de chai sobre agua tónica.", en: "Chai concentrate over tonic water." } },
    ],
  },
  {
    slug: "focaccias",
    title: { es: "Focaccias", en: "Focaccias" },
    intro: {
      es: "La oferta cambia por temporada — normalmente hay una versión cárnica, una vegana y el melt del día.",
      en: "The lineup changes by season — usually a meat version, a vegan version and the melt of the day.",
    },
    items: [
      { slug: "carnica", name: "Cárnica", description: { es: "La versión con proteína del día, consulta en barra.", en: "The protein version of the day — ask at the counter." } },
      { slug: "vegana", name: "Vegana", description: { es: "100% vegetal, rotativa por temporada.", en: "Fully plant-based, changes by season." }, tags: ["vegan"] },
      { slug: "melt-del-dia", name: "Melt del día", description: { es: "La combinación caliente que elige la cocina hoy.", en: "Today's hot combination, chef's call." } },
    ],
  },
  {
    slug: "cookie-packs",
    title: { es: "Cookie Packs", en: "Cookie packs" },
    intro: { es: "Para llevar la colección completa a donde vayas.", en: "Take the whole collection wherever you're going." },
    items: [
      { slug: "3-pack", name: "3 Pack", description: { es: "Tres cookies a elegir.", en: "Three cookies, your choice." } },
      { slug: "5-pack", name: "5 Pack", description: { es: "La colección casi completa.", en: "Nearly the whole collection." } },
      { slug: "10-pack", name: "10 Pack", description: { es: "Para compartir — o no.", en: "For sharing — or not." } },
    ],
  },
];

export function getMenuSection(slug: string) {
  return menu.find((section) => section.slug === slug);
}
