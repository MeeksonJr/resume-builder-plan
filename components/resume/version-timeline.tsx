"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    GitBranch,
    Clock,
    RotateCcw,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    History,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Version {
    id: string;
    version_number: number;
    title: string;
    change_summary: string;
    created_at: string;
    version_metrics: {
        applications_sent: number;
        interviews_received: number;
        offers_received: number;
    }[];
}

interface VersionTimelineProps {
    resumeId: string;
    versions: Version[];
}

export function VersionTimeline({ resumeId, versions }: VersionTimelineProps) {
    const router = useRouter();
    const [isRestoring, setIsRestoring] = useState<string | null>(null);

    const handleRestore = async (versionId: string, versionNumber: number) => {
        if (!confirm(`Are you sure you want to restore to Version ${versionNumber}? Your current resume will be backed up first.`)) {
            return;
        }

        setIsRestoring(versionId);
        try {
            const response = await fetch(`/api/resume/${resumeId}/versions/${versionId}/restore`, {
                method: "POST",
            });

            if (!response.ok) throw new Error("Restore failed");

            toast.success("Version restored successfully!");
            router.push(`/dashboard/resume/${resumeId}/edit`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to restore version");
        } finally {
            setIsRestoring(null);
        }
    };

    const getSuccessRate = (metrics: Version["version_metrics"][0]) => {
        if (metrics.applications_sent === 0) return 0;
        return Math.round((metrics.interviews_received / metrics.applications_sent) * 100);
    };

    if (versions.length === 0) {
        return (
            <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
                <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-bold mb-2">No Version History Yet</h2>
                <p className="text-muted-foreground max-w-md">
                    Versions are automatically created when you make significant changes to your resume.
                    Start editing to create your first version!
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {versions.map((version, index) => {
                const metrics = version.version_metrics?.[0];
                const successRate = metrics ? getSuccessRate(metrics) : 0;
                const isLatest = index === 0;

                return (
                    <Card key={version.id} className={isLatest ? "border-primary" : ""}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <GitBranch className="h-4 w-4" />
                                            Version {version.version_number}
                                            {isLatest && (
                                                <Badge variant="default" className="ml-2">
                                                    Current
                                                </Badge>
                                            )}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRestore(version.id, version.version_number)}
                                    disabled={isLatest || isRestoring !== null}
                                    className="gap-2"
                                >
                                    {isRestoring === version.id ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Restoring...
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw className="h-4 w-4" />
                                            Restore
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Changes</p>
                                <p className="text-sm text-muted-foreground">{version.change_summary}</p>
                            </div>

                            {metrics && metrics.applications_sent > 0 && (
                                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        <p className="text-sm font-semibold">Performance Metrics</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Applications</p>
                                            <p className="text-2xl font-bold">{metrics.applications_sent}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Interviews</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {metrics.interviews_received}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Offers</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {metrics.offers_received}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Success Rate</p>
                                            <p className="text-2xl font-bold">{successRate}%</p>
                                        </div>
                                    </div>
                                    {successRate >= 50 ? (
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>High-performing version</span>
                                        </div>
                                    ) : successRate > 0 ? (
                                        <div className="flex items-center gap-2 text-sm text-yellow-600">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>Average performance</span>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
