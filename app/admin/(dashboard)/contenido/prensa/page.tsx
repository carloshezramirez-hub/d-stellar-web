import Link from "next/link";
import { Plus } from "lucide-react";
import { ConsoleShell } from "@/components/admin/console-shell";
import { PressList } from "@/components/admin/press/press-list";
import { listPress } from "@/lib/press-db";

export default async function PressContentPage() {
  const mentions = await listPress();

  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="mb-2 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">
          Contenido · Prensa
        </p>
        <h1 className="font-demi text-2xl font-bold text-stellar-white">Prensa</h1>
        <p className="mt-2 max-w-xl text-sm text-stellar-white/60">Se reflejan en /press de inmediato.</p>

        <Link
          href="/admin/contenido/prensa/nueva"
          className="mt-6 inline-flex w-fit items-center gap-1 border-2 border-line px-4 py-2 text-xs uppercase tracking-widest text-stellar-white/80 hover:border-stellar-pink"
        >
          <Plus size={14} /> Agregar mención
        </Link>

        <div className="mt-6">
          <PressList mentions={mentions} />
        </div>
      </div>
    </main>
  );
}
