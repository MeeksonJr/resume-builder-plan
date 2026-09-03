"use client";

import React, { forwardRef } from "react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { ModernTemplate } from "./templates/modern-template";
import { MinimalTemplate } from "./templates/minimal-template";
import { ClassicTemplate } from "./templates/classic-template";
import { CreativeTemplate } from "./templates/creative-template";
import { ExecutiveTemplate } from "./templates/executive-template";
import { TechnicalTemplate } from "./templates/technical-template";
import { CompactTemplate } from "./templates/compact-template";
import { ElegantTemplate } from "./templates/elegant-template";

interface ResumePreviewProps extends React.HTMLAttributes<HTMLDivElement> {
    data?: {
        resume: any;
        profile: any;
        personalInfo: any;
        workExperiences: any[];
        education: any[];
        skills: any[];
        projects: any[];
        certifications: any[];
        languages: any[];
    };
    readOnly?: boolean;
    isRtl?: boolean;
    language?: string;
}

// Helper to convert hex to HSL channels
function hexToHsl(hex: string): string {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "221.2 83.2% 53.3%"; // Default blue fallback

    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}

/** Build a proper CSS font-family string with fallbacks */
function buildFontFamily(font: string): string {
    const serifFonts = ["Merriweather", "Playfair Display", "Lora"];
    const monoFonts = ["Source Code Pro"];
    const fontName = font.includes(" ") ? `'${font}'` : font;

    if (serifFonts.includes(font)) return `${fontName}, Georgia, 'Times New Roman', serif`;
    if (monoFonts.includes(font)) return `${fontName}, 'Courier New', Courier, monospace`;
    return `${fontName}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
}

/** Map font size setting to actual CSS values with clear differences */
const FONT_SIZE_MAP: Record<string, { base: string; sm: string; xs: string; lg: string; xl: string; xxl: string; xxxl: string }> = {
    small: { base: "12px", sm: "11px", xs: "9.5px", lg: "13px", xl: "15px", xxl: "18px", xxxl: "24px" },
    standard: { base: "14px", sm: "12.5px", xs: "11px", lg: "16px", xl: "18px", xxl: "22px", xxxl: "30px" },
    large: { base: "16px", sm: "14px", xs: "12.5px", lg: "18px", xl: "21px", xxl: "26px", xxxl: "36px" },
};

/** Map line height setting to CSS value */
const LINE_HEIGHT_MAP: Record<string, string> = {
    tight: "1.25",
    standard: "1.5",
    relaxed: "1.75",
};

/** Map margin setting to CSS padding value (applied inside templates) */
const MARGIN_MAP: Record<string, string> = {
    compact: "1.25rem 1.5rem",
    vertical: "1.25rem 1.5rem",
    standard: "2.25rem 2.25rem",
    wide: "3.25rem 3.25rem",
    horizontal: "3.25rem 3.25rem",
};

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>((props, ref) => {
    const store = useResumeStore();
    const { template: storeTemplate, visualConfig } = store;
    const { data } = props;

    // If data is provided, use the template from data.resume, otherwise use store template
    const template = data?.resume?.template_id || data?.resume?.template || storeTemplate;
    const isRtl = data?.resume?.is_rtl ?? store.is_rtl;
    const language = data?.resume?.language ?? store.language;

    // Visual Config Resolvers
    const currentConfig = data?.resume?.visual_config || visualConfig;
    const accentColor = currentConfig?.accentColor || "#0070f3";
    const fontFamily = currentConfig?.fontFamily || "Inter";
    const fontSize = currentConfig?.fontSize || "standard";
    const lineHeight = currentConfig?.lineHeight || "standard";
    const marginSetting = currentConfig?.margins || currentConfig?.nav_style || "standard";

    const fontSizes = FONT_SIZE_MAP[fontSize] || FONT_SIZE_MAP.standard;
    const lineHeightValue = LINE_HEIGHT_MAP[lineHeight] || LINE_HEIGHT_MAP.standard;
    const paddingValue = MARGIN_MAP[marginSetting] || MARGIN_MAP.standard;

    const renderTemplate = () => {
        const templateProps = { data, isRtl, language };
        switch (template) {
            case "minimal":
                return <MinimalTemplate {...templateProps} />;
            case "classic":
                return <ClassicTemplate {...templateProps} />;
            case "creative":
                return <CreativeTemplate {...templateProps} />;
            case "executive":
                return <ExecutiveTemplate {...templateProps} />;
            case "technical":
                return <TechnicalTemplate {...templateProps} />;
            case "compact":
                return <CompactTemplate {...templateProps} />;
            case "elegant":
                return <ElegantTemplate {...templateProps} />;
            case "modern":
            default:
                return <ModernTemplate {...templateProps} />;
        }
    };

    return (
        <div
            ref={ref}
            className="print:shadow-none min-h-[1056px] h-auto w-full max-w-full overflow-hidden break-words [overflow-wrap:anywhere] bg-white text-black isolate resume-preview-root"
            dir={isRtl ? "rtl" : "ltr"}
            lang={language}
            data-theme="light"
            style={{
                colorScheme: "light",
                "--primary": hexToHsl(accentColor),
                "--ring": hexToHsl(accentColor),
                "--resume-accent": accentColor,
                "--resume-font": buildFontFamily(fontFamily),
                "--resume-font-base": fontSizes.base,
                "--resume-font-sm": fontSizes.sm,
                "--resume-font-xs": fontSizes.xs,
                "--resume-font-lg": fontSizes.lg,
                "--resume-font-xl": fontSizes.xl,
                "--resume-font-xxl": fontSizes.xxl,
                "--resume-font-xxxl": fontSizes.xxxl,
                "--resume-line-height": lineHeightValue,
                "--resume-padding": paddingValue,
                fontFamily: buildFontFamily(fontFamily),
                fontSize: fontSizes.base,
                lineHeight: lineHeightValue,
            } as React.CSSProperties}
        >
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        .resume-preview-root,
                        .resume-preview-root *:not(svg):not(path) {
                            font-family: var(--resume-font) !important;
                        }
                        .resume-preview-root .prose,
                        .resume-preview-root .prose-sm,
                        .resume-preview-root .prose-sm p,
                        .resume-preview-root .prose-sm ul,
                        .resume-preview-root .prose-sm li,
                        .resume-preview-root p,
                        .resume-preview-root li,
                        .resume-preview-root span {
                            line-height: var(--resume-line-height) !important;
                        }
                    `,
                }}
            />
            {renderTemplate()}
        </div>
    );
});

ResumePreview.displayName = "ResumePreview";
