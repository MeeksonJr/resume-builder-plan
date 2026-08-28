"use client";

import React, { forwardRef } from "react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { ModernTemplate } from "./templates/modern-template";
import { MinimalTemplate } from "./templates/minimal-template";
import { ClassicTemplate } from "./templates/classic-template";
import { CreativeTemplate } from "./templates/creative-template";

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


export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>((props, ref) => {
    const store = useResumeStore();
    const { template: storeTemplate, visualConfig } = store;
    const { data } = props;

    // If data is provided, use the template from data.resume, otherwise use store template
    const template = data?.resume?.template || storeTemplate;
    const isRtl = data?.resume?.is_rtl ?? store.is_rtl;
    const language = data?.resume?.language ?? store.language;

    // Visual Config Resolvers
    const currentConfig = data?.resume?.visual_config || visualConfig;
    const accentColor = currentConfig?.accentColor || "#0070f3";
    const fontFamily = currentConfig?.fontFamily || "Inter";
    const fontSizeMap = { small: "0.875rem", standard: "1rem", large: "1.125rem" };
    const lineHeightMap = { tight: "1.2", standard: "1.5", relaxed: "1.75" };
    const marginMap = { vertical: "1rem", standard: "2.5rem", horizontal: "3.5rem" }; // Using map for nav_style/margins

    const renderTemplate = () => {
        const templateProps = { data, isRtl, language };
        switch (template) {
            case "minimal":
                return <MinimalTemplate {...templateProps} />;
            case "classic":
                return <ClassicTemplate {...templateProps} />;
            case "creative":
                return <CreativeTemplate {...templateProps} />;
            case "modern":
            default:
                return <ModernTemplate {...templateProps} />;
        }
    };

    return (
        <div
            ref={ref}
            className="print:shadow-none h-full bg-white text-black min-h-[1056px] isolate"
            dir={isRtl ? "rtl" : "ltr"}
            lang={language}
            data-theme="light"
            style={{
                colorScheme: "light",
                "--primary": hexToHsl(accentColor),
                "--ring": hexToHsl(accentColor),
                fontFamily: fontFamily,
                fontSize: fontSizeMap[(currentConfig?.fontSize || "standard") as keyof typeof fontSizeMap],
                lineHeight: lineHeightMap[(currentConfig?.lineHeight || "standard") as keyof typeof lineHeightMap],
                padding: marginMap[(currentConfig?.nav_style || "standard") as keyof typeof marginMap],
            } as React.CSSProperties}
        >
            {renderTemplate()}
        </div>
    );
});

ResumePreview.displayName = "ResumePreview";
