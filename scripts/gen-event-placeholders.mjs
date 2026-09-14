import { writeFileSync, mkdirSync, readFileSync } from "node:fs";

// Official gradient combination from Manual-D-stellar.pdf ("VARIACIONES DE
// COLOR"): pink -> green -> blue, diagonal, saturated. Used here only as a
// placeholder background until real event photography is available — see
// PROJECT_NOTES.md.
function card({ w, h, label, sub, logoBase64 }) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A21FFE"/>
      <stop offset="35%" stop-color="#FF70E0"/>
      <stop offset="70%" stop-color="#00FF00"/>
      <stop offset="100%" stop-color="#243AD2"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="#000000" opacity="0.55"/>
  <image href="data:image/png;base64,${logoBase64}" x="${w / 2 - 180}" y="${h / 2 - 55}" width="360" height="74"/>
  <text x="50%" y="${h / 2 + 60}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(h * 0.035)}" letter-spacing="6" fill="#ffffff">${label}</text>
  <text x="50%" y="${h - 24}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(h * 0.022)}" fill="#ffffff" opacity="0.6">${sub}</text>
</svg>`;
}

mkdirSync("public/images/events", { recursive: true });

const logoBase64 = readFileSync("public/brand/logos/dstellar-wordmark-white.png").toString("base64");

const items = [
  { file: "public/images/events/la-mas-draga-viewing-party.svg", label: "VIEWING PARTY", sub: "Placeholder — replace with real event photography" },
  { file: "public/images/events/pride-block-party.svg", label: "PRIDE BLOCK PARTY", sub: "Placeholder — replace with real event photography" },
];

for (const item of items) {
  writeFileSync(item.file, card({ w: 1200, h: 675, label: item.label, sub: item.sub, logoBase64 }));
  console.log("wrote", item.file);
}
