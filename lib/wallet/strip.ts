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
// real. Por eso esta imagen es solo el logo sobre un rosa oscuro plano —
// todo el texto (nombre, sellos, antigüedad) vive como campos nativos de
// Wallet — ver lib/wallet/apple-pass.ts — esos los dibuja iOS
// directamente, nunca fallan.
const BASE_WIDTH = 375;
const BASE_HEIGHT = 123;
const DARK_PINK = "#4a1636"; // rosa de marca (#ff70e0) oscurecido, plano — sin degradado

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
  const logoHeight = Math.round(20 * scale);
  const logoWidth = Math.round(logoHeight * ((logoMeta.width ?? 2458) / (logoMeta.height ?? 502)));
  const logoB64 = logoBuffer.toString("base64");
  const margin = Math.round(18 * scale);

  // En un storeCard, Wallet dibuja el primaryField (el número de sellos)
  // ENCIMA de esta imagen, abajo a la izquierda — por eso el logo va
  // arriba a la derecha, lejos de esa zona.
  const logoX = width - margin - logoWidth;
  const logoY = margin;

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${DARK_PINK}"/>
    <image x="${logoX}" y="${logoY}" width="${logoWidth}" height="${logoHeight}"
      href="data:image/png;base64,${logoB64}" />
  </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
