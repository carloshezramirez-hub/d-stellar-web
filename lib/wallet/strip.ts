import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// Apple Wallet storeCard strip image — la única zona de un storeCard donde
// se puede meter arte propio (todo lo demás es backgroundColor plano).
//
// Se simplificó a propósito: cualquier <text> dibujado aquí (nombre,
// contador, etc.) sale como cuadros vacíos en producción — el runtime de
// Vercel no tiene ninguna fuente instalada para que sharp/librsvg
// rasterice texto (ni siquiera "sans-serif" genérico resuelve a nada ahí,
// aunque en local sí por los fonts del sistema). Se comprobó en iPhone
// real. Por eso esta imagen es solo el logo sobre negro plano — todo el
// texto (sellos, nivel, nombre, antigüedad) vive como campos nativos de
// Wallet — ver lib/wallet/apple-pass.ts — esos los dibuja iOS
// directamente, nunca fallan.
//
// Estilo "tarjeta de aerolínea" (Iberia Club / Flying Blue): sellos y
// nivel van arriba como headerFields nativos (izquierda/derecha), así que
// el logo queda centrado en medio de la franja, sin nada con que chocar.
const BASE_WIDTH = 375;
const BASE_HEIGHT = 123;

let logoCache: Buffer | null = null;

async function loadLogo(): Promise<Buffer> {
  if (!logoCache) {
    logoCache = await readFile(join(process.cwd(), "public/brand/logos/dstellar-wordmark-white.png"));
  }
  return logoCache;
}

export async function buildStampStrip(scale: 1 | 2 | 3): Promise<Buffer> {
  const width = BASE_WIDTH * scale;
  const height = BASE_HEIGHT * scale;

  const logoBuffer = await loadLogo();
  const logoMeta = await sharp(logoBuffer).metadata();
  const logoHeight = Math.round(26 * scale);
  const logoWidth = Math.round(logoHeight * ((logoMeta.width ?? 2458) / (logoMeta.height ?? 502)));
  const logoB64 = logoBuffer.toString("base64");

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#000000"/>
    <image x="${(width - logoWidth) / 2}" y="${(height - logoHeight) / 2}" width="${logoWidth}" height="${logoHeight}"
      href="data:image/png;base64,${logoB64}" />
  </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
