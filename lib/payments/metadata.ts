// Mercado Pago's Payments API hands back `metadata` keys lowercased with
// separators stripped — a preference created with `eventSlug` comes back as
// `eventslug`. Every *other* metadata field in this codebase happens to be a
// single lowercase word already (code, email, items...), which is why only
// the tickets webhook (eventSlug/ticketIndex/sessionDateISO) ever hit this:
// see the 2026-10-02 incident where a real approved ticket payment silently
// failed to send either confirmation email because `metadata.eventSlug` read
// back as `undefined`.
export function getMetadataValue(metadata: Record<string, unknown>, key: string): string | undefined {
  if (key in metadata) return metadata[key] as string;
  const target = key.toLowerCase();
  for (const [k, v] of Object.entries(metadata)) {
    if (k.toLowerCase() === target) return v as string;
  }
  return undefined;
}
