"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { X, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { CtaLink } from "@/components/ui/cta-link";
import { trackEvent } from "@/lib/analytics";

const SHOWN_KEY = "dstellar-pickup-promo-shown";
const SHOW_DELAY_MS = 1200;

export function PickupPromoPopup() {
  const t = useTranslations("pickupPromo");
  const [open, setOpen] = useState(false);

  // Once per browser session (tab), not once ever: a sale prompt should
  // greet every fresh visit, but never re-trigger from client-side route
  // changes or scrolling within the same visit — sessionStorage is marked
  // the moment it's shown, not on dismiss, so it can't re-fire either way.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SHOWN_KEY)) return;
    const id = window.setTimeout(() => {
      window.sessionStorage.setItem(SHOWN_KEY, "1");
      setOpen(true);
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  const handleOpenChange = (next: boolean) => setOpen(next);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-stellar-black/80" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 border-2 border-line bg-stellar-black-soft focus:outline-none">
          <Dialog.Close className="absolute right-3 top-3 z-10 text-stellar-white/80 hover:text-stellar-pink">
            <X size={20} />
            <span className="sr-only">{t("dismiss")}</span>
          </Dialog.Close>

          <div className="grid grid-cols-2">
            <div className="relative aspect-[4/5]">
              <Image src="/images/products/cookie-display-lit.webp" alt="" fill sizes="220px" className="object-cover" />
            </div>
            <div className="relative aspect-[4/5]">
              <Image src="/images/products/cookie-display-bright.webp" alt="" fill sizes="220px" className="object-cover" />
            </div>
          </div>

          <div className="p-6 text-center">
            <Dialog.Title asChild>
              <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("eyebrow")}</p>
            </Dialog.Title>
            <p className="mt-2 font-display text-2xl font-black uppercase leading-[0.95] text-stellar-white">
              {t("title")}
            </p>
            <Dialog.Description className="mt-3 text-sm text-stellar-white/75">{t("body")}</Dialog.Description>

            <CtaLink
              href="/pickup"
              variant="solid"
              className="mt-6 w-full"
              onClick={() => {
                trackEvent("click_pickup", { source: "popup" });
                handleOpenChange(false);
              }}
            >
              {t("cta")} <ArrowUpRight size={14} />
            </CtaLink>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
