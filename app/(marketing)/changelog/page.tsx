"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const CHANGES = [
    {
        version: "2.1.0",
        date: "February 1, 2026",
        title: "Voice Interview Integration",
        changes: [
            "Added real-time AI Voice Interview mode.",
            "Implemented transcript analysis and scoring.",
            "New 'Simulated Call' UI with hands-free interaction.",
        ],
        type: "Major",
    },
    {
        version: "2.0.5",
        date: "January 28, 2026",
        title: "Premium Design Overhaul",
        changes: [
            "Completely redesigned Marketing pages.",
            "Added Dark Mode support with premium Slate theme.",
            "Improved mobile responsiveness for navigation.",
        ],
        type: "Enhancement",
    },
    {
        version: "1.9.0",
        date: "January 20, 2026",
        title: "Public Portfolios",
        changes: [
            "Share your resume with a public link.",
            "Added OG Tags for social sharing previews.",
            "Introduced custom themes for portfolio pages.",
        ],
        type: "Feature",
    },
];

export default function ChangelogPage() {
    return (
        <div className="py-32 bg-background min-h-screen">
            <div className="container mx-auto px-4 max-w-3xl">
                <h1 className="text-4xl font-bold mb-4">Changelog</h1>
                <p className="text-lg text-muted-foreground mb-12">
                    New updates and improvements to ResumeBuilder.
                </p>

                <div className="relative border-l border-border/50 ml-4 space-y-12">
                    {CHANGES.map((release, idx) => (
                        <div key={idx} className="relative pl-8">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-xl font-bold">{release.version}</h2>
                                        <Badge variant={release.type === "Major" ? "default" : "secondary"}>
                                            {release.type}
                                        </Badge>
                                    </div>
                                    <time className="text-sm text-muted-foreground">{release.date}</time>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold mb-3">{release.title}</h3>
                            <ul className="space-y-2">
                                {release.changes.map((change, i) => (
                                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                        <span>{change}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
