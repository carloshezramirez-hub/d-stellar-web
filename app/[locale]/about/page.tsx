import type { Metadata } from "next";
import Image from "next/image";
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
      ? "d-stellar is a queer-friendly cookie shop in Condesa, founded in 2024 by Hernán Castilla and Eduardo Hernández."
      : "d-stellar es una cookie shop LGBTQ+ friendly en Condesa, fundada en 2024 por Hernán Castilla y Eduardo Hernández.",
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
    <div>
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${locale === "en" ? "/en" : ""}/about` },
        ])}
      />

      <div className="px-5 pb-16 pt-16 md:pb-24 md:pt-24">
        <div className="mx-auto max-w-3xl">
          <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("eyebrow")}</p>
          <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] text-stellar-white md:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-stellar-white/85">{t("lead")}</p>

          <div className="relative mt-10 aspect-[4/3] w-full overflow-hidden border-2 border-line">
            <Image
              src="/images/products/cookie-display-dark.webp"
              alt="Exhibición de cookies iluminada en la pared de d-stellar"
              fill
              sizes="(min-width: 768px) 700px, 100vw"
              className="object-cover"
            />
          </div>

          <div className="mt-10 space-y-5 text-lg leading-relaxed text-stellar-white/75">
            {t.raw("body").map((paragraph: string, i: number) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <blockquote className="mt-12 border-l-4 border-stellar-pink pl-6 font-display text-2xl font-bold uppercase italic text-stellar-white">
            {t("quote")}
          </blockquote>

          <p className="mt-10 font-tag text-xs uppercase tracking-widest text-stellar-white/50">
            {BUSINESS.founders.join(" · ")} — {BUSINESS.foundedYear}
          </p>
        </div>
      </div>

      <div className="border-t border-line bg-stellar-black px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="font-display text-3xl font-black uppercase leading-[0.95] text-stellar-white sm:text-5xl">
            {t("brandStatementTitle")}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-stellar-white/70 md:text-lg">
            {t("brandStatement")}
          </p>
        </div>
      </div>
    </div>
  );
}
