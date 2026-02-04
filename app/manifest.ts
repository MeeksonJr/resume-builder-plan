import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "ResumeForge - AI Resume Builder",
        short_name: "ResumeForge",
        description: "Create professional, ATS-optimized resumes with AI assistance.",
        start_url: "/dashboard",
        display: "standalone",
        background_color: "#020617", // Slate-950
        theme_color: "#020617",       // Slate-950
        icons: [
            {
                src: "/icon.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icon-dark-32x32.png",
                sizes: "32x32",
                type: "image/png",
            },
        ],
    };
}
