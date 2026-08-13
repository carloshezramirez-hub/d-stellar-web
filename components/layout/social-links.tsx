"use client";

import { BUSINESS } from "@/data/site";
import { trackEvent } from "@/lib/analytics";

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82c-1.05-.9-1.66-2.2-1.66-3.62h-3.13v13.9a3.14 3.14 0 1 1-2.22-3.01v-3.24a6.24 6.24 0 1 0 5.34 6.18V9.36a6.9 6.9 0 0 0 4.02 1.28V7.5a3.7 3.7 0 0 1-2.35-1.68z" />
    </svg>
  );
}

export function SocialLinks() {
  return (
    <div className="flex gap-4">
      <a
        href={BUSINESS.social.instagram}
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
        onClick={() => trackEvent("click_instagram")}
        className="text-cream/80 transition-colors hover:text-nova"
      >
        <InstagramIcon />
      </a>
      <a
        href={BUSINESS.social.tiktok}
        target="_blank"
        rel="noreferrer"
        aria-label="TikTok"
        onClick={() => trackEvent("click_tiktok")}
        className="text-cream/80 transition-colors hover:text-nova"
      >
        <TikTokIcon />
      </a>
    </div>
  );
}
