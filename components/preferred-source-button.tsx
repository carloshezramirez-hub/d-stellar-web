"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

// Google's officially documented "advanced" integration for Preferred
// Sources: https://developers.google.com/search/docs/appearance/preferred-sources
// We use the manual-control mode (`preferred-sources-control="manual"`)
// instead of the auto-rendered `google-add-preferred-source-btn` div so the
// button can match the site's own CTA styling rather than Google's default
// light/dark widget look.
const PUBLISHER_SCRIPT_SRC = "https://news.google.com/swg/js/v1/publisher.js";

type PreferredSourceApi = {
  init: (options: { theme?: "light" | "dark"; lang?: string }) => void;
  addPreferredSource: () => void;
};

declare global {
  interface Window {
    PREFERRED_SOURCE?: Array<(api: PreferredSourceApi) => void>;
  }
}

export function PreferredSourceButton({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("cta");
  const apiRef = useRef<PreferredSourceApi | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    window.PREFERRED_SOURCE = window.PREFERRED_SOURCE || [];
    window.PREFERRED_SOURCE.push((api) => {
      api.init({ theme: "dark", lang: locale });
      apiRef.current = api;
      setReady(true);
    });
  }, [locale]);

  return (
    <>
      <Script
        id="google-preferred-source-publisher"
        src={PUBLISHER_SCRIPT_SRC}
        strategy="lazyOnload"
        {...{ "preferred-sources-control": "manual" }}
      />
      <button
        type="button"
        disabled={!ready}
        onClick={() => {
          trackEvent("click_preferred_source");
          apiRef.current?.addPreferredSource();
        }}
        aria-label={t("preferredSourceAriaLabel")}
        className={cn(
          "inline-flex items-center gap-1.5 font-tag text-xs uppercase tracking-widest text-stellar-white/70 transition-colors hover:text-stellar-pink disabled:cursor-default disabled:opacity-40 disabled:hover:text-stellar-white/70",
          className
        )}
      >
        <Star size={14} aria-hidden="true" />
        {t("preferredSource")}
      </button>
    </>
  );
}
