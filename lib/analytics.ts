export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export type AnalyticsEvent =
  | "click_directions"
  | "click_menu"
  | "click_pickup"
  | "click_event"
  | "click_instagram"
  | "click_tiktok"
  | "click_phone"
  | "submit_pickup_order"
  | "language_switch";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: AnalyticsEvent, params?: Record<string, string | number>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}
