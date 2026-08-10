import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Mirrors the site header logo: a signal-blue rounded square with a bold white
// "A" (components/site-header.tsx). Keep the two in sync when the brand changes.
const SIGNAL = "#0070f3";

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
          borderRadius: "6px",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 21,
            fontWeight: 800,
            lineHeight: 1,
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          A
        </span>
      </div>
    </div>,
    { ...size },
  );
}
