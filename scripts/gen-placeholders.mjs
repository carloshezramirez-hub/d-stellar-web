import { writeFileSync, mkdirSync } from "node:fs";

const stars = (seed, count, w, h) => {
  let out = "";
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    const x = Math.round(rand() * w);
    const y = Math.round(rand() * h);
    const r = 1.5 + rand() * 2.5;
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#F7F1E4" opacity="${(0.3 + rand() * 0.5).toFixed(2)}"/>`;
  }
  return out;
};

function card({ w, h, bg1, bg2, accent, label, sub, seed }) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="30%" cy="20%" r="80%">
      <stop offset="0%" stop-color="${bg2}"/>
      <stop offset="100%" stop-color="${bg1}"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  ${stars(seed, 40, w, h)}
  <circle cx="${w - 120}" cy="120" r="60" fill="${accent}" opacity="0.35"/>
  <text x="50%" y="46%" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(h * 0.09)}" fill="#F7F1E4" font-weight="700">d-stellar<tspan fill="${accent}"> ★</tspan></text>
  <text x="50%" y="56%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(h * 0.035)}" letter-spacing="4" fill="${accent}">${label}</text>
  <text x="50%" y="94%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(h * 0.024)}" fill="#F7F1E4" opacity="0.45">${sub}</text>
</svg>`;
}

mkdirSync("public/images/events", { recursive: true });
mkdirSync("public/images/visit", { recursive: true });
mkdirSync("public/images/about", { recursive: true });

const items = [
  { file: "public/images/events/la-mas-draga-viewing-party.svg", w: 1200, h: 675, bg1: "#0E0E10", bg2: "#2a1030", accent: "#FF2E7E", label: "VIEWING PARTY", sub: "Placeholder — replace with real event photography", seed: 3 },
  { file: "public/images/events/pride-block-party.svg", w: 1200, h: 675, bg1: "#0E0E10", bg2: "#101a3a", accent: "#3B4BFF", label: "PRIDE BLOCK PARTY", sub: "Placeholder — replace with real event photography", seed: 7 },
  { file: "public/images/visit/facade.svg", w: 1200, h: 900, bg1: "#0E0E10", bg2: "#241408", accent: "#FFC72C", label: "FACHADA · PABELLÓN NUEVO LEÓN", sub: "Placeholder — replace with real storefront photo", seed: 11 },
  { file: "public/images/visit/interior.svg", w: 1200, h: 900, bg1: "#0E0E10", bg2: "#2a1030", accent: "#FF2E7E", label: "INTERIOR", sub: "Placeholder — replace with real interior photo", seed: 17 },
  { file: "public/images/visit/entrance.svg", w: 1200, h: 900, bg1: "#0E0E10", bg2: "#0d2436", accent: "#3B4BFF", label: "ENTRADA", sub: "Placeholder — replace with real entrance photo", seed: 23 },
  { file: "public/images/about/story.svg", w: 1200, h: 900, bg1: "#0E0E10", bg2: "#301616", accent: "#FF5A36", label: "THE SWEET UNIVERSE COMPANY", sub: "Placeholder — replace with real brand photography", seed: 29 },
];

for (const item of items) {
  writeFileSync(item.file, card(item));
  console.log("wrote", item.file);
}
