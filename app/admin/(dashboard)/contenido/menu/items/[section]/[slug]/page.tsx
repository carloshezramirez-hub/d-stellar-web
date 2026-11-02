import { notFound } from "next/navigation";
import { ConsoleShell } from "@/components/admin/console-shell";
import { MenuItemForm } from "@/components/admin/menu/menu-item-form";
import { getMenuSection } from "@/lib/menu-db";

export default async function EditMenuItemPage({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section: sectionSlug, slug } = await params;
  const section = await getMenuSection(sectionSlug);
  const item = section?.items.find((i) => i.slug === slug);
  if (!section || !item) notFound();

  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="mb-2 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">
          Contenido · Menú · {section.title.es}
        </p>
        <h1 className="mb-6 font-demi text-2xl font-bold text-stellar-white">Editar producto</h1>
        <MenuItemForm sectionSlug={sectionSlug} initialItem={item} />
      </div>
    </main>
  );
}
