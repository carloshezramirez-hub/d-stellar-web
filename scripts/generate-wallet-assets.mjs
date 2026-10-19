import sharp from "sharp";
import { mkdirSync } from "node:fs";

// Genera el ícono (notificaciones/Apple Watch) que pide Apple Wallet en
// 1x/2x/3x a partir del ícono de marca — ver lib/wallet/apple-pass.ts. El
// logo NO se genera aquí: vive dentro de la franja (lib/wallet/strip.ts),
// tomado directo de public/brand/logos/. Re-ejecutar si cambia el ícono:
//   node scripts/generate-wallet-assets.mjs

mkdirSync("public/wallet", { recursive: true });

const ICON_SRC = "public/brand/icons/pixel-star.png";

async function makeIcon(px, outName) {
  // El ícono fuente no es cuadrado (622x552) — se centra sobre un lienzo
  // negro cuadrado antes de reducir al tamaño final que pide Apple.
  const CANVAS = 640;
  const icon = await sharp(ICON_SRC)
    .resize({ width: Math.round(CANVAS * 0.74), height: Math.round(CANVAS * 0.74), fit: "inside" })
    .toBuffer();

  const composited = await sharp({
    create: { width: CANVAS, height: CANVAS, channels: 4, background: "#000000" },
  })
    .composite([{ input: icon, gravity: "center" }])
    .png()
    .toBuffer();

  // Resize must run in a separate pipeline — sharp applies resize to the
  // base image before compositing, regardless of call order, so chaining
  // .resize() after .composite() shrinks the canvas before the overlay runs.
  await sharp(composited).resize(px, px).png().toFile(`public/wallet/${outName}`);
}

await makeIcon(29, "icon.png");
await makeIcon(58, "icon@2x.png");
await makeIcon(87, "icon@3x.png");

console.log("Ícono de Wallet escrito en public/wallet/");
