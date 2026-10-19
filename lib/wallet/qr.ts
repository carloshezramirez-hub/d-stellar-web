import QRCode from "qrcode";

export async function loyaltySignupQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    margin: 1,
    width: 480,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export async function loyaltySignupQrPng(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    margin: 2,
    width: 1200,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
