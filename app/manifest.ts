import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "d-stellar — Cookies, Cacao & Events in Condesa",
    short_name: "d-stellar",
    description: "LGBTQ+ friendly cookie shop in Condesa, Mexico City — monthly rotating menu, cacao drinks and community events.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E0E10",
    theme_color: "#0E0E10",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
