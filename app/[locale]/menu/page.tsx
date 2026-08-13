import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import { menuSchema, breadcrumbSchema } from "@/lib/schema";
import { menu, MENU_MONTH_LABEL, type MenuSection } from "@/data/menu";
import { SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string }> };
type Locale = "es" | "en";

const ACCENT: Record<MenuSection["accent"], { bg: string; text: string }> = {
  green: { bg: "bg-stellar-green", text: "text-stellar-black" },
  pink: { bg: "bg-stellar-pink", text: "text-stellar-black" },
  blue: { bg: "bg-stellar-blue", text: "text-stellar-white" },
  purple: { bg: "bg-stellar-purple", text: "text-stellar-white" },
  red: { bg: "bg-stellar-red", text: "text-stellar-white" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const path = isEn ? "/en/menu" : "/menu";
  return {
    title: isEn
      ? "Menu — Cookies, Coffee, Cacao & Matcha in Condesa"
      : "Menú — Cookies, café, cacao y matcha en Condesa",
    description: isEn
      ? "d-stellar's full menu: monthly cookies, signature drinks, coffee, cacao, matcha, tonics, focaccias and cookie packs. Nuevo León 217, Condesa."
      : "El menú completo de d-stellar: cookies del mes, bebidas de autor, café, cacao, matcha, tónicos, focaccias y cookie packs. Nuevo León 217, Condesa.",
    alternates: {
      canonical: path,
      languages: { es: "/menu", en: "/en/menu", "x-default": "/menu" },
    },
  };
}

export default async function MenuPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("menu");

  const schemaSections = menu.map((section) => ({
    title: section.title[loc],
    items: section.items.map((item) => ({
      name: item.name,
      description: item.description[loc],
    })),
  }));

  return (
    <div className="px-5 py-16 md:py-24">
      <JsonLd data={menuSchema(schemaSections)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "d-stellar", url: SITE_URL },
          { name: t("title"), url: `${SITE_URL}${locale === "en" ? "/en" : ""}/menu` },
        ])}
      />

      <header className="mx-auto max-w-4xl">
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("eyebrow")}</p>
        <h1 className="mt-4 font-display text-6xl font-black uppercase leading-[0.9] text-stellar-white md:text-8xl">
          {t("title")}
        </h1>
        <p className="mt-5 max-w-xl text-stellar-white/75">{t("intro")}</p>
        <p className="mt-3 inline-block bg-stellar-white px-3 py-1 font-tag text-xs uppercase tracking-widest text-stellar-black">
          {MENU_MONTH_LABEL[loc]}
        </p>
      </header>

      <nav aria-label={t("title")} className="mx-auto mt-10 flex max-w-4xl flex-wrap gap-2">
        {menu.map((section) => {
          const accent = ACCENT[section.accent];
          return (
            <a
              key={section.slug}
              href={`#${section.slug}`}
              className={`${accent.bg} ${accent.text} px-3 py-1.5 font-tag text-[11px] uppercase tracking-wide transition-opacity hover:opacity-80`}
            >
              {section.title[loc]}
            </a>
          );
        })}
      </nav>

      <div className="mx-auto mt-16 max-w-4xl space-y-16">
        {menu.map((section) => {
          const accent = ACCENT[section.accent];
          return (
            <section key={section.slug} id={section.slug} aria-labelledby={`${section.slug}-heading`} className="scroll-mt-24">
              <div className={`${accent.bg} ${accent.text} inline-block px-3 py-1`}>
                <h2 id={`${section.slug}-heading`} className="font-display text-3xl font-black uppercase leading-none md:text-4xl">
                  {section.title[loc]}
                </h2>
              </div>
              <p className="mt-3 max-w-xl text-sm text-stellar-white/65">{section.intro[loc]}</p>

              <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {section.items.map((item) => (
                  <li key={item.slug} className="border-b border-line pb-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-demi text-lg font-bold text-stellar-white">{item.name}</span>
                      <span className="font-tag text-sm text-stellar-white/70">${item.priceMXN}</span>
                    </div>
                    <p className="mt-1 text-sm text-stellar-white/65">{item.description[loc]}</p>
                    {item.tags?.length ? (
                      <p className="mt-2 font-tag text-[10px] uppercase tracking-widest text-stellar-pink/80">
                        {item.tags.join(" · ")}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="mx-auto mt-16 max-w-4xl text-center text-xs text-stellar-white/50">{t("note")}</p>
    </div>
  );
}
