import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Mirrors the site wordmark: a vermilion tile with a serif "A".
const SIGNAL = "#ff5433";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: SIGNAL,
          borderRadius: "3px",
        }}
      >
        <span
          style={{
            color: "#fff8f4",
            fontSize: 22,
            lineHeight: 1,
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          A
        </span>
      </div>
    </div>,
    { ...size },
  );
}
