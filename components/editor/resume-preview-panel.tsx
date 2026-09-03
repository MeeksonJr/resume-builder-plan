"use client";

import React, { useState, useEffect, useRef } from "react";
import { ResumePreview } from "./resume-preview";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumePreviewPanelProps {
    data?: any;
    readOnly?: boolean;
}

const RESUME_BASE_WIDTH = 800; // Standard 8.5in proportional width in pixels

export function ResumePreviewPanel({ data, readOnly }: ResumePreviewPanelProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [contentHeight, setContentHeight] = useState<number>(1056);
    const [isFitMode, setIsFitMode] = useState<boolean>(true);
    const [customScale, setCustomScale] = useState<number>(1);

    // Track container width
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateWidth = () => {
            if (container) {
                setContainerWidth(container.clientWidth);
            }
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

    // Track content height so the scaled box doesn't leave blank space
    useEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        const updateHeight = () => {
            if (content) {
                setContentHeight(Math.max(1056, content.scrollHeight));
            }
        };

        updateHeight();

        const ro = new ResizeObserver(() => {
            updateHeight();
        });

        ro.observe(content);
        return () => ro.disconnect();
    }, []);

    // Calculate auto-fit scale based on available container width
    const fitScale = Math.max(
        0.35,
        containerWidth > 32
            ? parseFloat(((containerWidth - 32) / RESUME_BASE_WIDTH).toFixed(3))
            : 0.8
    );

    // Active scale to apply
    const activeScale = isFitMode ? fitScale : customScale;

    const handleZoomIn = () => {
        setIsFitMode(false);
        setCustomScale((prev) => Math.min(1.5, parseFloat((prev + 0.1).toFixed(2))));
    };

    const handleZoomOut = () => {
        setIsFitMode(false);
        setCustomScale((prev) => Math.max(0.4, parseFloat((prev - 0.1).toFixed(2))));
    };

    const handleSetFit = () => {
        setIsFitMode(true);
    };

    const handleSet100 = () => {
        setIsFitMode(false);
        setCustomScale(1);
    };

    const scaledWidth = Math.round(RESUME_BASE_WIDTH * activeScale);
    const scaledHeight = Math.round(contentHeight * activeScale);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-neutral-100 border-l border-[#102b2b]/15">
            {/* Zoom / Scale Top Toolbar */}
            <div className="flex items-center justify-between border-b border-[#102b2b]/15 bg-white/95 px-4 py-2 shrink-0 text-xs">
                <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#52716a]">
                        Zoom
                    </span>
                    <div className="flex items-center gap-1 font-mono">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleZoomOut}
                            disabled={activeScale <= 0.4}
                            className="h-6 w-6 rounded-none text-[#102b2b] hover:bg-neutral-100"
                            title="Zoom out"
                        >
                            <ZoomOut className="h-3.5 w-3.5" />
                        </Button>
                        <span className="min-w-[42px] text-center font-bold text-[#102b2b]">
                            {Math.round(activeScale * 100)}%
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleZoomIn}
                            disabled={activeScale >= 1.5}
                            className="h-6 w-6 rounded-none text-[#102b2b] hover:bg-neutral-100"
                            title="Zoom in"
                        >
                            <ZoomIn className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <Button
                        variant={isFitMode ? "default" : "outline"}
                        size="sm"
                        onClick={handleSetFit}
                        className={cn(
                            "h-7 px-2.5 text-[10.5px] font-bold rounded-none gap-1",
                            isFitMode
                                ? "bg-[#102b2b] text-[#f8f4ec] hover:bg-[#102b2b]"
                                : "text-[#52716a] border-[#102b2b]/20 hover:bg-neutral-100"
                        )}
                        title="Fit document to available width"
                    >
                        <Maximize2 className="h-3 w-3" />
                        <span>Fit Width</span>
                    </Button>
                    <Button
                        variant={!isFitMode && customScale === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={handleSet100}
                        className={cn(
                            "h-7 px-2.5 text-[10.5px] font-bold rounded-none gap-1",
                            !isFitMode && customScale === 1
                                ? "bg-[#102b2b] text-[#f8f4ec] hover:bg-[#102b2b]"
                                : "text-[#52716a] border-[#102b2b]/20 hover:bg-neutral-100"
                        )}
                        title="View at 100% full scale"
                    >
                        <RotateCcw className="h-3 w-3" />
                        <span>100%</span>
                    </Button>
                </div>
            </div>

            {/* Scrollable Viewport */}
            <div
                ref={containerRef}
                className="relative flex-1 overflow-y-auto overflow-x-auto p-4 flex justify-center items-start scrollbar-thin scrollbar-thumb-neutral-300 hover:scrollbar-thumb-neutral-400"
                style={{ backgroundColor: "hsl(var(--muted) / 0.35)" }}
            >
                {/* Scaled Wrapper: occupies the exact visual dimensions of the scaled resume */}
                <div
                    style={{
                        width: `${scaledWidth}px`,
                        height: `${scaledHeight}px`,
                        position: "relative",
                        flexShrink: 0,
                    }}
                    className="mx-auto"
                >
                    {/* Inner Document: 800px wide, transformed smoothly from top-left */}
                    <div
                        ref={contentRef}
                        style={{
                            width: `${RESUME_BASE_WIDTH}px`,
                            minHeight: "1056px",
                            transform: `scale(${activeScale})`,
                            transformOrigin: "0 0",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            transition: isFitMode ? "transform 0.15s ease-out" : "none",
                        }}
                        className="bg-white shadow-xl border border-neutral-300/80"
                    >
                        <ResumePreview data={data} readOnly={readOnly} />
                    </div>
                </div>
            </div>
        </div>
    );
}
