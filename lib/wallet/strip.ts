import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { ensureBrandFontRegistered, BRAND_DISPLAY_FONT } from "./register-brand-font";

ensureBrandFontRegistered();

// Apple Wallet storeCard strip image — la única zona de un storeCard donde
// se puede meter arte propio (todo lo demás es backgroundColor plano).
// IMPORTANTE: Wallet recorta la franja al alto que documenta Apple
// (375x123 @1x) — una franja más alta no se ve completa, se corta al
// centro (se comprobó en iPhone real). Por eso esto son solo DOS filas:
//   1) logo (izquierda) + nombre del cliente (derecha, con glow, tipografía
//      de marca)
//   2) la fila de progreso: la galleta en forma de estrella por cada sello
//      (glow rosa en las ganadas, apagada en las que faltan) terminando en
//      la cajita de regalo — "llega hasta aquí y te lo ganas"
// El nivel del cliente y "miembro desde" van como campos nativos de Wallet
// (ver lib/wallet/apple-pass.ts), no en esta imagen.
const BASE_WIDTH = 375;
const BASE_HEIGHT = 123;
const ICON_COUNT_MAX = 10;
const GLOW_RGB = { r: 255, g: 112, b: 224 }; // #FF70E0, el rosa de marca

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

let starCookieCache: Buffer | null = null;
let logoCache: Buffer | null = null;

async function loadStarCookie(): Promise<Buffer> {
  if (!starCookieCache) {
    starCookieCache = await readFile(join(process.cwd(), "public/wallet/star-cookie.png"));
  }
  return starCookieCache;
}

async function loadLogo(): Promise<Buffer> {
  if (!logoCache) {
    logoCache = await readFile(join(process.cwd(), "public/brand/logos/dstellar-wordmark-white.png"));
  }
  return logoCache;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function resizeIcon(source: Buffer, size: number): Promise<Buffer> {
  return sharp(source).resize(size, size, { fit: "contain", background: transparent }).toBuffer();
}

/** Copia apagada/desaturada para los sellos que aún no se ganan. */
async function dimIcon(source: Buffer, size: number): Promise<Buffer> {
  const { data, info } = await sharp(source)
    .resize(size, size, { fit: "contain", background: transparent })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    const luma = Math.round(out[i] * 0.3 + out[i + 1] * 0.59 + out[i + 2] * 0.11);
    out[i] = luma;
    out[i + 1] = luma;
    out[i + 2] = luma;
    out[i + 3] = Math.round(out[i + 3] * 0.35);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png()
    .toBuffer();
}

/** Icono + halo rosa fuerte detrás, sobre un lienzo más grande — sellos ya ganados. */
async function glowIcon(source: Buffer, size: number, blurPx: number): Promise<{ buffer: Buffer; pad: number }> {
  const pad = Math.round(blurPx * 2.6);
  const resized = await resizeIcon(source, size);
  const { data, info } = await sharp(resized).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const tint = Buffer.from(data);
  for (let i = 0; i < tint.length; i += 4) {
    tint[i] = GLOW_RGB.r;
    tint[i + 1] = GLOW_RGB.g;
    tint[i + 2] = GLOW_RGB.b;
    tint[i + 3] = Math.min(255, Math.round(tint[i + 3] * 1.6));
  }
  const glowLayer = await sharp(tint, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png()
    .blur(Math.max(1, blurPx))
    .toBuffer();

  const canvasSize = size + pad * 2;
  // Dos pasadas de glow (ancho tenue + angosto intenso) para un halo más
  // premium que un solo blur plano.
  const tightGlow = await sharp(tint, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png()
    .blur(Math.max(1, blurPx * 0.45))
    .toBuffer();

  const buffer = await sharp({ create: { width: canvasSize, height: canvasSize, channels: 4, background: transparent } })
    .composite([
      { input: glowLayer, left: pad, top: pad },
      { input: tightGlow, left: pad, top: pad },
      { input: resized, left: pad, top: pad },
    ])
    .png()
    .toBuffer();

  return { buffer, pad };
}

async function giftBoxIcon(size: number): Promise<Buffer> {
  const half = size / 2;
  const lidH = size * 0.22;
  const ribbonW = size * 0.16;
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="${lidH}" width="${size}" height="${size - lidH}" rx="${size * 0.06}" fill="#ffffff"/>
    <rect x="${-size * 0.04}" y="0" width="${size * 1.08}" height="${lidH}" rx="${size * 0.05}" fill="#ff70e0"/>
    <rect x="${half - ribbonW / 2}" y="0" width="${ribbonW}" height="${size}" fill="#ff70e0"/>
    <path d="M ${half} ${lidH * 0.55}
             C ${half - size * 0.28} ${lidH * 0.55}, ${half - size * 0.28} ${-size * 0.1}, ${half} ${lidH * 0.22}
             C ${half + size * 0.28} ${-size * 0.1}, ${half + size * 0.28} ${lidH * 0.55}, ${half} ${lidH * 0.55} Z"
      fill="none" stroke="#ff70e0" stroke-width="${size * 0.07}" stroke-linejoin="round"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Posiciones fijas (no aleatorias en cada render, para que no "parpadeen"
 * entre descargas) de los destellos rosa tipo "shine" sobre el fondo negro.
 * Coordenadas en fracción de width/height.
 */
const SHINE_SPOTS: Array<{ x: number; y: number; r: number; opacity: number }> = [
  { x: 0.06, y: 0.1, r: 0.3, opacity: 0.5 },
  { x: 0.85, y: 0.05, r: 0.22, opacity: 0.4 },
  { x: 0.97, y: 0.6, r: 0.2, opacity: 0.26 },
  { x: 0.5, y: 1.0, r: 0.28, opacity: 0.2 },
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

async function buildHeaderSvg(width: number, height: number, name: string): Promise<string> {
  const logoBuffer = await loadLogo();
  const logoMeta = await sharp(logoBuffer).metadata();
  const scale = width / BASE_WIDTH;
  const logoHeight = Math.round(20 * scale);
  const logoWidth = Math.round(logoHeight * ((logoMeta.width ?? 2458) / (logoMeta.height ?? 502)));
  const logoB64 = logoBuffer.toString("base64");
  const margin = Math.round(18 * scale);
  const headerY = Math.round(height * 0.26);
  const nameFontSize = Math.round(15 * scale);

  return `
    <defs>
      <filter id="nameGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="${2 * scale}" result="blur"/>
        <feFlood flood-color="#ff70e0" flood-opacity="0.9"/>
        <feComposite in2="blur" operator="in" result="glow"/>
        <feMerge>
          <feMergeNode in="glow"/>
          <feMergeNode in="glow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <image x="${margin}" y="${headerY - logoHeight / 2}" width="${logoWidth}" height="${logoHeight}"
      href="data:image/png;base64,${logoB64}" />

    <g filter="url(#nameGlow)">
      <text x="${width - margin}" y="${headerY + nameFontSize * 0.35}" text-anchor="end"
        font-family="${BRAND_DISPLAY_FONT}" font-weight="600"
        font-size="${nameFontSize}" fill="#ffffff">${escapeXml(name)}</text>
    </g>
  `;
}

function backgroundSvg(width: number, height: number, headerSvg: string): string {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#000000"/>
    ${shineSvg(width, height)}
    <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>
    ${headerSvg}
  </svg>`;
}

export async function buildStampStrip(stamps: number, stampsRequired: number, name: string, scale: 1 | 2 | 3): Promise<Buffer> {
  const width = BASE_WIDTH * scale;
  const height = BASE_HEIGHT * scale;
  const count = Math.min(stampsRequired, ICON_COUNT_MAX);
  const earned = Math.max(0, Math.min(stamps, count));

  const starSource = await loadStarCookie();
  const marginX = Math.round(18 * scale);
  const gapTarget = Math.round(5 * scale);
  const giftGap = Math.round(10 * scale);
  // count galletas + 1 cajita de regalo al final, todas del mismo tamaño,
  // repartidas en el ancho disponible.
  const slots = count + 1;
  const iconSize = Math.round((width - marginX * 2 - gapTarget * (slots - 1) - (giftGap - gapTarget)) / slots);
  const blurPx = Math.max(1, Math.round(iconSize * 0.2));

  const [emptyIcon, { buffer: filledGlow, pad }, giftIcon] = await Promise.all([
    dimIcon(starSource, iconSize),
    glowIcon(starSource, iconSize, blurPx),
    giftBoxIcon(iconSize),
  ]);

  const rowCenterY = Math.round(height * 0.72);
  const emptyTop = Math.round(rowCenterY - iconSize / 2);

  const composites: Array<{ input: Buffer; left: number; top: number }> = [];
  let left = marginX;
  for (let i = 0; i < count; i++) {
    if (i < earned) {
      composites.push({ input: filledGlow, left: left - pad, top: Math.round(rowCenterY - (iconSize + pad * 2) / 2) });
    } else {
      composites.push({ input: emptyIcon, left, top: emptyTop });
    }
    left += iconSize + gapTarget;
  }
  left += giftGap - gapTarget;
  composites.push({ input: giftIcon, left, top: emptyTop });

  const headerSvg = await buildHeaderSvg(width, height, name);

  return sharp(Buffer.from(backgroundSvg(width, height, headerSvg)))
    .composite(composites)
    .png()
    .toBuffer();
}
