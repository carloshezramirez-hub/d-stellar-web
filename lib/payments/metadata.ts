// Mercado Pago's Payments API hands back `metadata` keys snake_cased — a
// preference created with `eventSlug` comes back as `event_slug`. Every
// *other* metadata field in this codebase happens to already be a single
// lowercase word (code, email, items...), which is why only the tickets
// webhook (eventSlug/ticketIndex/sessionDateISO) ever hit this: see the
// 2026-10-02 incident where a real approved ticket payment (Zoe Valdez,
// el-camino-de-regreso, payment 181926304252) silently failed to send
// either confirmation email because `metadata.eventSlug` read back as
// `undefined`. Comparing with separators stripped handles snake_case,
// camelCase and the lowercased-no-separator form MP has used in the past.
function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getMetadataValue(metadata: Record<string, unknown>, key: string): string | undefined {
  if (key in metadata) return metadata[key] as string;
  const target = normalizeKey(key);
  for (const [k, v] of Object.entries(metadata)) {
    if (normalizeKey(k) === target) return v as string;
  }
  return undefined;
}
