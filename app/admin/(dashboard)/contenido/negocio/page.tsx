import { ConsoleShell } from "@/components/admin/console-shell";
import { SiteSettingsForm } from "@/components/admin/settings/site-settings-form";
import { getSiteSettings } from "@/lib/site-settings-db";

export default async function BusinessSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="mb-2 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">
          Contenido · Negocio
        </p>
        <h1 className="font-demi text-2xl font-bold text-stellar-white">Datos del negocio</h1>
        <p className="mt-2 max-w-xl text-sm text-stellar-white/60">
          Horario, contacto y redes se usan en todo el sitio (footer, botón de WhatsApp, datos estructurados para
          Google). La dirección y los fundadores son hechos fijos y no se editan aquí.
        </p>

        <div className="mt-6">
          <SiteSettingsForm settings={settings} />
        </div>
      </div>
    </main>
  );
}
