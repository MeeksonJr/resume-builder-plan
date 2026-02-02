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
import { Loader2, Workflow, Building2, Briefcase, MapPin, DollarSign, StickyNote, FileText, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
            <DialogContent className="sm:max-w-[550px] bg-slate-950/95 border-primary/10 shadow-3xl backdrop-blur-2xl p-0 overflow-hidden rounded-3xl">
                <div className="relative h-28 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-primary/5 flex items-center px-8">
                    <div className="relative z-10 space-y-1">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white">Pipeline Entry</DialogTitle>
                        <DialogDescription className="font-bold text-muted-foreground/80 flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-primary" />
                            Track a new professional engagement.
                        </DialogDescription>
                    </div>
                    <Workflow className="absolute right-8 top-1/2 -translate-y-1/2 h-16 w-16 text-primary/10 -rotate-12" />
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid gap-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="company" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Hiring Entity</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                                    <Input
                                        id="company"
                                        placeholder="Google"
                                        className="h-12 bg-slate-900/50 border-primary/10 rounded-xl pl-11 font-bold focus:ring-primary/20 transition-all"
                                        value={form.company}
                                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Target Role</Label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                                    <Input
                                        id="role"
                                        placeholder="Software Engineer"
                                        className="h-12 bg-slate-900/50 border-primary/10 rounded-xl pl-11 font-bold focus:ring-primary/20 transition-all"
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Pipeline Stage</Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(v) => setForm({ ...form, status: v })}
                                >
                                    <SelectTrigger className="h-12 bg-slate-900/50 border-primary/10 rounded-xl font-bold focus:ring-primary/20 transition-all">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-950 border-primary/10 rounded-xl">
                                        <SelectItem value="applied" className="font-bold text-xs uppercase tracking-tight py-3 focus:bg-primary/10">Applied</SelectItem>
                                        <SelectItem value="interviewing" className="font-bold text-xs uppercase tracking-tight py-3 focus:bg-amber-500/10">Interviewing</SelectItem>
                                        <SelectItem value="offered" className="font-bold text-xs uppercase tracking-tight py-3 focus:bg-emerald-500/10">Offered</SelectItem>
                                        <SelectItem value="rejected" className="font-bold text-xs uppercase tracking-tight py-3 focus:bg-destructive/10">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Location</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                                    <Input
                                        id="location"
                                        placeholder="Remote / NYC"
                                        className="h-12 bg-slate-900/50 border-primary/10 rounded-xl pl-11 font-bold focus:ring-primary/20 transition-all"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-primary/5 pt-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-4">Linked Artifacts</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="resume" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Base Resume</Label>
                                    <Select
                                        value={form.resume_id}
                                        onValueChange={(v) => {
                                            setForm({ ...form, resume_id: v, resume_version_id: "" });
                                            fetchResumeVersions(v);
                                        }}
                                    >
                                        <SelectTrigger className="h-12 bg-slate-900/50 border-primary/10 rounded-xl font-bold text-xs">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-3 w-3 text-primary/60" />
                                                <SelectValue placeholder="Select resume" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-950 border-primary/10 rounded-xl">
                                            {resumes.map(r => (
                                                <SelectItem key={r.id} value={r.id} className="font-bold text-xs py-3">{r.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="cover-letter" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Matched Letter</Label>
                                    <Select
                                        value={form.cover_letter_id}
                                        onValueChange={(v) => setForm({ ...form, cover_letter_id: v })}
                                    >
                                        <SelectTrigger className="h-12 bg-slate-900/50 border-primary/10 rounded-xl font-bold text-xs">
                                            <div className="flex items-center gap-2">
                                                <StickyNote className="h-3 w-3 text-primary/60" />
                                                <SelectValue placeholder="Select letter" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-950 border-primary/10 rounded-xl">
                                            {coverLetters.map(cl => (
                                                <SelectItem key={cl.id} value={cl.id} className="font-bold text-xs py-3">{cl.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 border-t border-primary/5 pt-6">
                            <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Engagement URL</Label>
                            <Input
                                id="url"
                                placeholder="https://..."
                                className="h-12 bg-slate-900/50 border-primary/10 rounded-xl font-bold focus:ring-primary/20 transition-all italic text-xs"
                                value={form.url}
                                onChange={(e) => setForm({ ...form, url: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Strategic Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Key details about the role or referral info..."
                                className="min-h-[100px] bg-slate-900/30 border-primary/10 rounded-xl p-4 font-medium text-sm focus:ring-primary/20 resize-none transition-all"
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-900/40 border-t border-primary/5">
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="ghost" onClick={() => setOpen(false)} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:text-white">Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all group">
                            {isSaving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Workflow className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                            )}
                            Initialize Entry
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}