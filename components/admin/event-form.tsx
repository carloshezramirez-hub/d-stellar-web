"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventRecord, EventTicket } from "@/lib/events-types";

const CDMX_OFFSET = "-06:00";

/** "2026-10-17T19:00:00-06:00" (o cualquier ISO) -> "2026-10-17T19:00" en hora de CDMX, para un <input type="datetime-local">. */
function isoToCdmxLocalInput(iso: string): string {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** "2026-10-17T19:00" (valor de un datetime-local, hora de CDMX) -> ISO con offset -06:00. */
function cdmxLocalInputToISO(value: string): string {
  return `${value}:00${CDMX_OFFSET}`;
}

type TicketForm = {
  nameEs: string;
  nameEn: string;
  priceMXN: string;
  includesEs: string;
  includesEn: string;
  noteEs: string;
  noteEn: string;
};

type SessionForm = { localValue: string; soldOut: boolean };

function ticketToForm(t: EventTicket): TicketForm {
  return {
    nameEs: t.name.es,
    nameEn: t.name.en,
    priceMXN: String(t.priceMXN),
    includesEs: t.includes.es.join("\n"),
    includesEn: t.includes.en.join("\n"),
    noteEs: t.note?.es ?? "",
    noteEn: t.note?.en ?? "",
  };
}

function emptyTicket(): TicketForm {
  return { nameEs: "", nameEn: "", priceMXN: "", includesEs: "", includesEn: "", noteEs: "", noteEn: "" };
}

type DateMode = "exact" | "no-time" | "month-only";

function initialDateMode(event?: EventRecord): DateMode {
  if (!event) return "exact";
  if (!event.dateISO) return "month-only";
  return event.timeKnown === false ? "no-time" : "exact";
}

export function EventForm({ initialEvent }: { initialEvent?: EventRecord }) {
  const router = useRouter();
  const isEdit = Boolean(initialEvent);

  const [slug, setSlug] = useState(initialEvent?.slug ?? "");
  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [dateMode, setDateMode] = useState<DateMode>(initialDateMode(initialEvent));
  const [dateLocal, setDateLocal] = useState(initialEvent?.dateISO ? isoToCdmxLocalInput(initialEvent.dateISO) : "");
  const [endLocal, setEndLocal] = useState(initialEvent?.endISO ? isoToCdmxLocalInput(initialEvent.endISO) : "");
  const [monthLabelEs, setMonthLabelEs] = useState(initialEvent?.monthLabel?.es ?? "");
  const [monthLabelEn, setMonthLabelEn] = useState(initialEvent?.monthLabel?.en ?? "");

  const [sessions, setSessions] = useState<SessionForm[]>(
    (initialEvent?.sessionDates ?? []).map((iso) => ({
      localValue: isoToCdmxLocalInput(iso),
      soldOut: initialEvent?.soldOutSessionDates?.includes(iso) ?? false,
    })),
  );
  const [datesSummaryEs, setDatesSummaryEs] = useState(initialEvent?.datesSummary?.es ?? "");
  const [datesSummaryEn, setDatesSummaryEn] = useState(initialEvent?.datesSummary?.en ?? "");
  const [doorsNoteEs, setDoorsNoteEs] = useState(initialEvent?.doorsNote?.es ?? "");
  const [doorsNoteEn, setDoorsNoteEn] = useState(initialEvent?.doorsNote?.en ?? "");

  const [summaryEs, setSummaryEs] = useState(initialEvent?.summary.es ?? "");
  const [summaryEn, setSummaryEn] = useState(initialEvent?.summary.en ?? "");
  const [descriptionEs, setDescriptionEs] = useState(initialEvent?.description.es.join("\n") ?? "");
  const [descriptionEn, setDescriptionEn] = useState(initialEvent?.description.en.join("\n") ?? "");
  const [includesEs, setIncludesEs] = useState(initialEvent?.includes?.es.join("\n") ?? "");
  const [includesEn, setIncludesEn] = useState(initialEvent?.includes?.en.join("\n") ?? "");

  const [capacity, setCapacity] = useState(initialEvent?.capacity != null ? String(initialEvent.capacity) : "");
  const [pricingMode, setPricingMode] = useState<"single" | "tiers">(initialEvent?.tickets?.length ? "tiers" : "single");
  const [priceMXN, setPriceMXN] = useState(initialEvent?.priceMXN != null ? String(initialEvent.priceMXN) : "");
  const [tickets, setTickets] = useState<TicketForm[]>(initialEvent?.tickets?.map(ticketToForm) ?? []);

  const [coverImage, setCoverImage] = useState(initialEvent?.coverImage ?? "");
  const [galleryImages, setGalleryImages] = useState<string[]>(initialEvent?.galleryImages ?? []);
  const [imageAltEs, setImageAltEs] = useState(initialEvent?.imageAlt.es ?? "");
  const [imageAltEn, setImageAltEn] = useState(initialEvent?.imageAlt.en ?? "");

  const [status, setStatus] = useState<"upcoming" | "past">(initialEvent?.status ?? "upcoming");
  const [externalUrl, setExternalUrl] = useState(initialEvent?.externalUrl ?? "");

  const [uploading, setUploading] = useState<"cover" | "gallery" | null>(null);
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

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("cover");
    try {
      setCoverImage(await uploadFile(file));
    } catch {
      setError("No se pudo subir la imagen.");
    } finally {
      setUploading(null);
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading("gallery");
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setGalleryImages((prev) => [...prev, ...urls]);
    } catch {
      setError("No se pudieron subir una o más imágenes.");
    } finally {
      setUploading(null);
    }
  }

  function addSession() {
    setSessions((prev) => [...prev, { localValue: "", soldOut: false }]);
  }
  function updateSession(i: number, patch: Partial<SessionForm>) {
    setSessions((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function removeSession(i: number) {
    setSessions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addTicket() {
    setTickets((prev) => [...prev, emptyTicket()]);
  }
  function updateTicket(i: number, patch: Partial<TicketForm>) {
    setTickets((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function removeTicket(i: number) {
    setTickets((prev) => prev.filter((_, idx) => idx !== i));
  }

  function buildPayload(): EventRecord {
    const sessionISOs = sessions.filter((s) => s.localValue).map((s) => cdmxLocalInputToISO(s.localValue));
    const soldOutISOs = sessions.filter((s) => s.localValue && s.soldOut).map((s) => cdmxLocalInputToISO(s.localValue));

    const dateISO =
      dateMode === "month-only"
        ? undefined
        : sessionISOs.length > 0
          ? sessionISOs[0]
          : dateLocal
            ? cdmxLocalInputToISO(dateLocal)
            : undefined;

    return {
      slug: slug.trim(),
      title: title.trim(),
      dateISO,
      endISO: endLocal ? cdmxLocalInputToISO(endLocal) : undefined,
      timeKnown: dateMode === "no-time" ? false : true,
      monthLabel: dateMode === "month-only" ? { es: monthLabelEs, en: monthLabelEn } : undefined,
      sessionDates: sessionISOs.length ? sessionISOs : undefined,
      soldOutSessionDates: soldOutISOs.length ? soldOutISOs : undefined,
      datesSummary: datesSummaryEs || datesSummaryEn ? { es: datesSummaryEs, en: datesSummaryEn } : undefined,
      doorsNote: doorsNoteEs || doorsNoteEn ? { es: doorsNoteEs, en: doorsNoteEn } : undefined,
      summary: { es: summaryEs, en: summaryEn },
      description: {
        es: descriptionEs.split("\n").map((s) => s.trim()).filter(Boolean),
        en: descriptionEn.split("\n").map((s) => s.trim()).filter(Boolean),
      },
      includes:
        includesEs || includesEn
          ? {
              es: includesEs.split("\n").map((s) => s.trim()).filter(Boolean),
              en: includesEn.split("\n").map((s) => s.trim()).filter(Boolean),
            }
          : undefined,
      capacity: capacity ? Number(capacity) : undefined,
      priceMXN: pricingMode === "single" && priceMXN ? Number(priceMXN) : undefined,
      tickets:
        pricingMode === "tiers" && tickets.length
          ? tickets.map((t) => ({
              name: { es: t.nameEs, en: t.nameEn },
              priceMXN: Number(t.priceMXN) || 0,
              includes: {
                es: t.includesEs.split("\n").map((s) => s.trim()).filter(Boolean),
                en: t.includesEn.split("\n").map((s) => s.trim()).filter(Boolean),
              },
              note: t.noteEs || t.noteEn ? { es: t.noteEs, en: t.noteEn } : undefined,
            }))
          : undefined,
      coverImage,
      galleryImages: galleryImages.length ? galleryImages : undefined,
      imageAlt: { es: imageAltEs, en: imageAltEn },
      status,
      externalUrl: externalUrl || undefined,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload();
      const url = isEdit ? `/api/admin/events/${initialEvent!.slug}` : "/api/admin/events";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save_failed");
      router.push("/admin/eventos");
      router.refresh();
    } catch {
      setError("No se pudo guardar el evento.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialEvent) return;
    if (!confirm(`¿Borrar "${initialEvent.title}"? Esto no se puede deshacer.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/events/${initialEvent.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete_failed");
      router.push("/admin/eventos");
      router.refresh();
    } catch {
      setError("No se pudo borrar el evento.");
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
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Título
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Slug (url)
            <input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="mi-evento"
              className={inputClass}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Estatus
            <select value={status} onChange={(e) => setStatus(e.target.value as "upcoming" | "past")} className={inputClass}>
              <option value="upcoming">Próximo</option>
              <option value="past">Pasado</option>
            </select>
          </label>
          <label className={labelClass}>
            Capacidad
            <input
              type="number"
              min={0}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        <label className={labelClass}>
          URL externa (Instagram, opcional)
          <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} className={inputClass} />
        </label>
      </div>

      <div className={sectionClass}>
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Fecha</p>
        <label className={labelClass}>
          ¿Qué tanto se sabe de la fecha?
          <select value={dateMode} onChange={(e) => setDateMode(e.target.value as DateMode)} className={inputClass}>
            <option value="exact">Fecha y hora exactas</option>
            <option value="no-time">Día confirmado, hora no</option>
            <option value="month-only">Solo mes aproximado (sin día)</option>
          </select>
        </label>

        {dateMode === "month-only" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Mes aproximado (ES)
              <input value={monthLabelEs} onChange={(e) => setMonthLabelEs(e.target.value)} placeholder="Julio 2026" className={inputClass} />
            </label>
            <label className={labelClass}>
              Mes aproximado (EN)
              <input value={monthLabelEn} onChange={(e) => setMonthLabelEn(e.target.value)} placeholder="July 2026" className={inputClass} />
            </label>
          </div>
        ) : (
          <>
            {sessions.length === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Inicio (hora CDMX)
                  <input
                    type="datetime-local"
                    required
                    value={dateLocal}
                    onChange={(e) => setDateLocal(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Fin (hora CDMX, opcional)
                  <input
                    type="datetime-local"
                    value={endLocal}
                    onChange={(e) => setEndLocal(e.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>
            )}

            <div>
              <p className="text-sm text-stellar-white/70">
                Sesiones múltiples (opcional) — si el evento se repite varias noches, agrega cada una aquí en vez de
                llenar &quot;Inicio&quot; arriba.
              </p>
              <div className="mt-3 grid gap-2">
                {sessions.map((s, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-3">
                    <input
                      type="datetime-local"
                      value={s.localValue}
                      onChange={(e) => updateSession(i, { localValue: e.target.value })}
                      className={inputClass}
                    />
                    <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-stellar-white/70">
                      <input
                        type="checkbox"
                        checked={s.soldOut}
                        onChange={(e) => updateSession(i, { soldOut: e.target.checked })}
                      />
                      Agotada
                    </label>
                    <button type="button" onClick={() => removeSession(i)} className="text-xs text-stellar-red underline">
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSession}
                className="mt-3 border-2 border-line px-4 py-2 text-xs uppercase tracking-widest text-stellar-white/80 hover:border-stellar-pink"
              >
                + Agregar sesión
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Resumen de fechas override (ES, opcional)
                <input value={datesSummaryEs} onChange={(e) => setDatesSummaryEs(e.target.value)} className={inputClass} />
              </label>
              <label className={labelClass}>
                Resumen de fechas override (EN, opcional)
                <input value={datesSummaryEn} onChange={(e) => setDatesSummaryEn(e.target.value)} className={inputClass} />
              </label>
            </div>
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Nota de puerta (ES, opcional)
            <input value={doorsNoteEs} onChange={(e) => setDoorsNoteEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Nota de puerta (EN, opcional)
            <input value={doorsNoteEn} onChange={(e) => setDoorsNoteEn(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <div className={sectionClass}>
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Copy</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Resumen (ES)
            <textarea required rows={2} value={summaryEs} onChange={(e) => setSummaryEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Resumen (EN)
            <textarea required rows={2} value={summaryEn} onChange={(e) => setSummaryEn(e.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Descripción (ES) — un párrafo por línea
            <textarea required rows={6} value={descriptionEs} onChange={(e) => setDescriptionEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Descripción (EN) — un párrafo por línea
            <textarea required rows={6} value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Incluye (ES, opcional) — un ítem por línea
            <textarea rows={3} value={includesEs} onChange={(e) => setIncludesEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Incluye (EN, opcional) — un ítem por línea
            <textarea rows={3} value={includesEn} onChange={(e) => setIncludesEn(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <div className={sectionClass}>
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Precio / boletos</p>
        <label className={labelClass}>
          Modo
          <select value={pricingMode} onChange={(e) => setPricingMode(e.target.value as "single" | "tiers")} className={inputClass}>
            <option value="single">Precio único (o evento gratis)</option>
            <option value="tiers">Niveles de boleto (ej. individual / dúo)</option>
          </select>
        </label>

        {pricingMode === "single" ? (
          <label className={labelClass}>
            Precio MXN (vacío = evento gratis)
            <input type="number" min={0} value={priceMXN} onChange={(e) => setPriceMXN(e.target.value)} className={inputClass} />
          </label>
        ) : (
          <div className="grid gap-4">
            {tickets.map((t, i) => (
              <div key={i} className="grid gap-3 border border-line p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className={labelClass}>
                    Nombre (ES)
                    <input value={t.nameEs} onChange={(e) => updateTicket(i, { nameEs: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Nombre (EN)
                    <input value={t.nameEn} onChange={(e) => updateTicket(i, { nameEn: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Precio MXN
                    <input
                      type="number"
                      min={0}
                      value={t.priceMXN}
                      onChange={(e) => updateTicket(i, { priceMXN: e.target.value })}
                      className={inputClass}
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Incluye (ES) — un ítem por línea
                    <textarea rows={3} value={t.includesEs} onChange={(e) => updateTicket(i, { includesEs: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Incluye (EN) — un ítem por línea
                    <textarea rows={3} value={t.includesEn} onChange={(e) => updateTicket(i, { includesEn: e.target.value })} className={inputClass} />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Nota (ES, opcional)
                    <input value={t.noteEs} onChange={(e) => updateTicket(i, { noteEs: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Nota (EN, opcional)
                    <input value={t.noteEn} onChange={(e) => updateTicket(i, { noteEn: e.target.value })} className={inputClass} />
                  </label>
                </div>
                <button type="button" onClick={() => removeTicket(i)} className="justify-self-start text-xs text-stellar-red underline">
                  Quitar este nivel
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTicket}
              className="border-2 border-line px-4 py-2 text-xs uppercase tracking-widest text-stellar-white/80 hover:border-stellar-pink"
            >
              + Agregar nivel de boleto
            </button>
          </div>
        )}
      </div>

      <div className={sectionClass}>
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Imágenes</p>
        <label className={labelClass}>
          Portada
          <input type="file" accept="image/*" onChange={handleCoverUpload} className={inputClass} />
        </label>
        {uploading === "cover" && <p className="text-xs text-stellar-white/60">Subiendo...</p>}
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element -- preview de la imagen subida, URL dinámica
          <img src={coverImage} alt="" className="h-40 w-full max-w-xs object-cover" />
        )}

        <label className={labelClass}>
          Galería adicional (opcional)
          <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className={inputClass} />
        </label>
        {uploading === "gallery" && <p className="text-xs text-stellar-white/60">Subiendo...</p>}
        {galleryImages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {galleryImages.map((url, i) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- preview, URL dinámica */}
                <img src={url} alt="" className="h-24 w-32 object-cover" />
                <button
                  type="button"
                  onClick={() => setGalleryImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute right-1 top-1 bg-stellar-black/80 px-1 text-xs text-stellar-red"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Texto alternativo (ES)
            <input required value={imageAltEs} onChange={(e) => setImageAltEs(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Texto alternativo (EN)
            <input required value={imageAltEn} onChange={(e) => setImageAltEn(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-stellar-red">{error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={saving || uploading !== null || !coverImage}
          className="bg-stellar-pink px-6 py-3 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear evento"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="border-2 border-stellar-red px-6 py-3 font-tag text-xs font-bold uppercase tracking-widest text-stellar-red disabled:cursor-not-allowed disabled:opacity-50"
          >
            Borrar evento
          </button>
        )}
      </div>
    </form>
  );
}
