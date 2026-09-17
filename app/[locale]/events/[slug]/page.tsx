import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, MapPin, Users, ArrowLeft, Tag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CtaAnchor, CtaLink } from "@/components/ui/cta-link";
import { JsonLd } from "@/components/json-ld";
import { eventSchema, breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { events, getEvent, eventStartingPrice } from "@/data/events";
import { formatEventDate } from "@/lib/event-date";
import { BUSINESS, SITE_URL } from "@/data/site";
import { TicketOrderForm } from "@/components/sections/ticket-order-form";
import { TicketPaymentBanner } from "@/components/sections/ticket-payment-banner";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ status?: string; code?: string }>;
};
type Locale = "es" | "en";

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  const loc = locale as Locale;

  return pageMetadata({
    locale: loc,
    path: `/events/${slug}`,
    title: event.title,
    description: event.summary[loc],
    image: event.coverImage,
    type: "article",
  });
}

function googleCalendarUrl(event: NonNullable<ReturnType<typeof getEvent>> & { dateISO: string }) {
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

export default async function EventDetailPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const { status, code } = await searchParams;
  setRequestLocale(locale);
  const event = getEvent(slug);
  if (!event) notFound();

  const loc = locale as Locale;
  const t = await getTranslations("events");
  const cta = await getTranslations("cta");
  const paymentStatus = status === "approved" || status === "pending" || status === "failure" ? status : null;

  const formattedDate = formatEventDate(event, loc);

  return (
    <div className="px-5 py-16 md:py-24">
      {event.dateISO && <JsonLd data={eventSchema({ ...event, dateISO: event.dateISO }, locale)} />}
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
          className="inline-flex items-center gap-2 font-tag text-xs uppercase tracking-widest text-stellar-white/60 hover:text-stellar-pink"
        >
          <ArrowLeft size={14} /> {cta("backToEvents")}
        </Link>

        <div className="relative mt-6 aspect-[16/9] overflow-hidden border-2 border-line bg-stellar-black-soft">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand placeholder SVG, swap for a real photo via next/image */}
          <img
            src={event.coverImage}
            alt={event.imageAlt[loc]}
            className="size-full object-cover"
            loading="eager"
          />
        </div>

        <h1 className="mt-8 font-display text-4xl font-black uppercase leading-[0.95] text-stellar-white md:text-5xl">{event.title}</h1>
        <p className="mt-3 text-lg text-stellar-white/75">{event.summary[loc]}</p>

        {paymentStatus && (
          <div className="mt-8">
            <TicketPaymentBanner status={paymentStatus} code={code} />
          </div>
        )}

        <div className="mt-8 grid gap-4 border-2 border-line p-6 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="font-tag text-[10px] uppercase tracking-widest text-stellar-pink">{t("details")}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-stellar-white/80">
              <CalendarDays size={14} /> {formattedDate}
            </p>
          </div>
          <div>
            <p className="font-tag text-[10px] uppercase tracking-widest text-stellar-pink">{t("price")}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-stellar-white/80">
              <Tag size={14} />{" "}
              {(() => {
                const price = eventStartingPrice(event);
                if (price == null) return t("priceFree");
                return event.tickets?.length ? t("priceFrom", { price }) : `$${price} MXN`;
              })()}
            </p>
          </div>
          {event.capacity != null && (
            <div>
              <p className="font-tag text-[10px] uppercase tracking-widest text-stellar-pink">{t("capacity")}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-stellar-white/80">
                <Users size={14} /> {event.capacity} {t("capacityUnit")}
              </p>
            </div>
          )}
          <div>
            <p className="font-tag text-[10px] uppercase tracking-widest text-stellar-pink">{t("location")}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-stellar-white/80">
              <MapPin size={14} /> {BUSINESS.streetAddress}
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-4 text-stellar-white/80">
          {event.description[loc].map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {event.tickets?.length ? (
          <div className="mt-10">
            <p className="font-demi text-lg font-bold text-stellar-white">{t("ticketsTitle")}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {event.tickets.map((ticket) => (
                <div key={ticket.name[loc]} className="border-2 border-line p-6">
                  <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{ticket.name[loc]}</p>
                  <p className="mt-2 font-demi text-2xl font-bold text-stellar-white">${ticket.priceMXN} MXN</p>
                  <ul className="mt-4 space-y-2">
                    {ticket.includes[loc].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stellar-white/75">
                        <Image src="/brand/icons/pixel-star.png" alt="" width={622} height={552} className="mt-0.5 h-3.5 w-auto shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {ticket.note && <p className="mt-4 text-xs italic text-stellar-white/50">{ticket.note[loc]}</p>}
                </div>
              ))}
            </div>
            {event.status === "upcoming" && <TicketOrderForm event={event} />}
          </div>
        ) : (
          event.includes && (
            <div className="mt-8">
              <p className="font-demi text-lg font-bold text-stellar-white">{t("includesTitle")}</p>
              <ul className="mt-3 space-y-2">
                {event.includes[loc].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stellar-white/75">
                    <Image src="/brand/icons/pixel-star.png" alt="" width={622} height={552} className="mt-0.5 h-3.5 w-auto shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          {event.status === "upcoming" && event.dateISO && (
            <CtaAnchor
              href={googleCalendarUrl({ ...event, dateISO: event.dateISO })}
              target="_blank"
              rel="noreferrer"
              variant="solid"
            >
              {cta("addToCalendar")}
            </CtaAnchor>
          )}
          {event.externalUrl && (
            <CtaAnchor href={event.externalUrl} target="_blank" rel="noreferrer" variant="solid">
              Instagram
            </CtaAnchor>
          )}
          <CtaAnchor href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" variant="outline">
            {cta("openInMaps")}
          </CtaAnchor>
          <CtaLink href={{ pathname: "/events", hash: "private-events" }} variant="ghost">
            {cta("sendInquiry")}
          </CtaLink>
        </div>
      </div>
    </div>
  );
}
