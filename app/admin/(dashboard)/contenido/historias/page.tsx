import Link from "next/link";
import { Plus } from "lucide-react";
import { ConsoleShell } from "@/components/admin/console-shell";
import { HistoriaList } from "@/components/admin/historias/historia-list";
import { listMenuHistory } from "@/lib/historias-db";

export default async function HistoriasContentPage() {
  const stories = await listMenuHistory();

  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="mb-2 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">
          Contenido · Historias
        </p>
        <h1 className="font-demi text-2xl font-bold text-stellar-white">Historias del menú</h1>
        <p className="mt-2 max-w-xl text-sm text-stellar-white/60">
          La narrativa de cada colección mensual. Se reflejan en /historias de inmediato.
        </p>

        <Link
          href="/admin/contenido/historias/nueva"
          className="mt-6 inline-flex w-fit items-center gap-1 border-2 border-line px-4 py-2 text-xs uppercase tracking-widest text-stellar-white/80 hover:border-stellar-pink"
        >
          <Plus size={14} /> Agregar historia
        </Link>

        <div className="mt-6">
          <HistoriaList stories={stories} />
        </div>
      </div>
    </main>
  );
}
