import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { BUSINESS, SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn ? "About d-stellar — The Sweet Universe Company" : "Nosotros — The Sweet Universe Company",
    description: isEn
      ? "d-stellar is a queer-friendly cookie and cacao shop in Condesa, founded in 2024 by Hernán Castilla and Eduardo de Castilla."
      : "d-stellar es una cookie shop y cacao bar LGBTQ+ friendly en Condesa, fundada en 2024 por Hernán Castilla y Eduardo de Castilla.",
    alternates: {
      canonical: isEn ? "/en/about" : "/about",
      languages: { es: "/about", en: "/en/about", "x-default": "/about" },
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="px-5 py-16 md:py-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${locale === "en" ? "/en" : ""}/about` },
        ])}
      />

      <div className="mx-auto max-w-3xl">
        <p className="font-tag text-xs uppercase tracking-widest text-nova">{t("eyebrow")}</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-cream md:text-5xl">{t("title")}</h1>
        <p className="mt-6 text-xl leading-relaxed text-cream/85">{t("lead")}</p>

        {/* eslint-disable-next-line @next/next/no-img-element -- brand placeholder SVG, swap for real photography */}
        <img
          src="/images/about/story.svg"
          alt=""
          className="mt-10 aspect-[4/3] w-full rounded-3xl border border-line object-cover"
        />

        <div className="mt-10 space-y-5 text-lg leading-relaxed text-cream/75">
          {t.raw("body").map((paragraph: string, i: number) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <blockquote className="mt-12 border-l-2 border-nova pl-6 font-display text-2xl italic text-cream">
          “{t("quote")}”
        </blockquote>

        <p className="mt-10 font-tag text-xs uppercase tracking-widest text-cream/50">
          {BUSINESS.founders.join(" · ")} — {BUSINESS.foundedYear}
        </p>
      </div>
    </div>
  );
}
