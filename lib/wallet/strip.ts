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
// real. Por eso esta imagen es solo el logo sobre un fondo con destellos
// rosa (formas/gradientes, no texto — esos si renderizan bien en
// cualquier lado). Todo el texto (nombre, sellos, miembro desde, nivel)
// vive como campos nativos de Wallet — ver lib/wallet/apple-pass.ts — esos
// los dibuja iOS directamente, nunca fallan.
const BASE_WIDTH = 375;
const BASE_HEIGHT = 123;

let logoCache: Buffer | null = null;

async function loadLogo(): Promise<Buffer> {
  if (!logoCache) {
    logoCache = await readFile(join(process.cwd(), "public/brand/logos/dstellar-wordmark-white.png"));
  }
  return logoCache;
}

/**
 * Posiciones fijas (no aleatorias en cada render, para que no "parpadeen"
 * entre descargas) de los destellos rosa tipo "shine" sobre el fondo negro.
 * Coordenadas en fracción de width/height.
 */
const SHINE_SPOTS: Array<{ x: number; y: number; r: number; opacity: number }> = [
  { x: 0.1, y: 0.15, r: 0.35, opacity: 0.45 },
  { x: 0.85, y: 0.1, r: 0.3, opacity: 0.35 },
  { x: 0.95, y: 0.85, r: 0.3, opacity: 0.22 },
];

function shineSvg(width: number, height: number): string {
  const defs = SHINE_SPOTS.map(
    (spot, i) => `
      <radialGradient id="shine${i}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ff70e0" stop-opacity="${spot.opacity}"/>
        <stop offset="100%" stop-color="#ff70e0" stop-opacity="0"/>
      </radialGradient>`,
  ).join("");
  const circles = SHINE_SPOTS.map((spot, i) => {
    const r = spot.r * width;
    return `<circle cx="${spot.x * width}" cy="${spot.y * height}" r="${r}" fill="url(#shine${i})"/>`;
  }).join("");
  return `<defs>${defs}</defs>${circles}`;
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

  // En un storeCard, Wallet dibuja el primaryField ("Sellos") ENCIMA de
  // esta imagen, abajo a la izquierda — no debajo de la franja como en
  // otros tipos de pase (se comprobó en iPhone real, se encimaba con el
  // logo centrado). Por eso el logo va arriba a la derecha, lejos de esa
  // zona.
  const logoX = width - margin - logoWidth;
  const logoY = margin;

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#000000"/>
    ${shineSvg(width, height)}
    <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>
    <image x="${logoX}" y="${logoY}" width="${logoWidth}" height="${logoHeight}"
      href="data:image/png;base64,${logoB64}" />
  </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
