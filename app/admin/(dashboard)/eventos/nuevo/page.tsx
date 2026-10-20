import Link from "next/link";
import { EventForm } from "@/components/admin/event-form";
import { ConsoleShell } from "@/components/admin/console-shell";

export default function NuevoEventoPage() {
  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link href="/admin/eventos" className="text-xs text-stellar-white/60 underline underline-offset-4">
          ← Volver a eventos
        </Link>
        <h1 className="mt-2 mb-6 font-demi text-xl font-bold text-stellar-white">Nuevo evento</h1>
        <EventForm />
      </div>
    </main>
  );
}
