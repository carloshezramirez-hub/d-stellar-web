"use client";

import { createContext, useContext } from "react";
import { SITE_SETTINGS_FALLBACK, type SiteSettings } from "@/lib/site-settings-types";

const SiteSettingsContext = createContext<SiteSettings>(SITE_SETTINGS_FALLBACK);

/** Fetched once en el layout (`getSiteSettings()`) y repartido a los
 * client components que necesitan teléfono/WhatsApp/redes — evita que
 * cada uno tenga que volver a pedirlo. */
export function SiteSettingsProvider({ value, children }: { value: SiteSettings; children: React.ReactNode }) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}
