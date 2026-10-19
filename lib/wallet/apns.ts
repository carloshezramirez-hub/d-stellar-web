import http2 from "node:http2";
import { appleWalletEnv } from "./env";

/**
 * Notifica a un dispositivo que su pase cambió, vía APNs — el mismo
 * certificado del Pass Type ID sirve para autenticar este push (no hace
 * falta un certificado APNs aparte). El payload va vacío a propósito: es
 * solo la señal para que Wallet vuelva a pedir el pase a
 * /api/wallet/v1/passes/... — ver la documentación de Apple de "Sending
 * Push Notifications for Updatable Passes".
 */
export async function sendPassUpdatePush(pushToken: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  const certs = appleWalletEnv();
  if (!certs) return { ok: false, error: "apple_wallet_not_configured" };

  return new Promise((resolve) => {
    const client = http2.connect("https://api.push.apple.com:443", {
      cert: certs.signerCert,
      key: certs.signerKey,
      passphrase: certs.signerKeyPassphrase,
    });

    client.on("error", (err) => {
      resolve({ ok: false, error: err.message });
    });

    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${pushToken}`,
      "apns-topic": certs.passTypeIdentifier,
      "apns-push-type": "background",
      "apns-priority": "5",
    });

    let status: number | undefined;
    req.on("response", (headers) => {
      status = Number(headers[":status"]);
    });

    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      client.close();
      const ok = typeof status === "number" && status >= 200 && status < 300;
      resolve({ ok, status, error: ok ? undefined : body || undefined });
    });
    req.on("error", (err) => {
      client.close();
      resolve({ ok: false, error: err.message });
    });

    req.write(JSON.stringify({}));
    req.end();
  });
}

export async function sendPassUpdatePushToAll(
  pushTokens: string[],
): Promise<Array<{ pushToken: string; ok: boolean; status?: number; error?: string }>> {
  const results = await Promise.allSettled(pushTokens.map((token) => sendPassUpdatePush(token)));
  return results.map((result, i) =>
    result.status === "fulfilled"
      ? { pushToken: pushTokens[i], ...result.value }
      : { pushToken: pushTokens[i], ok: false, error: String(result.reason) },
  );
}
