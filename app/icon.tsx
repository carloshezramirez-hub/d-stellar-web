import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0E0E10",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF2E7E">
          <path d="M12 2l2.6 7.2H22l-6 4.6 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.6h7.4z" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
