import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
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
          background: "#0F3D2E",
        }}
      >
        <div
          style={{
            width: 440,
            height: 440,
            borderRadius: 220,
            background: "#F5B800",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0F3D2E",
            fontSize: 150,
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