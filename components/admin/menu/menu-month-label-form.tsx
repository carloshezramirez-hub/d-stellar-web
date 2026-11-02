"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/site-settings-types";

export function MenuMonthLabelForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [es, setEs] = useState(settings.menuMonthLabel.es);
  const [en, setEn] = useState(settings.menuMonthLabel.en);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, menuMonthLabel: { es, en } }),
      });
      if (!res.ok) throw new Error("save_failed");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "border-2 border-line bg-transparent px-3 py-2 text-sm text-stellar-white outline-none focus:border-stellar-pink";

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 border-2 border-line bg-stellar-black-soft p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="flex flex-col gap-1 text-xs text-stellar-white/70">
        Etiqueta del mes (ES)
        <input value={es} onChange={(e) => setEs(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-stellar-white/70">
        Etiqueta del mes (EN)
        <input value={en} onChange={(e) => setEn(e.target.value)} className={inputClass} />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="h-fit bg-stellar-pink px-4 py-2 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
