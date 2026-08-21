import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CivicSignal — Community Infrastructure Response",
    short_name: "CivicSignal",
    description: "Community infrastructure incident and response hub prototype.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f9f4",
    theme_color: "#102c35",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
