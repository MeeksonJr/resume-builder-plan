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

                            <div className="pt-2 grid grid-cols-2 gap-2">
                                <Button onClick={handleCopyLink} variant="secondary" className="w-full gap-2">
                                    <Copy className="h-4 w-4" />
                                    Copy Link
                                </Button>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="w-full text-[#0a66c2] hover:text-[#0a66c2] hover:bg-blue-50 border-blue-200"
                                        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/r/${localSlug}`)}`, '_blank')}
                                        title="Share on LinkedIn"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
                                        </svg>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="w-full text-black hover:bg-gray-50 border-gray-300"
                                        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my resume!`)}&url=${encodeURIComponent(`${window.location.origin}/r/${localSlug}`)}`, '_blank')}
                                        title="Share on X (Twitter)"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
                                        </svg>
                                    </Button>
                                </div>
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
