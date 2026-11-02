"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import type { ReviewQuote } from "@/lib/reviews-types";

export function ReviewList({ reviews }: { reviews: Array<ReviewQuote & { id: string }> }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const ids = reviews.map((r) => r.id);

  async function move(from: number, to: number) {
    if (to < 0 || to >= ids.length) return;
    const next = [...ids];
    [next[from], next[to]] = [next[to], next[from]];
    setBusy("reorder");
    try {
      await fetch("/api/admin/reviews/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string, author: string) {
    if (!confirm(`¿Borrar la reseña de "${author}"? Esto no se puede deshacer.`)) return;
    setBusy(id);
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <ul className="grid gap-2">
      {reviews.map((review, i) => (
        <li key={review.id} className="flex flex-wrap items-center justify-between gap-3 border-2 border-line bg-stellar-black-soft px-4 py-3">
          <div className="min-w-0">
            <p className="font-demi text-sm font-bold text-stellar-white">
              {review.author} <span className="text-stellar-white/50">· {review.rating}★</span>
            </p>
            <p className="truncate text-xs text-stellar-white/60">{review.quote}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" disabled={busy === "reorder" || i === 0} onClick={() => move(i, i - 1)} className="border border-line p-1.5 text-stellar-white/70 hover:border-stellar-pink disabled:opacity-30" aria-label="Subir">
              <ArrowUp size={14} />
            </button>
            <button type="button" disabled={busy === "reorder" || i === reviews.length - 1} onClick={() => move(i, i + 1)} className="border border-line p-1.5 text-stellar-white/70 hover:border-stellar-pink disabled:opacity-30" aria-label="Bajar">
              <ArrowDown size={14} />
            </button>
            <Link href={`/admin/contenido/resenas/${review.id}`} className="border border-line p-1.5 text-stellar-white/70 hover:border-stellar-pink" aria-label="Editar">
              <Pencil size={14} />
            </Link>
            <button type="button" disabled={busy === review.id} onClick={() => remove(review.id, review.author)} className="border border-line p-1.5 text-stellar-red/80 hover:border-stellar-red disabled:opacity-30" aria-label="Borrar">
              <Trash2 size={14} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
