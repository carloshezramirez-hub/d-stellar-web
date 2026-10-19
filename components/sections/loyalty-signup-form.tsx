"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

type Locale = "es" | "en";

export function LoyaltySignupForm() {
  const t = useTranslations("loyalty.form");
  const locale = useLocale() as Locale;
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "not_configured">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    setStatus("submitting");
    try {
      const res = await fetch("/api/wallet/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email") || undefined,
          locale,
          website: form.get("website"),
        }),
      });

      if (res.status === 503) {
        setStatus("not_configured");
        return;
      }
      if (!res.ok) throw new Error("request_failed");

      const json = await res.json();
      trackEvent("submit_loyalty_signup");
      window.location.href = json.passUrl;
    } catch {
      setStatus("error");
    }
  }

  if (status === "not_configured") {
    return (
      <div className="grid gap-3 py-6 text-center">
        <p className="font-demi text-xl font-bold text-stellar-pink">{t("notConfiguredTitle")}</p>
        <p className="text-sm text-stellar-white/70">{t("notConfiguredBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {/* Honeypot: hidden from real users, bots tend to fill every field. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <label className="flex flex-col gap-2 text-sm text-stellar-white/80">
        {t("name")}
        <input
          name="name"
          required
          minLength={2}
          className="border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-stellar-white/80">
        {t("phone")}
        <input
          type="tel"
          name="phone"
          required
          minLength={8}
          className="border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-stellar-white/80">
        {t("email")}
        <input
          type="email"
          name="email"
          className="border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink"
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
