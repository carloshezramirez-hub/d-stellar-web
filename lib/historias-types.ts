export type CookieStory = {
  number: string;
  name: string;
  tagline: { es: string; en: string };
  story: { es: string[]; en: string[] };
  pullQuote?: { es: string; en: string };
};

export type GalleryImage = {
  src: string;
  alt: { es: string; en: string };
};

export type MonthlyStory = {
  slug: string;
  chapterNumber?: number;
  monthLabel: { es: string; en: string };
  title: { es: string; en: string };
  hook: { es: string; en: string };
  flavorNames: string[];
  sectionEyebrow: { es: string; en: string };
  sectionTitle: { es: string; en: string };
  intro: { es: string[]; en: string[] };
  cookies: CookieStory[];
  closingEyebrow: { es: string; en: string };
  closingTitle: { es: string; en: string };
  closing: { es: string[]; en: string[] };
  oneLiner: { es: string; en: string };
  heroImage: string;
  heroAlt: { es: string; en: string };
  gallery: GalleryImage[];
};
