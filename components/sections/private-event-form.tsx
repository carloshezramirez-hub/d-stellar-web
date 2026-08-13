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
      <button
        type="submit"
        className="mt-2 inline-flex items-center justify-center bg-stellar-pink px-6 py-3 font-demi text-xs font-bold uppercase tracking-widest text-stellar-black transition-colors hover:bg-stellar-white"
      >
        {t("submit")}
      </button>
    </form>
  );
}
