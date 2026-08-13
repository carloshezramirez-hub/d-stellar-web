export type MenuItem = {
  slug: string;
  name: string;
  description: { es: string; en: string };
  priceMXN: number;
  tags?: Array<"vegan" | "caffeine-free" | "seasonal" | "signature">;
};

export type MenuSection = {
  slug: string;
  title: { es: string; en: string };
  intro: { es: string; en: string };
  accent: "green" | "pink" | "blue" | "purple" | "red";
  items: MenuItem[];
};

// Verified against the menu board photographed in-store, August. To update
// the monthly cookie rotation: edit the `cookies` section (names, descriptions,
// prices) and `MENU_MONTH_LABEL` below — everything else tends to hold steady
// month to month. See PROJECT_NOTES.md → "Cómo actualizar el menú".
export const MENU_MONTH_LABEL = { es: "Menú de agosto", en: "August menu" };

export const menu: MenuSection[] = [
  {
    slug: "gourmet-cookies",
    title: { es: "Gourmet Cookies", en: "Gourmet Cookies" },
    accent: "green",
    intro: {
      es: "El cast del mes. Cinco cookies horneadas en tandas cortas — cuando se acaban, se acaban.",
      en: "This month's cast. Five cookies baked in short batches — when they're gone, they're gone.",
    },
    items: [
      {
        slug: "nube-ambar",
        name: "Nube Ámbar",
        description: {
          es: "Cookie de vainilla con corazón de pera rostizada, crema sedosa de mascarpone y tierra crujiente de cacao y café.",
          en: "Vanilla cookie with a roasted-pear center, silky mascarpone cream and a crunchy cacao-coffee crumble.",
        },
        priceMXN: 90,
        tags: ["signature"],
      },
      {
        slug: "bruma-zarza",
        name: "Bruma Zarza",
        description: {
          es: "Cookie vegana con confit de zarzamora y crema de frutos rojos.",
          en: "Vegan cookie with blackberry confit and red berry cream.",
        },
        priceMXN: 90,
        tags: ["vegan"],
      },
      {
        slug: "aurora-rosada",
        name: "Aurora Rosada",
        description: {
          es: "Cookie de limón amarillo con crema ligera de vainilla y compota de tuna rosa.",
          en: "Yellow lemon cookie with light vanilla cream and pink prickly-pear compote.",
        },
        priceMXN: 90,
      },
      {
        slug: "eclipse-rubi",
        name: "Eclipse Rubí",
        description: {
          es: "Cookie de cacao intenso con crujiente oculto, ganache montada de chocolate y un centro ácido de granada.",
          en: "Intense cacao cookie with a hidden crunch, whipped chocolate ganache and a tart pomegranate center.",
        },
        priceMXN: 90,
        tags: ["signature"],
      },
      {
        slug: "ultima-de-verano",
        name: "Última de Verano",
        description: {
          es: "Cookie de hojicha con crocante de arroz tostado, mango ácido y ganache aireada de chocolate blanco tostado.",
          en: "Hojicha cookie with toasted rice crunch, tart mango and airy toasted white chocolate ganache.",
        },
        priceMXN: 90,
        tags: ["seasonal"],
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
        slug: "cielo-ambar",
        name: "Cielo Ámbar",
        description: { es: "Pera fresca y burbujeante con un doble espresso.", en: "Fresh, bubbly pear with a double espresso." },
        priceMXN: 90,
      },
      {
        slug: "gota-amatista",
        name: "Gota Amatista",
        description: { es: "Soda de zarzamora y limón coronada con cold foam.", en: "Blackberry-lime soda topped with cold foam." },
        priceMXN: 90,
      },
      {
        slug: "agua-de-cuarzo",
        name: "Agua de Cuarzo",
        description: { es: "Soda de tuna rosa y limón con cold foam.", en: "Pink prickly-pear and lime soda with cold foam." },
        priceMXN: 90,
      },
      {
        slug: "bergamota-rubi",
        name: "Bergamota Rubí",
        description: { es: "Soda de granada y Earl Grey, agua mineral y bergamota.", en: "Pomegranate and Earl Grey soda, mineral water and bergamot." },
        priceMXN: 90,
      },
      {
        slug: "ultimo-atardecer",
        name: "Último Atardecer",
        description: { es: "Mango y azahar burbujeantes con un shot de hojicha.", en: "Bubbly mango and orange blossom with a shot of hojicha." },
        priceMXN: 90,
      },
    ],
  },
  {
    slug: "cafeina",
    title: { es: "Cafeína", en: "Caffeine" },
    accent: "blue",
    intro: { es: "Los clásicos, hechos como se debe.", en: "The classics, done right." },
    items: [
      { slug: "americano", name: "Americano", description: { es: "Espresso alargado con agua caliente.", en: "Espresso lengthened with hot water." }, priceMXN: 60 },
      { slug: "capuccino", name: "Capuccino", description: { es: "Espresso, leche vaporizada y espuma densa.", en: "Espresso, steamed milk and dense foam." }, priceMXN: 70 },
      { slug: "latte", name: "Latte", description: { es: "Espresso con leche vaporizada.", en: "Espresso with steamed milk." }, priceMXN: 70 },
      { slug: "cacao-kosher", name: "Cacao Kosher", description: { es: "Cacao de origen, certificado kosher.", en: "Origin cacao, kosher-certified." }, priceMXN: 70 },
      { slug: "mocha", name: "Mocha", description: { es: "Espresso, cacao y leche vaporizada.", en: "Espresso, cacao and steamed milk." }, priceMXN: 90 },
      { slug: "white-mocha", name: "White Mocha", description: { es: "Espresso, chocolate blanco y leche vaporizada.", en: "Espresso, white chocolate and steamed milk." }, priceMXN: 90 },
      { slug: "chai-latte", name: "Chai Latte", description: { es: "Té chai especiado con leche vaporizada.", en: "Spiced chai tea with steamed milk." }, priceMXN: 90 },
      { slug: "dirty-chai", name: "Dirty Chai", description: { es: "Chai latte con un shot de espresso.", en: "Chai latte with a shot of espresso." }, priceMXN: 90 },
      { slug: "organic-chasen-matcha", name: "Organic Chasen Matcha", description: { es: "Matcha orgánico batido a mano con chasen.", en: "Organic matcha, hand-whisked with a chasen." }, priceMXN: 90 },
    ],
  },
  {
    slug: "sin-cafeina",
    title: { es: "Sin Cafeína", en: "Caffeine-Free" },
    accent: "green",
    intro: { es: "Toda la ceremonia, sin la cafeína.", en: "All the ritual, none of the caffeine." },
    items: [
      { slug: "chasen-hojicha-latte", name: "Chasen Hojicha Latte", description: { es: "Té hojicha tostado, batido a mano.", en: "Roasted hojicha tea, hand-whisked." }, priceMXN: 90, tags: ["caffeine-free"] },
      { slug: "taro-latte", name: "Taro Latte", description: { es: "Taro cremoso con leche vaporizada.", en: "Creamy taro with steamed milk." }, priceMXN: 90, tags: ["caffeine-free"] },
      { slug: "leche-de-lavanda", name: "Leche de Lavanda", description: { es: "Leche vaporizada infusionada con lavanda.", en: "Steamed milk infused with lavender." }, priceMXN: 80, tags: ["caffeine-free"] },
      { slug: "leche-para-cookies", name: "Leche para Cookies", description: { es: "Leche entera fría, hecha para acompañar.", en: "Cold whole milk, made for dunking." }, priceMXN: 60, tags: ["caffeine-free"] },
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
      es: "Nuestro pan de masa madre, dorado y prensado al momento. Pregunta por el melt de hoy.",
      en: "Our sourdough, pressed and browned to order. Ask about today's melt.",
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
      { slug: "3-pack", name: "3-Pack", description: { es: "Tres cookies a elegir.", en: "Three cookies, your choice." }, priceMXN: 262 },
      { slug: "5-pack", name: "5-Pack", description: { es: "La colección casi completa.", en: "Nearly the whole collection." }, priceMXN: 428 },
      { slug: "10-pack", name: "10-Pack", description: { es: "Para compartir — o no.", en: "For sharing — or not." }, priceMXN: 810 },
    ],
  },
];

export function getMenuSection(slug: string) {
  return menu.find((section) => section.slug === slug);
}
