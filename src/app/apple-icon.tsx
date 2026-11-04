import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0F3D2E" }}>
        <svg width="180" height="180" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r="118" fill="#F5B800" />
          <g transform="translate(130 130) scale(1.35) translate(-130 -103)">
            <rect x="74" y="58" width="112" height="70" rx="22" fill="#0F3D2E" />
            <path d="M92 96 L102 72 H158 L168 96 Z" fill="#F5B800" />
            <rect x="62" y="96" width="136" height="38" rx="12" fill="#0F3D2E" />
            <circle cx="86" cy="115" r="8" fill="#FFFFFF" />
            <circle cx="174" cy="115" r="8" fill="#FFFFFF" />
            <rect x="112" y="110" width="36" height="10" rx="3" fill="#F5B800" />
            <rect x="72" y="132" width="22" height="16" rx="4" fill="#0F3D2E" />
            <rect x="166" y="132" width="22" height="16" rx="4" fill="#0F3D2E" />
          </g>
        </svg>
      </div>
    ),
    size
  );
}