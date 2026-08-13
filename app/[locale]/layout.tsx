import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope, Space_Mono } from "next/font/google";
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

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
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
        className={`${bricolage.variable} ${manrope.variable} ${spaceMono.variable} font-body antialiased`}
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
