import QRCode from "qrcode";

// Solo para imprimir en tienda (ver app/api/wallet/qr) — la página pública
// /fidelidad ya no muestra el QR en pantalla, no tiene sentido para alguien
// que ya está viendo la página.
export async function loyaltySignupQrPng(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    margin: 2,
    width: 1200,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
