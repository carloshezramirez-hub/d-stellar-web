import { createSign } from "crypto";
import { googleEnv } from "@/lib/google/env";

/**
 * Cliente mínimo para las APIs de Google (GA4 Data API + Search Console
 * API) autenticado con una cuenta de servicio (JWT Bearer flow) — sin
 * dependencias nuevas, solo `crypto` nativo de Node para firmar el JWT.
 * Mismo espíritu que lib/odoo/client.ts: un fetch directo, sin SDK.
 */
interface ServiceAccount {
  client_email: string;
  private_key: string;
}

function base64url(input: string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

async function getAccessToken(scope: string): Promise<string> {
  const cached = tokenCache.get(scope);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  if (!googleEnv.serviceAccountJson) throw new Error("Google no está configurado (GOOGLE_SERVICE_ACCOUNT_JSON).");
  const sa: ServiceAccount = JSON.parse(googleEnv.serviceAccountJson);

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = { iss: sa.client_email, scope, aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(sa.private_key).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google OAuth error: ${JSON.stringify(data)}`);

  tokenCache.set(scope, { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 });
  return data.access_token;
}

export async function ga4RunReport(body: unknown): Promise<any> {
  const token = await getAccessToken("https://www.googleapis.com/auth/analytics.readonly");
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${googleEnv.ga4PropertyId}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`GA4 error: ${JSON.stringify(json)}`);
  return json;
}

/** GA4 Realtime API — usuarios activos ahora mismo (ventana ~30 min de GA4), endpoint distinto a :runReport. */
export async function ga4RunRealtimeReport(body: unknown): Promise<any> {
  const token = await getAccessToken("https://www.googleapis.com/auth/analytics.readonly");
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${googleEnv.ga4PropertyId}:runRealtimeReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`GA4 realtime error: ${JSON.stringify(json)}`);
  return json;
}

export async function gscSearchAnalytics(body: unknown): Promise<any> {
  const token = await getAccessToken("https://www.googleapis.com/auth/webmasters.readonly");
  const siteUrl = encodeURIComponent(googleEnv.gscSiteUrl ?? "");
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Search Console error: ${JSON.stringify(json)}`);
  return json;
}
