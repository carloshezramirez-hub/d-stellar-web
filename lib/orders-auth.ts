import { createHmac, timingSafeEqual } from "crypto";
import { analyticsDashboardEnv } from "./social/env";

// Reutiliza la misma contraseña que /analytics (ANALYTICS_DASHBOARD_PASSWORD)
// — ambas son zonas de admin internas de Carlos, no vale la pena gestionar
// un segundo secreto solo para esto.
export const ORDERS_SESSION_COOKIE = "orders_session";
const SESSION_DAYS = 30;
export const ORDERS_SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

function sign(expiresAt: number, password: string): string {
  return createHmac("sha256", password).update(String(expiresAt)).digest("hex");
}

export function createOrdersSessionCookieValue(): string | null {
  const password = analyticsDashboardEnv.password;
  if (!password) return null;
  const expiresAt = Date.now() + ORDERS_SESSION_MAX_AGE * 1000;
  return `${expiresAt}.${sign(expiresAt, password)}`;
}

export function isValidOrdersSessionCookie(value: string | undefined): boolean {
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
