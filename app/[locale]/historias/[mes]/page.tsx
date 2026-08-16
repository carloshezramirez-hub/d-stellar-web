import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CtaLink } from "@/components/ui/cta-link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { menuHistory, getMonthlyStory } from "@/data/menu-history";
import { SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string; mes: string }> };
type Locale = "es" | "en";

export function generateStaticParams() {
  return menuHistory.map((month) => ({ mes: month.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, mes } = await params;
  const month = getMonthlyStory(mes);
  if (!month) return {};
  const loc = locale as Locale;
  const path = `${locale === "en" ? "/en" : ""}/historias/${mes}`;

  return {
    title: `${month.title[loc]} · ${month.monthLabel[loc]}`,
    description: month.hook[loc],
    alternates: {
      canonical: path,
      languages: { es: `/historias/${mes}`, en: `/en/historias/${mes}`, "x-default": `/historias/${mes}` },
    },
    openGraph: {
      title: `${month.title[loc]} · ${month.monthLabel[loc]}`,
      description: month.hook[loc],
      images: [{ url: month.heroImage }],
      type: "article",
    },
  };
}

export default async function HistoriaDetailPage({ params }: Props) {
  const { locale, mes } = await params;
  setRequestLocale(locale);
  const month = getMonthlyStory(mes);
  if (!month) notFound();

  const loc = locale as Locale;
  const t = await getTranslations("historias");
  const cta = await getTranslations("cta");

  const index = menuHistory.findIndex((m) => m.slug === mes);
  // menuHistory is newest-first, but chapters read chronologically forward
  // (Capítulo 01 → 08), so "next chapter" means a lower array index.
  const next = menuHistory[index - 1];
  const prev = menuHistory[index + 1];

  return (
    <div className="px-5 py-16 md:py-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${locale === "en" ? "/en" : ""}/historias` },
          { name: month.title[loc], url: `${SITE_URL}${locale === "en" ? "/en" : ""}/historias/${mes}` },
        ])}
      />

      <div className="mx-auto max-w-3xl">
        <Link
          href="/historias"
          className="inline-flex items-center gap-2 font-tag text-xs uppercase tracking-widest text-stellar-white/60 hover:text-stellar-pink"
        >
          <ArrowLeft size={14} /> {t("backToHistorias")}
        </Link>

        <div className="relative mt-6 aspect-[4/3] overflow-hidden border-2 border-line bg-stellar-black-soft sm:aspect-[16/9]">
          <Image
            src={month.heroImage}
            alt={month.heroAlt[loc]}
            fill
            sizes="(min-width: 768px) 700px, 100vw"
            className="object-cover"
            priority
          />
        </div>

        <p className="mt-8 font-tag text-xs uppercase tracking-widest text-stellar-pink">
          {month.chapterNumber != null ? `${t("chapter", { n: month.chapterNumber })} · ` : ""}
          {month.monthLabel[loc]}
        </p>
        <h1 className="mt-3 font-display text-4xl font-black uppercase leading-[0.95] text-stellar-white md:text-6xl">
          {month.title[loc]}
        </h1>
        <p className="mt-2 font-tag text-xs uppercase tracking-widest text-stellar-white/40">
          {month.flavorNames.join(" / ")}
        </p>
        <p className="mt-5 text-xl leading-relaxed text-stellar-white/85">{month.hook[loc]}</p>
      </div>

      <div className="mx-auto mt-14 max-w-3xl">
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-blue">{month.sectionEyebrow[loc]}</p>
        <h2 className="mt-2 font-display text-2xl font-black uppercase text-stellar-white md:text-3xl">
          {month.sectionTitle[loc]}
        </h2>
        <div className="mt-5 space-y-4 text-stellar-white/80">
          {month.intro[loc].map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-3xl space-y-14">
        {month.cookies.map((cookie, i) => (
          <div key={cookie.number}>
            {month.gallery[i - 1] && (
              <div className="relative mb-10 aspect-[3/2] overflow-hidden border-2 border-line bg-stellar-black-soft">
                <Image
                  src={month.gallery[i - 1].src}
                  alt={month.gallery[i - 1].alt[loc]}
                  fill
                  sizes="700px"
                  className="object-cover"
                />
              </div>
            )}
            <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{cookie.number}</p>
            <h3 className="mt-1 font-display text-2xl font-black uppercase text-stellar-white md:text-3xl">
              {cookie.name}
            </h3>
            <p className="mt-2 font-demi text-base font-bold text-stellar-white/90">{cookie.tagline[loc]}</p>
            <div className="mt-4 space-y-3 text-stellar-white/75">
              {cookie.story[loc].map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-3xl border-t border-line pt-10">
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-green">{month.closingEyebrow[loc]}</p>
        <h2 className="mt-2 font-display text-2xl font-black uppercase text-stellar-white md:text-3xl">
          {month.closingTitle[loc]}
        </h2>
        <div className="mt-5 space-y-4 text-stellar-white/80">
          {month.closing[loc].map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <p className="mt-8 border-l-2 border-stellar-pink pl-5 font-demi text-lg font-bold italic text-stellar-white">
          {month.oneLiner[loc]}
        </p>
      </div>

      <div className="mx-auto mt-14 flex max-w-3xl flex-wrap gap-4">
        <CtaLink href="/menu" variant="solid">
          {cta("viewMenu")}
        </CtaLink>
        <CtaLink href="/historias" variant="outline">
          {t("backToHistorias")}
        </CtaLink>
      </div>

      {(prev || next) && (
        <div className="mx-auto mt-16 grid max-w-3xl gap-4 border-t border-line pt-10 sm:grid-cols-2">
          {prev && (
            <Link
              href={{ pathname: "/historias/[mes]", params: { mes: prev.slug } }}
              className="group flex flex-col gap-1 border-2 border-line p-5 transition-colors hover:border-stellar-pink"
            >
              <span className="flex items-center gap-1 font-tag text-[10px] uppercase tracking-widest text-stellar-white/50">
                <ArrowLeft size={12} /> {prev.monthLabel[loc]}
              </span>
              <span className="font-demi font-bold text-stellar-white group-hover:text-stellar-pink">
                {prev.title[loc]}
              </span>
            </Link>
          )}
          {next && (
            <Link
              href={{ pathname: "/historias/[mes]", params: { mes: next.slug } }}
              className="group flex flex-col gap-1 border-2 border-line p-5 text-right transition-colors hover:border-stellar-pink sm:col-start-2"
            >
              <span className="flex items-center justify-end gap-1 font-tag text-[10px] uppercase tracking-widest text-stellar-white/50">
                {next.monthLabel[loc]} <ArrowRight size={12} />
              </span>
              <span className="font-demi font-bold text-stellar-white group-hover:text-stellar-pink">
                {next.title[loc]}
              </span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
