import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const star = await readFile(join(process.cwd(), "public/brand/icons/pixel-star.png"));
  const starSrc = `data:image/png;base64,${star.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
        }}
      >
        <img src={starSrc} width={20} height={18} alt="" />
      </div>
    ),
    { ...size },
  );
}
