import { createHmac, timingSafeEqual } from "crypto";

export const WALLET_STAFF_SESSION_COOKIE = "wallet_staff_session";
const SESSION_DAYS = 30;
export const WALLET_STAFF_SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

export const walletStaffEnv = {
  password: process.env.WALLET_STAFF_PASSWORD,
};

export function isWalletStaffConfigured(): boolean {
  return Boolean(walletStaffEnv.password);
}

function sign(expiresAt: number, password: string): string {
  return createHmac("sha256", password).update(String(expiresAt)).digest("hex");
}

/** Cookie value = "<expiresAtMs>.<hmac>", firmada con la contraseña — sin secreto extra que gestionar. */
export function createStaffSessionCookieValue(): string | null {
  const password = walletStaffEnv.password;
  if (!password) return null;
  const expiresAt = Date.now() + WALLET_STAFF_SESSION_MAX_AGE * 1000;
  return `${expiresAt}.${sign(expiresAt, password)}`;
}

export function isValidStaffSessionCookie(value: string | undefined): boolean {
  const password = walletStaffEnv.password;
  if (!password || !value) return false;

  const [expiresAtRaw, signature] = value.split(".");
  const expiresAt = Number(expiresAtRaw);
  if (!expiresAt || !signature || Date.now() > expiresAt) return false;

  const expected = sign(expiresAt, password);
  const provided = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  return provided.length === expectedBuf.length && timingSafeEqual(provided, expectedBuf);
}
