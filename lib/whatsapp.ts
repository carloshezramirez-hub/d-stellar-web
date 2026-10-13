import { BUSINESS } from "@/data/site";

const ORDER_MESSAGE: Record<"es" | "en", string> = {
  es: "Hola! Quiero hacer un pedido para pickup en d-stellar 🍪",
  en: "Hi! I'd like to place a pickup order at d-stellar 🍪",
};

export function whatsappOrderUrl(locale: "es" | "en" = "es") {
  const text = ORDER_MESSAGE[locale] ?? ORDER_MESSAGE.es;
  return `${BUSINESS.whatsappUrl}?text=${encodeURIComponent(text)}`;
}
