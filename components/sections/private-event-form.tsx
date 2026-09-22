"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

type Locale = "es" | "en";

export function PrivateEventForm() {
  const t = useTranslations("privateEvents.formFields");
  const locale = useLocale() as Locale;
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    setStatus("submitting");
    try {
      const res = await fetch("/api/private-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          date: form.get("date") || undefined,
          guests: form.get("guests") || undefined,
          message: form.get("message"),
          locale,
          website: form.get("website"),
        }),
      });

      if (!res.ok) throw new Error("request_failed");

      trackEvent("submit_private_event_inquiry");
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
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {/* Honeypot: hidden from real users, bots tend to fill every field. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

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
          {t("date")}
          <input
            type="date"
            name="date"
            className="border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stellar-white/80">
          {t("guests")}
          <input
            type="number"
            min={1}
            name="guests"
            className="border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink"
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm text-stellar-white/80">
        {t("message")}
        <textarea
          name="message"
          rows={4}
          required
          className="resize-none border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink"
        />
      </label>
      <div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-2 inline-flex items-center justify-center bg-stellar-pink px-6 py-3 font-demi text-xs font-bold uppercase tracking-widest text-stellar-black transition-colors hover:bg-stellar-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? t("submitting") : t("submit")}
        </button>
        {status === "error" && <p className="mt-3 text-sm text-stellar-red">{t("errorBody")}</p>}
      </div>
    </form>
  );
}
