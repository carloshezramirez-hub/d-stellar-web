"use client";

import { useTranslations } from "next-intl";
import { BUSINESS } from "@/data/site";

export function PrivateEventForm() {
  const t = useTranslations("privateEvents.formFields");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name");
    const email = data.get("email");
    const date = data.get("date");
    const guests = data.get("guests");
    const message = data.get("message");

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Preferred date: ${date}`,
      `Guests: ${guests}`,
      "",
      `${message}`,
    ].join("\n");

    window.location.href = `mailto:${BUSINESS.email}?subject=${encodeURIComponent(
      "Private event inquiry — d-stellar",
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-cream/80">
          {t("name")}
          <input
            name="name"
            required
            className="rounded-lg border border-line bg-transparent px-4 py-3 text-cream outline-none focus:border-nova"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-cream/80">
          {t("email")}
          <input
            type="email"
            name="email"
            required
            className="rounded-lg border border-line bg-transparent px-4 py-3 text-cream outline-none focus:border-nova"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-cream/80">
          {t("date")}
          <input
            type="date"
            name="date"
            className="rounded-lg border border-line bg-transparent px-4 py-3 text-cream outline-none focus:border-nova"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-cream/80">
          {t("guests")}
          <input
            type="number"
            min={1}
            name="guests"
            className="rounded-lg border border-line bg-transparent px-4 py-3 text-cream outline-none focus:border-nova"
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm text-cream/80">
        {t("message")}
        <textarea
          name="message"
          rows={4}
          required
          className="resize-none rounded-lg border border-line bg-transparent px-4 py-3 text-cream outline-none focus:border-nova"
        />
      </label>
      <button
        type="submit"
        className="mt-2 inline-flex items-center justify-center rounded-full bg-nova px-6 py-3 font-tag text-xs uppercase tracking-widest text-ink transition-colors hover:bg-cream"
      >
        {t("submit")}
      </button>
    </form>
  );
}
