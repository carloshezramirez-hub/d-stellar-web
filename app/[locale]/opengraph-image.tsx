import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/brand/logos/dstellar-wordmark-white.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(135deg, #A21FFE 0%, #FF70E0 30%, #00FF00 60%, #243AD2 100%)",
            opacity: 0.22,
          }}
        />
        <img src={logoSrc} width={560} height={114} alt="" style={{ zIndex: 1 }} />
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 28,
            letterSpacing: 8,
            color: "#ffffff",
            textTransform: "uppercase",
            fontFamily: "monospace",
            zIndex: 1,
          }}
        >
          Cookies · Cacao · Condesa, CDMX
        </div>
      </div>
    ),
    { ...size },
  );
}
