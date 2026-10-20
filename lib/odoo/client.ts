import { odooEnv } from "@/lib/odoo/env";

/**
 * Cliente mínimo de Odoo External API (JSON-RPC) — autentica con un API key
 * (no la contraseña real) generado desde Odoo → Mi perfil → Seguridad →
 * Claves API. Mismo patrón que lib/social/db.ts: uid cacheado a nivel de
 * módulo, válido mientras la instancia serverless siga caliente.
 */
let cachedUid: number | null = null;
// Promesa en vuelo (no solo el valor resuelto) — si varias llamadas piden
// login a la vez con el caché frío, Odoo las limita por rate. Compartir la
// misma promesa evita más de un login real.
let uidPromise: Promise<number> | null = null;

// Odoo responde HTTP 429 "Rate limit exceeded" ante ráfagas de peticiones
// concurrentes al mismo /jsonrpc (confirmado en vivo: con 5 llamadas a la
// vez, varias fallan) — Ventas/Home/Ideas disparan varias consultas en
// paralelo (Promise.all), así que todo rpcCall pasa por una cola que deja
// correr máximo 2 a la vez en vez de pegarle a Odoo con todo junto.
const MAX_CONCURRENT = 2;
let active = 0;
const queue: (() => void)[] = [];

async function withConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => queue.push(resolve));
  }
  active++;
  try {
    return await fn();
  } finally {
    active--;
    const next = queue.shift();
    if (next) next();
  }
}

async function rpcCall<T>(service: string, method: string, args: unknown[]): Promise<T> {
  const { url } = odooEnv;
  if (!url) throw new Error("Odoo no está configurado (ODOO_URL).");

  return withConcurrencyLimit(async () => {
    const res = await fetch(`${url}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service, method, args } }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Odoo respondió ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    if (json.error) {
      throw new Error(`Odoo RPC error: ${json.error.data?.message ?? json.error.message}`);
    }
    return json.result as T;
  });
}

async function getUid(): Promise<number> {
  if (cachedUid !== null) return cachedUid;
  if (uidPromise) return uidPromise;

  const { db, username, apiKey } = odooEnv;
  if (!db || !username || !apiKey) throw new Error("Odoo no está configurado (ODOO_DB / ODOO_USERNAME / ODOO_API_KEY).");

  uidPromise = rpcCall<number | false>("common", "login", [db, username, apiKey]).then((uid) => {
    if (!uid) throw new Error("Odoo rechazó las credenciales (login falló).");
    cachedUid = uid;
    return uid;
  });
  try {
    return await uidPromise;
  } finally {
    uidPromise = null;
  }
}

export async function odooSearchRead<T>(
  model: string,
  domain: unknown[],
  options: { fields?: string[]; order?: string; limit?: number } = {},
): Promise<T[]> {
  const { db, apiKey } = odooEnv;
  if (!db || !apiKey) throw new Error("Odoo no está configurado (ODOO_DB / ODOO_API_KEY).");
  const uid = await getUid();

  return rpcCall<T[]>("object", "execute_kw", [db, uid, apiKey, model, "search_read", [domain], options]);
}
