import { ConsoleShell } from "@/components/admin/console-shell";
import { MenuSectionForm } from "@/components/admin/menu/menu-section-form";

export default function NewMenuSectionPage() {
  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="mb-2 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">
          Contenido · Menú
        </p>
        <h1 className="mb-6 font-demi text-2xl font-bold text-stellar-white">Nueva sección</h1>
        <MenuSectionForm />
      </div>
    </main>
  );
}
