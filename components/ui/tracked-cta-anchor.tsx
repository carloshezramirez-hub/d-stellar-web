"use client";

import type { ComponentProps, MouseEvent } from "react";
import { CtaAnchor } from "@/components/ui/cta-link";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

type Props = ComponentProps<typeof CtaAnchor> & {
  event: AnalyticsEvent;
  eventParams?: Record<string, string | number>;
};

export function TrackedCtaAnchor({ event, eventParams, onClick, ...props }: Props) {
  return (
    <CtaAnchor
      {...props}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        trackEvent(event, eventParams);
        onClick?.(e);
      }}
    />
  );
}
