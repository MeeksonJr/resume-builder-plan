"use client";

import { useState } from "react";
import { useResumeStore } from "@/lib/stores/resume-store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SaveVersionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SaveVersionDialog({ open, onOpenChange }: SaveVersionDialogProps) {
    const { saveVersion } = useResumeStore();
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) return;

        setIsSaving(true);
        try {
            await saveVersion(title, summary);
            toast.success("Version saved successfully");
            onOpenChange(false);
            setTitle("");
            setSummary("");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save version");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Save Resume Version</DialogTitle>
                    <DialogDescription>
                        Create a snapshot of your current resume. You can restore this version later.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Version Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Software Engineer V1"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="summary">Change Summary (Optional)</Label>
                        <Textarea
                            id="summary"
                            placeholder="What changed in this version?"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Version
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
