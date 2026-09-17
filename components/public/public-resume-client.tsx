"use client";

import React, { useState, useEffect, useRef } from "react";
import { ResumePreview } from "@/components/editor/resume-preview";
import { PublicResumeHeader } from "./public-resume-header";
import { MentorFeedbackDrawer } from "./mentor-feedback-drawer";
import { ResumeQrDialog } from "./resume-qr-dialog";
import { VideoElevatorPitchModal } from "./video-elevator-pitch-modal";
import { PublicDownloadButton } from "@/components/dashboard/public-download-button";
import { isRtlLanguage } from "@/lib/i18n/resume-translations";
import { Button } from "@/components/ui/button";

const RESUME_BASE_WIDTH = 800;

interface PublicResumeClientProps {
    data: any;
    candidateName: string;
    resumeCode: string;
}

export function PublicResumeClient({
    data,
    candidateName,
    resumeCode,
}: PublicResumeClientProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [isFitMode, setIsFitMode] = useState<boolean>(true);
    const [customScale, setCustomScale] = useState<number>(1);
    const [supportsZoom, setSupportsZoom] = useState<boolean>(true);
    const [language, setLanguage] = useState<string>(data?.resume?.language || "en");
    const [isRtl, setIsRtl] = useState<boolean>(
        data?.resume?.is_rtl ?? isRtlLanguage(data?.resume?.language)
    );

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        setIsRtl(isRtlLanguage(newLang));
    };

    useEffect(() => {
        if (typeof document !== "undefined") {
            setSupportsZoom("zoom" in document.documentElement.style);
        }
    }, []);

    // Observe container width
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateWidth = () => {
            if (container) setContainerWidth(container.clientWidth);
        };

        updateWidth();
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        ro.observe(container);
        return () => ro.disconnect();
    }, []);

    // Responsive fit scale: on screens narrower than 860px, automatically scale down to fit viewport nicely
    const fitScale = Math.max(
        0.35,
        Math.min(
            1.0,
            containerWidth > 48
                ? parseFloat(((containerWidth - 48) / RESUME_BASE_WIDTH).toFixed(3))
                : 0.9
        )
    );

    const activeScale = isFitMode ? fitScale : customScale;

    const localizedData = {
        ...data,
        resume: {
            ...data?.resume,
            language,
            is_rtl: isRtl,
        },
    };

    const handleZoomIn = () => {
        setIsFitMode(false);
        setCustomScale((prev) => Math.min(1.4, parseFloat((prev + 0.1).toFixed(2))));
    };

    const handleZoomOut = () => {
        setIsFitMode(false);
        setCustomScale((prev) => Math.max(0.4, parseFloat((prev - 0.1).toFixed(2))));
    };

    return (
        <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 flex flex-col">
            {/* Elevated Public Header */}
            <PublicResumeHeader
                resume={localizedData.resume}
                candidateName={candidateName}
                resumeCode={resumeCode}
                activeScale={activeScale}
                isFitMode={isFitMode}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onSetFit={() => setIsFitMode(true)}
                onSet100={() => {
                    setIsFitMode(false);
                    setCustomScale(1);
                }}
                language={language}
                onLanguageChange={handleLanguageChange}
            />

            {/* Document Viewport */}
            <main
                ref={containerRef}
                className="flex-1 py-8 px-2 sm:px-4 flex flex-col items-center justify-start overflow-x-auto print:p-0 print:overflow-visible"
            >
                {/* Scaled Resume Paper */}
                <div
                    style={
                        supportsZoom
                            ? ({
                                  width: `${RESUME_BASE_WIDTH}px`,
                                  zoom: activeScale,
                              } as any)
                            : {
                                  width: `${RESUME_BASE_WIDTH}px`,
                                  transform: `scale(${activeScale})`,
                                  transformOrigin: "top center",
                              }
                    }
                    className="bg-white shadow-xl print:shadow-none border border-neutral-200 print:border-none shrink-0 mb-8 transition-[zoom] duration-150"
                >
                    <ResumePreview data={localizedData} readOnly={true} isRtl={isRtl} language={language} />
                </div>

                {/* Footer Brand Credit */}
                <footer className="mt-12 mb-8 text-center space-y-3 print:hidden">
                    <p className="text-xs text-muted-foreground font-medium">
                        Verified candidate resume hosted securely on{" "}
                        <span className="font-semibold text-foreground">
                            ResumeForge
                        </span>
                    </p>
                    <div>
                        <a
                            href={`/?utm_source=public_resume_footer&utm_medium=referral&ref=public_resume_${data.resume?.id || 'forge'}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition-all"
                        >
                            <span>Build your own ATS-friendly resume for free</span>
                            <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </footer>
            </main>

            {/* Mobile Sticky Quick-Action Dock (visible only on sm:hidden) */}
            <div className="sm:hidden fixed bottom-3 inset-x-3 z-40 bg-[#102b2b]/95 backdrop-blur-md text-white px-3 py-2 border border-white/15 shadow-2xl flex items-center justify-between gap-2 print:hidden">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="truncate text-xs font-bold text-[#d8f36b]">{candidateName}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <VideoElevatorPitchModal
                        candidateName={candidateName}
                        roleTitle={data?.resume?.title || "Professional"}
                        summaryText={data?.resume?.summary || ""}
                    />
                    <ResumeQrDialog candidateName={candidateName} resume={data.resume} resumeCode={resumeCode} />
                    <MentorFeedbackDrawer resumeId={data.resume.id} candidateName={candidateName} />
                    <PublicDownloadButton
                        user={data.resume.user}
                        resumeId={data.resume.id}
                        title={data.resume.title}
                        resumeCode={resumeCode}
                    />
                </div>
            </div>
        </div>
    );
}
