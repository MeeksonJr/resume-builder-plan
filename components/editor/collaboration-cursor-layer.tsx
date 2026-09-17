"use client";

import React from "react";
import type { PeerCursor } from "@/lib/collaboration/realtime-cursors";

interface CollaborationCursorLayerProps {
  cursors: PeerCursor[];
  className?: string;
}

export function CollaborationCursorLayer({ cursors, className = "" }: CollaborationCursorLayerProps) {
  if (!cursors || cursors.length === 0) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 z-30 overflow-hidden ${className}`}>
      {cursors.map((cursor) => {
        const roleLabel =
          cursor.role === "coach"
            ? "Career Coach"
            : cursor.role === "mentor"
            ? "Mentor"
            : cursor.role === "reviewer"
            ? "Reviewer"
            : "Peer";

        return (
          <div
            key={cursor.userId}
            style={{
              left: `${cursor.xPercent}%`,
              top: `${cursor.yPercent}%`,
              transition: "left 120ms ease-out, top 120ms ease-out",
            }}
            className="absolute -translate-x-1 -translate-y-1 will-change-[left,top]"
          >
            {/* SVG Mouse Pointer */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-md"
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={cursor.color || "#0d8274"}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </svg>

            {/* Peer Name & Role Label Pill */}
            <div
              style={{ backgroundColor: cursor.color || "#0d8274" }}
              className="ml-4 -mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-white shadow-md select-none text-[10px] font-bold whitespace-nowrap"
            >
              <span className="truncate max-w-[120px]">{cursor.name}</span>
              <span className="opacity-75 font-normal text-[9px]">({roleLabel})</span>
            </div>

            {/* Active Field Focus Indicator */}
            {cursor.activeField && (
              <div className="ml-4 mt-0.5 text-[9px] font-mono text-neutral-600 bg-white/90 border border-neutral-200 px-1.5 py-0.2 rounded-xs shadow-xs">
                Editing {cursor.activeField.split(".").pop()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
