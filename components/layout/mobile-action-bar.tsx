"use client";

import { useTranslations } from "next-intl";
import { MapPin, BookOpen, ShoppingBag, CalendarDays } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BUSINESS } from "@/data/site";
import { trackEvent } from "@/lib/analytics";

export function MobileActionBar() {
  const t = useTranslations("mobileBar");

  return (
    <nav
      aria-label={t("directions")}
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-line bg-ink/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <a
        href={BUSINESS.mapsUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent("click_directions")}
        className="flex flex-col items-center gap-1 py-2.5 text-cream/80 active:text-nova"
      >
        <MapPin size={20} />
        <span className="font-tag text-[10px] uppercase tracking-wide">{t("directions")}</span>
      </a>
      <Link
        href="/menu"
        onClick={() => trackEvent("click_menu")}
        className="flex flex-col items-center gap-1 py-2.5 text-cream/80 active:text-nova"
      >
        <BookOpen size={20} />
        <span className="font-tag text-[10px] uppercase tracking-wide">{t("menu")}</span>
      </Link>
      <Link
        href="/pickup"
        onClick={() => trackEvent("click_pickup")}
        className="flex flex-col items-center gap-1 py-2.5 text-cream/80 active:text-nova"
      >
        <ShoppingBag size={20} />
        <span className="font-tag text-[10px] uppercase tracking-wide">{t("pickup")}</span>
      </Link>
      <Link
        href="/events"
        className="flex flex-col items-center gap-1 py-2.5 text-cream/80 active:text-nova"
      >
        <CalendarDays size={20} />
        <span className="font-tag text-[10px] uppercase tracking-wide">{t("events")}</span>
      </Link>
    </nav>
  );
}
