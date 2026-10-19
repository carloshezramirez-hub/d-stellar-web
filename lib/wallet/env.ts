/**
 * Apple Wallet pass signing — requiere un Pass Type ID + certificado de una
 * cuenta Apple Developer Program de pago. Ver WALLET_SETUP.md para los
 * pasos exactos de cómo generar cada valor.
 */
export interface AppleWalletCerts {
  teamIdentifier: string;
  passTypeIdentifier: string;
  signerCert: Buffer;
  signerKey: Buffer;
  signerKeyPassphrase: string;
  wwdr: Buffer;
}

// passkit-generator (vía node-forge) espera PEM, no el .p12 crudo — ver
// WALLET_SETUP.md para los comandos openssl que separan
// Certificates.p12 en signerCert.pem / signerKey.pem.
export function appleWalletEnv(): AppleWalletCerts | null {
  const teamIdentifier = process.env.APPLE_TEAM_IDENTIFIER;
  const passTypeIdentifier = process.env.APPLE_PASS_TYPE_IDENTIFIER;
  const certBase64 = process.env.APPLE_PASS_CERT_BASE64;
  const keyBase64 = process.env.APPLE_PASS_KEY_BASE64;
  const wwdrBase64 = process.env.APPLE_WWDR_CERT_BASE64;

  if (!teamIdentifier || !passTypeIdentifier || !certBase64 || !keyBase64 || !wwdrBase64) {
    return null;
  }

  return {
    teamIdentifier,
    passTypeIdentifier,
    signerKeyPassphrase: process.env.APPLE_PASS_CERT_PASSWORD ?? "",
    signerCert: Buffer.from(certBase64, "base64"),
    signerKey: Buffer.from(keyBase64, "base64"),
    wwdr: Buffer.from(wwdrBase64, "base64"),
  };
}

export function isAppleWalletConfigured(): boolean {
  return appleWalletEnv() !== null;
}
