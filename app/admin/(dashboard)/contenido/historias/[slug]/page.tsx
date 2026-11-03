import { notFound } from "next/navigation";
import { ConsoleShell } from "@/components/admin/console-shell";
import { HistoriaForm } from "@/components/admin/historias/historia-form";
import { getMonthlyStory } from "@/lib/historias-db";

export default async function EditHistoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getMonthlyStory(slug);
  if (!story) notFound();

  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="mb-2 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">
          Contenido · Historias
        </p>
        <h1 className="mb-6 font-demi text-2xl font-bold text-stellar-white">Editar historia</h1>
        <HistoriaForm initialStory={story} />
      </div>
    </main>
  );
}
