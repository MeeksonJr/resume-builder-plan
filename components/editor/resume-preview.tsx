import React, { forwardRef } from "react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { ModernTemplate } from "./templates/modern-template";
import { MinimalTemplate } from "./templates/minimal-template";
import { ClassicTemplate } from "./templates/classic-template";

interface ResumePreviewProps extends React.HTMLAttributes<HTMLDivElement> {
    data?: {
        resume: any;
        profile: any;
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

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>((props, ref) => {
    const store = useResumeStore();
    const { template: storeTemplate } = store;
    const { data } = props;

    // If data is provided, use the template from data.resume, otherwise use store template
    const template = data?.resume?.template || storeTemplate;
    const isRtl = data?.resume?.is_rtl ?? store.is_rtl;
    const language = data?.resume?.language ?? store.language;

    const renderTemplate = () => {
        const templateProps = { data, isRtl, language };
        switch (template) {
            case "minimal":
                return <MinimalTemplate {...templateProps} />;
            case "classic":
                return <ClassicTemplate {...templateProps} />;
            case "modern":
            default:
                return <ModernTemplate {...templateProps} />;
        }
    };

    return (
        <div
            ref={ref}
            className="print:shadow-none h-full bg-white text-black min-h-[1056px]"
            dir={isRtl ? "rtl" : "ltr"}
            lang={language}
        >
            {renderTemplate()}
        </div>
    );
});

ResumePreview.displayName = "ResumePreview";
