import { ConsoleShell } from "@/components/admin/console-shell";
import { MenuItemForm } from "@/components/admin/menu/menu-item-form";

export default async function NewMenuItemPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const { section } = await searchParams;

  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="mb-2 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">
          Contenido · Menú
        </p>
        <h1 className="mb-6 font-demi text-2xl font-bold text-stellar-white">Nuevo producto</h1>
        {section ? (
          <MenuItemForm sectionSlug={section} />
        ) : (
          <p className="text-sm text-stellar-red">Falta elegir una sección — vuelve al menú y usa &quot;Agregar producto&quot; dentro de una sección.</p>
        )}
      </div>
    </main>
  );
}
