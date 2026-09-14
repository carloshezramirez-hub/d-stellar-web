import type { Metadata } from "next";
import { SITE_URL } from "@/data/site";

type Locale = "es" | "en";

function localizedPath(path: string, locale: Locale) {
  if (locale === "en") return `/en${path}`;
  return path || "/";
}

export function absoluteUrl(path: string, locale: Locale) {
  return `${SITE_URL}${localizedPath(path, locale)}`;
}

/**
 * Every field here (siteName/locale/type/url) must be set on every page,
 * not just the ones that differ from the default — Next.js replaces the
 * whole `openGraph` object per route segment rather than deep-merging it,
 * so a page that only sets `openGraph.url` silently drops the site-wide
 * og:site_name/og:locale set in the root layout.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = "website",
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: localizedPath(path, locale),
      languages: {
        es: path || "/",
        en: `/en${path}`,
        "x-default": path || "/",
      },
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path, locale),
      siteName: "d-stellar",
      locale: locale === "en" ? "en_US" : "es_MX",
      type,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
