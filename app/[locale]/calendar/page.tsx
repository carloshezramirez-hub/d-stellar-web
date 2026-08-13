import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { CtaLink } from "@/components/ui/cta-link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { sortedCalendar, currentCalendarMonth } from "@/data/cookie-calendar";
import { SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string }> };
type Locale = "es" | "en";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn ? "Cookie Calendar — Month by Month" : "Calendario de cookies — mes a mes",
    description: isEn
      ? "Every monthly cookie collection at d-stellar, on the record — from the current lineup back through past rotations."
      : "Cada colección mensual de cookies de d-stellar, en el registro — desde la actual hasta las rotaciones pasadas.",
    alternates: {
      canonical: isEn ? "/en/calendar" : "/calendar",
      languages: { es: "/calendar", en: "/en/calendar", "x-default": "/calendar" },
    },
  };
}

export default async function CalendarPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("calendar");

  const months = sortedCalendar();
  const current = currentCalendarMonth();

  return (
    <div>
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${locale === "en" ? "/en" : ""}/calendar` },
        ])}
      />

      <div className="px-5 pb-16 pt-16 md:pb-24 md:pt-24">
        <div className="mx-auto max-w-3xl">
          <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("eyebrow")}</p>
          <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] text-stellar-white md:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-stellar-white/85">{t("intro")}</p>
          <CtaLink href="/menu" variant="ghost" className="mt-6 px-0">
            {t("viewMenu")} <ArrowUpRight size={14} />
          </CtaLink>
        </div>
      </div>

      <div className="border-t border-line px-5 py-16 md:py-20">
        <div className="mx-auto max-w-5xl space-y-16">
          {months.map((month) => (
            <section key={month.monthKey}>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-3xl font-black uppercase text-stellar-white md:text-4xl">
                  {month.label[loc]}
                </h2>
                {month.monthKey === current.monthKey && (
                  <span className="bg-stellar-green px-3 py-1 font-tag text-[10px] font-bold uppercase tracking-widest text-stellar-black">
                    {t("currentBadge")}
                  </span>
                )}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {month.cookies.map((cookie) => (
                  <div key={cookie.name} className="flex flex-col gap-2 border-2 border-line p-6">
                    <p className="font-demi text-lg font-bold text-stellar-white">{cookie.name}</p>
                    <p className="flex-1 text-sm leading-relaxed text-stellar-white/70">
                      {cookie.description[loc]}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
