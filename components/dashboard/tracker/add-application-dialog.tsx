"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddApplicationDialogProps {
    children: React.ReactNode;
    onSave: () => void;
}

export function AddApplicationDialog({ children, onSave }: AddApplicationDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [resumes, setResumes] = useState<any[]>([]);
    const [coverLetters, setCoverLetters] = useState<any[]>([]);
    const [versions, setVersions] = useState<any[]>([]);
    const supabase = createClient();

    const [form, setForm] = useState({
        company: "",
        role: "",
        status: "applied",
        resume_id: "",
        resume_version_id: "",
        cover_letter_id: "",
        location: "",
        url: "",
        salary_range: "",
        notes: "",
    });

    useEffect(() => {
        if (open) {
            fetchVersions();
        }
    }, [open]);

    const fetchVersions = async () => {
        const [resumesRes, coverLettersRes] = await Promise.all([
            supabase.from("resumes").select("id, title").order("updated_at", { ascending: false }),
            supabase.from("cover_letters").select("id, title").order("updated_at", { ascending: false })
        ]);

        if (resumesRes.data) setResumes(resumesRes.data);
        if (coverLettersRes.data) setCoverLetters(coverLettersRes.data);
    };

    const fetchResumeVersions = async (resumeId: string) => {
        if (!resumeId) {
            setVersions([]);
            return;
        }

        const { data } = await supabase
            .from("resume_versions")
            .select("id, version_number, title")
            .eq("resume_id", resumeId)
            .order("version_number", { ascending: false });

        setVersions(data || []);
        // Auto-select the latest version
        if (data && data.length > 0) {
            setForm(prev => ({ ...prev, resume_version_id: data[0].id }));
        }
    };

    const handleSave = async () => {
        if (!form.company || !form.role) {
            toast.error("Company and Role are required");
            return;
        }

        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase.from("applications").insert({
                ...form,
                user_id: user.id,
                resume_id: form.resume_id || null,
                resume_version_id: form.resume_version_id || null,
                cover_letter_id: form.cover_letter_id || null,
            });

            if (error) throw error;

            toast.success("Application added successfully!");
            setOpen(false);
            onSave();
            setForm({
                company: "",
                role: "",
                status: "applied",
                resume_id: "",
                resume_version_id: "",
                cover_letter_id: "",
                location: "",
                url: "",
                salary_range: "",
                notes: "",
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to add application");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Application</DialogTitle>
                    <DialogDescription>
                        Track a new job application and link it to your resume.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="company">Company *</Label>
                            <Input
                                id="company"
                                placeholder="Google"
                                value={form.company}
                                onChange={(e) => setForm({ ...form, company: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <Input
                                id="role"
                                placeholder="Software Engineer"
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.status}
                                onValueChange={(v) => setForm({ ...form, status: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="applied">Applied</SelectItem>
                                    <SelectItem value="interviewing">Interviewing</SelectItem>
                                    <SelectItem value="offered">Offered</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="Remote / New York"
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="resume">Resume Used</Label>
                            <Select
                                value={form.resume_id}
                                onValueChange={(v) => {
                                    setForm({ ...form, resume_id: v, resume_version_id: "" });
                                    fetchResumeVersions(v);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select resume" />
                                </SelectTrigger>
                                <SelectContent>
                                    {resumes.map(r => (
                                        <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {form.resume_id && versions.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="version">Resume Version</Label>
                                <Select
                                    value={form.resume_version_id}
                                    onValueChange={(v) => setForm({ ...form, resume_version_id: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select version" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {versions.map(v => (
                                            <SelectItem key={v.id} value={v.id}>
                                                Version {v.version_number} {v.version_number === versions[0].version_number && "(Latest)"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="cover-letter">Cover Letter Used</Label>
                            <Select
                                value={form.cover_letter_id}
                                onValueChange={(v) => setForm({ ...form, cover_letter_id: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select cover letter" />
                                </SelectTrigger>
                                <SelectContent>
                                    {coverLetters.map(cl => (
                                        <SelectItem key={cl.id} value={cl.id}>{cl.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="url">Job Posting URL</Label>
                        <Input
                            id="url"
                            placeholder="https://google.com/careers/..."
                            value={form.url}
                            onChange={(e) => setForm({ ...form, url: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Key details about the role or referral info..."
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Application
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}