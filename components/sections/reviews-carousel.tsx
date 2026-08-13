"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { ReviewQuote } from "@/data/reviews";

export function ReviewsCarousel({ reviews }: { reviews: ReviewQuote[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("press");

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-review-card]");
    const amount = (card?.offsetWidth ?? 300) + 16;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  return (
    <div className="relative mt-10">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review, i) => (
          <div
            key={i}
            data-review-card
            className="flex w-[78vw] shrink-0 snap-start flex-col gap-4 border-2 border-line bg-stellar-black-soft p-6 sm:w-[320px]"
          >
            <div className="flex items-center gap-1 text-stellar-green">
              {Array.from({ length: review.rating }).map((_, star) => (
                <Star key={star} size={14} fill="currentColor" />
              ))}
            </div>
            <p className="flex-1 text-sm leading-relaxed text-stellar-white/85">&ldquo;{review.quote}&rdquo;</p>
            <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/50">{review.author}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label={t("prevReviews")}
          className="border-2 border-line p-2 text-stellar-white transition-colors hover:border-stellar-pink hover:text-stellar-pink"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label={t("nextReviews")}
          className="border-2 border-line p-2 text-stellar-white transition-colors hover:border-stellar-pink hover:text-stellar-pink"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
