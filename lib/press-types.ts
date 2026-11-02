export type PressMention = {
  outlet: string;
  // Official outlet logo, sourced from the outlet itself or Wikimedia
  // Commons. Rendered on a white chip so dark-text marks stay legible on
  // our dark background. Omit only when no real logo could be sourced —
  // the card then falls back to the outlet name as plain text, never a
  // fabricated mark.
  logo?: string;
  title: string;
  url: string;
  // Human-readable, deliberately not a precise ISO date — publish dates on
  // some outlets are ambiguous (published vs. updated timestamps).
  dateLabel: { es: string; en: string };
  summary: { es: string; en: string };
};
