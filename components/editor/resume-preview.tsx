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
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>((props, ref) => {
    const { template: storeTemplate } = useResumeStore();
    const { data } = props;

    // If data is provided, use the template from data.resume, otherwise use store template
    const template = data?.resume?.template || storeTemplate;

    const renderTemplate = () => {
        switch (template) {
            case "minimal":
                return <MinimalTemplate data={data} />;
            case "classic":
                return <ClassicTemplate data={data} />;
            case "modern":
            default:
                return <ModernTemplate data={data} />;
        }
    };

    return (
        <div ref={ref} className="print:shadow-none h-full bg-white text-black min-h-[1056px]">
            {renderTemplate()}
        </div>
    );
});

ResumePreview.displayName = "ResumePreview";
