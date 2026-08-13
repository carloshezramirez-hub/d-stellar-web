import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight, Check } from "lucide-react";
import { CtaAnchor } from "@/components/ui/cta-link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { BUSINESS, SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Visit d-stellar — Nuevo León 217, Condesa, Mexico City"
      : "Visita d-stellar — Nuevo León 217, Condesa, CDMX",
    description: isEn
      ? "How to find d-stellar inside Pabellón Nuevo León: address, hours, walking directions from Parque México, parking and accessibility."
      : "Cómo llegar a d-stellar dentro del Pabellón Nuevo León: dirección, horario, cómo llegar caminando desde el Parque México, estacionamiento y accesibilidad.",
    alternates: {
      canonical: isEn ? "/en/visit" : "/visit",
      languages: { es: "/visit", en: "/en/visit", "x-default": "/visit" },
    },
  };
}

const images = [
  { src: "/images/visit/facade.svg", key: "facade" },
  { src: "/images/visit/entrance.svg", key: "entrance" },
  { src: "/images/visit/interior.svg", key: "interior" },
] as const;

export default async function VisitPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("visit");
  const cta = await getTranslations("cta");

  return (
    <div className="px-5 py-16 md:py-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${locale === "en" ? "/en" : ""}/visit` },
        ])}
      />

      <div className="mx-auto max-w-3xl text-center">
        <p className="font-tag text-xs uppercase tracking-widest text-nova">{t("eyebrow")}</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-cream md:text-5xl">{t("title")}</h1>
        <p className="mt-5 text-cream/75">{t("intro")}</p>
        <div className="mt-7">
          <CtaAnchor href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" variant="solid">
            {cta("openInMaps")} <ArrowUpRight size={14} />
          </CtaAnchor>
        </div>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
        {images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element -- brand placeholder SVG
          <img
            key={img.key}
            src={img.src}
            alt=""
            className="aspect-[4/3] w-full rounded-2xl border border-line object-cover"
          />
        ))}
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-tag text-xs uppercase tracking-widest text-nova">{t("addressTitle")}</h2>
          <p className="mt-3 text-lg text-cream">
            {BUSINESS.streetAddress}
            <br />
            {BUSINESS.neighborhood}
            <br />
            {BUSINESS.addressLocality}, {BUSINESS.postalCode}
          </p>

          <h2 className="mt-8 font-tag text-xs uppercase tracking-widest text-nova">{t("hoursTitle")}</h2>
          <p className="mt-3 text-lg text-cream">{t("hoursBody")}</p>
        </div>

        <div>
          <h2 className="font-tag text-xs uppercase tracking-widest text-cosmic">{t("findUsTitle")}</h2>
          <p className="mt-3 text-cream/80">{t("findUsBody")}</p>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-4xl">
        <h2 className="font-display text-2xl font-bold text-cream">{t("gettingHereTitle")}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {t.raw("gettingHere").map((item: { title: string; body: string }, i: number) => (
            <div key={i} className="rounded-2xl border border-line p-5">
              <p className="font-display font-bold text-cream">{item.title}</p>
              <p className="mt-2 text-sm text-cream/65">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-4xl">
        <h2 className="font-display text-2xl font-bold text-cream">{t("amenitiesTitle")}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {t.raw("amenities").map((item: string, i: number) => (
            <li key={i} className="flex items-center gap-2 text-cream/80">
              <Check size={16} className="text-nova" /> {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-3xl border border-line">
        <iframe
          title="d-stellar map"
          src="https://www.google.com/maps?q=Av.+Nuevo+Le%C3%B3n+217,+Hip%C3%B3dromo,+Cuauht%C3%A9moc,+06100+Ciudad+de+M%C3%A9xico&output=embed"
          className="h-80 w-full grayscale invert-[0.92]"
          loading="lazy"
        />
      </div>
    </div>
  );
}
