import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock } from "lucide-react";
import { CtaAnchor, CtaLink } from "@/components/ui/cta-link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { BUSINESS, SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn ? "Pickup — Order Ahead at Nuevo León 217" : "Pickup — Pide para recoger en Nuevo León 217",
    description: isEn
      ? "Pickup only at d-stellar, Nuevo León 217, Condesa. No delivery. Online ordering coming soon."
      : "Pickup en d-stellar, Nuevo León 217, Condesa. Sin delivery. Pedidos en línea, muy pronto.",
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
        <p className="font-tag text-xs uppercase tracking-widest text-nova">{t("eyebrow")}</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-cream md:text-5xl">{t("title")}</h1>
        <p className="mt-5 text-cream/75">{t("intro")}</p>
      </div>

      <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-dashed border-marigold/60 bg-ink-soft p-8 text-center">
        <p className="font-tag text-xs uppercase tracking-widest text-marigold">{t("statusTitle")}</p>
        <p className="mt-3 text-cream/80">{t("statusBody")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <CtaAnchor href={BUSINESS.social.instagram} target="_blank" rel="noreferrer" variant="solid">
            {cta("instagram")}
          </CtaAnchor>
          <CtaLink href="/menu" variant="outline">
            {cta("viewMenu")}
          </CtaLink>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-2xl">
        <p className="flex items-center justify-center gap-2 font-tag text-xs uppercase tracking-widest text-cream/60">
          <Clock size={14} /> {t("howTitle")}
        </p>
        <ol className="mt-8 space-y-6">
          {t.raw("steps").map((step: { title: string; body: string }, i: number) => (
            <li key={i} className="flex gap-4">
              <span className="font-display text-2xl font-bold text-nova">{i + 1}</span>
              <div>
                <p className="font-display text-lg font-bold text-cream">{step.title}</p>
                <p className="mt-1 text-sm text-cream/65">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
