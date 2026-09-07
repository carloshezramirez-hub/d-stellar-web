"use client";

import { BUSINESS } from "@/data/site";
import { trackEvent } from "@/lib/analytics";

export function PhoneLink({ className }: { className?: string }) {
  return (
    <a href={`tel:${BUSINESS.phoneHref}`} onClick={() => trackEvent("click_phone")} className={className}>
      {BUSINESS.phone}
    </a>
  );
}
