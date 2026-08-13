import type { Metadata } from "next";
import { Big_Shoulders, Archivo, Inter, IBM_Plex_Mono } from "next/font/google";
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

// Franklin Gothic URW Demi is the official display face (Adobe Fonts —
// no kit configured in this project). Big Shoulders is Google's closest
// open equivalent: a condensed American-gothic display face built for the
// exact same signage/editorial register (Chicago flag / Franklin Gothic
// lineage).
const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-big-shoulders",
  display: "swap",
});

// Standing in for Franklin Gothic URW Demi at non-condensed sizes
// (subheads, labels, nav) where the condensed face reads too tight.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

// Coordinates Variable Regular is the official body face (Adobe Fonts —
// same licensing gap as above). Inter is the fallback for long-form,
// highly legible copy.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
        className={`${bigShoulders.variable} ${archivo.variable} ${inter.variable} ${plexMono.variable} font-body antialiased`}
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
