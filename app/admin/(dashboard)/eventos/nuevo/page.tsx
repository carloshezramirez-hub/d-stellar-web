import Link from "next/link";
import { EventForm } from "@/components/admin/event-form";

export default function NuevoEventoPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-line px-6 py-4">
        <h1 className="font-demi text-sm font-bold uppercase tracking-widest text-stellar-white">Nuevo evento</h1>
        <div className="flex gap-3">
          <Link href="/admin/eventos" className="text-xs text-stellar-white/60 underline underline-offset-4">
            ← Volver a eventos
          </Link>
          <Link href="/admin" className="text-xs text-stellar-white/60 underline underline-offset-4">
            ← Volver al panel
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl p-6">
        <EventForm />
      </div>
    </main>
  );
}
