"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Cookie, CupSoda, Coffee, Leaf, Droplet, Croissant, Package, type LucideIcon } from "lucide-react";
import { menu, type MenuSection } from "@/data/menu";
import { ACCENT_STYLES } from "@/lib/menu-accent";
import { trackEvent } from "@/lib/analytics";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

type Locale = "es" | "en";

const allItems = menu.flatMap((section) => section.items);
const gourmetCookies = menu.find((section) => section.slug === "gourmet-cookies")!.items;

const SECTION_ICONS: Record<MenuSection["slug"], LucideIcon> = {
  "gourmet-cookies": Cookie,
  "bebidas-autor": CupSoda,
  cafeina: Coffee,
  "sin-cafeina": Leaf,
  tonics: Droplet,
  focaccias: Croissant,
  "cookie-packs": Package,
};

export function PickupOrderForm() {
  const t = useTranslations("pickup.order");
  const locale = useLocale() as Locale;
  const [activeSection, setActiveSection] = useState(menu[0].slug);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  // Per pack slug, the chosen cookie slug for each unit in the pack —
  // e.g. a qty-2 3-Pack has 6 slots, repeats allowed.
  const [packFlavors, setPackFlavors] = useState<Record<string, string[]>>({});
  const [showEmptyError, setShowEmptyError] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const lines = useMemo(
    () =>
      menu.flatMap((section) =>
        section.items
          .filter((item) => (quantities[item.slug] ?? 0) > 0)
          .map((item) => ({
            slug: item.slug,
            name: item.name,
            qty: quantities[item.slug],
            priceMXN: item.priceMXN,
            subtotal: item.priceMXN * quantities[item.slug],
            flavors: item.packSize ? (packFlavors[item.slug] ?? []) : undefined,
          })),
      ),
    [quantities, packFlavors],
  );

  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const totalItemCount = lines.reduce((sum, line) => sum + line.qty, 0);

  function setQty(slug: string, value: number) {
    const qty = Math.max(0, Math.min(20, Number.isNaN(value) ? 0 : value));
    setQuantities((prev) => ({ ...prev, [slug]: qty }));
    if (qty > 0) setShowEmptyError(false);

    const item = allItems.find((i) => i.slug === slug);
    if (item?.packSize) {
      const slots = qty * item.packSize;
      setPackFlavors((prev) => {
        const current = prev[slug] ?? [];
        const next = Array.from({ length: slots }, (_, i) => current[i] ?? gourmetCookies[0].slug);
        return { ...prev, [slug]: next };
      });
    }
  }

  function setPackFlavor(slug: string, index: number, cookieSlug: string) {
    setPackFlavors((prev) => {
      const next = [...(prev[slug] ?? [])];
      next[index] = cookieSlug;
      return { ...prev, [slug]: next };
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) {
      setShowEmptyError(true);
      return;
    }

    const form = new FormData(e.currentTarget);
    const items = lines.map((line) => ({
      slug: line.slug,
      name: line.name,
      qty: line.qty,
      priceMXN: line.priceMXN,
      flavors: line.flavors?.length
        ? line.flavors.map((slug) => gourmetCookies.find((c) => c.slug === slug)?.name ?? slug)
        : undefined,
    }));

    setStatus("submitting");
    try {
      const res = await fetch("/api/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          date: form.get("date"),
          time: form.get("time"),
          notes: form.get("notes") || undefined,
          items,
          locale,
          website: form.get("website"),
        }),
      });

      if (!res.ok) throw new Error("request_failed");
      const json = await res.json();

      trackEvent("submit_pickup_order", { total });

      if (json.checkoutUrl) {
        trackEvent("begin_checkout_pickup", { total });
        window.location.href = json.checkoutUrl;
        return;
      }

      setConfirmationCode(json.code ?? null);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="grid gap-3 py-6 text-center">
        <p className="font-demi text-xl font-bold text-stellar-green">{t("successTitle")}</p>
        <p className="text-sm text-stellar-white/70">{t("successBody")}</p>
        {confirmationCode && (
          <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/50">
            {t("successCode", { code: confirmationCode })}
          </p>
        )}
      </div>
    );
  }

  const activeItems = menu.find((section) => section.slug === activeSection)!.items;

  return (
    <form onSubmit={handleSubmit} className="grid gap-8">
      {/* Honeypot: hidden from real users, bots tend to fill every field. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="min-w-0">
        <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 md:-mx-10 md:px-10 [&::-webkit-scrollbar]:hidden">
          {menu.map((section) => {
            const accent = ACCENT_STYLES[section.accent];
            const isActive = section.slug === activeSection;
            const sectionCount = section.items.reduce((sum, item) => sum + (quantities[item.slug] ?? 0), 0);
            const Icon = SECTION_ICONS[section.slug];
            return (
              <motion.button
                key={section.slug}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveSection(section.slug)}
                className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap border-2 px-4 py-2 font-tag text-xs uppercase tracking-widest transition-colors ${
                  isActive ? `border-transparent ${accent.text}` : "border-line text-stellar-white/70 hover:border-stellar-white/40"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="pickup-active-tab"
                    className={`absolute inset-0 ${accent.bg}`}
                    transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <Icon size={14} strokeWidth={2.25} />
                  {section.title[locale]}
                  {sectionCount > 0 && <span className="opacity-70">({sectionCount})</span>}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="sticky top-16 z-10 -mx-6 mt-4 flex items-center justify-between border-y-2 border-line bg-stellar-black-soft/95 px-6 py-3 backdrop-blur md:-mx-10 md:px-10">
          <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/70">
            {totalItemCount > 0 ? t("cartCount", { count: totalItemCount }) : t("cartEmpty")}
          </p>
          <AnimatePresence mode="popLayout">
            <motion.p
              key={total}
              initial={{ scale: 1.2, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.4 }}
              className="font-demi text-lg font-bold text-stellar-green"
            >
              ${total} MXN
            </motion.p>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.04 } },
            }}
            className="mt-6 grid gap-3 sm:grid-cols-2"
          >
            {activeItems.map((item) => {
              const qty = quantities[item.slug] ?? 0;
              return (
                <motion.div
                  key={item.slug}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className={`border-2 p-4 transition-colors ${qty > 0 ? "border-stellar-pink" : "border-line"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-demi text-sm font-bold text-stellar-white">{item.name}</p>
                      <p className="mt-1 text-xs text-stellar-white/60">{item.description[locale]}</p>
                      <p className="mt-2 font-tag text-xs text-stellar-white/50">
                        {item.compareAtPriceMXN && (
                          <span className="mr-1.5 text-stellar-white/30 line-through">${item.compareAtPriceMXN}</span>
                        )}
                        ${item.priceMXN} MXN
                      </p>
                    </div>
                    <QuantityStepper value={qty} onChange={(value) => setQty(item.slug, value)} label={item.name} />
                  </div>

                  {item.packSize && qty > 0 && (
                    <div className="mt-4 grid gap-2 border-l-2 border-line pl-3">
                      <p className="font-tag text-[10px] uppercase tracking-widest text-stellar-white/50">
                        {t("packFlavorsTitle")}
                      </p>
                      {(packFlavors[item.slug] ?? []).map((selected, i) => (
                        <select
                          key={i}
                          aria-label={`${item.name} — ${t("packFlavorSlot", { n: i + 1 })}`}
                          value={selected}
                          onChange={(e) => setPackFlavor(item.slug, i, e.currentTarget.value)}
                          className="border-2 border-line bg-transparent px-2 py-1.5 text-xs text-stellar-white outline-none focus:border-stellar-pink"
                        >
                          {gourmetCookies.map((cookie) => (
                            <option key={cookie.slug} value={cookie.slug} className="bg-stellar-black">
                              {cookie.name}
                            </option>
                          ))}
                        </select>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {lines.length > 0 && (
        <div className="border-2 border-line bg-stellar-black-soft/60 p-5">
          <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/50">{t("orderSummary")}</p>
          <ul className="mt-3 space-y-2">
            {lines.map((line) => (
              <li key={line.slug} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-stellar-white/80">
                  {line.qty}× {line.name}
                  {line.flavors?.length ? (
                    <span className="text-stellar-white/40">
                      {" "}
                      ({line.flavors.map((slug) => gourmetCookies.find((c) => c.slug === slug)?.name ?? slug).join(", ")})
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-stellar-white/60">${line.subtotal} MXN</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t-2 border-line pt-3">
            <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/70">{t("total")}</p>
            <p className="font-demi text-xl font-bold text-stellar-green">${total} MXN</p>
          </div>
        </div>
      )}
      {showEmptyError && <p className="text-sm text-stellar-red">{t("emptyError")}</p>}

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
          {t("email")}
          <input
            type="email"
            name="email"
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
        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center bg-stellar-pink px-6 py-3 font-demi text-xs font-bold uppercase tracking-widest text-stellar-black transition-colors hover:bg-stellar-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? t("submitting") : t("submit")}
        </motion.button>
        <p className="mt-3 text-xs text-stellar-white/50">{t("payNote")}</p>
        {status === "error" && <p className="mt-3 text-sm text-stellar-red">{t("errorBody")}</p>}
      </div>
    </form>
  );
}
