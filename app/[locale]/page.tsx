import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight, Star } from "lucide-react";
import { CtaLink, CtaAnchor } from "@/components/ui/cta-link";
import { StarField } from "@/components/ui/star-field";
import { ReviewsCarousel } from "@/components/sections/reviews-carousel";
import { HeroCarousel } from "@/components/sections/hero-carousel";
import { menu, MENU_MONTH_LABEL } from "@/data/menu";
import { BUSINESS } from "@/data/site";
import { googleReviews, googleReviewStats } from "@/data/reviews";

type Props = { params: Promise<{ locale: string }> };
type Locale = "es" | "en";

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

const VALUE_ACCENTS = ["bg-stellar-green", "bg-stellar-pink", "bg-stellar-blue", "bg-stellar-purple"] as const;

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("home");
  const cta = await getTranslations("cta");
  const tPress = await getTranslations("press");

  return (
    <>
      {/* HERO — carousel: brand intro slide + this month's cookie lineup */}
      <section className="border-b border-line">
        <HeroCarousel
          slides={[
            <div
              key="brand"
              className="relative flex min-h-[560px] items-center overflow-hidden px-5 pb-16 pt-14 md:min-h-[620px] md:pb-24 md:pt-20"
            >
              <StarField />
              <div className="relative mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[1fr_auto] md:items-end md:gap-6">
                <div>
                  <p className="font-tag text-xs uppercase tracking-[0.35em] text-stellar-pink">{t("heroKicker")}</p>
                  <h1 className="mt-4 font-display text-[15vw] font-black uppercase leading-[0.85] tracking-tight text-stellar-white sm:text-7xl md:text-8xl lg:text-[7.5rem]">
                    {t("heroTitle")}
                  </h1>
                  <p className="mt-6 max-w-lg text-balance text-base text-stellar-white/75 md:text-lg">
                    {t("heroSubtitle")}
                  </p>
                  <p className="star-rule mt-4 font-tag text-xs uppercase text-stellar-green">{t("heroTag")}</p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <CtaAnchor href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" variant="solid">
                      {cta("directions")} <ArrowUpRight size={14} />
                    </CtaAnchor>
                    <CtaLink href="/menu" variant="outline">
                      {cta("viewMenu")}
                    </CtaLink>
                  </div>
                </div>

                <div className="relative hidden shrink-0 md:block">
                  <Image
                    src="/brand/illustrations/star-person-run-white.png"
                    alt=""
                    width={2956}
                    height={3053}
                    className="h-56 w-auto opacity-90 lg:h-72"
                    priority
                  />
                </div>
              </div>
            </div>,
            <div
              key="monthly"
              className="relative flex min-h-[560px] items-center overflow-hidden px-5 pb-16 pt-14 md:min-h-[620px] md:pb-24 md:pt-20"
            >
              <StarField />
              <div className="relative mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[1fr_auto] md:items-end md:gap-10">
                <div>
                  <p className="inline-block bg-stellar-white px-3 py-1 font-tag text-xs uppercase tracking-widest text-stellar-black">
                    {MENU_MONTH_LABEL[loc]}
                  </p>
                  <p className="mt-5 font-tag text-xs uppercase tracking-[0.35em] text-stellar-green">
                    {t("heroMonthlyKicker")}
                  </p>
                  <h2 className="mt-4 max-w-2xl font-display text-4xl font-black uppercase leading-[0.9] text-stellar-white sm:text-6xl md:text-7xl">
                    {t("heroMonthlyTitle")}
                  </h2>
                  <p className="mt-6 max-w-lg text-balance text-base text-stellar-white/75 md:text-lg">
                    {t("heroMonthlySubtitle")}
                  </p>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {cookieNames.map((name) => (
                      <li
                        key={name}
                        className="border-2 border-stellar-white/30 px-3 py-1 font-tag text-xs uppercase tracking-widest text-stellar-white/85"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <CtaLink href="/menu" variant="solid">
                      {cta("viewMenu")} <ArrowUpRight size={14} />
                    </CtaLink>
                  </div>
                </div>

                <div className="relative mx-auto aspect-[3/4] w-48 shrink-0 overflow-hidden border-2 border-line sm:w-56 md:mx-0 md:w-72 lg:w-80">
                  <Image
                    src="/images/products/cookie-display-lit.webp"
                    alt="Cookies del mes en su caja d-stellar"
                    fill
                    sizes="(min-width: 768px) 320px, 220px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>,
          ]}
        />
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-b border-line bg-stellar-white py-3">
        <div className="flex w-max animate-marquee items-center gap-8 font-display text-2xl font-bold uppercase text-stellar-black md:text-3xl">
          {[...cookieNames, ...cookieNames].map((name, i) => (
            <span key={i} className="flex items-center gap-8">
              {name}
              <Image src="/brand/icons/pixel-star.png" alt="" width={622} height={552} className="h-4 w-auto md:h-5" />
            </span>
          ))}
        </div>
      </div>

      {/* INTRO — editorial, asymmetric, photo overlap */}
      <section className="relative border-b border-line px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          <h2 className="font-display text-4xl font-black uppercase leading-[0.95] text-stellar-white md:text-6xl">
            {t("introTitle")}
          </h2>
          <div className="flex flex-col gap-8 sm:flex-row md:flex-col">
            <p className="flex-1 text-base leading-relaxed text-stellar-white/75 md:text-lg">{t("introBody")}</p>
            <div className="relative aspect-[4/5] w-full max-w-[220px] shrink-0 self-end overflow-hidden border-2 border-stellar-white/20 sm:max-w-[180px] md:max-w-[220px]">
              <Image
                src="/images/products/cookie-display-bright.webp"
                alt="Exhibición de cookies del mes en la barra de d-stellar"
                fill
                sizes="220px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS — real Google Maps quotes */}
      <section className="border-b border-line px-5 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <Star className="text-stellar-green" size={22} fill="currentColor" />
            <h2 className="font-display text-3xl font-black uppercase text-stellar-white md:text-4xl">
              {tPress("reviewsTitle")}
            </h2>
          </div>
          <p className="mt-3 max-w-xl text-stellar-white/70">{tPress("reviewsIntro")}</p>

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
                · {googleReviewStats.count} {tPress("reviewsCount")}
              </p>
            </div>
          )}

          {googleReviews.length > 0 ? (
            <ReviewsCarousel reviews={googleReviews} />
          ) : (
            <p className="mt-10 max-w-md text-sm text-stellar-white/60">{tPress("reviewsEmpty")}</p>
          )}

          <CtaAnchor href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" variant="outline" className="mt-8">
            {tPress("reviewsCta")} <ArrowUpRight size={14} />
          </CtaAnchor>
        </div>
      </section>

      {/* STATEMENT — stacked type + brand copy, official language */}
      <section className="border-b border-line bg-stellar-black px-5 py-20">
        <div className="mx-auto max-w-6xl md:grid md:grid-cols-[1.3fr_1fr] md:gap-16">
          <p className="font-display text-3xl font-black uppercase leading-[0.9] text-stellar-white sm:text-5xl md:text-6xl">
            {t("statementTitle")}
          </p>
          <p className="mt-8 max-w-md text-base leading-relaxed text-stellar-white/70 md:mt-0 md:self-center md:text-lg">
            {t("statementBody")}
          </p>
        </div>
      </section>

      {/* PHOTO STRIP — real, uneven crops */}
      <section className="border-b border-line px-5 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <div className="relative col-span-1 aspect-[3/4] overflow-hidden md:translate-y-6">
            <Image
              src="/images/location/storefront-door-1.webp"
              alt="Entrada de d-stellar en Pabellón Nuevo León, con bandera de la comunidad"
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative col-span-1 aspect-[3/4] overflow-hidden">
            <Image
              src="/images/location/interior-lounge.webp"
              alt="Interior de d-stellar, techo con efecto estrellado"
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative col-span-1 aspect-[3/4] overflow-hidden md:translate-y-10">
            <Image
              src="/images/products/cookie-display-lit.webp"
              alt="Cookies del mes exhibidas en la barra"
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative col-span-1 aspect-[3/4] overflow-hidden">
            <Image
              src="/images/location/patio.webp"
              alt="Patio exterior de d-stellar"
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* MENU + EVENTS TEASER — color blocks */}
      <section className="grid border-b border-line md:grid-cols-2">
        <div className="border-b border-line px-5 py-16 md:border-b-0 md:border-r md:px-10 md:py-20">
          <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("menuTeaserTitle")}</p>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-stellar-white/80">{t("menuTeaserBody")}</p>
          <CtaLink href="/menu" variant="ghost" className="mt-6 px-0">
            {cta("viewMenu")} <ArrowUpRight size={14} />
          </CtaLink>
        </div>
        <div className="px-5 py-16 md:px-10 md:py-20">
          <p className="font-tag text-xs uppercase tracking-widest text-stellar-blue">{t("eventsTeaserTitle")}</p>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-stellar-white/80">{t("eventsTeaserBody")}</p>
          <CtaLink href="/events" variant="ghost" className="mt-6 px-0">
            {cta("seeEvents")} <ArrowUpRight size={14} />
          </CtaLink>
        </div>
      </section>

      {/* VALUES */}
      <section className="border-b border-line px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-black uppercase text-stellar-white md:text-4xl">
            {t("valuesTitle")}
          </h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {t.raw("values").map((value: { title: string; body: string }, i: number) => (
              <div key={i} className={`${VALUE_ACCENTS[i % VALUE_ACCENTS.length]} p-5 text-stellar-black`}>
                <p className="font-demi text-lg font-bold">{value.title}</p>
                <p className="mt-2 text-sm text-stellar-black/80">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT TEASER — photo backdrop */}
      <section className="relative overflow-hidden px-5 py-24 md:py-32">
        <Image
          src="/images/location/facade-entrance.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top opacity-25"
        />
        <div className="absolute inset-0 bg-stellar-black/60" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="font-tag text-xs uppercase tracking-widest text-stellar-green">{t("visitTeaserTitle")}</p>
            <p className="mt-3 max-w-md font-display text-2xl font-bold uppercase leading-tight text-stellar-white md:text-3xl">
              {t("visitTeaserBody")}
            </p>
          </div>
          <CtaAnchor href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" variant="solid">
            {cta("openInMaps")} <ArrowUpRight size={14} />
          </CtaAnchor>
        </div>
      </section>
    </>
  );
}
