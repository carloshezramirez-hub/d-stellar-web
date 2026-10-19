import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// sharp/librsvg rasteriza el texto de la franja vía Pango + fontconfig.
// @font-face con un data URI no funciona en esta versión de librsvg (se
// probó y cae siempre a la fuente por defecto) — pero registrar la fuente
// real de marca (fonts/franklin-gothic-urw-demi.otf, la misma que usa el
// sitio) vía un fontconfig.conf mínimo apuntando a esa carpeta SÍ funciona,
// incluso seteando la variable de entorno en caliente después de importar
// sharp. Family interna de ese archivo: "FranklinGothic URW".
let registered = false;

export function ensureBrandFontRegistered(): void {
  if (registered) return;
  registered = true;

  const fontsDir = join(process.cwd(), "fonts");
  const cacheDir = "/tmp/dstellar-fontconfig-cache";
  const confPath = "/tmp/dstellar-fontconfig.conf";

  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

  const xml = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${fontsDir}</dir>
  <cachedir>${cacheDir}</cachedir>
</fontconfig>
`;
  writeFileSync(confPath, xml);
  process.env.FONTCONFIG_FILE = confPath;
}

export const BRAND_DISPLAY_FONT = "FranklinGothic URW";
