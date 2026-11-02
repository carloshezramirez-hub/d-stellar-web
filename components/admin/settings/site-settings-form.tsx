"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HoursException, SiteSettings } from "@/lib/site-settings-types";

const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();

  const [opens, setOpens] = useState(settings.hours.opens);
  const [closes, setCloses] = useState(settings.hours.closes);
  const [exceptions, setExceptions] = useState<HoursException[]>(settings.hoursExceptions);

  const [phone, setPhone] = useState(settings.phone);
  const [phoneHref, setPhoneHref] = useState(settings.phoneHref);
  const [whatsappUrl, setWhatsappUrl] = useState(settings.whatsappUrl);
  const [email, setEmail] = useState(settings.email);
  const [instagram, setInstagram] = useState(settings.social.instagram);
  const [tiktok, setTiktok] = useState(settings.social.tiktok);
  const [facebook, setFacebook] = useState(settings.social.facebook);
  const [linkedin, setLinkedin] = useState(settings.social.linkedin);

  const [seasonalDecorEnabled, setSeasonalDecorEnabled] = useState(settings.seasonalDecorEnabled);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function addException() {
    setExceptions((prev) => [...prev, { dayOfWeek: "Tuesday", opens: "11:00", closes: "19:00" }]);
  }
  function updateException(i: number, patch: Partial<HoursException>) {
    setExceptions((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }
  function removeException(i: number) {
    setExceptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const payload: SiteSettings = {
      hours: { opens, closes },
      hoursExceptions: exceptions,
      phone,
      phoneHref,
      whatsappUrl,
      email,
      social: { instagram, tiktok, facebook, linkedin },
      menuMonthLabel: settings.menuMonthLabel,
      seasonalDecorEnabled,
      seasonalDecorVariant: settings.seasonalDecorVariant,
    };

    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save_failed");
      setSaved(true);
      router.refresh();
    } finally {
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
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Horario</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Abre (horario por default)
            <input type="time" required value={opens} onChange={(e) => setOpens(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Cierra (horario por default)
            <input type="time" required value={closes} onChange={(e) => setCloses(e.target.value)} className={inputClass} />
          </label>
        </div>

        <div className="grid gap-2">
          <p className="text-sm text-stellar-white/70">Excepciones por día (ej. martes abre más tarde)</p>
          {exceptions.map((exception, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3">
              <select
                value={exception.dayOfWeek}
                onChange={(e) => updateException(i, { dayOfWeek: e.target.value })}
                className={`${inputClass} py-2`}
              >
                {DAY_OPTIONS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <input type="time" value={exception.opens} onChange={(e) => updateException(i, { opens: e.target.value })} className={`${inputClass} py-2`} />
              <input type="time" value={exception.closes} onChange={(e) => updateException(i, { closes: e.target.value })} className={`${inputClass} py-2`} />
              <button type="button" onClick={() => removeException(i)} className="text-xs text-stellar-red underline">
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addException}
            className="mt-1 w-fit border-2 border-line px-4 py-2 text-xs uppercase tracking-widest text-stellar-white/80 hover:border-stellar-pink"
          >
            + Agregar excepción
          </button>
        </div>
      </div>

      <div className={sectionClass}>
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Contacto</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Teléfono (texto a mostrar)
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 55 6502 4440" className={inputClass} />
          </label>
          <label className={labelClass}>
            Teléfono (solo dígitos, para tel: y wa.me)
            <input required value={phoneHref} onChange={(e) => setPhoneHref(e.target.value)} placeholder="+525565024440" className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Link de WhatsApp
            <input required type="url" value={whatsappUrl} onChange={(e) => setWhatsappUrl(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Email
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <div className={sectionClass}>
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Redes sociales</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Instagram
            <input required type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            TikTok
            <input required type="url" value={tiktok} onChange={(e) => setTiktok(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Facebook
            <input required type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            LinkedIn
            <input required type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <div className={sectionClass}>
        <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Decoración de temporada</p>
        <label className="flex items-center gap-3 text-sm text-stellar-white/80">
          <input type="checkbox" checked={seasonalDecorEnabled} onChange={(e) => setSeasonalDecorEnabled(e.target.checked)} />
          Mostrar decoración de Día de Muertos (telaraña + vela) en todo el sitio
        </label>
        <p className="text-xs text-stellar-white/50">
          Apágala cuando termine la temporada — no hace falta tocar código ni redeploy.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-stellar-pink px-6 py-3 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        {saved && <p className="text-sm text-stellar-green">Guardado.</p>}
      </div>
    </form>
  );
}
