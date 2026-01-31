"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Globe, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/lib/stores/resume-store";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function ShareDialog() {
    const { resumeId, is_public, slug, setIsPublic, setSlug, saveAllChanges } = useResumeStore();
    const [isOpen, setIsOpen] = useState(false);
    const [localSlug, setLocalSlug] = useState("");
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (slug) {
            setLocalSlug(slug);
        } else if (resumeId) {
            // Generate a default slug if none exists
            setLocalSlug(`${resumeId.slice(0, 8)}`);
        }
    }, [slug, resumeId]);

    const generateSlug = () => {
        const random = Math.random().toString(36).substring(2, 10);
        setLocalSlug(random);
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/r/${localSlug}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
    };

    const handleSave = async () => {
        if (!resumeId) return;

        if (is_public && !localSlug) {
            toast.error("Please enter a valid URL slug");
            return;
        }

        setIsChecking(true);

        // Check if slug is unique (if changed and public)
        if (is_public && localSlug !== slug) {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("resumes")
                .select("id")
                .eq("slug", localSlug)
                .neq("id", resumeId)
                .single();

            if (data) {
                toast.error("This URL is already taken. Please choose another.");
                setIsChecking(false);
                return;
            }
        }

        setSlug(localSlug);
        await saveAllChanges(); // This saves is_public and slug to DB
        setIsChecking(false);
        setIsOpen(false);
        toast.success("Share settings updated");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="min-h-[44px] gap-2 bg-transparent">
                    <Globe className="h-4 w-4" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Resume</DialogTitle>
                    <DialogDescription>
                        Make your resume public to share it with recruiters and friends.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="public-mode" className="font-medium">
                                Public Access
                            </Label>
                            <span className="text-xs text-muted-foreground">
                                {is_public
                                    ? "Anyone with the link can view your resume"
                                    : "Only you can view your resume"}
                            </span>
                        </div>
                        <Switch
                            id="public-mode"
                            checked={is_public}
                            onCheckedChange={setIsPublic}
                        />
                    </div>

                    {is_public && (
                        <div className="space-y-2">
                            <Label>Public Link</Label>
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 flex items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                                    <span className="shrink-0">{typeof window !== 'undefined' ? window.location.host : ''}/r/</span>
                                    <input
                                        className="flex-1 bg-transparent text-foreground outline-none min-w-0 ml-1"
                                        value={localSlug}
                                        onChange={(e) => setLocalSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="your-custom-url"
                                    />
                                </div>
                                <Button variant="outline" size="icon" onClick={generateSlug} title="Generate Random">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Characters allowed: a-z, 0-9, and hyphens.
                            </p>

                            <div className="pt-2">
                                <Button onClick={handleCopyLink} variant="secondary" className="w-full gap-2">
                                    <Copy className="h-4 w-4" />
                                    Copy Link
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isChecking}>
                        {isChecking ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
