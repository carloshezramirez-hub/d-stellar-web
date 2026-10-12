import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HelpCircle } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return pageMetadata({
    locale: isEn ? "en" : "es",
    path: "/faq",
    title: isEn
      ? "FAQ — Hours, Location, Pickup & More"
      : "Preguntas frecuentes — Horario, ubicación, pickup y más",
    description: isEn
      ? "Answers about d-stellar's location, hours, menu rotation, pickup, parking and the LGBTQ+ safe space in Condesa, Mexico City."
      : "Respuestas sobre la ubicación, horario, menú rotativo, pickup, estacionamiento y el espacio LGBTQ+ safe space de d-stellar en Condesa, CDMX.",
  });
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const items = t.raw("items") as Array<{ q: string; a: string }>;

  return (
    <div className="px-5 py-16 md:py-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${locale === "en" ? "/en" : ""}/faq` },
        ])}
      />
      <JsonLd data={faqSchema(items)} />

      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <HelpCircle className="text-stellar-pink" size={22} />
          <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("eyebrow")}</p>
        </div>
        <h1 className="mt-4 break-words font-display text-4xl font-black uppercase leading-[0.9] text-stellar-white sm:text-5xl md:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-5 max-w-xl text-stellar-white/75">{t("intro")}</p>
      </div>

      <div className="mx-auto mt-14 max-w-3xl divide-y divide-line border-y border-line">
        {items.map((item) => (
          <div key={item.q} className="py-6">
            <h2 className="font-demi text-lg font-bold text-stellar-white">{item.q}</h2>
            <p className="mt-2 text-stellar-white/70">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
