import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Star, ArrowUpRight, Newspaper } from "lucide-react";
import { CtaAnchor } from "@/components/ui/cta-link";
import { JsonLd } from "@/components/json-ld";
import { ReviewsCarousel } from "@/components/sections/reviews-carousel";
import { breadcrumbSchema } from "@/lib/schema";
import { press } from "@/data/press";
import { googleReviews, googleReviewStats } from "@/data/reviews";
import { BUSINESS, SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string }> };
type Locale = "es" | "en";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn ? "Press & Reviews" : "Hablan de nosotros",
    description: isEn
      ? "Press coverage of d-stellar and reviews from Google Maps — what the press and the Condesa community have to say."
      : "Cobertura de prensa de d-stellar y reseñas de Google Maps — lo que dicen la prensa y la comunidad de Condesa.",
    alternates: {
      canonical: isEn ? "/en/press" : "/press",
      languages: { es: "/press", en: "/en/press", "x-default": "/press" },
    },
  };
}

export default async function PressPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("press");

  return (
    <div>
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${locale === "en" ? "/en" : ""}/press` },
        ])}
      />

      <div className="px-5 pb-16 pt-16 md:pb-24 md:pt-24">
        <div className="mx-auto max-w-3xl">
          <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("eyebrow")}</p>
          <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] text-stellar-white md:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-stellar-white/85">{t("intro")}</p>
        </div>
      </div>

      {/* GOOGLE REVIEWS */}
      <section className="border-t border-line bg-stellar-black px-5 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <Star className="text-stellar-green" size={22} fill="currentColor" />
            <h2 className="font-display text-3xl font-black uppercase text-stellar-white md:text-4xl">
              {t("reviewsTitle")}
            </h2>
          </div>
          <p className="mt-3 max-w-xl text-stellar-white/70">{t("reviewsIntro")}</p>

          {googleReviews.length > 0 && (
            <div className="mt-6 flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-stellar-green">
                {Array.from({ length: Math.round(googleReviewStats.average) }).map((_, star) => (
                  <Star key={star} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/60">
                {new Intl.NumberFormat(loc === "en" ? "en-US" : "es-MX", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                }).format(googleReviewStats.average)}{" "}
                · {googleReviewStats.count} {t("reviewsCount")}
              </p>
            </div>
          )}

          {googleReviews.length > 0 ? (
            <ReviewsCarousel reviews={googleReviews} />
          ) : (
            <p className="mt-10 max-w-md text-sm text-stellar-white/60">{t("reviewsEmpty")}</p>
          )}

          <CtaAnchor
            href={BUSINESS.mapsUrl}
            target="_blank"
            rel="noreferrer"
            variant="outline"
            className="mt-8"
          >
            {t("reviewsCta")} <ArrowUpRight size={14} />
          </CtaAnchor>
        </div>
      </section>

      {/* IN THE MEDIA */}
      <section className="border-t border-line px-5 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <Newspaper className="text-stellar-pink" size={22} />
            <h2 className="font-display text-3xl font-black uppercase text-stellar-white md:text-4xl">
              {t("mediaTitle")}
            </h2>
          </div>
          <p className="mt-3 max-w-xl text-stellar-white/70">{t("mediaIntro")}</p>

          <ul className="mt-10 space-y-4">
            {press.map((mention) => (
              <li key={mention.url}>
                <a
                  href={mention.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col gap-2 border-2 border-line p-6 transition-colors hover:border-stellar-pink"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-tag text-xs uppercase tracking-widest text-stellar-pink">
                      {mention.outlet}
                    </span>
                    <span className="font-tag text-xs uppercase tracking-widest text-stellar-white/40">
                      {mention.dateLabel[loc]}
                    </span>
                  </div>
                  <p className="font-demi text-xl font-bold text-stellar-white group-hover:text-stellar-pink">
                    {mention.title}
                  </p>
                  <p className="text-sm leading-relaxed text-stellar-white/70">{mention.summary[loc]}</p>
                  <span className="mt-1 flex items-center gap-1 font-tag text-xs uppercase tracking-widest text-stellar-white/60 group-hover:text-stellar-pink">
                    {t("readMore")} <ArrowUpRight size={12} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
