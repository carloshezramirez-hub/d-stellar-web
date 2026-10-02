"use client";

import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { trackEvent } from "@/lib/analytics";

type Props = ComponentProps<typeof Link> & { slug: string };

/** Link a /events/[slug] con tracking — separado en su propio client component porque la página de listado de eventos es un Server Component y no puede pasarle un onClick inline a Link. */
export function TrackedEventLink({ slug, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackEvent("click_event", { event: slug });
        onClick?.(e);
      }}
    />
  );
}
