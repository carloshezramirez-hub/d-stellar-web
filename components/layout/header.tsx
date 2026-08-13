"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { trackEvent } from "@/lib/analytics";

const NAV_ITEMS = [
  { href: "/menu" as const, key: "menu" },
  { href: "/events" as const, key: "events" },
  { href: "/pickup" as const, key: "pickup" },
  { href: "/visit" as const, key: "visit" },
  { href: "/private-events" as const, key: "privateEvents" },
  { href: "/about" as const, key: "about" },
];

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const otherLocale = locale === "es" ? "en" : "es";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-stellar-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" onClick={() => setOpen(false)} aria-label="d-stellar">
          <Image
            src="/brand/logos/dstellar-wordmark-white.png"
            alt="d-stellar"
            width={140}
            height={29}
            priority
            className="h-6 w-auto sm:h-7"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="font-demi text-xs font-bold uppercase tracking-widest text-stellar-white/80 transition-colors hover:text-stellar-pink"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={pathname as never}
            locale={otherLocale}
            onClick={() => trackEvent("language_switch", { to: otherLocale })}
            className="font-tag text-xs uppercase tracking-widest text-stellar-white/60 transition-colors hover:text-stellar-pink"
          >
            {t("language")}
          </Link>
        </div>

        <button
          type="button"
          className="text-stellar-white md:hidden"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-line px-5 pb-6 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-3 font-demi text-2xl font-bold uppercase text-stellar-white"
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            href={pathname as never}
            locale={otherLocale}
            onClick={() => {
              trackEvent("language_switch", { to: otherLocale });
              setOpen(false);
            }}
            className="py-3 font-tag text-xs uppercase tracking-widest text-stellar-white/60"
          >
            {t("language")}
          </Link>
        </nav>
      )}
    </header>
  );
}
