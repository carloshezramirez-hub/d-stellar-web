"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewStats } from "@/lib/reviews-types";

export function ReviewStatsForm({ stats }: { stats: ReviewStats }) {
  const router = useRouter();
  const [average, setAverage] = useState(String(stats.average));
  const [count, setCount] = useState(String(stats.count));
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/admin/reviews/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ average: Number(average), count: Number(count) }),
      });
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
        Promedio real de Google Maps
        <input type="number" step="0.1" min={1} max={5} value={average} onChange={(e) => setAverage(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-stellar-white/70">
        Conteo total real de reseñas
        <input type="number" min={0} value={count} onChange={(e) => setCount(e.target.value)} className={inputClass} />
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
