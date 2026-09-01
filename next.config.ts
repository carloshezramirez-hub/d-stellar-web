import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // /private-events was folded into a section on /events (2026-09-01) —
    // keep old links/bookmarks/search results working.
    return [
      { source: "/private-events", destination: "/events#private-events", permanent: true },
      { source: "/en/private-events", destination: "/en/events#private-events", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
