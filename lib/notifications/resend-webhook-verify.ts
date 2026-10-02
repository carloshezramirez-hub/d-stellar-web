import { createHmac, timingSafeEqual } from "crypto";

/**
 * Resend firma sus webhooks con el formato Svix (mismo esquema que usan
 * Clerk, Stripe-compatible apps, etc.) — HMAC-SHA256 sobre
 * "<svix-id>.<svix-timestamp>.<body>", con el secreto en base64 (prefijo
 * "whsec_"). Verificado a mano para no sumar la dependencia `svix` solo por
 * esto. Ver https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests
 */
export function verifyResendWebhook(
  payload: string,
  headers: { svixId: string | null; svixTimestamp: string | null; svixSignature: string | null },
  secret: string,
): boolean {
  const { svixId, svixTimestamp, svixSignature } = headers;
  if (!svixId || !svixTimestamp || !svixSignature) return false;

  // Rechaza eventos viejos (más de 5 minutos) para frenar replay attacks.
  const timestampSeconds = Number(svixTimestamp);
  if (!timestampSeconds || Math.abs(Date.now() / 1000 - timestampSeconds) > 300) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
  const expected = createHmac("sha256", secretBytes).update(signedContent).digest("base64");
  const expectedBuf = Buffer.from(expected, "base64");

  return svixSignature
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter(Boolean)
    .some((candidate) => {
      const candidateBuf = Buffer.from(candidate, "base64");
      return candidateBuf.length === expectedBuf.length && timingSafeEqual(candidateBuf, expectedBuf);
    });
}
