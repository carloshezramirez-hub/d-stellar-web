import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  // Disabled: the default (true) 307-redirects "/" to "/en" for any visitor
  // whose browser sends an English Accept-Language header — including
  // crawlers and PageSpeed/Lighthouse runs that default to en-US. That
  // silently served Googlebot a different canonical page than the one the
  // sitemap/hreflang declare, which is the likely cause of "/en" posting far
  // higher Search Console impressions than "/" despite es being the real
  // default for a CDMX business. Explicit "/en" links still work normally;
  // only the automatic header-based redirect is turned off.
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/menu": { es: "/menu", en: "/menu" },
    "/events": { es: "/events", en: "/events" },
    "/events/[slug]": { es: "/events/[slug]", en: "/events/[slug]" },
    "/pickup": { es: "/pickup", en: "/pickup" },
    "/visit": { es: "/visit", en: "/visit" },
    "/about": { es: "/about", en: "/about" },
    "/press": { es: "/press", en: "/press" },
    "/faq": { es: "/faq", en: "/faq" },
    "/historias": { es: "/historias", en: "/historias" },
    "/historias/[mes]": { es: "/historias/[mes]", en: "/historias/[mes]" },
  },
});

export type AppLocale = (typeof routing.locales)[number];
