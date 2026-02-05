"use client";

import { useEffect } from "react";

export function PublicTracker({ resumeId }: { resumeId: string }) {
    useEffect(() => {
        const trackView = async () => {
            try {
                await fetch("/api/analytics/track", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        resumeId,
                        referrer: document.referrer,
                    }),
                });
            } catch (err) {
                // Ignore analytics errors
            }
        };

        trackView();
    }, [resumeId]);

    return null;
}
