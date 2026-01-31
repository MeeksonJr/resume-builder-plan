"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { History, RotateCcw, Save } from "lucide-react";
import { useResumeStore, ResumeVersion } from "@/lib/stores/resume-store";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function VersionHistory() {
    const [isOpen, setIsOpen] = useState(false);
    const { versions, loadVersions, saveVersion, restoreVersion, hasChanges } = useResumeStore();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadVersions();
        }
    }, [isOpen, loadVersions]);

    const handleSaveVersion = async () => {
        setIsSaving(true);
        try {
            await saveVersion();
            toast.success("Version saved successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save version");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRestore = (version: ResumeVersion) => {
        if (confirm("Are you sure? This will replace your current resume content with this version.")) {
            restoreVersion(version);
            setIsOpen(false);
            toast.success("Version restored successfully");
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <History className="h-4 w-4" />
                    History
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Version History</SheetTitle>
                    <SheetDescription>
                        View and restore previous versions of your resume.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-4 flex flex-col gap-4 h-[calc(100vh-120px)]">
                    <Button onClick={handleSaveVersion} disabled={isSaving} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Current Version"}
                    </Button>

                    <div className="text-xs text-muted-foreground text-center">
                        {versions.length === 0 ? "No saved versions yet." : `${versions.length} saved versions`}
                    </div>

                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <div className="space-y-4">
                            {versions.map((version) => (
                                <div
                                    key={version.id}
                                    className="flex flex-col gap-2 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-sm">
                                                {format(new Date(version.created_at), "MMM d, yyyy h:mm a")}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {version.content.profile?.full_name || "Untitled Resume"}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {version.content.workExperiences?.length || 0} Jobs
                                                </Badge>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {version.content.skills?.length || 0} Skills
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full mt-2"
                                        onClick={() => handleRestore(version)}
                                    >
                                        <RotateCcw className="mr-2 h-3 w-3" />
                                        Restore This Version
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    );
}
