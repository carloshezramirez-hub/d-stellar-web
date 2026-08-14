import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { Analytics } from "@/components/analytics";
import { JsonLd } from "@/components/json-ld";
import { localBusinessSchema, websiteSchema } from "@/lib/schema";
import { SITE_URL } from "@/data/site";
import "../globals.css";

// The real brand typefaces, self-hosted from the client's own licensed
// font files (Process Type Foundry / URW) — see fonts/ and
// PROJECT_NOTES.md → "Typography". Used for both huge display headlines
// and smaller subheads/nav/labels: it's a single Demi weight, not
// condensed, so it doesn't need Big Shoulders' signage-condensed
// substitute at small sizes the way the old fallback did.
const franklinGothic = localFont({
  src: "../../fonts/franklin-gothic-urw-demi.otf",
  variable: "--font-franklin-gothic",
  display: "swap",
  weight: "600",
});

// Variable font — ships Light through Bold as named instances, so a single
// import covers both the Light body copy and any heavier in-body emphasis.
const coordinates = localFont({
  src: "../../fonts/coordinates-variable.otf",
  variable: "--font-coordinates",
  display: "swap",
  weight: "300 700",
});

// IBM Plex Mono appears in d-stellar's own presentation deck as the
// working mono face for labels/prices — kept here for tags and prices.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const isEn = locale === "en";

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `d-stellar — ${isEn ? "Cookies, Drinks & Events in Condesa" : "Cookies, cacao y eventos en Condesa"}`, template: `%s · ${t("titleSuffix")}` },
    description: t("defaultDescription"),
    alternates: {
      canonical: isEn ? "/en" : "/",
      languages: {
        es: "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      siteName: "d-stellar",
      locale: isEn ? "en_US" : "es_MX",
      type: "website",
      url: isEn ? `${SITE_URL}/en` : SITE_URL,
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body
        className={`${franklinGothic.variable} ${coordinates.variable} ${plexMono.variable} font-body antialiased`}
      >
        <NextIntlClientProvider>
          <JsonLd data={websiteSchema()} />
          <JsonLd data={localBusinessSchema()} />
          <Header />
          <main className="pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileActionBar />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
