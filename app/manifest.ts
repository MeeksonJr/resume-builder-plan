import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ResumeForge &bull; AI Career Workspace & Campus Portals",
    short_name: "ResumeForge",
    description: "AI-powered resume builder, Virginia collegiate career centers, and automated job matching workspace.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#102b2b",
    theme_color: "#102b2b",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
