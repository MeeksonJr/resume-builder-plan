"use client";

import { useState, useEffect, use, forwardRef, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Download, FileDown, Save, Loader2, Info, Building2, Briefcase, Calendar, Layout } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const PrintableCoverLetter = forwardRef<HTMLDivElement, { content: string, profile: any, template: string }>(({ content, profile, template }, ref) => {
    const isClassic = template === "classic";
    const isModern = template === "modern";
    const isMinimal = template === "minimal";

    return (
        <div ref={ref} className={`p-16 text-gray-900 bg-white min-h-[1056px] leading-relaxed ${isClassic ? 'font-serif' : 'font-sans'}`}>
            {profile && (
                <div className={`mb-10 pb-6 ${isModern ? 'border-l-4 border-primary pl-6' : isClassic ? 'text-center border-b' : 'border-b'}`}>
                    <h1 className={`${isModern ? 'text-3xl' : 'text-2xl'} font-bold text-gray-900 uppercase tracking-tight`}>
                        {profile.full_name}
                    </h1>
                    <div className={`mt-2 text-sm text-gray-600 ${isClassic ? 'flex justify-center gap-3' : 'space-y-1'}`}>
                        <span>{profile.location}</span>
                        {!isClassic && <br />}
                        {isClassic && <span className="mx-1">|</span>}
                        <span>{profile.phone}</span>
                        {!isClassic && <br />}
                        {isClassic && <span className="mx-1">|</span>}
                        <span>{profile.email}</span>
                        {profile.website_url && (
                            <>
                                {!isClassic && <br />}
                                {isClassic && <span className="mx-1">|</span>}
                                <span>{profile.website_url}</span>
                            </>
                        )}
                    </div>
                </div>
            )}
            <div
                className={`prose prose-sm max-w-none prose-p:my-3 prose-ul:my-2 prose-li:my-1 text-gray-800 ${isClassic ? 'text-justify' : ''}`}
                style={{ fontSize: '11pt' }}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
});
PrintableCoverLetter.displayName = "PrintableCoverLetter";

export default function CoverLetterDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [coverLetter, setCoverLetter] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [coverLetterTemplate, setCoverLetterTemplate] = useState<string>("modern");
    const [isEdited, setIsEdited] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: coverLetter?.title || "Cover Letter",
    } as any);

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase
                .from("cover_letters")
                .select("*, resumes(*)")
                .eq("id", id)
                .single();

            if (data) {
                setCoverLetter(data);
                if (data.resumes?.user_id) {
                    const { data: profileData } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", data.resumes.user_id)
                        .single();

                    if (profileData) setProfile(profileData);
                }
            } else if (error) {
                toast.error("Could not find cover letter");
            }
            setLoading(false);
        }
        fetchData();
    }, [id, supabase]);

    const handleSave = async () => {
        if (!coverLetter) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from("cover_letters")
                .update({
                    content: coverLetter.content,
                    title: coverLetter.title,
                })
                .eq("id", id);

            if (error) throw error;
            toast.success("Cover letter saved!");
            setIsEdited(false);
        } catch (error) {
            toast.error("Failed to save cover letter");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!coverLetter) {
        return (
            <div className="text-center py-20 bg-slate-950/40 backdrop-blur-xl rounded-[32px] border border-primary/5 mx-auto max-w-lg mt-20">
                <Info className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                <h2 className="text-2xl font-black uppercase tracking-tight">Letter not found</h2>
                <Button asChild variant="link" className="text-primary font-bold">
                    <Link href="/dashboard/cover-letters">Return to Dashboard</Link>
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto max-w-6xl space-y-8"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild className="hover:bg-slate-900 rounded-xl px-3 group">
                        <Link href="/dashboard/cover-letters">
                            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black uppercase tracking-tight text-white line-clamp-1">
                                {coverLetter.title}
                            </h1>
                            <AnimatePresence>
                                {isEdited && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            Rendered {format(new Date(coverLetter.created_at), "PPP")}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="h-11 px-5 rounded-xl border-primary/10 bg-slate-900/50 hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] gap-2 transition-all shadow-xl" onClick={() => handlePrint()}>
                        <Download className="h-4 w-4" />
                        Export PDF
                    </Button>
                    <Button onClick={handleSave} disabled={saving || !isEdited} size="sm" className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Sync Changes
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-4">
                <Card className="lg:col-span-3 border-primary/5 bg-slate-950/60 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
                    <CardHeader className="border-b border-primary/5 bg-slate-900/40 px-8 py-5">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Letter Manuscript</CardTitle>
                            <div className="flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${isEdited ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground/40">{isEdited ? 'Unsaved Changes' : 'Synced'}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        <RichTextEditor
                            content={coverLetter.content}
                            onChange={(content) => {
                                setCoverLetter({ ...coverLetter, content });
                                setIsEdited(true);
                            }}
                            className="border-0 focus-within:ring-0 min-h-[600px] p-8"
                            placeholder="Your cover letter content..."
                        />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-primary/5 bg-slate-950/40 backdrop-blur-xl rounded-[24px] shadow-xl overflow-hidden">
                        <div className="bg-primary/5 border-b border-primary/5 px-6 py-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Layout className="h-3 w-3" />
                                Configuration
                            </h3>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Layout Engine</Label>
                                <Select value={coverLetterTemplate} onValueChange={setCoverLetterTemplate}>
                                    <SelectTrigger className="h-10 bg-slate-900/50 border-primary/10 rounded-xl focus:ring-primary/20 font-bold transition-all">
                                        <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-primary/10 rounded-xl">
                                        <SelectItem value="modern" className="focus:bg-primary/10 rounded-lg py-2 font-bold">Modern (Clean)</SelectItem>
                                        <SelectItem value="classic" className="focus:bg-primary/10 rounded-lg py-2 font-bold">Classic (Serif)</SelectItem>
                                        <SelectItem value="minimal" className="focus:bg-primary/10 rounded-lg py-2 font-bold">Minimal (Focus)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-primary/5">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Target</Label>
                                    <div className="flex items-center gap-2 text-white font-bold group">
                                        <Building2 className="h-3.5 w-3.5 text-primary opacity-60 group-hover:opacity-100 transition-all" />
                                        <p className="text-sm truncate">{coverLetter.company_name || "Enterprise"}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Role</Label>
                                    <div className="flex items-center gap-2 text-white font-bold group">
                                        <Briefcase className="h-3.5 w-3.5 text-primary opacity-60 group-hover:opacity-100 transition-all" />
                                        <p className="text-sm truncate">{coverLetter.job_title || "Professional"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-6 rounded-[24px] border border-primary/5 bg-slate-950/20 backdrop-blur-sm">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3 flex items-center gap-1.5">
                            <Info className="h-3 w-3" />
                            Live Synthesis
                        </h4>
                        <p className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed italic">
                            Changes saved here are synced to your database but won't affect the original resume source material.
                        </p>
                    </div>
                </div>
            </div>

            {/* Hidden printable component */}
            <div className="hidden">
                <PrintableCoverLetter ref={componentRef} content={coverLetter.content} profile={profile} template={coverLetterTemplate} />
            </div>
        </motion.div>
    );
}
