import { createHmac, timingSafeEqual } from "crypto";
import { analyticsDashboardEnv } from "@/lib/social/env";

// Sesión única para todo el panel /admin (y lo que cuelga de él:
// /analytics, /pedidos, /wallet-staff) — un solo login, una sola
// contraseña (ANALYTICS_DASHBOARD_PASSWORD). Reemplaza los 3 sistemas de
// auth que existían antes (uno por sección).
export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DAYS = 30;
export const ADMIN_SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

export function isAdminAuthConfigured(): boolean {
  return Boolean(analyticsDashboardEnv.password);
}

function sign(expiresAt: number, password: string): string {
  return createHmac("sha256", password).update(String(expiresAt)).digest("hex");
}

/** Cookie value = "<expiresAtMs>.<hmac>", firmada con la contraseña — sin secreto extra que gestionar. */
export function createAdminSessionCookieValue(): string | null {
  const password = analyticsDashboardEnv.password;
  if (!password) return null;
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  return `${expiresAt}.${sign(expiresAt, password)}`;
}

export function isValidAdminSession(value: string | undefined): boolean {
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
