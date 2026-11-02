"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MenuSection } from "@/lib/menu-types";

const ACCENT_OPTIONS: MenuSection["accent"][] = ["green", "pink", "blue", "purple", "red"];

export function MenuSectionForm({ initialSection }: { initialSection?: Omit<MenuSection, "items"> }) {
  const router = useRouter();
  const isEdit = Boolean(initialSection);

  const [slug, setSlug] = useState(initialSection?.slug ?? "");
  const [titleEs, setTitleEs] = useState(initialSection?.title.es ?? "");
  const [titleEn, setTitleEn] = useState(initialSection?.title.en ?? "");
  const [introEs, setIntroEs] = useState(initialSection?.intro.es ?? "");
  const [introEn, setIntroEn] = useState(initialSection?.intro.en ?? "");
  const [accent, setAccent] = useState<MenuSection["accent"]>(initialSection?.accent ?? "green");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = { slug: slug.trim(), title: { es: titleEs, en: titleEn }, intro: { es: introEs, en: introEn }, accent };
    try {
      const url = isEdit ? `/api/admin/menu/sections/${initialSection!.slug}` : "/api/admin/menu/sections";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save_failed");
      router.push("/admin/contenido/menu");
      router.refresh();
    } catch {
      setError("No se pudo guardar la sección.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink";
  const labelClass = "flex flex-col gap-2 text-sm text-stellar-white/80";

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 border-2 border-line bg-stellar-black-soft p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Slug (url interna, sin espacios)
          <input required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="gourmet-cookies" className={inputClass} />
        </label>
        <label className={labelClass}>
          Acento (color)
          <select value={accent} onChange={(e) => setAccent(e.target.value as MenuSection["accent"])} className={inputClass}>
            {ACCENT_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Título (ES)
          <input required value={titleEs} onChange={(e) => setTitleEs(e.target.value)} className={inputClass} />
        </label>
        <label className={labelClass}>
          Título (EN)
          <input required value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputClass} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Intro (ES)
          <textarea required rows={2} value={introEs} onChange={(e) => setIntroEs(e.target.value)} className={inputClass} />
        </label>
        <label className={labelClass}>
          Intro (EN)
          <textarea required rows={2} value={introEn} onChange={(e) => setIntroEn(e.target.value)} className={inputClass} />
        </label>
      </div>

      {error && <p className="text-sm text-stellar-red">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-fit bg-stellar-pink px-6 py-3 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black disabled:opacity-50"
      >
        {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear sección"}
      </button>
    </form>
  );
}
