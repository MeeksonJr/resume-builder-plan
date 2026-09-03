"use client";

import { useState } from "react";
import { Copy, BarChart3, Trash2, Pencil, Loader2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ResumeActionProps {
    resumeId: string;
    title?: string;
}

export function DuplicateResumeAction({ resumeId }: { resumeId: string }) {
    const router = useRouter();
    const [isDuplicating, setIsDuplicating] = useState(false);

    const handleDuplicate = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDuplicating(true);
        const loadingToast = toast.loading("Duplicating resume...");

        try {
            const response = await fetch(`/api/resumes/${resumeId}/duplicate`, {
                method: "POST",
            });

            if (!response.ok) throw new Error("Failed to duplicate");

            const data = await response.json();
            toast.success("Resume duplicated successfully", { id: loadingToast });
            router.refresh();
            router.push(`/dashboard/resume/${data.id}`);
        } catch {
            toast.error("Failed to duplicate resume", { id: loadingToast });
        } finally {
            setIsDuplicating(false);
        }
    };

    return (
        <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
            {isDuplicating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Copy className="mr-2 h-4 w-4" />
            )}
            {isDuplicating ? "Duplicating..." : "Duplicate"}
        </DropdownMenuItem>
    );
}

export function AnalyticsLinkAction({ resumeId }: { resumeId: string }) {
    const router = useRouter();

    return (
        <DropdownMenuItem onClick={() => router.push(`/dashboard/resume/${resumeId}/analytics`)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
        </DropdownMenuItem>
    );
}

export function RenameResumeAction({
    resumeId,
    currentTitle,
    onRenamed,
}: {
    resumeId: string;
    currentTitle: string;
    onRenamed?: (newTitle: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(currentTitle);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleOpen = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setTitle(currentTitle);
        setOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) {
            toast.error("Resume name cannot be blank");
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from("resumes")
                .update({
                    title: trimmed,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", resumeId);

            if (error) throw error;

            toast.success("Resume renamed successfully");
            setOpen(false);
            if (onRenamed) onRenamed(trimmed);
            router.refresh();
        } catch (err: any) {
            console.error("Rename error:", err);
            toast.error(err.message || "Failed to rename resume");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <DropdownMenuItem onClick={handleOpen}>
                <Pencil className="mr-2 h-4 w-4" />
                Rename
            </DropdownMenuItem>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-none border border-[#102b2b]/20 bg-white p-6 shadow-xl">
                    <form onSubmit={handleSave}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-[#102b2b]">
                                Rename Resume
                            </DialogTitle>
                            <DialogDescription className="text-sm text-neutral-500">
                                Give your resume a clear name to stay organized across your applications.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <Label htmlFor="resume-name" className="text-xs font-bold uppercase text-neutral-700">
                                Resume Title
                            </Label>
                            <Input
                                id="resume-name"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Senior Frontend Engineer - 2026"
                                autoFocus
                                className="mt-1.5 rounded-none border-neutral-300 font-medium text-neutral-900 focus-visible:ring-[#0d8274]"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="rounded-none border-neutral-300 hover:bg-neutral-100"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving || !title.trim()}
                                className="rounded-none bg-[#102b2b] text-white hover:bg-[#164743]"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function DeleteResumeAction({
    resumeId,
    title,
}: {
    resumeId: string;
    title: string;
}) {
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleOpen = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const { error } = await supabase.from("resumes").delete().eq("id", resumeId);
            if (error) throw error;

            toast.success(`"${title}" was deleted`);
            setOpen(false);
            router.refresh();
        } catch (err: any) {
            console.error("Delete error:", err);
            toast.error(err.message || "Failed to delete resume");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <DropdownMenuItem onClick={handleOpen} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                Delete
            </DropdownMenuItem>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="rounded-none border border-neutral-200 bg-white p-6 shadow-xl sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-neutral-900">
                            Delete Resume?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-neutral-600">
                            Are you sure you want to permanently delete{" "}
                            <span className="font-bold text-neutral-900">&ldquo;{title}&rdquo;</span>? This will
                            remove all tailored sections and disable public links. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-none border-neutral-300">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="rounded-none bg-red-600 text-white hover:bg-red-700"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Resume"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
