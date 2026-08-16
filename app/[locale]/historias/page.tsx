import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CtaLink } from "@/components/ui/cta-link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { menuHistory } from "@/data/menu-history";
import { SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string }> };
type Locale = "es" | "en";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn ? "Menu Stories — The Story Behind Every Month" : "Historias del Menú — La historia detrás de cada mes",
    description: isEn
      ? "The real story behind every monthly cookie collection at d-stellar, since day one — the ideas, the people, and the flavors behind each menu."
      : "La historia real detrás de cada colección mensual de cookies de d-stellar, desde el primer día — las ideas, las personas y los sabores detrás de cada menú.",
    alternates: {
      canonical: isEn ? "/en/historias" : "/historias",
      languages: { es: "/historias", en: "/en/historias", "x-default": "/historias" },
    },
  };
}

export default async function HistoriasPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("historias");

  return (
    <div>
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${locale === "en" ? "/en" : ""}/historias` },
        ])}
      />

      <div className="px-5 pb-16 pt-16 md:pb-24 md:pt-24">
        <div className="mx-auto max-w-3xl">
          <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("eyebrow")}</p>
          <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] text-stellar-white md:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-stellar-white/85">{t("intro")}</p>
          <CtaLink href="/menu" variant="solid" className="mt-6">
            {t("viewMenu")} <ArrowUpRight size={14} />
          </CtaLink>
        </div>
      </div>

      <div className="border-t border-line px-5 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <ul className="grid gap-10 sm:grid-cols-2">
            {menuHistory.map((month, i) => (
              <li key={month.slug} className={i === 0 ? "sm:col-span-2" : ""}>
                <Link
                  href={{ pathname: "/historias/[mes]", params: { mes: month.slug } }}
                  className={`group flex flex-col gap-5 border-2 border-line p-2 transition-colors hover:border-stellar-pink ${
                    i === 0 ? "sm:flex-row sm:items-stretch" : ""
                  }`}
                >
                  <div
                    className={`relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-stellar-black-soft ${
                      i === 0 ? "sm:w-[45%]" : ""
                    }`}
                  >
                    <Image
                      src={month.heroImage}
                      alt={month.heroAlt[loc]}
                      fill
                      sizes={i === 0 ? "(min-width: 640px) 45vw, 100vw" : "(min-width: 640px) 45vw, 100vw"}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-2 p-4 pt-0 sm:p-4">
                    <p className="font-tag text-[11px] uppercase tracking-widest text-stellar-white/40">
                      {month.chapterNumber != null ? `${t("chapter", { n: month.chapterNumber })} · ` : ""}
                      {month.monthLabel[loc]}
                    </p>
                    <h2
                      className={`font-display font-black uppercase leading-[0.95] text-stellar-white group-hover:text-stellar-pink ${
                        i === 0 ? "text-3xl md:text-4xl" : "text-2xl"
                      }`}
                    >
                      {month.title[loc]}
                    </h2>
                    <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/50">
                      {month.flavorNames.join(" / ")}
                    </p>
                    <p className="text-sm leading-relaxed text-stellar-white/70">{month.hook[loc]}</p>
                    <span className="mt-1 flex items-center gap-1 font-tag text-xs uppercase tracking-widest text-stellar-white/60 group-hover:text-stellar-pink">
                      {t("readStory")} <ArrowUpRight size={12} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
