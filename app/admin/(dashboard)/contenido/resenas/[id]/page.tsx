import { notFound } from "next/navigation";
import { ConsoleShell } from "@/components/admin/console-shell";
import { ReviewForm } from "@/components/admin/reviews/review-form";
import { listReviews } from "@/lib/reviews-db";

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reviews = await listReviews();
  const review = reviews.find((r) => r.id === id);
  if (!review) notFound();

  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="mb-2 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">
          Contenido · Reseñas
        </p>
        <h1 className="mb-6 font-demi text-2xl font-bold text-stellar-white">Editar reseña</h1>
        <ReviewForm initialReview={review} />
      </div>
    </main>
  );
}
