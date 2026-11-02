const ORDER_MESSAGE: Record<"es" | "en", string> = {
  es: "Hola! Quiero hacer un pedido para pickup en d-stellar 🍪",
  en: "Hi! I'd like to place a pickup order at d-stellar 🍪",
};

// whatsappUrl viene de getSiteSettings() (lib/site-settings-db.ts) — es
// editable desde /admin/contenido/negocio, por eso ya no se lee de BUSINESS
// directo aquí.
export function whatsappOrderUrl(whatsappUrl: string, locale: "es" | "en" = "es") {
  const text = ORDER_MESSAGE[locale] ?? ORDER_MESSAGE.es;
  return `${whatsappUrl}?text=${encodeURIComponent(text)}`;
}
