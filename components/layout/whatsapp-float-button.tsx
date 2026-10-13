"use client";

import { useLocale, useTranslations } from "next-intl";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export function WhatsappFloatButton() {
  const locale = useLocale() as "es" | "en";
  const t = useTranslations("whatsappFloat");

  return (
    <a
      href={whatsappOrderUrl(locale)}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent("click_whatsapp", { source: "floating_button" })}
      aria-label={t("ariaLabel")}
      className="fixed right-4 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-stellar-green text-stellar-black shadow-lg transition-transform hover:scale-105 active:scale-95 md:bottom-8 md:right-8 md:h-16 md:w-16"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-7 w-7 md:h-8 md:w-8">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.91L2 22l5.25-1.38A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.13a8.1 8.1 0 0 1-4.14-1.14l-.3-.18-3.09.81.83-3.01-.2-.31A8.12 8.12 0 1 1 20.16 12a8.1 8.1 0 0 1-8.12 8.13Zm4.47-6.06c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.19-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.12-.12.27-.31.4-.47.13-.16.17-.27.26-.45.09-.18.04-.33-.04-.45-.08-.12-.49-1.18-.67-1.62-.18-.43-.36-.37-.5-.38-.13-.01-.28-.01-.43-.01-.15 0-.39.06-.6.3-.21.24-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.11.15 1.53 2.34 3.71 3.19 1.81.71 2.18.57 2.57.53.39-.04 1.43-.58 1.63-1.15.2-.57.2-1.05.14-1.15-.06-.1-.23-.16-.47-.28Z" />
      </svg>
    </a>
  );
}
