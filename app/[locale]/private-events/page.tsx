import type { Metadata } from "next";
import Image from "next/image";
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
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("eyebrow")}</p>
        <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] text-stellar-white md:text-6xl">{t("title")}</h1>
        <p className="mt-5 text-stellar-white/75">{t("intro")}</p>
      </div>

      <div className="mx-auto mt-14 max-w-3xl border-2 border-line bg-stellar-black-soft p-8">
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-green">{t("pitchTitle")}</p>
        <p className="mt-3 text-lg text-stellar-white/85">{t("pitchBody")}</p>
      </div>

      <div className="mx-auto mt-14 max-w-3xl">
        <h2 className="font-display text-2xl font-black uppercase text-stellar-white">{t("useCasesTitle")}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {t.raw("useCases").map((item: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-stellar-white/80">
              <Image src="/brand/icons/pixel-star.png" alt="" width={622} height={552} className="mt-0.5 h-3.5 w-auto shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-16 max-w-3xl border-t border-line pt-14">
        <h2 className="font-display text-2xl font-black uppercase text-stellar-white">{t("formTitle")}</h2>
        <p className="mt-2 text-stellar-white/70">{t("formBody")}</p>
        <div className="mt-8">
          <PrivateEventForm />
        </div>
      </div>
    </div>
  );
}
