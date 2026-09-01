import type { Metadata } from "next";
import Image from "next/image";
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

const STEP_IMAGES = [
  { src: "/images/location/facade-entrance.webp", alt: "Fachada del Pabellón Nuevo León sobre Av. Nuevo León" },
  { src: "/images/location/storefront-door-2.webp", alt: "Puerta de d-stellar con la bandera de la comunidad" },
  { src: "/images/location/interior-counter.webp", alt: "Interior de d-stellar, barra y counter" },
] as const;

export default async function VisitPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("visit");
  const cta = await getTranslations("cta");
  const steps = t.raw("steps") as Array<{ title: string; body: string }>;

  return (
    <div className="px-5 py-16 md:py-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${locale === "en" ? "/en" : ""}/visit` },
        ])}
      />

      <div className="mx-auto max-w-3xl">
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("eyebrow")}</p>
        <h1 className="mt-4 break-words font-display text-4xl font-black uppercase leading-[0.9] text-stellar-white sm:text-5xl md:text-7xl">
          {t("title")}
        </h1>
        <p className="mt-5 max-w-xl text-stellar-white/75">{t("intro")}</p>
        <div className="mt-7">
          <CtaAnchor href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" variant="solid">
            {cta("openInMaps")} <ArrowUpRight size={14} />
          </CtaAnchor>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <h2 className="font-display text-2xl font-black uppercase text-stellar-white">{t("stepsTitle")}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i}>
              <div className="relative aspect-[3/4] overflow-hidden border-2 border-line">
                <Image
                  src={STEP_IMAGES[i].src}
                  alt={STEP_IMAGES[i].alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 font-demi font-bold text-stellar-white">{step.title}</p>
              <p className="mt-1 text-sm text-stellar-white/65">{step.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-2xl">
        <h2 className="font-display text-2xl font-black uppercase text-stellar-white">{t("videoTitle")}</h2>
        <p className="mt-2 text-sm text-stellar-white/65">{t("videoBody")}</p>
        <div className="relative mx-auto mt-6 aspect-[9/16] max-w-xs overflow-hidden border-2 border-line">
          <video
            src="/videos/como-llegar.mp4"
            poster="/images/location/como-llegar-poster.webp"
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          >
            <track kind="captions" />
          </video>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("addressTitle")}</h2>
          <p className="mt-3 text-lg text-stellar-white">
            {BUSINESS.streetAddress}
            <br />
            {BUSINESS.neighborhood}
            <br />
            {BUSINESS.addressLocality}, {BUSINESS.postalCode}
          </p>

          <h2 className="mt-8 font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("hoursTitle")}</h2>
          <div className="mt-3 space-y-1">
            {t.raw("hoursBody").map((line: string, i: number) => (
              <p key={i} className="text-lg text-stellar-white">
                {line}
              </p>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-tag text-xs uppercase tracking-widest text-stellar-blue">{t("gettingHereTitle")}</h2>
          <div className="mt-4 space-y-4">
            {t.raw("gettingHere").map(
              (item: { title: string; body: string; link?: { label: string; url: string } }, i: number) => (
                <div key={i}>
                  <p className="font-demi font-bold text-stellar-white">{item.title}</p>
                  <p className="text-sm text-stellar-white/65">{item.body}</p>
                  {item.link && (
                    <a
                      href={item.link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-stellar-pink underline decoration-2 underline-offset-4 hover:text-stellar-white"
                    >
                      {item.link.label} <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <h2 className="font-display text-2xl font-black uppercase text-stellar-white">{t("amenitiesTitle")}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {t.raw("amenities").map((item: string, i: number) => (
            <li key={i} className="flex items-center gap-2 text-stellar-white/80">
              <Check size={16} className="text-stellar-green" /> {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-16 max-w-5xl overflow-hidden border-2 border-line">
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
