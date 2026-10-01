export type MenuItem = {
  slug: string;
  name: string;
  description: { es: string; en: string };
  priceMXN: number;
  // Original (pre-discount) price, shown struck through next to priceMXN.
  // Only cookie-packs use this — it's the count × single-cookie price.
  compareAtPriceMXN?: number;
  // Number of cookies in a pack, so the pickup order form knows how many
  // flavor pickers to render. Only cookie-packs use this.
  packSize?: number;
  tags?: Array<"vegan" | "caffeine-free" | "seasonal" | "signature">;
};

export type MenuSection = {
  slug: string;
  title: { es: string; en: string };
  intro: { es: string; en: string };
  accent: "green" | "pink" | "blue" | "purple" | "red";
  items: MenuItem[];
};

// Verified against the October/November menu board (photo supplied by the
// client, 2026-10-01) — Día de Muertos theme, valid through November 15. To
// update the monthly rotation: edit `gourmet-cookies`, `bebidas-autor` and
// `sin-cafeina` below (these three sections rotate with the theme) plus
// `MENU_MONTH_LABEL` — `cafeina`, `tonics`, `focaccias` and `cookie-packs`
// tend to hold steady month to month. See PROJECT_NOTES.md → "Cómo
// actualizar el menú".
export const MENU_MONTH_LABEL = { es: "Menú de octubre y noviembre", en: "October & November menu" };

export const menu: MenuSection[] = [
  {
    slug: "gourmet-cookies",
    title: { es: "Gourmet Cookies", en: "Gourmet Cookies" },
    accent: "green",
    intro: {
      es: "La propuesta del mes. Cinco cookies horneadas en tandas cortas — cuando se acaban, se acaban.",
      en: "This month's lineup. Five cookies baked in short batches — when they're gone, they're gone.",
    },
    items: [
      {
        slug: "te-guarde-una",
        name: "Te Guardé Una",
        description: {
          es: "Cookie de mantequilla con huesitos de crema de azahar y un toque de azúcar.",
          en: "Butter cookie with orange-blossom cream \"huesitos\" and a touch of sugar.",
        },
        priceMXN: 90,
        tags: ["seasonal"],
      },
      {
        slug: "como-me-ensenaste",
        name: "Como Me Enseñaste",
        description: {
          es: "Cookie vegana especiada con dulce de calabaza en tacha.",
          en: "Spiced vegan cookie with candied pumpkin (calabaza en tacha).",
        },
        priceMXN: 90,
        tags: ["vegan", "seasonal"],
      },
      {
        slug: "te-deje-flores",
        name: "Te Dejé Flores",
        description: {
          es: "Cookie de mandarina y cardamomo con curd de mandarina, un gajito y pétalos de cempasúchil.",
          en: "Mandarin and cardamom cookie with mandarin curd, a mandarin segment and marigold petals.",
        },
        priceMXN: 90,
        tags: ["seasonal"],
      },
      {
        slug: "asi-te-recuerdo",
        name: "Así Te Recuerdo",
        description: {
          es: "Cookie de café con mousse de café de olla y una fina cobertura de chocolate.",
          en: "Coffee cookie with café de olla mousse and a thin chocolate coating.",
        },
        priceMXN: 90,
        tags: ["seasonal"],
      },
      {
        slug: "te-llevo-conmigo",
        name: "Te Llevo Conmigo",
        description: {
          es: "Cookie de vainilla con cajeta de muerto de camote morado y guayaba, y un toque ácido de jamaica.",
          en: "Vanilla cookie with purple sweet potato and guava \"cajeta de muerto\", and a tart hint of hibiscus.",
        },
        priceMXN: 90,
        tags: ["signature", "seasonal"],
      },
      {
        slug: "clasica-chispas-de-chocolate",
        name: "Clásica Chispas de Chocolate",
        description: {
          es: "Cookie de masa de mantequilla con chunks de chocolate semi amargo.",
          en: "Butter-dough cookie with semisweet chocolate chunks.",
        },
        priceMXN: 90,
        tags: ["signature"],
      },
      {
        slug: "clasica-de-calabaza",
        name: "Clásica de Calabaza",
        description: {
          es: "Cookie vegana clásica de calabaza, de temporada.",
          en: "Classic vegan pumpkin cookie, seasonal.",
        },
        priceMXN: 90,
        tags: ["vegan", "seasonal"],
      },
    ],
  },
  {
    slug: "bebidas-autor",
    title: { es: "Bebidas de Autor", en: "Signature Drinks" },
    accent: "purple",
    intro: {
      es: "Sodas y cordiales de la casa, una pareja para cada cookie del mes.",
      en: "House sodas and cordials, one paired with each cookie of the month.",
    },
    items: [
      {
        slug: "quedate-un-ratito",
        name: "Quédate un Ratito",
        description: { es: "Chocolate cremoso con piloncillo, canela y especias.", en: "Creamy chocolate with piloncillo, cinnamon and spices." },
        priceMXN: 80,
        tags: ["seasonal"],
      },
      {
        slug: "cuentame-otra-vez",
        name: "Cuéntame Otra Vez",
        description: { es: "Latte de calabaza en tacha con especias y leche a elección. Espresso opcional.", en: "Pumpkin-in-syrup latte with spices and milk of choice. Espresso optional." },
        priceMXN: 80,
        tags: ["seasonal"],
      },
      {
        slug: "aqui-te-espero",
        name: "Aquí Te Espero",
        description: {
          es: "Cempasúchil y miel. Frío con agua mineral y espuma cremosa; caliente con leche a elección.",
          en: "Marigold (cempasúchil) and honey. Served cold with sparkling water and creamy foam, or hot with milk of choice.",
        },
        priceMXN: 80,
        tags: ["seasonal"],
      },
      {
        slug: "cerquita-de-mi",
        name: "Cerquita de Mí",
        description: { es: "Café de olla con espresso, piloncillo y canela.", en: "Café de olla with espresso, piloncillo and cinnamon." },
        priceMXN: 40,
      },
      {
        slug: "a-donde-vaya",
        name: "A Donde Vaya",
        description: { es: "Limonada de guayaba y jamaica con burbujas.", en: "Guava and hibiscus limeade with bubbles." },
        priceMXN: 80,
      },
    ],
  },
  {
    slug: "cafeina",
    title: { es: "Cafeína", en: "Caffeine" },
    accent: "blue",
    intro: { es: "Los clásicos, hechos como se debe.", en: "The classics, done right." },
    items: [
      { slug: "americano", name: "Americano", description: { es: "Espresso alargado con agua caliente.", en: "Espresso lengthened with hot water." }, priceMXN: 35 },
      { slug: "capuccino", name: "Capuccino", description: { es: "Espresso, leche vaporizada y espuma densa.", en: "Espresso, steamed milk and dense foam." }, priceMXN: 50 },
      { slug: "latte", name: "Latte", description: { es: "Espresso con leche vaporizada.", en: "Espresso with steamed milk." }, priceMXN: 50 },
      { slug: "cacao-kosher", name: "Cacao", description: { es: "Cacao de origen, certificado kosher.", en: "Origin cacao, kosher-certified." }, priceMXN: 50 },
      { slug: "mocha", name: "Mocha", description: { es: "Espresso, cacao y leche vaporizada.", en: "Espresso, cacao and steamed milk." }, priceMXN: 70 },
      { slug: "white-mocha", name: "White Mocha", description: { es: "Espresso, chocolate blanco y leche vaporizada.", en: "Espresso, white chocolate and steamed milk." }, priceMXN: 70 },
      { slug: "chai-latte", name: "Chai Latte", description: { es: "Té chai especiado con leche vaporizada.", en: "Spiced chai tea with steamed milk." }, priceMXN: 70 },
      { slug: "dirty-chai", name: "Dirty Chai", description: { es: "Chai latte con un shot de espresso.", en: "Chai latte with a shot of espresso." }, priceMXN: 70 },
      { slug: "organic-chasen-matcha", name: "Chasen Matcha", description: { es: "Matcha batido a mano con chasen.", en: "Matcha, hand-whisked with a chasen." }, priceMXN: 70 },
    ],
  },
  {
    slug: "sin-cafeina",
    title: { es: "Sin Cafeína", en: "Caffeine-Free" },
    accent: "green",
    intro: { es: "Toda la ceremonia, sin la cafeína.", en: "All the ritual, none of the caffeine." },
    items: [
      { slug: "chasen-hojicha-latte", name: "Chasen Hojicha Latte", description: { es: "Té hojicha tostado, batido a mano.", en: "Roasted hojicha tea, hand-whisked." }, priceMXN: 70, tags: ["caffeine-free"] },
      { slug: "leche-de-lavanda", name: "Leche de Lavanda", description: { es: "Leche vaporizada infusionada con lavanda.", en: "Steamed milk infused with lavender." }, priceMXN: 70, tags: ["caffeine-free"] },
      { slug: "leche-para-cookies", name: "Leche para Cookies", description: { es: "Leche a tu elección, fría, hecha para acompañar.", en: "Milk of your choice, cold, made for dunking." }, priceMXN: 35, tags: ["caffeine-free"] },
    ],
  },
  {
    slug: "tonics",
    title: { es: "Tónics", en: "Tonics" },
    accent: "purple",
    intro: { es: "Café y té sobre agua tónica, con hielo.", en: "Coffee and tea over tonic water, on ice." },
    items: [
      { slug: "espresso-tonic", name: "Espresso", description: { es: "Espresso doble sobre agua tónica.", en: "Double espresso over tonic water." }, priceMXN: 90 },
      { slug: "cold-brew-tonic", name: "Cold Brew", description: { es: "Cold brew de la casa sobre agua tónica.", en: "House cold brew over tonic water." }, priceMXN: 90 },
      { slug: "matcha-tonic", name: "Matcha", description: { es: "Matcha batido sobre agua tónica.", en: "Whisked matcha over tonic water." }, priceMXN: 90 },
      { slug: "chai-tonic", name: "Chai", description: { es: "Concentrado de chai sobre agua tónica.", en: "Chai concentrate over tonic water." }, priceMXN: 90 },
    ],
  },
  {
    slug: "focaccias",
    title: { es: "Focaccias", en: "Focaccias" },
    accent: "red",
    intro: {
      es: "Nuestra masa fermentada por más de 28hrs, con un intenso sabor a ajo con perejil.",
      en: "Our dough, fermented for over 28 hours, with an intense garlic-and-parsley flavor.",
    },
    items: [
      {
        slug: "carnica",
        name: "Cárnica",
        description: {
          es: "Labneh con mozzarella fundido, jamón serrano, duraznos rostizados, arúgula y miel picante.",
          en: "Labneh with melted mozzarella, serrano ham, roasted peaches, arugula and spicy honey.",
        },
        priceMXN: 180,
      },
      {
        slug: "vegana",
        name: "Vegana",
        description: {
          es: "Labneh de tofu, huitlacoche, cebolla encurtida y aceite trufado.",
          en: "Tofu labneh, huitlacoche, pickled onion and truffle oil.",
        },
        priceMXN: 180,
        tags: ["vegan"],
      },
      {
        slug: "melt-del-dia",
        name: "Melt del día",
        description: { es: "La receta cambia según la temporada — pregunta en barra.", en: "The recipe changes by season — ask at the counter." },
        priceMXN: 180,
      },
    ],
  },
  {
    slug: "cookie-packs",
    title: { es: "Cookie Packs", en: "Cookie Packs" },
    accent: "pink",
    intro: { es: "Para llevar la colección completa a donde vayas.", en: "Take the whole collection wherever you're going." },
    items: [
      { slug: "3-pack", name: "3-Pack", description: { es: "Tres cookies a elegir.", en: "Three cookies, your choice." }, priceMXN: 262, compareAtPriceMXN: 270, packSize: 3 },
      { slug: "5-pack", name: "5-Pack", description: { es: "La colección completa.", en: "The whole collection." }, priceMXN: 428, compareAtPriceMXN: 450, packSize: 5 },
      { slug: "10-pack", name: "10-Pack", description: { es: "Para compartir — o no.", en: "For sharing — or not." }, priceMXN: 810, compareAtPriceMXN: 900, packSize: 10 },
    ],
  },
];

export function getMenuSection(slug: string) {
  return menu.find((section) => section.slug === slug);
}
