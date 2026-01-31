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
import { ChevronLeft, Download, FileDown, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";

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
                        {isClassic && <span>|</span>}
                        <span>{profile.phone}</span>
                        {!isClassic && <br />}
                        {isClassic && <span>|</span>}
                        <span>{profile.email}</span>
                        {profile.website_url && (
                            <>
                                {!isClassic && <br />}
                                {isClassic && <span>|</span>}
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
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        // For react-to-print v3+ the argument might be different, but content: () => ref.current is standard for v2
        // If it throws lint errors, we might need to cast or check v3 syntax
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
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Cover letter not found</h2>
                <Button asChild variant="link">
                    <Link href="/dashboard/cover-letters">Back to list</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/cover-letters">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to list
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handlePrint()}>
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                    <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Edit Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RichTextEditor
                            content={coverLetter.content}
                            onChange={(content) => setCoverLetter({ ...coverLetter, content })}
                            placeholder="Your cover letter content..."
                        />
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Template</label>
                                <Select value={coverLetterTemplate} onValueChange={setCoverLetterTemplate}>
                                    <SelectTrigger className="mt-1 h-9">
                                        <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="modern">Modern</SelectItem>
                                        <SelectItem value="classic">Classic</SelectItem>
                                        <SelectItem value="minimal">Minimal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Title</label>
                                <p className="font-medium">{coverLetter.title}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Company</label>
                                <p>{coverLetter.company_name || "Not specified"}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Role</label>
                                <p>{coverLetter.job_title || "Not specified"}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Created</label>
                                <p className="text-sm">{format(new Date(coverLetter.created_at), "PPP")}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Hidden printable component */}
            <div className="hidden">
                <PrintableCoverLetter ref={componentRef} content={coverLetter.content} profile={profile} template={coverLetterTemplate} />
            </div>
        </div>
    );
}
