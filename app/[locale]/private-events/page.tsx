import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { PrivateEventForm } from "@/components/sections/private-event-form";
import { SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn ? "Private Events — Book d-stellar in Condesa" : "Eventos privados — Renta d-stellar en Condesa",
    description: isEn
      ? "Book d-stellar for private screenings, birthdays, brand activations and LGBTQ+ events in an intimate, limited-capacity Condesa space."
      : "Renta d-stellar para screenings privados, cumpleaños, activaciones de marca y eventos LGBTQ+ en un espacio íntimo y de cupo limitado en Condesa.",
    alternates: {
      canonical: isEn ? "/en/private-events" : "/private-events",
      languages: {
        es: "/private-events",
        en: "/en/private-events",
        "x-default": "/private-events",
      },
    },
  };
}

export default async function PrivateEventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privateEvents");

  return (
    <div className="px-5 py-16 md:py-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          {
            name: t("title"),
            url: `${SITE_URL}${locale === "en" ? "/en" : ""}/private-events`,
          },
        ])}
      />

      <div className="mx-auto max-w-3xl text-center">
        <p className="font-tag text-xs uppercase tracking-widest text-nova">{t("eyebrow")}</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-cream md:text-5xl">{t("title")}</h1>
        <p className="mt-5 text-cream/75">{t("intro")}</p>
      </div>

      <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-line bg-ink-soft p-8">
        <p className="font-tag text-xs uppercase tracking-widest text-marigold">{t("pitchTitle")}</p>
        <p className="mt-3 text-lg text-cream/85">{t("pitchBody")}</p>
      </div>

      <div className="mx-auto mt-14 max-w-3xl">
        <h2 className="font-display text-2xl font-bold text-cream">{t("useCasesTitle")}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {t.raw("useCases").map((item: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-cream/80">
              <span className="text-nova">★</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-16 max-w-3xl border-t border-line pt-14">
        <h2 className="font-display text-2xl font-bold text-cream">{t("formTitle")}</h2>
        <p className="mt-2 text-cream/70">{t("formBody")}</p>
        <div className="mt-8">
          <PrivateEventForm />
        </div>
      </div>
    </div>
  );
}
