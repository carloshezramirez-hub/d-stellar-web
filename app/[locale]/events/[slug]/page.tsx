import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, MapPin, Users, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CtaAnchor, CtaLink } from "@/components/ui/cta-link";
import { JsonLd } from "@/components/json-ld";
import { eventSchema, breadcrumbSchema } from "@/lib/schema";
import { events, getEvent } from "@/data/events";
import { BUSINESS, SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string; slug: string }> };
type Locale = "es" | "en";

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  const loc = locale as Locale;
  const path = `${locale === "en" ? "/en" : ""}/events/${slug}`;

  return {
    title: event.title,
    description: event.summary[loc],
    alternates: {
      canonical: path,
      languages: { es: `/events/${slug}`, en: `/en/events/${slug}`, "x-default": `/events/${slug}` },
    },
    openGraph: {
      title: event.title,
      description: event.summary[loc],
      images: [{ url: event.coverImage }],
      type: "article",
    },
  };
}

function googleCalendarUrl(event: NonNullable<ReturnType<typeof getEvent>>) {
  const start = new Date(event.dateISO).toISOString().replace(/[-:]|\.\d{3}/g, "");
  const end = new Date(event.endISO ?? event.dateISO).toISOString().replace(/[-:]|\.\d{3}/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    location: `${BUSINESS.streetAddress}, ${BUSINESS.addressLocality}, ${BUSINESS.addressRegion}`,
    details: event.summary.es,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function EventDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const event = getEvent(slug);
  if (!event) notFound();

  const loc = locale as Locale;
  const t = await getTranslations("events");
  const cta = await getTranslations("cta");

  const formattedDate = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(event.dateISO));

  return (
    <div className="px-5 py-16 md:py-24">
      <JsonLd data={eventSchema(event, locale)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${locale === "en" ? "/en" : ""}/events` },
          { name: event.title, url: `${SITE_URL}${locale === "en" ? "/en" : ""}/events/${slug}` },
        ])}
      />

      <div className="mx-auto max-w-3xl">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 font-tag text-xs uppercase tracking-widest text-cream/60 hover:text-nova"
        >
          <ArrowLeft size={14} /> {cta("backToEvents")}
        </Link>

        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-3xl border border-line bg-ink-soft">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand placeholder SVG, swap for a real photo via next/image */}
          <img
            src={event.coverImage}
            alt={event.imageAlt[loc]}
            className="size-full object-cover"
            loading="eager"
          />
        </div>

        <h1 className="mt-8 font-display text-3xl font-bold text-cream md:text-4xl">{event.title}</h1>
        <p className="mt-3 text-lg text-cream/75">{event.summary[loc]}</p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-line p-6 sm:grid-cols-3">
          <div>
            <p className="font-tag text-[10px] uppercase tracking-widest text-nova">{t("details")}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-cream/80">
              <CalendarDays size={14} /> {formattedDate}
            </p>
          </div>
          <div>
            <p className="font-tag text-[10px] uppercase tracking-widest text-nova">{t("capacity")}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-cream/80">
              <Users size={14} /> {event.capacity} {t("capacityUnit")}
            </p>
          </div>
          <div>
            <p className="font-tag text-[10px] uppercase tracking-widest text-nova">{t("location")}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-cream/80">
              <MapPin size={14} /> {BUSINESS.streetAddress}
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-4 text-cream/80">
          {event.description[loc].map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-8">
          <p className="font-display text-lg font-bold text-cream">{t("includesTitle")}</p>
          <ul className="mt-3 space-y-2">
            {event.includes[loc].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-cream/75">
                <span className="text-nova">★</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <CtaAnchor href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" variant="solid">
            {cta("addToCalendar")}
          </CtaAnchor>
          <CtaAnchor href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" variant="outline">
            {cta("openInMaps")}
          </CtaAnchor>
          <CtaLink href="/private-events" variant="ghost">
            {cta("sendInquiry")}
          </CtaLink>
        </div>
      </div>
    </div>
  );
}
