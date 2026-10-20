import { odooEnv } from "@/lib/odoo/env";

/**
 * Cliente mínimo de Odoo External API (JSON-RPC) — autentica con un API key
 * (no la contraseña real) generado desde Odoo → Mi perfil → Seguridad →
 * Claves API. Mismo patrón que lib/social/db.ts: uid cacheado a nivel de
 * módulo, válido mientras la instancia serverless siga caliente.
 */
let cachedUid: number | null = null;

async function rpcCall<T>(service: string, method: string, args: unknown[]): Promise<T> {
  const { url } = odooEnv;
  if (!url) throw new Error("Odoo no está configurado (ODOO_URL).");

  const res = await fetch(`${url}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service, method, args } }),
  });
  const json = await res.json();
  if (json.error) {
    throw new Error(`Odoo RPC error: ${json.error.data?.message ?? json.error.message}`);
  }
  return json.result as T;
}

async function getUid(): Promise<number> {
  if (cachedUid !== null) return cachedUid;
  const { db, username, apiKey } = odooEnv;
  if (!db || !username || !apiKey) throw new Error("Odoo no está configurado (ODOO_DB / ODOO_USERNAME / ODOO_API_KEY).");

  const uid = await rpcCall<number | false>("common", "login", [db, username, apiKey]);
  if (!uid) throw new Error("Odoo rechazó las credenciales (login falló).");
  cachedUid = uid;
  return uid;
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
