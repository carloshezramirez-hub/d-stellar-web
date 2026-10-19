import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { LoyaltySignupForm } from "@/components/sections/loyalty-signup-form";
import { loyaltySignupQrDataUrl } from "@/lib/wallet/qr";
import { SITE_URL } from "@/data/site";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return pageMetadata({
    locale: isEn ? "en" : "es",
    path: "/fidelidad",
    title: isEn ? "Loyalty card (beta) — Apple Wallet" : "Tarjeta de fidelidad (beta) — Apple Wallet",
    description: isEn
      ? "Add the d-stellar loyalty card to Apple Wallet — a beta test."
      : "Agrega la tarjeta de fidelidad de d-stellar a tu Apple Wallet — una prueba beta.",
  });
}

export default async function LoyaltyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("loyalty");
  const path = `${locale === "en" ? "/en" : ""}/fidelidad`;
  const qrDataUrl = await loyaltySignupQrDataUrl(`${SITE_URL}${path}`);

  return (
    <div className="px-5 py-16 md:py-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${path}` },
        ])}
      />

      <div className="mx-auto max-w-2xl text-center">
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("eyebrow")}</p>
        <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] text-stellar-white md:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-5 text-stellar-white/75">{t("intro")}</p>
        <p className="mt-3 text-xs text-stellar-white/40">{t("betaNote")}</p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-10 border-2 border-line bg-stellar-black-soft p-6 md:grid-cols-2 md:p-10">
        <div>
          <p className="font-tag text-xs uppercase tracking-widest text-stellar-green">{t("form.eyebrow")}</p>
          <h2 className="mt-2 font-display text-2xl font-black uppercase text-stellar-white">{t("form.title")}</h2>
          <div className="mt-6">
            <LoyaltySignupForm />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 border-t-2 border-line pt-8 md:border-l-2 md:border-t-0 md:pl-10 md:pt-0">
          <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/50">{t("qr.label")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt={t("qr.alt")} width={220} height={220} className="border-2 border-line bg-stellar-white p-3" />
          <a
            href={`/api/wallet/qr?locale=${locale}`}
            className="font-tag text-xs uppercase tracking-widest text-stellar-white/60 underline underline-offset-4 hover:text-stellar-pink"
          >
            {t("qr.download")}
          </a>
        </div>
      </div>
    </div>
  );
}
