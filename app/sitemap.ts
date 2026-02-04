import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://resumeforge.com";

    // Static routes
    const routes = [
        "",
        "/auth/login",
        "/auth/signup",
        // Marketing pages
        "/features",
        "/pricing",
        "/about",
        "/blog",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    // Dynamic routes (Public Resumes/Portfolios) could be fetched here
    // For now, we return static core routes

    return [...routes];
}
