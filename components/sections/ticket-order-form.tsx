"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { trackEvent } from "@/lib/analytics";
import type { EventRecord } from "@/data/events";

type Locale = "es" | "en";

export function TicketOrderForm({ event }: { event: EventRecord }) {
  const t = useTranslations("events.order");
  const locale = useLocale() as Locale;
  const tickets = event.tickets ?? [];
  const [ticketIndex, setTicketIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

  const ticket = tickets[ticketIndex];
  const total = (ticket?.priceMXN ?? 0) * qty;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ticket) return;

    const form = new FormData(e.currentTarget);

    setStatus("submitting");
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: event.slug,
          ticketIndex,
          qty,
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          notes: form.get("notes") || undefined,
          locale,
          website: form.get("website"),
        }),
      });

      if (!res.ok) throw new Error("request_failed");
      const json = await res.json();

      trackEvent("submit_ticket_order", { total, event: event.slug });

      if (json.checkoutUrl) {
        trackEvent("begin_checkout_ticket", { total, event: event.slug });
        window.location.href = json.checkoutUrl;
        return;
      }

      setConfirmationCode(json.code ?? null);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (tickets.length === 0) return null;

  if (status === "success") {
    return (
      <div className="mt-10 grid gap-3 border-2 border-line bg-stellar-black-soft p-6 text-center">
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

  return (
    <form onSubmit={handleSubmit} className="mt-10 grid gap-6 border-2 border-line bg-stellar-black-soft p-6 md:p-8">
      {/* Honeypot: hidden from real users, bots tend to fill every field. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div>
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">{t("eyebrow")}</p>
        <h2 className="mt-2 font-display text-2xl font-black uppercase text-stellar-white">{t("title")}</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {tickets.map((tk, i) => (
          <button
            type="button"
            key={tk.name[locale]}
            onClick={() => setTicketIndex(i)}
            className={`border-2 p-4 text-left transition-colors ${
              i === ticketIndex ? "border-stellar-pink" : "border-line hover:border-stellar-white/40"
            }`}
          >
            <p className="font-demi text-sm font-bold text-stellar-white">{tk.name[locale]}</p>
            <p className="mt-1 font-tag text-xs text-stellar-white/60">${tk.priceMXN} MXN</p>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-y-2 border-line py-4">
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/70">{t("qty")}</p>
        <QuantityStepper
          value={qty}
          onChange={(value) => setQty(Math.max(1, Math.min(4, value)))}
          label={ticket?.name[locale] ?? ""}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/70">{t("total")}</p>
        <p className="font-demi text-xl font-bold text-stellar-green">${total} MXN</p>
      </div>

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
        <label className="flex flex-col gap-2 text-sm text-stellar-white/80 sm:col-span-2">
          {t("phone")}
          <input
            type="tel"
            name="phone"
            required
            className="border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink"
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm text-stellar-white/80">
        {t("notes")}
        <textarea
          name="notes"
          rows={2}
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
