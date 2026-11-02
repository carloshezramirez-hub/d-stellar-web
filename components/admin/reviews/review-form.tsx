"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewQuote } from "@/lib/reviews-types";

export function ReviewForm({ initialReview }: { initialReview?: ReviewQuote & { id: string } }) {
  const router = useRouter();
  const isEdit = Boolean(initialReview);

  const [author, setAuthor] = useState(initialReview?.author ?? "");
  const [rating, setRating] = useState(initialReview?.rating ?? 5);
  const [quote, setQuote] = useState(initialReview?.quote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: ReviewQuote = { author: author.trim(), rating: rating as ReviewQuote["rating"], quote: quote.trim() };

    try {
      const url = isEdit ? `/api/admin/reviews/${initialReview!.id}` : "/api/admin/reviews";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save_failed");
      router.push("/admin/contenido/resenas");
      router.refresh();
    } catch {
      setError("No se pudo guardar la reseña.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink";
  const labelClass = "flex flex-col gap-2 text-sm text-stellar-white/80";

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 border-2 border-line bg-stellar-black-soft p-6">
      <p className="rounded border border-stellar-pink/40 bg-stellar-pink/10 p-3 text-xs text-stellar-white/80">
        Regla dura del proyecto: copia la cita exacta de Google Maps, nunca inventada ni reescrita.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Autor
          <input required value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
        </label>
        <label className={labelClass}>
          Estrellas
          <select
            required
            value={rating}
            onChange={(e) => setRating(Number(e.target.value) as ReviewQuote["rating"])}
            className={inputClass}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className={labelClass}>
        Cita (tal cual aparece en Google Maps)
        <textarea required rows={4} value={quote} onChange={(e) => setQuote(e.target.value)} className={inputClass} />
      </label>

      {error && <p className="text-sm text-stellar-red">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-fit bg-stellar-pink px-6 py-3 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black disabled:opacity-50"
      >
        {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar reseña"}
      </button>
    </form>
  );
}
