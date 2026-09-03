import { VisualConfig } from "@/lib/stores/resume-store";

export type TemplateCategory =
    | "all"
    | "ats"
    | "tech"
    | "executive"
    | "minimal"
    | "creative";

export interface TemplateDefinition {
    id: string;
    name: string;
    subtitle: string;
    description: string;
    category: TemplateCategory[];
    atsScore: number;
    recommendedFor: string[];
    defaultVisualConfig: VisualConfig;
    badge?: string;
    isPro?: boolean;
}

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
    {
        id: "modern",
        name: "Modern Clean",
        subtitle: "Balanced & Versatile",
        description: "Contemporary design with crisp border accents, prominent headings, and clean inline contact badges. Excellent for all industries.",
        category: ["all", "tech", "minimal"],
        atsScore: 98,
        recommendedFor: ["Software Engineers", "Product Managers", "Operations", "General"],
        badge: "Most Popular",
        defaultVisualConfig: {
            accentColor: "#0f172a",
            fontFamily: "Inter",
            fontSize: "standard",
            lineHeight: "standard",
            margins: "standard",
            nav_style: "standard",
        },
    },
    {
        id: "classic",
        name: "Ivy League Classic",
        subtitle: "Traditional & Authoritative",
        description: "Timeless academic layout with formal serif typography, horizontal dividers, and dense bullet structure. 100% ATS parser compliant.",
        category: ["all", "ats", "executive"],
        atsScore: 100,
        recommendedFor: ["Finance", "Law", "Healthcare", "Consulting", "Government"],
        badge: "100% ATS Safe",
        defaultVisualConfig: {
            accentColor: "#1e3a8a",
            fontFamily: "Merriweather",
            fontSize: "standard",
            lineHeight: "standard",
            margins: "standard",
            nav_style: "standard",
        },
    },
    {
        id: "minimal",
        name: "Minimalist Nordic",
        subtitle: "Clean & Content-First",
        description: "Scandi-inspired aesthetic featuring generous whitespace, centered typography, and subtle hierarchy. Lets your accomplishments speak.",
        category: ["all", "minimal", "creative"],
        atsScore: 97,
        recommendedFor: ["Designers", "Writers", "Architects", "Research"],
        badge: "Editorial",
        defaultVisualConfig: {
            accentColor: "#374151",
            fontFamily: "Inter",
            fontSize: "standard",
            lineHeight: "relaxed",
            margins: "wide",
            nav_style: "horizontal",
        },
    },
    {
        id: "creative",
        name: "Creative Studio",
        subtitle: "Dynamic Two-Column",
        description: "Modern split layout with a prominent contact/skills sidebar and wide project showcase. Perfect for portfolio-driven careers.",
        category: ["all", "creative", "tech"],
        atsScore: 94,
        recommendedFor: ["UI/UX Designers", "Marketers", "Growth Leads", "Creative Tech"],
        badge: "High Impact",
        defaultVisualConfig: {
            accentColor: "#0d9488",
            fontFamily: "Outfit",
            fontSize: "standard",
            lineHeight: "standard",
            margins: "compact",
            nav_style: "vertical",
        },
    },
    {
        id: "executive",
        name: "Executive Leadership",
        subtitle: "Authoritative & Prestigious",
        description: "Designed for senior leadership with a dark header banner, serif title treatments, and structured executive milestone sections.",
        category: ["all", "executive", "ats"],
        atsScore: 99,
        recommendedFor: ["VP / Director", "C-Suite", "Founders", "Senior Management"],
        badge: "Executive",
        defaultVisualConfig: {
            accentColor: "#0f172a",
            fontFamily: "Playfair Display",
            fontSize: "standard",
            lineHeight: "standard",
            margins: "standard",
            nav_style: "standard",
        },
    },
    {
        id: "technical",
        name: "Technical Developer",
        subtitle: "Engineered for Tech Screens",
        description: "Built specifically for engineers with dedicated technical skill matrices, monospace project badges, and quantifiable impact metrics.",
        category: ["all", "tech", "ats"],
        atsScore: 99,
        recommendedFor: ["Backend Engineers", "Full Stack", "DevOps & Cloud", "Data Science"],
        badge: "Tech Recruiter Pick",
        defaultVisualConfig: {
            accentColor: "#166534",
            fontFamily: "Source Code Pro",
            fontSize: "small",
            lineHeight: "tight",
            margins: "compact",
            nav_style: "standard",
        },
    },
    {
        id: "compact",
        name: "High-Density Compact",
        subtitle: "Guaranteed 1-Page Fit",
        description: "Engineered with ultra-efficient spacing and smart layout density to pack 5+ years of experience onto a single immaculate page.",
        category: ["all", "ats", "minimal"],
        atsScore: 99,
        recommendedFor: ["Career Switchers", "Fast-Paced Tech", "Mid-Level Pros"],
        badge: "Single Page Pro",
        defaultVisualConfig: {
            accentColor: "#1d4ed8",
            fontFamily: "Roboto",
            fontSize: "small",
            lineHeight: "tight",
            margins: "compact",
            nav_style: "vertical",
        },
    },
    {
        id: "elegant",
        name: "Editorial Elegance",
        subtitle: "Sophisticated & Polished",
        description: "Harmonious pairing of refined serif headlines with a modern sans-serif body, delicate date columns, and generous breathing room.",
        category: ["all", "creative", "executive"],
        atsScore: 96,
        recommendedFor: ["Consulting", "Strategy", "Higher Education", "Publishing"],
        badge: "Premium Style",
        defaultVisualConfig: {
            accentColor: "#881337",
            fontFamily: "Lora",
            fontSize: "standard",
            lineHeight: "relaxed",
            margins: "standard",
            nav_style: "standard",
        },
    },
];

export function getTemplateById(id: string): TemplateDefinition {
    return (
        TEMPLATE_REGISTRY.find((t) => t.id === id) || TEMPLATE_REGISTRY[0]
    );
}

export function getTemplatesByCategory(category: TemplateCategory): TemplateDefinition[] {
    if (category === "all") return TEMPLATE_REGISTRY;
    return TEMPLATE_REGISTRY.filter((t) => t.category.includes(category));
}
