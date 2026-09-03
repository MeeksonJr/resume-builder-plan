"use client";

import React, { useState, useEffect, useRef } from "react";
import { ResumePreview } from "@/components/editor/resume-preview";
import { PublicResumeHeader } from "./public-resume-header";
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
                resume={data.resume}
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
                    <ResumePreview data={data} readOnly={true} />
                </div>

                {/* Footer Brand Credit */}
                <footer className="mt-8 mb-6 text-center space-y-2 print:hidden">
                    <p className="text-xs text-muted-foreground font-medium">
                        Verified candidate resume hosted securely on{" "}
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            ResumeForge
                        </span>
                    </p>
                    <Button variant="link" size="sm" asChild className="text-xs text-primary font-semibold">
                        <a href="/?utm_source=public_resume_footer&utm_medium=referral">
                            Build your own ATS-friendly resume for free <span aria-hidden="true">&rarr;</span>
                        </a>
                    </Button>
                </footer>
            </main>
        </div>
    );
}
