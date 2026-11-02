import Link from "next/link";
import { Plus } from "lucide-react";
import { ConsoleShell } from "@/components/admin/console-shell";
import { ReviewList } from "@/components/admin/reviews/review-list";
import { ReviewStatsForm } from "@/components/admin/reviews/review-stats-form";
import { listReviews, getReviewStats } from "@/lib/reviews-db";

export default async function ReviewsContentPage() {
  const [reviews, stats] = await Promise.all([listReviews(), getReviewStats()]);

  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="mb-2 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">
          Contenido · Reseñas
        </p>
        <h1 className="font-demi text-2xl font-bold text-stellar-white">Reseñas</h1>
        <p className="mt-2 max-w-xl text-sm text-stellar-white/60">Se reflejan en la portada de inmediato.</p>

        <div className="mt-6">
          <ReviewStatsForm stats={stats} />
        </div>

        <Link
          href="/admin/contenido/resenas/nueva"
          className="mt-6 inline-flex w-fit items-center gap-1 border-2 border-line px-4 py-2 text-xs uppercase tracking-widest text-stellar-white/80 hover:border-stellar-pink"
        >
          <Plus size={14} /> Agregar reseña
        </Link>

        <div className="mt-6">
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </main>
  );
}
