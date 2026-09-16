/**
 * Vanity Layout & Styling Constants for Public Share Hub (/p/[slug])
 */

export interface VanityPalette {
    id: string;
    name: string;
    hex: string;
    borderClass: string;
    bgClass: string;
    description: string;
}

export const VANITY_PALETTES: VanityPalette[] = [
    {
        id: "sapphire",
        name: "Sapphire Blue",
        hex: "#2563eb",
        borderClass: "border-blue-500",
        bgClass: "bg-blue-500",
        description: "Authoritative, tech-forward, and crisp",
    },
    {
        id: "emerald",
        name: "Emerald Green",
        hex: "#059669",
        borderClass: "border-emerald-500",
        bgClass: "bg-emerald-500",
        description: "Fresh, vibrant, and growth-oriented",
    },
    {
        id: "violet",
        name: "Royal Violet",
        hex: "#7c3aed",
        borderClass: "border-purple-500",
        bgClass: "bg-purple-500",
        description: "Creative, modern, and distinctive",
    },
    {
        id: "rose",
        name: "Crimson Rose",
        hex: "#e11d48",
        borderClass: "border-rose-500",
        bgClass: "bg-rose-500",
        description: "Bold, passionate, and high-impact",
    },
    {
        id: "amber",
        name: "Warm Amber",
        hex: "#d97706",
        borderClass: "border-amber-500",
        bgClass: "bg-amber-500",
        description: "Approachable, energetic, and warm",
    },
    {
        id: "slate",
        name: "Obsidian Slate",
        hex: "#334155",
        borderClass: "border-slate-500",
        bgClass: "bg-slate-500",
        description: "Understated, minimal, and timeless",
    },
];

export type PortfolioTemplateId = "modern" | "minimal" | "corporate" | "creative";

export interface VanityTemplateOption {
    id: PortfolioTemplateId;
    name: string;
    tagline: string;
    badge: string;
}

export const VANITY_TEMPLATES: VanityTemplateOption[] = [
    {
        id: "modern",
        name: "Modern Glass",
        tagline: "Dynamic glow, glassmorphic cards, and animated pill badges",
        badge: "Popular",
    },
    {
        id: "minimal",
        name: "Clean Editorial",
        tagline: "High-contrast typography, generous spacing, and concise flow",
        badge: "Clean",
    },
    {
        id: "corporate",
        name: "Executive Suite",
        tagline: "Structured corporate header with traditional career hierarchies",
        badge: "Structured",
    },
    {
        id: "creative",
        name: "Artistic Canvas",
        tagline: "Asymmetrical layout, gradient accents, and expressive elements",
        badge: "Expressive",
    },
];

export type TypographyStyle = "sans" | "serif" | "mono";

export interface TypographyOption {
    id: TypographyStyle;
    name: string;
    cssClass: string;
    preview: string;
}

export const TYPOGRAPHY_OPTIONS: TypographyOption[] = [
    {
        id: "sans",
        name: "Modern Sans",
        cssClass: "font-sans",
        preview: "Aa Inter / Manrope",
    },
    {
        id: "serif",
        name: "Editorial Serif",
        cssClass: "font-serif",
        preview: "Aa Playfair / Merriweather",
    },
    {
        id: "mono",
        name: "Code Mono",
        cssClass: "font-mono",
        preview: "Aa JetBrains Mono",
    },
];

export interface ShareLinks {
    fullUrl: string;
    linkedin: string;
    twitter: string;
    whatsapp: string;
    email: string;
    qrCodeUrl: string;
}

/**
 * Builds standard social share URLs and QR code image URL for a given slug & candidate title.
 */
export function generateShareLinks(slug: string, candidateName: string, baseUrl?: string): ShareLinks {
    const origin = baseUrl || (typeof window !== "undefined" ? window.location.origin : "https://resumeforge.ai");
    const fullUrl = `${origin}/p/${slug}`;
    const encodedUrl = encodeURIComponent(fullUrl);
    const text = `Take a look at ${candidateName}'s verified professional portfolio & career showcase on ResumeForge:`;
    const encodedText = encodeURIComponent(text);

    return {
        fullUrl,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
        email: `mailto:?subject=${encodeURIComponent(`${candidateName} - Verified Professional Portfolio`)}&body=${encodedText}%0A%0A${encodedUrl}`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodedUrl}&format=png`,
    };
}
