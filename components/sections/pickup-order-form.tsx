"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { menu } from "@/data/menu";
import { BUSINESS } from "@/data/site";
import { trackEvent } from "@/lib/analytics";

type Locale = "es" | "en";

// Cookies, focaccias and packs are worth ordering ahead — they take time to
// prepare or hold. Drinks are made fresh at the counter, so they're left off
// this form on purpose (see PROJECT_NOTES.md).
const ORDERABLE_SECTIONS = ["gourmet-cookies", "focaccias", "cookie-packs"];

const orderSections = menu.filter((section) => ORDERABLE_SECTIONS.includes(section.slug));

export function PickupOrderForm() {
  const t = useTranslations("pickup.order");
  const locale = useLocale() as Locale;
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showEmptyError, setShowEmptyError] = useState(false);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const lines = useMemo(
    () =>
      orderSections.flatMap((section) =>
        section.items
          .filter((item) => (quantities[item.slug] ?? 0) > 0)
          .map((item) => ({
            name: item.name,
            qty: quantities[item.slug],
            priceMXN: item.priceMXN,
            subtotal: item.priceMXN * quantities[item.slug],
          })),
      ),
    [quantities],
  );

  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);

  function setQty(slug: string, value: number) {
    const qty = Math.max(0, Math.min(20, Number.isNaN(value) ? 0 : value));
    setQuantities((prev) => ({ ...prev, [slug]: qty }));
    if (qty > 0) setShowEmptyError(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) {
      setShowEmptyError(true);
      return;
    }

    const data = new FormData(e.currentTarget);
    const name = data.get("name");
    const phone = data.get("phone");
    const date = data.get("date");
    const time = data.get("time");
    const notes = data.get("notes");

    const body = [
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Pickup date: ${date}`,
      `Pickup time: ${time}`,
      "",
      "Order:",
      ...lines.map((line) => `- ${line.qty}x ${line.name} — $${line.subtotal}`),
      "",
      `Estimated total: $${total} MXN`,
      "(Pay in store at pickup.)",
      "",
      notes ? `Notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    trackEvent("submit_pickup_order", { total });

    window.location.href = `mailto:${BUSINESS.email}?subject=${encodeURIComponent(
      "Pickup order — d-stellar",
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10">
      <div className="grid gap-10 sm:grid-cols-3">
        {orderSections.map((section) => (
          <div key={section.slug}>
            <p className="font-demi text-sm font-bold uppercase tracking-wide text-stellar-white">
              {section.title[locale]}
            </p>
            <ul className="mt-4 space-y-3">
              {section.items.map((item) => (
                <li key={item.slug} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-stellar-white">{item.name}</p>
                    <p className="font-tag text-xs text-stellar-white/50">${item.priceMXN}</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    inputMode="numeric"
                    aria-label={item.name}
                    value={quantities[item.slug] ?? 0}
                    onChange={(e) => setQty(item.slug, e.currentTarget.valueAsNumber)}
                    className="w-14 border-2 border-line bg-transparent px-2 py-1.5 text-center text-stellar-white outline-none focus:border-stellar-pink"
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-y-2 border-line py-4">
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/70">{t("total")}</p>
        <p className="font-demi text-xl font-bold text-stellar-green">${total} MXN</p>
      </div>
      {showEmptyError && <p className="-mt-6 text-sm text-stellar-red">{t("emptyError")}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-stellar-white/80">
          {t("name")}
          <input
            name="name"
            required
            className="border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stellar-white/80">
          {t("phone")}
          <input
            type="tel"
            name="phone"
            required
            className="border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stellar-white/80">
          {t("date")}
          <input
            type="date"
            name="date"
            min={todayISO}
            required
            className="border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stellar-white/80">
          {t("time")}
          <input
            type="time"
            name="time"
            min="11:00"
            max="19:00"
            required
            className="border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink"
          />
        </label>
      </div>
      <label className="-mt-4 flex flex-col gap-2 text-sm text-stellar-white/80">
        {t("notes")}
        <textarea
          name="notes"
          rows={3}
          className="resize-none border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink"
        />
      </label>

      <div>
        <button
          type="submit"
          className="inline-flex items-center justify-center bg-stellar-pink px-6 py-3 font-demi text-xs font-bold uppercase tracking-widest text-stellar-black transition-colors hover:bg-stellar-white"
        >
          {t("submit")}
        </button>
        <p className="mt-3 text-xs text-stellar-white/50">{t("payNote")}</p>
      </div>
    </form>
  );
}
