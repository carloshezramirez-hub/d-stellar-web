import { createHmac, timingSafeEqual } from "crypto";
import { analyticsDashboardEnv } from "./env";

export const ANALYTICS_SESSION_COOKIE = "analytics_session";
const SESSION_DAYS = 30;
export const ANALYTICS_SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

function sign(expiresAt: number, password: string): string {
  return createHmac("sha256", password).update(String(expiresAt)).digest("hex");
}

/** Cookie value = "<expiresAtMs>.<hmac>", firmada con la contraseña — sin secreto extra que gestionar. */
export function createSessionCookieValue(): string | null {
  const password = analyticsDashboardEnv.password;
  if (!password) return null;
  const expiresAt = Date.now() + ANALYTICS_SESSION_MAX_AGE * 1000;
  return `${expiresAt}.${sign(expiresAt, password)}`;
}

export function isValidSessionCookie(value: string | undefined): boolean {
  const password = analyticsDashboardEnv.password;
  if (!password || !value) return false;

  const [expiresAtRaw, signature] = value.split(".");
  const expiresAt = Number(expiresAtRaw);
  if (!expiresAt || !signature || Date.now() > expiresAt) return false;

  const expected = sign(expiresAt, password);
  const provided = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  return provided.length === expectedBuf.length && timingSafeEqual(provided, expectedBuf);
}
