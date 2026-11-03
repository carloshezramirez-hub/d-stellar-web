"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { MonthlyStory } from "@/lib/historias-types";

export function HistoriaList({ stories }: { stories: MonthlyStory[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(slug: string, title: string) {
    if (!confirm(`¿Borrar "${title}"? Esto no se puede deshacer.`)) return;
    setBusy(slug);
    try {
      await fetch(`/api/admin/historias/${slug}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <ul className="flex flex-col gap-2">
      {stories.map((story) => (
        <li key={story.slug} className="flex flex-wrap items-center justify-between gap-3 border-2 border-line bg-stellar-black-soft px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="font-demi text-sm font-bold text-stellar-white">
              {story.chapterNumber != null ? `Cap. ${story.chapterNumber} · ` : ""}
              {story.monthLabel.es} — {story.title.es}
            </p>
            <p className="truncate text-xs text-stellar-white/60">{story.flavorNames.join(" / ")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/admin/contenido/historias/${story.slug}`} className="border border-line p-1.5 text-stellar-white/70 hover:border-stellar-pink" aria-label="Editar">
              <Pencil size={14} />
            </Link>
            <button type="button" disabled={busy === story.slug} onClick={() => remove(story.slug, story.title.es)} className="border border-line p-1.5 text-stellar-red/80 hover:border-stellar-red disabled:opacity-30" aria-label="Borrar">
              <Trash2 size={14} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
