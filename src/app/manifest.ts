import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ABBA Car Rental",
    short_name: "ABBA",
    start_url: "/trips",
    display: "standalone",
    background_color: "#0F3D2E",
    theme_color: "#0F3D2E",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}