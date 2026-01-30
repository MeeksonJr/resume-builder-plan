import React, { forwardRef } from "react";
import { useResumeStore } from "@/lib/stores/resume-store";
import { ModernTemplate } from "./templates/modern-template";
import { MinimalTemplate } from "./templates/minimal-template";

export const ResumePreview = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
    const { template } = useResumeStore();

    const renderTemplate = () => {
        switch (template) {
            case "minimal":
                return <MinimalTemplate />;
            case "modern":
            default:
                return <ModernTemplate />;
        }
    };

    return (
        <div ref={ref} className="print:shadow-none h-full bg-white text-black min-h-[1056px]">
            {renderTemplate()}
        </div>
    );
});

ResumePreview.displayName = "ResumePreview";
