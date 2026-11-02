import { ConsoleShell } from "@/components/admin/console-shell";
import { MenuSectionList } from "@/components/admin/menu/menu-section-list";
import { MenuMonthLabelForm } from "@/components/admin/menu/menu-month-label-form";
import { listMenu } from "@/lib/menu-db";
import { getSiteSettings } from "@/lib/site-settings-db";

export default async function MenuContentPage() {
  const [menu, settings] = await Promise.all([listMenu(), getSiteSettings()]);

  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="mb-2 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">
          Contenido · Menú
        </p>
        <h1 className="font-demi text-2xl font-bold text-stellar-white">Menú</h1>
        <p className="mt-2 max-w-xl text-sm text-stellar-white/60">
          Los cambios aquí se reflejan en /menu, /pickup y la portada de inmediato.
        </p>

        <div className="mt-6">
          <MenuMonthLabelForm settings={settings} />
        </div>

        <div className="mt-8">
          <MenuSectionList menu={menu} />
        </div>
      </div>
    </main>
  );
}
