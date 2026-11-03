"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MonthlyStory } from "@/lib/historias-types";

type CookieForm = {
  number: string;
  name: string;
  taglineEs: string;
  taglineEn: string;
  storyEs: string;
  storyEn: string;
  pullQuoteEs: string;
  pullQuoteEn: string;
};

type GalleryForm = { src: string; altEs: string; altEn: string };

function cookieToForm(c: MonthlyStory["cookies"][number]): CookieForm {
  return {
    number: c.number,
    name: c.name,
    taglineEs: c.tagline.es,
    taglineEn: c.tagline.en,
    storyEs: c.story.es.join("\n"),
    storyEn: c.story.en.join("\n"),
    pullQuoteEs: c.pullQuote?.es ?? "",
    pullQuoteEn: c.pullQuote?.en ?? "",
  };
}

function emptyCookie(nextNumber: number): CookieForm {
  return {
    number: String(nextNumber).padStart(2, "0"),
    name: "",
    taglineEs: "",
    taglineEn: "",
    storyEs: "",
    storyEn: "",
    pullQuoteEs: "",
    pullQuoteEn: "",
  };
}

export function HistoriaForm({ initialStory }: { initialStory?: MonthlyStory }) {
  const router = useRouter();
  const isEdit = Boolean(initialStory);

  const [slug, setSlug] = useState(initialStory?.slug ?? "");
  const [chapterNumber, setChapterNumber] = useState(initialStory?.chapterNumber != null ? String(initialStory.chapterNumber) : "");
  const [monthLabelEs, setMonthLabelEs] = useState(initialStory?.monthLabel.es ?? "");
  const [monthLabelEn, setMonthLabelEn] = useState(initialStory?.monthLabel.en ?? "");
  const [titleEs, setTitleEs] = useState(initialStory?.title.es ?? "");
  const [titleEn, setTitleEn] = useState(initialStory?.title.en ?? "");
  const [hookEs, setHookEs] = useState(initialStory?.hook.es ?? "");
  const [hookEn, setHookEn] = useState(initialStory?.hook.en ?? "");
  const [flavorNames, setFlavorNames] = useState(initialStory?.flavorNames.join(", ") ?? "");
  const [sectionEyebrowEs, setSectionEyebrowEs] = useState(initialStory?.sectionEyebrow.es ?? "");
  const [sectionEyebrowEn, setSectionEyebrowEn] = useState(initialStory?.sectionEyebrow.en ?? "");
  const [sectionTitleEs, setSectionTitleEs] = useState(initialStory?.sectionTitle.es ?? "");
  const [sectionTitleEn, setSectionTitleEn] = useState(initialStory?.sectionTitle.en ?? "");
  const [introEs, setIntroEs] = useState(initialStory?.intro.es.join("\n") ?? "");
  const [introEn, setIntroEn] = useState(initialStory?.intro.en.join("\n") ?? "");
  const [closingEyebrowEs, setClosingEyebrowEs] = useState(initialStory?.closingEyebrow.es ?? "");
  const [closingEyebrowEn, setClosingEyebrowEn] = useState(initialStory?.closingEyebrow.en ?? "");
  const [closingTitleEs, setClosingTitleEs] = useState(initialStory?.closingTitle.es ?? "");
  const [closingTitleEn, setClosingTitleEn] = useState(initialStory?.closingTitle.en ?? "");
  const [closingEs, setClosingEs] = useState(initialStory?.closing.es.join("\n") ?? "");
  const [closingEn, setClosingEn] = useState(initialStory?.closing.en.join("\n") ?? "");
  const [oneLinerEs, setOneLinerEs] = useState(initialStory?.oneLiner.es ?? "");
  const [oneLinerEn, setOneLinerEn] = useState(initialStory?.oneLiner.en ?? "");
  const [heroImage, setHeroImage] = useState(initialStory?.heroImage ?? "");
  const [heroAltEs, setHeroAltEs] = useState(initialStory?.heroAlt.es ?? "");
  const [heroAltEn, setHeroAltEn] = useState(initialStory?.heroAlt.en ?? "");

  const [cookies, setCookies] = useState<CookieForm[]>(initialStory?.cookies.map(cookieToForm) ?? []);
  const [gallery, setGallery] = useState<GalleryForm[]>(
    initialStory?.gallery.map((g) => ({ src: g.src, altEs: g.alt.es, altEn: g.alt.en })) ?? [],
  );

  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
    if (!res.ok) throw new Error("upload_failed");
    const data = (await res.json()) as { url: string };
    return data.url;
  }

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("hero");
    try {
      setHeroImage(await uploadFile(file));
    } catch {
      setError("No se pudo subir la imagen.");
    } finally {
      setUploading(null);
    }
  }

  async function handleGalleryUpload(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(`gallery-${i}`);
    try {
      const url = await uploadFile(file);
      setGallery((prev) => prev.map((g, idx) => (idx === i ? { ...g, src: url } : g)));
    } catch {
      setError("No se pudo subir la imagen.");
    } finally {
      setUploading(null);
    }
  }

  function addCookie() {
    setCookies((prev) => [...prev, emptyCookie(prev.length + 1)]);
  }
  function updateCookie(i: number, patch: Partial<CookieForm>) {
    setCookies((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }
  function removeCookie(i: number) {
    setCookies((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addGalleryImage() {
    setGallery((prev) => [...prev, { src: "", altEs: "", altEn: "" }]);
  }
  function updateGalleryImage(i: number, patch: Partial<GalleryForm>) {
    setGallery((prev) => prev.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  }
  function removeGalleryImage(i: number) {
    setGallery((prev) => prev.filter((_, idx) => idx !== i));
  }

  function buildPayload(): MonthlyStory {
    return {
      slug: slug.trim(),
      chapterNumber: chapterNumber ? Number(chapterNumber) : undefined,
      monthLabel: { es: monthLabelEs, en: monthLabelEn },
      title: { es: titleEs, en: titleEn },
      hook: { es: hookEs, en: hookEn },
      flavorNames: flavorNames.split(",").map((s) => s.trim()).filter(Boolean),
      sectionEyebrow: { es: sectionEyebrowEs, en: sectionEyebrowEn },
      sectionTitle: { es: sectionTitleEs, en: sectionTitleEn },
      intro: {
        es: introEs.split("\n").map((s) => s.trim()).filter(Boolean),
        en: introEn.split("\n").map((s) => s.trim()).filter(Boolean),
      },
      cookies: cookies.map((c) => ({
        number: c.number,
        name: c.name,
        tagline: { es: c.taglineEs, en: c.taglineEn },
        story: {
          es: c.storyEs.split("\n").map((s) => s.trim()).filter(Boolean),
          en: c.storyEn.split("\n").map((s) => s.trim()).filter(Boolean),
        },
        pullQuote: c.pullQuoteEs || c.pullQuoteEn ? { es: c.pullQuoteEs, en: c.pullQuoteEn } : undefined,
      })),
      closingEyebrow: { es: closingEyebrowEs, en: closingEyebrowEn },
      closingTitle: { es: closingTitleEs, en: closingTitleEn },
      closing: {
        es: closingEs.split("\n").map((s) => s.trim()).filter(Boolean),
        en: closingEn.split("\n").map((s) => s.trim()).filter(Boolean),
      },
      oneLiner: { es: oneLinerEs, en: oneLinerEn },
      heroImage,
      heroAlt: { es: heroAltEs, en: heroAltEn },
      gallery: gallery.filter((g) => g.src).map((g) => ({ src: g.src, alt: { es: g.altEs, en: g.altEn } })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload();
      const url = isEdit ? `/api/admin/historias/${initialStory!.slug}` : "/api/admin/historias";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save_failed");
      router.push("/admin/contenido/historias");
      router.refresh();
    } catch {
      setError("No se pudo guardar la historia.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialStory) return;
    if (!confirm(`¿Borrar "${initialStory.title.es}"? Esto no se puede deshacer.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/historias/${initialStory.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete_failed");
      router.push("/admin/contenido/historias");
      router.refresh();
    } catch {
      setError("No se pudo borrar la historia.");
      setSaving(false);
    }
  }

  const inputClass =
    "border-2 border-line bg-transparent px-4 py-3 text-stellar-white outline-none focus:border-stellar-pink";
  const labelClass = "flex flex-col gap-2 text-sm text-stellar-white/80";
  const sectionClass = "grid gap-4 border-2 border-line bg-stellar-black-soft p-6";

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className={sectionClass}>
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Datos básicos</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className={labelClass}>
            Slug (url)
            <input required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="agosto-2026" className={inputClass} />
          </label>
          <label className={labelClass}>
            № de capítulo (opcional)
            <input type="number" min={1} value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Sabores (separados por coma)
            <input value={flavorNames} onChange={(e) => setFlavorNames(e.target.value)} placeholder="MANGO, LIMÓN" className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Mes (ES, ej. Agosto 2026)
            <input required value={monthLabelEs} onChange={(e) => setMonthLabelEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Mes (EN, ej. August 2026)
            <input required value={monthLabelEn} onChange={(e) => setMonthLabelEn(e.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Título de la colección (ES)
            <input required value={titleEs} onChange={(e) => setTitleEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Título de la colección (EN)
            <input required value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Hook / gancho (ES)
            <textarea required rows={2} value={hookEs} onChange={(e) => setHookEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Hook / gancho (EN)
            <textarea required rows={2} value={hookEn} onChange={(e) => setHookEn(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <div className={sectionClass}>
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Intro</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Eyebrow de sección (ES)
            <input required value={sectionEyebrowEs} onChange={(e) => setSectionEyebrowEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Eyebrow de sección (EN)
            <input required value={sectionEyebrowEn} onChange={(e) => setSectionEyebrowEn(e.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Título de sección (ES)
            <input required value={sectionTitleEs} onChange={(e) => setSectionTitleEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Título de sección (EN)
            <input required value={sectionTitleEn} onChange={(e) => setSectionTitleEn(e.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Intro (ES) — un párrafo por línea
            <textarea required rows={5} value={introEs} onChange={(e) => setIntroEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Intro (EN) — un párrafo por línea
            <textarea required rows={5} value={introEn} onChange={(e) => setIntroEn(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <div className={sectionClass}>
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Cookies de la colección</p>
        {cookies.map((c, i) => (
          <div key={i} className="grid gap-3 border border-line p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className={labelClass}>
                №
                <input value={c.number} onChange={(e) => updateCookie(i, { number: e.target.value })} className={inputClass} />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Nombre
                <input value={c.name} onChange={(e) => updateCookie(i, { name: e.target.value })} className={inputClass} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Tagline (ES)
                <input value={c.taglineEs} onChange={(e) => updateCookie(i, { taglineEs: e.target.value })} className={inputClass} />
              </label>
              <label className={labelClass}>
                Tagline (EN)
                <input value={c.taglineEn} onChange={(e) => updateCookie(i, { taglineEn: e.target.value })} className={inputClass} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Historia (ES) — un párrafo por línea
                <textarea rows={3} value={c.storyEs} onChange={(e) => updateCookie(i, { storyEs: e.target.value })} className={inputClass} />
              </label>
              <label className={labelClass}>
                Historia (EN) — un párrafo por línea
                <textarea rows={3} value={c.storyEn} onChange={(e) => updateCookie(i, { storyEn: e.target.value })} className={inputClass} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Pull quote (ES, opcional)
                <input value={c.pullQuoteEs} onChange={(e) => updateCookie(i, { pullQuoteEs: e.target.value })} className={inputClass} />
              </label>
              <label className={labelClass}>
                Pull quote (EN, opcional)
                <input value={c.pullQuoteEn} onChange={(e) => updateCookie(i, { pullQuoteEn: e.target.value })} className={inputClass} />
              </label>
            </div>
            <button type="button" onClick={() => removeCookie(i)} className="justify-self-start text-xs text-stellar-red underline">
              Quitar esta cookie
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addCookie}
          className="w-fit border-2 border-line px-4 py-2 text-xs uppercase tracking-widest text-stellar-white/80 hover:border-stellar-pink"
        >
          + Agregar cookie
        </button>
      </div>

      <div className={sectionClass}>
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Cierre</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Eyebrow de cierre (ES)
            <input required value={closingEyebrowEs} onChange={(e) => setClosingEyebrowEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Eyebrow de cierre (EN)
            <input required value={closingEyebrowEn} onChange={(e) => setClosingEyebrowEn(e.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Título de cierre (ES)
            <input required value={closingTitleEs} onChange={(e) => setClosingTitleEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Título de cierre (EN)
            <input required value={closingTitleEn} onChange={(e) => setClosingTitleEn(e.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Cierre (ES) — un párrafo por línea
            <textarea required rows={4} value={closingEs} onChange={(e) => setClosingEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Cierre (EN) — un párrafo por línea
            <textarea required rows={4} value={closingEn} onChange={(e) => setClosingEn(e.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Frase final / one-liner (ES)
            <textarea required rows={2} value={oneLinerEs} onChange={(e) => setOneLinerEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Frase final / one-liner (EN)
            <textarea required rows={2} value={oneLinerEn} onChange={(e) => setOneLinerEn(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <div className={sectionClass}>
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Imágenes</p>
        <label className={labelClass}>
          Portada (hero)
          <input type="file" accept="image/*" onChange={handleHeroUpload} className={inputClass} />
        </label>
        {uploading === "hero" && <p className="text-xs text-stellar-white/60">Subiendo...</p>}
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element -- preview de la imagen subida, URL dinámica
          <img src={heroImage} alt="" className="h-40 w-full max-w-xs object-cover" />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Texto alternativo portada (ES)
            <input required value={heroAltEs} onChange={(e) => setHeroAltEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Texto alternativo portada (EN)
            <input required value={heroAltEn} onChange={(e) => setHeroAltEn(e.target.value)} className={inputClass} />
          </label>
        </div>

        <p className="mt-2 text-sm text-stellar-white/70">Galería adicional (se muestra entre las cookies)</p>
        {gallery.map((g, i) => (
          <div key={i} className="grid gap-3 border border-line p-4">
            <input type="file" accept="image/*" onChange={(e) => handleGalleryUpload(i, e)} className={inputClass} />
            {uploading === `gallery-${i}` && <p className="text-xs text-stellar-white/60">Subiendo...</p>}
            {g.src && (
              // eslint-disable-next-line @next/next/no-img-element -- preview, URL dinámica
              <img src={g.src} alt="" className="h-32 w-48 object-cover" />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Texto alternativo (ES)
                <input value={g.altEs} onChange={(e) => updateGalleryImage(i, { altEs: e.target.value })} className={inputClass} />
              </label>
              <label className={labelClass}>
                Texto alternativo (EN)
                <input value={g.altEn} onChange={(e) => updateGalleryImage(i, { altEn: e.target.value })} className={inputClass} />
              </label>
            </div>
            <button type="button" onClick={() => removeGalleryImage(i)} className="justify-self-start text-xs text-stellar-red underline">
              Quitar esta imagen
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addGalleryImage}
          className="w-fit border-2 border-line px-4 py-2 text-xs uppercase tracking-widest text-stellar-white/80 hover:border-stellar-pink"
        >
          + Agregar imagen de galería
        </button>
      </div>

      {error && <p className="text-sm text-stellar-red">{error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={saving || uploading !== null || !heroImage}
          className="bg-stellar-pink px-6 py-3 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear historia"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="border-2 border-stellar-red px-6 py-3 font-tag text-xs font-bold uppercase tracking-widest text-stellar-red disabled:cursor-not-allowed disabled:opacity-50"
          >
            Borrar historia
          </button>
        )}
      </div>
    </form>
  );
}
