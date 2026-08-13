import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import { menuSchema, breadcrumbSchema } from "@/lib/schema";
import { menu, MENU_MONTH_LABEL } from "@/data/menu";
import { SITE_URL } from "@/data/site";

type Props = { params: Promise<{ locale: string }> };
type Locale = "es" | "en";

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

      <header className="mx-auto max-w-4xl text-center">
        <p className="font-tag text-xs uppercase tracking-widest text-nova">{t("eyebrow")}</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-cream md:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-5 max-w-xl text-cream/75">{t("intro")}</p>
        <p className="mt-3 font-tag text-xs uppercase tracking-widest text-marigold">
          {MENU_MONTH_LABEL[loc]}
        </p>
      </header>

      <div className="mx-auto mt-16 max-w-4xl space-y-16">
        {menu.map((section) => (
          <section key={section.slug} id={section.slug} aria-labelledby={`${section.slug}-heading`}>
            <h2
              id={`${section.slug}-heading`}
              className="font-display text-2xl font-bold text-cream md:text-3xl"
            >
              {section.title[loc]}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-cream/65">{section.intro[loc]}</p>

            <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {section.items.map((item) => (
                <li key={item.slug} className="border-b border-line pb-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-lg font-semibold text-cream">{item.name}</span>
                    {item.priceMXN ? (
                      <span className="font-tag text-sm text-marigold">${item.priceMXN}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-cream/65">{item.description[loc]}</p>
                  {item.tags?.length ? (
                    <p className="mt-2 font-tag text-[10px] uppercase tracking-widest text-nova/80">
                      {item.tags.join(" · ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mx-auto mt-16 max-w-4xl text-center text-xs text-cream/50">{t("note")}</p>
    </div>
  );
}
