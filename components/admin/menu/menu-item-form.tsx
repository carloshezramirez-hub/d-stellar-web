"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MenuItem } from "@/lib/menu-types";

const TAG_OPTIONS: NonNullable<MenuItem["tags"]>[number][] = ["vegan", "caffeine-free", "seasonal", "signature"];

export function MenuItemForm({
  sectionSlug,
  initialItem,
}: {
  sectionSlug: string;
  initialItem?: MenuItem;
}) {
  const router = useRouter();
  const isEdit = Boolean(initialItem);

  const [slug, setSlug] = useState(initialItem?.slug ?? "");
  const [name, setName] = useState(initialItem?.name ?? "");
  const [descriptionEs, setDescriptionEs] = useState(initialItem?.description.es ?? "");
  const [descriptionEn, setDescriptionEn] = useState(initialItem?.description.en ?? "");
  const [priceMXN, setPriceMXN] = useState(initialItem ? String(initialItem.priceMXN) : "");
  const [compareAtPriceMXN, setCompareAtPriceMXN] = useState(
    initialItem?.compareAtPriceMXN != null ? String(initialItem.compareAtPriceMXN) : "",
  );
  const [packSize, setPackSize] = useState(initialItem?.packSize != null ? String(initialItem.packSize) : "");
  const [tags, setTags] = useState<Set<string>>(new Set(initialItem?.tags ?? []));
  const [image, setImage] = useState(initialItem?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(tag: string) {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
      if (!res.ok) throw new Error("upload_failed");
      const data = (await res.json()) as { url: string };
      setImage(data.url);
    } catch {
      setError("No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const item: MenuItem = {
      slug: slug.trim(),
      name: name.trim(),
      description: { es: descriptionEs, en: descriptionEn },
      priceMXN: Number(priceMXN) || 0,
      compareAtPriceMXN: compareAtPriceMXN ? Number(compareAtPriceMXN) : undefined,
      packSize: packSize ? Number(packSize) : undefined,
      tags: tags.size ? (Array.from(tags) as MenuItem["tags"]) : undefined,
      image: image || undefined,
    };

    try {
      const url = isEdit
        ? `/api/admin/menu/items/${sectionSlug}/${initialItem!.slug}`
        : "/api/admin/menu/items";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? item : { sectionSlug, item }),
      });
      if (!res.ok) throw new Error("save_failed");
      router.push("/admin/contenido/menu");
      router.refresh();
    } catch {
      setError("No se pudo guardar el producto.");
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
          Nombre
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className={labelClass}>
          Slug (url interna, sin espacios)
          <input required value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Descripción (ES)
          <textarea required rows={2} value={descriptionEs} onChange={(e) => setDescriptionEs(e.target.value)} className={inputClass} />
        </label>
        <label className={labelClass}>
          Descripción (EN)
          <textarea required rows={2} value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} className={inputClass} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={labelClass}>
          Precio MXN
          <input required type="number" min={0} value={priceMXN} onChange={(e) => setPriceMXN(e.target.value)} className={inputClass} />
        </label>
        <label className={labelClass}>
          Precio anterior (opcional, tachado)
          <input type="number" min={0} value={compareAtPriceMXN} onChange={(e) => setCompareAtPriceMXN(e.target.value)} className={inputClass} />
        </label>
        <label className={labelClass}>
          Piezas por pack (solo cookie packs)
          <input type="number" min={0} value={packSize} onChange={(e) => setPackSize(e.target.value)} className={inputClass} />
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm text-stellar-white/80">Tags</p>
        <div className="flex flex-wrap gap-3">
          {TAG_OPTIONS.map((tag) => (
            <label key={tag} className="flex items-center gap-2 text-xs uppercase tracking-widest text-stellar-white/70">
              <input type="checkbox" checked={tags.has(tag)} onChange={() => toggleTag(tag)} />
              {tag}
            </label>
          ))}
        </div>
      </div>

      <label className={labelClass}>
        Foto (opcional)
        <input type="file" accept="image/*" onChange={handleImageUpload} className={inputClass} />
      </label>
      {uploading && <p className="text-xs text-stellar-white/60">Subiendo...</p>}
      {image && (
        // eslint-disable-next-line @next/next/no-img-element -- preview de la imagen subida, URL dinámica
        <img src={image} alt="" className="h-32 w-32 object-cover" />
      )}

      {error && <p className="text-sm text-stellar-red">{error}</p>}

      <button
        type="submit"
        disabled={saving || uploading}
        className="w-fit bg-stellar-pink px-6 py-3 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black disabled:opacity-50"
      >
        {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}
