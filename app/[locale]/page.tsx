import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { CtaLink, CtaAnchor } from "@/components/ui/cta-link";
import { StarField } from "@/components/ui/star-field";
import { menu } from "@/data/menu";
import { BUSINESS } from "@/data/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn
      ? "d-stellar — Cookies, Cacao & Events in Condesa, Mexico City"
      : "d-stellar — Cookies, cacao y eventos en Condesa, CDMX",
    alternates: { canonical: isEn ? "/en" : "/" },
  };
}

const cookieNames = menu[0].items.map((item) => item.name);

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const cta = await getTranslations("cta");

  return (
    <>
      <section className="relative overflow-hidden border-b border-line px-5 pb-20 pt-16 md:pb-28 md:pt-24">
        <StarField />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="font-tag text-xs uppercase tracking-[0.3em] text-nova">{t("eyebrow")}</p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] text-cream sm:text-5xl md:text-7xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-cream/75 md:text-lg">
            {t("heroSubtitle")}
          </p>
          <p className="star-rule mt-4 font-tag text-xs uppercase text-marigold">{t("heroTag")}</p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <CtaAnchor
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noreferrer"
              variant="solid"
            >
              {cta("directions")} <ArrowUpRight size={14} />
            </CtaAnchor>
            <CtaLink href="/menu" variant="outline">
              {cta("viewMenu")}
            </CtaLink>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-line bg-cream py-4">
        <div className="flex w-max animate-marquee gap-10 font-display text-2xl font-bold text-ink/90">
          {[...cookieNames, ...cookieNames].map((name, i) => (
            <span key={i} className="flex items-center gap-10">
              {name} <span className="text-nova">★</span>
            </span>
          ))}
        </div>
      </div>

      <section className="border-b border-line px-5 py-20">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <h2 className="font-display text-3xl font-bold leading-tight text-cream md:text-4xl">
            {t("introTitle")}
          </h2>
          <p className="text-base leading-relaxed text-cream/75 md:text-lg">{t("introBody")}</p>
        </div>
      </section>

      <section className="border-b border-line bg-cream px-5 py-20 text-ink">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="font-tag text-xs uppercase tracking-widest text-nova">{t("menuTeaserTitle")}</p>
            <p className="mt-4 text-lg leading-relaxed text-ink/80">{t("menuTeaserBody")}</p>
            <CtaLink href="/menu" variant="ghost" className="mt-6 px-0">
              {cta("viewMenu")} <ArrowUpRight size={14} />
            </CtaLink>
          </div>
          <div>
            <p className="font-tag text-xs uppercase tracking-widest text-cosmic">{t("eventsTeaserTitle")}</p>
            <p className="mt-4 text-lg leading-relaxed text-ink/80">{t("eventsTeaserBody")}</p>
            <CtaLink href="/events" variant="ghost" className="mt-6 px-0">
              {cta("seeEvents")} <ArrowUpRight size={14} />
            </CtaLink>
          </div>
        </div>
      </section>

      <section className="border-b border-line px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl font-bold text-cream md:text-3xl">{t("valuesTitle")}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {t.raw("values").map((value: { title: string; body: string }, i: number) => (
              <div key={i} className="rounded-2xl border border-line p-5">
                <p className="font-display text-lg font-bold text-nova">{value.title}</p>
                <p className="mt-2 text-sm text-cream/70">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 rounded-3xl border border-line bg-ink-soft p-8 md:flex-row md:items-center md:p-12">
          <div>
            <p className="font-tag text-xs uppercase tracking-widest text-marigold">{t("visitTeaserTitle")}</p>
            <p className="mt-3 max-w-md text-lg text-cream/80">{t("visitTeaserBody")}</p>
          </div>
          <CtaAnchor href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" variant="solid">
            {cta("openInMaps")} <ArrowUpRight size={14} />
          </CtaAnchor>
        </div>
      </section>
    </>
  );
}
