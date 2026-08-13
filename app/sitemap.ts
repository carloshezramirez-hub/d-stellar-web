import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";
import { events } from "@/data/events";

const staticPaths = ["", "/menu", "/events", "/pickup", "/visit", "/private-events", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
    alternates: {
      languages: {
        es: `${SITE_URL}${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
  }));

  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${SITE_URL}/events/${event.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
    alternates: {
      languages: {
        es: `${SITE_URL}/events/${event.slug}`,
        en: `${SITE_URL}/en/events/${event.slug}`,
      },
    },
  }));

  return [...entries, ...eventEntries];
}
