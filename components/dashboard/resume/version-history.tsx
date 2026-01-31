"use client";

import { useEffect, useState } from "react";
import { useResumeStore, ResumeVersion } from "@/lib/stores/resume-store";
import { format } from "date-fns";
import {
    RotateCcw,
    Clock,
    FileText,
    AlertTriangle,
    MoreVertical,
    Briefcase,
    MessageSquare,
    Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function VersionHistory() {
    const { versions, loadVersions, restoreVersion, resumeId } = useResumeStore();
    const [versionToRestore, setVersionToRestore] = useState<ResumeVersion | null>(
        null
    );

    useEffect(() => {
        if (resumeId) {
            loadVersions();
        }
    }, [resumeId, loadVersions]);

    const handleRestore = () => {
        if (versionToRestore) {
            restoreVersion(versionToRestore);
            toast.success("Version restored successfully");
            setVersionToRestore(null);
        }
    };

    if (versions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mb-4 opacity-50" />
                <p className="font-medium">No versions saved yet</p>
                <p className="text-sm">Save a version to track your changes</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <h3 className="font-semibold">Version History</h3>
                <p className="text-sm text-muted-foreground">
                    {versions.length} saved versions
                </p>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {versions.map((version) => (
                        <div
                            key={version.id}
                            className="group p-4 rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/20"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">V{version.version_number}</Badge>
                                    <span className="font-medium">{version.title}</span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => setVersionToRestore(version)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Restore this version
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                <Clock className="h-3 w-3" />
                                {format(new Date(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </div>

                            {version.metrics && (
                                <div className="flex items-center gap-4 mb-3 text-xs bg-muted/30 p-2 rounded border border-border/50">
                                    <div className="flex items-center gap-1.5" title="Applications Sent">
                                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="font-medium">{version.metrics.applications_sent}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Interviews Received">
                                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="font-medium">{version.metrics.interviews_received}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Offers Received">
                                        <Trophy className="h-3.5 w-3.5 text-emerald-500/70" />
                                        <span className="font-medium">{version.metrics.offers_received}</span>
                                    </div>
                                </div>
                            )}

                            {version.change_summary && (
                                <div className="text-sm bg-muted/50 p-2 rounded-md">
                                    <div className="flex items-center gap-1.5 mb-1 text-xs text-muted-foreground">
                                        <FileText className="h-3 w-3" />
                                        Change Summary
                                    </div>
                                    <p className="text-muted-foreground line-clamp-2">
                                        {version.change_summary}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <AlertDialog
                open={!!versionToRestore}
                onOpenChange={(open) => !open && setVersionToRestore(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore Version?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <div className="flex items-center gap-2 p-3 text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-800">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                <p className="text-sm font-medium">
                                    This will overwrite your current draft with "{versionToRestore?.title}".
                                </p>
                            </div>
                            <p>Any unsaved changes in your current draft will be lost.</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRestore}>
                            Restore Version
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
