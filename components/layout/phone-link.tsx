"use client";

import { useSiteSettings } from "@/components/site-settings-provider";
import { trackEvent } from "@/lib/analytics";

export function PhoneLink({ className }: { className?: string }) {
  const { phone, phoneHref } = useSiteSettings();
  return (
    <a href={`tel:${phoneHref}`} onClick={() => trackEvent("click_phone")} className={className}>
      {phone}
    </a>
  );
}
