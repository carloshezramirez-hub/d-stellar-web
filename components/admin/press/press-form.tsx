"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PressMention } from "@/lib/press-types";

export function PressForm({ initialMention }: { initialMention?: PressMention & { id: string } }) {
  const router = useRouter();
  const isEdit = Boolean(initialMention);

  const [outlet, setOutlet] = useState(initialMention?.outlet ?? "");
  const [logo, setLogo] = useState(initialMention?.logo ?? "");
  const [title, setTitle] = useState(initialMention?.title ?? "");
  const [url, setUrl] = useState(initialMention?.url ?? "");
  const [dateLabelEs, setDateLabelEs] = useState(initialMention?.dateLabel.es ?? "");
  const [dateLabelEn, setDateLabelEn] = useState(initialMention?.dateLabel.en ?? "");
  const [summaryEs, setSummaryEs] = useState(initialMention?.summary.es ?? "");
  const [summaryEn, setSummaryEn] = useState(initialMention?.summary.en ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: PressMention = {
      outlet: outlet.trim(),
      logo: logo.trim() || undefined,
      title: title.trim(),
      url: url.trim(),
      dateLabel: { es: dateLabelEs, en: dateLabelEn },
      summary: { es: summaryEs, en: summaryEn },
    };

    try {
      const requestUrl = isEdit ? `/api/admin/press/${initialMention!.id}` : "/api/admin/press";
      const res = await fetch(requestUrl, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save_failed");
      router.push("/admin/contenido/prensa");
      router.refresh();
    } catch {
      setError("No se pudo guardar la mención.");
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
        Regla dura del proyecto: solo agrega una nota que de verdad nombre &quot;d-stellar&quot; — nunca un
        roundup/listicle genérico que no lo mencione. Verifica el link antes de guardar.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Medio (outlet)
          <input required value={outlet} onChange={(e) => setOutlet(e.target.value)} className={inputClass} />
        </label>
        <label className={labelClass}>
          Logo (ruta opcional, ej. /press-logos/outlet.svg)
          <input value={logo} onChange={(e) => setLogo(e.target.value)} className={inputClass} />
        </label>
      </div>
      <label className={labelClass}>
        Título de la nota
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </label>
      <label className={labelClass}>
        URL
        <input required type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Fecha (ES, ej. Junio 2026)
          <input required value={dateLabelEs} onChange={(e) => setDateLabelEs(e.target.value)} className={inputClass} />
        </label>
        <label className={labelClass}>
          Fecha (EN, ej. June 2026)
          <input required value={dateLabelEn} onChange={(e) => setDateLabelEn(e.target.value)} className={inputClass} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Resumen (ES)
          <textarea required rows={3} value={summaryEs} onChange={(e) => setSummaryEs(e.target.value)} className={inputClass} />
        </label>
        <label className={labelClass}>
          Resumen (EN)
          <textarea required rows={3} value={summaryEn} onChange={(e) => setSummaryEn(e.target.value)} className={inputClass} />
        </label>
      </div>

      {error && <p className="text-sm text-stellar-red">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-fit bg-stellar-pink px-6 py-3 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black disabled:opacity-50"
      >
        {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar mención"}
      </button>
    </form>
  );
}
