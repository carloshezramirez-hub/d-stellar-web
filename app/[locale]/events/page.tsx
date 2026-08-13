import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { upcomingEvents, pastEvents } from "@/data/events";
import { SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn ? "Events — Viewing Parties & Screenings in Condesa" : "Eventos — Viewing parties y screenings en Condesa",
    description: isEn
      ? "Upcoming and past events at d-stellar: viewing parties, screenings, LGBTQ+ nights and collaborations in an intimate Condesa space."
      : "Eventos próximos y pasados en d-stellar: viewing parties, screenings, noches LGBTQ+ y colaboraciones en un espacio íntimo de Condesa.",
    alternates: {
      canonical: isEn ? "/en/events" : "/events",
      languages: { es: "/events", en: "/en/events", "x-default": "/events" },
    },
  };
}

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");
  const cta = await getTranslations("cta");

  const upcoming = upcomingEvents();
  const past = pastEvents();

  return (
    <div className="px-5 py-16 md:py-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${locale === "en" ? "/en" : ""}/events` },
        ])}
      />

      <header className="mx-auto max-w-3xl text-center">
        <p className="font-tag text-xs uppercase tracking-widest text-nova">{t("eyebrow")}</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-cream md:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-5 max-w-xl text-cream/75">{t("intro")}</p>
      </header>

      <section className="mx-auto mt-16 max-w-4xl">
        <h2 className="font-display text-2xl font-bold text-cream">{t("upcomingTitle")}</h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-cream/65">{t("emptyUpcoming")}</p>
        ) : (
          <ul className="mt-8 space-y-6">
            {upcoming.map((event) => (
              <li key={event.slug}>
                <Link
                  href={{ pathname: "/events/[slug]", params: { slug: event.slug } }}
                  className="group flex flex-col gap-3 rounded-2xl border border-line p-6 transition-colors hover:border-nova sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-display text-xl font-bold text-cream group-hover:text-nova">
                      {event.title}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-cream/65">
                      <CalendarDays size={14} /> {formatDate(event.dateISO, locale)}
                    </p>
                  </div>
                  <p className="flex items-center gap-2 font-tag text-xs uppercase tracking-widest text-marigold">
                    <Users size={14} /> {event.capacity} {t("capacityUnit")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mx-auto mt-16 max-w-4xl">
          <h2 className="font-display text-2xl font-bold text-cream/60">{t("pastTitle")}</h2>
          <ul className="mt-8 space-y-4">
            {past.map((event) => (
              <li key={event.slug}>
                <Link
                  href={{ pathname: "/events/[slug]", params: { slug: event.slug } }}
                  className="flex flex-col gap-1 rounded-2xl border border-line/60 p-6 opacity-70 transition-opacity hover:opacity-100 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="font-display text-lg font-bold text-cream">{event.title}</p>
                  <p className="text-sm text-cream/60">{formatDate(event.dateISO, locale)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mx-auto mt-16 max-w-4xl text-center">
        <Link
          href="/private-events"
          className="font-tag text-xs uppercase tracking-widest text-cream/60 underline decoration-nova underline-offset-4 hover:text-nova"
        >
          {cta("sendInquiry")}
        </Link>
      </div>
    </div>
  );
}
