import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Punto Club de Pádel", short_name: "Punto", description: "Partidos, eventos y ranking de tu club de pádel.", start_url: "/", display: "standalone", background_color: "#f6f4ec", theme_color: "#123a35", lang: "es-MX", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }, { src: "/maskable-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }] };
}
