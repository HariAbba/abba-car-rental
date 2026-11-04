import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F3D2E",
        }}
      >
        <div
          style={{
            width: 156,
            height: 156,
            borderRadius: 78,
            background: "#F5B800",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0F3D2E",
            fontSize: 52,
            fontWeight: 900,
          }}
        >
          ABBA
        </div>
      </div>
    ),
    size
  );
}