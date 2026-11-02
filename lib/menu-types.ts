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
  // Product photo for this item, shown as a thumbnail in the menu list.
  // Only set for items with a supplied photo — not every item needs one.
  image?: string;
};

export type MenuSection = {
  slug: string;
  title: { es: string; en: string };
  intro: { es: string; en: string };
  accent: "green" | "pink" | "blue" | "purple" | "red";
  items: MenuItem[];
};
