import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/menu": { es: "/menu", en: "/menu" },
    "/events": { es: "/events", en: "/events" },
    "/events/[slug]": { es: "/events/[slug]", en: "/events/[slug]" },
    "/pickup": { es: "/pickup", en: "/pickup" },
    "/visit": { es: "/visit", en: "/visit" },
    "/private-events": { es: "/private-events", en: "/private-events" },
    "/about": { es: "/about", en: "/about" },
    "/press": { es: "/press", en: "/press" },
    "/historias": { es: "/historias", en: "/historias" },
    "/historias/[mes]": { es: "/historias/[mes]", en: "/historias/[mes]" },
  },
});

export type AppLocale = (typeof routing.locales)[number];
