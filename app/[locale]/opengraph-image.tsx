import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          background: "radial-gradient(circle at 30% 20%, #2a1030, #0e0e10 70%)",
          color: "#F7F1E4",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 96, fontWeight: 700 }}>
          d-stellar
          <svg width="64" height="64" viewBox="0 0 24 24" fill="#FF2E7E" style={{ marginLeft: 16 }}>
            <path d="M12 2l2.6 7.2H22l-6 4.6 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.6h7.4z" />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 30,
            letterSpacing: 6,
            color: "#FFC72C",
            textTransform: "uppercase",
          }}
        >
          Cookies · Cacao · Condesa
        </div>
      </div>
    ),
    { ...size },
  );
}
