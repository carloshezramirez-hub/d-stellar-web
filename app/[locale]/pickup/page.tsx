import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CtaAnchor, CtaLink } from "@/components/ui/cta-link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { PickupOrderForm } from "@/components/sections/pickup-order-form";
import { BUSINESS, SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn ? "Pickup — Order Ahead at Nuevo León 217" : "Pickup — Pide para recoger en Nuevo León 217",
    description: isEn
      ? "Order ahead for pickup at d-stellar, Nuevo León 217, Condesa. Pay in store when you arrive. No delivery."
      : "Pide con anticipación para recoger en d-stellar, Nuevo León 217, Condesa. Pagas al llegar. Sin delivery.",
    alternates: {
      canonical: isEn ? "/en/pickup" : "/pickup",
      languages: { es: "/pickup", en: "/en/pickup", "x-default": "/pickup" },
    },
  };
}

export default async function PickupPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pickup");
  const cta = await getTranslations("cta");

  return (
    <div className="px-5 py-16 md:py-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${locale === "en" ? "/en" : ""}/pickup` },
        ])}
      />

      <div className="mx-auto max-w-2xl text-center">
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("eyebrow")}</p>
        <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] text-stellar-white md:text-6xl">{t("title")}</h1>
        <p className="mt-5 text-stellar-white/75">{t("intro")}</p>
      </div>

      <div className="mx-auto mt-14 max-w-4xl">
        <ol className="grid gap-6 sm:grid-cols-3">
          {t.raw("steps").map((step: { title: string; body: string }, i: number) => (
            <li key={i} className="flex gap-4 sm:flex-col sm:gap-2">
              <span className="font-display text-2xl font-black text-stellar-pink">{i + 1}</span>
              <div>
                <p className="font-demi font-bold text-stellar-white">{step.title}</p>
                <p className="mt-1 text-sm text-stellar-white/65">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-auto mt-16 max-w-4xl border-2 border-line bg-stellar-black-soft p-6 md:p-10">
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-green">{t("order.eyebrow")}</p>
        <h2 className="mt-2 font-display text-3xl font-black uppercase text-stellar-white">{t("order.title")}</h2>
        <p className="mt-2 max-w-xl text-sm text-stellar-white/70">{t("order.intro")}</p>

        <div className="mt-10">
          <PickupOrderForm />
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-4xl text-center">
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/50">{t("altTitle")}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <CtaAnchor href={`tel:${BUSINESS.phoneHref}`} variant="outline">
            {cta("call")}
          </CtaAnchor>
          <CtaAnchor href={BUSINESS.social.instagram} target="_blank" rel="noreferrer" variant="outline">
            {cta("instagram")}
          </CtaAnchor>
          <CtaLink href="/menu" variant="ghost">
            {cta("viewMenu")}
          </CtaLink>
        </div>
      </div>
    </div>
  );
}
