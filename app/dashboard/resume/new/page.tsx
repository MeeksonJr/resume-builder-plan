"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    ArrowRight,
    Loader2,
    FileText,
    Upload,
    Sparkles,
    Check,
    Palette,
    Layers,
    Code,
    Briefcase,
    TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { TemplateGallery } from "@/components/templates/template-gallery";
import { getTemplateById, TemplateDefinition } from "@/lib/templates/template-registry";
import { SAMPLE_PERSONAS } from "@/lib/templates/sample-personas";
import { JsonImportDialog } from "@/components/import/json-import-dialog";
import { ImportDialog } from "@/components/import/import-dialog";
import type { ParsedResumeData } from "@/lib/export/json-import";
import { cn } from "@/lib/utils";

type WizardStep = "template" | "content" | "finalize";

export default function NewResumePage() {
    const router = useRouter();

    // Step state
    const [currentStep, setCurrentStep] = useState<WizardStep>("template");

    // Template selection state
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("modern");
    const [accentColor, setAccentColor] = useState<string>("#0f172a");

    // Resume setup state
    const [title, setTitle] = useState<string>("");
    const [contentSource, setContentSource] = useState<"blank" | "demo_software" | "demo_executive" | "demo_marketing" | "imported">("blank");
    const [importedData, setImportedData] = useState<ParsedResumeData | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Subscription & Limit Check
    const { isPro, isLoading: isSubLoading, checkSubscription } = useSubscriptionStore();
    const [resumeCount, setResumeCount] = useState<number | null>(null);

    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    useEffect(() => {
        async function checkLimit() {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { count } = await supabase
                .from("resumes")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id);

            setResumeCount(count || 0);
        }
        checkLimit();
    }, []);

    const selectedTemplate = getTemplateById(selectedTemplateId);

    const handleSelectTemplate = (template: TemplateDefinition, visualConfigOverrides?: any) => {
        setSelectedTemplateId(template.id);
        if (visualConfigOverrides?.accentColor) {
            setAccentColor(visualConfigOverrides.accentColor);
        } else {
            setAccentColor(template.defaultVisualConfig.accentColor);
        }
    };

    const handleContinueToContent = () => {
        // Suggest a default title if not set
        if (!title) {
            setTitle(`${selectedTemplate.name} Resume`);
        }
        setCurrentStep("content");
    };

    const handleJSONImported = (data: ParsedResumeData) => {
        setImportedData(data);
        setContentSource("imported");
        if (data.title) setTitle(data.title);
        else if (data.profile?.full_name) setTitle(`${data.profile.full_name}'s Resume`);
        toast.success("JSON Resume parsed successfully!");
        setCurrentStep("finalize");
    };

    const handleCreateResume = async () => {
        // Feature Gate Check
        if (!isPro && (resumeCount || 0) >= 1) {
            toast.error("Free plan is limited to 1 resume. Upgrade to create more!");
            router.push("/dashboard/subscription");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                toast.error("You must be signed in to create a resume.");
                setIsLoading(false);
                return;
            }

            const resumeTitle = title.trim() || `${selectedTemplate.name} Resume`;

            // Prepare visual config
            const visualConfig = {
                ...selectedTemplate.defaultVisualConfig,
                accentColor: accentColor,
            };

            // Insert new resume row
            const { data: newResume, error: resumeError } = await supabase
                .from("resumes")
                .insert({
                    user_id: user.id,
                    title: resumeTitle,
                    template: selectedTemplate.id,
                    template_id: selectedTemplate.id,
                    visual_config: visualConfig,
                })
                .select("id")
                .single();

            if (resumeError || !newResume) {
                throw new Error(resumeError?.message || "Failed to create resume record");
            }

            const resumeId = newResume.id;

            // Fetch profile for default personal info fallback
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            // Populate content based on selected onboarding path
            if (contentSource === "imported" && importedData) {
                // Populate from parsed JSON Resume
                if (importedData.profile) {
                    await supabase.from("personal_info").upsert({
                        resume_id: resumeId,
                        full_name: importedData.profile.full_name || profile?.full_name || null,
                        email: importedData.profile.email || profile?.email || null,
                        phone: importedData.profile.phone || profile?.phone || null,
                        location: importedData.profile.location || profile?.location || null,
                        linkedin: importedData.profile.linkedin_url || null,
                        github: importedData.profile.github_url || null,
                        website: importedData.profile.website_url || null,
                    }, { onConflict: "resume_id" });
                }

                if (importedData.workExperiences?.length > 0) {
                    await supabase.from("work_experiences").insert(
                        importedData.workExperiences.map((w, i) => ({
                            resume_id: resumeId,
                            company: w.company,
                            position: w.position,
                            location: w.location || null,
                            start_date: w.start_date || null,
                            end_date: w.end_date || null,
                            is_current: !!w.is_current,
                            description: w.description || null,
                            highlights: w.highlights || [],
                            sort_order: i,
                        }))
                    );
                }

                if (importedData.education?.length > 0) {
                    await supabase.from("education").insert(
                        importedData.education.map((e, i) => ({
                            resume_id: resumeId,
                            institution: e.institution,
                            degree: e.degree || null,
                            field_of_study: e.field_of_study || null,
                            start_date: e.start_date || null,
                            end_date: e.end_date || null,
                            gpa: e.gpa || null,
                            achievements: e.highlights || [],
                            sort_order: i,
                        }))
                    );
                }

                if (importedData.skills?.length > 0) {
                    await supabase.from("skills").insert(
                        importedData.skills.map((s, i) => ({
                            resume_id: resumeId,
                            name: s.name,
                            category: s.category || null,
                            proficiency_level: s.proficiency_level || 3,
                            sort_order: i,
                        }))
                    );
                }

                if (importedData.projects?.length > 0) {
                    await supabase.from("projects").insert(
                        importedData.projects.map((p, i) => ({
                            resume_id: resumeId,
                            name: p.name,
                            description: p.description || null,
                            technologies: p.technologies || [],
                            url: p.url || null,
                            highlights: p.highlights || [],
                            sort_order: i,
                        }))
                    );
                }

                if (importedData.certifications?.length > 0) {
                    await supabase.from("certifications").insert(
                        importedData.certifications.map((c, i) => ({
                            resume_id: resumeId,
                            name: c.name,
                            issuer: c.issuer || null,
                            issue_date: c.issue_date || null,
                            credential_url: c.credential_url || null,
                            sort_order: i,
                        }))
                    );
                }

                if (importedData.languages?.length > 0) {
                    await supabase.from("languages").insert(
                        importedData.languages.map((l, i) => ({
                            resume_id: resumeId,
                            name: l.name,
                            proficiency: l.proficiency || "Professional working",
                            sort_order: i,
                        }))
                    );
                }
            } else if (contentSource.startsWith("demo_")) {
                // Populate from curated Industry Persona
                const personaKey =
                    contentSource === "demo_executive"
                        ? "executive_leader"
                        : contentSource === "demo_marketing"
                        ? "marketing_lead"
                        : "software_engineer";

                const persona = SAMPLE_PERSONAS[personaKey];

                await supabase.from("personal_info").upsert({
                    resume_id: resumeId,
                    full_name: profile?.full_name || persona.profile.full_name,
                    email: profile?.email || persona.profile.email,
                    phone: profile?.phone || persona.profile.phone,
                    location: profile?.location || persona.profile.location,
                    linkedin: profile?.linkedin_url || persona.profile.linkedin_url,
                    github: persona.profile.github_url || null,
                    website: persona.profile.website_url || null,
                }, { onConflict: "resume_id" });

                if (persona.workExperiences?.length > 0) {
                    await supabase.from("work_experiences").insert(
                        persona.workExperiences.map((w, i) => ({
                            resume_id: resumeId,
                            company: w.company,
                            position: w.position,
                            location: w.location,
                            start_date: w.start_date,
                            end_date: w.end_date,
                            is_current: !!w.is_current,
                            description: w.description,
                            highlights: w.highlights || [],
                            sort_order: i,
                        }))
                    );
                }

                if (persona.education?.length > 0) {
                    await supabase.from("education").insert(
                        persona.education.map((e, i) => ({
                            resume_id: resumeId,
                            institution: e.institution,
                            degree: e.degree,
                            field_of_study: e.field_of_study,
                            start_date: e.start_date,
                            end_date: e.end_date,
                            gpa: e.gpa || null,
                            achievements: e.highlights || [],
                            sort_order: i,
                        }))
                    );
                }

                if (persona.skills?.length > 0) {
                    await supabase.from("skills").insert(
                        persona.skills.map((s, i) => ({
                            resume_id: resumeId,
                            name: s.name,
                            category: s.category,
                            proficiency_level: 4,
                            sort_order: i,
                        }))
                    );
                }

                if (persona.projects?.length > 0) {
                    await supabase.from("projects").insert(
                        persona.projects.map((p, i) => ({
                            resume_id: resumeId,
                            name: p.name,
                            description: p.description,
                            technologies: p.technologies || [],
                            url: p.url,
                            highlights: p.highlights || [],
                            sort_order: i,
                        }))
                    );
                }

                if (persona.certifications?.length > 0) {
                    await supabase.from("certifications").insert(
                        persona.certifications.map((c, i) => ({
                            resume_id: resumeId,
                            name: c.name,
                            issuer: c.issuer,
                            issue_date: c.issue_date,
                            credential_url: null,
                            sort_order: i,
                        }))
                    );
                }
            } else {
                // Blank canvas with candidate's personal profile
                if (profile) {
                    const contactSettings = profile.settings?.contact || {};
                    await supabase.from("personal_info").upsert({
                        resume_id: resumeId,
                        full_name: profile.full_name || null,
                        email: profile.email || null,
                        phone: contactSettings.phone || profile.phone || null,
                        location: profile.location || null,
                        linkedin: contactSettings.linkedin || profile.linkedin_url || null,
                        github: contactSettings.github || profile.github_url || null,
                        website: profile.website_url || null,
                        summary: profile.bio || null,
                    }, { onConflict: "resume_id" });
                }
            }

            toast.success("Resume created successfully!");
            router.push(`/dashboard/resume/${resumeId}`);
        } catch (err: any) {
            console.error("Resume creation error:", err);
            setError(err.message || "Failed to create resume");
            toast.error("Failed to create resume", { description: err.message });
            setIsLoading(false);
        }
    };

    // Free tier limit reached screen
    if (!isSubLoading && !isPro && resumeCount !== null && resumeCount >= 1) {
        return (
            <div className="mx-auto max-w-3xl space-y-7 py-8">
                <Button asChild variant="ghost" size="icon" className="rounded-none">
                    <Link href="/dashboard/resumes">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <Card className="rounded-none border-[#102b2b]/20 bg-[#f5f7f1] shadow-none p-6 text-center">
                    <CardHeader className="space-y-3 pb-2">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center bg-[#d8f36b]">
                            <Sparkles className="h-6 w-6 text-[#102b2b]" />
                        </div>
                        <CardTitle className="text-2xl font-black uppercase tracking-tight text-[#102b2b]">
                            Free Plan Limit Reached
                        </CardTitle>
                        <CardDescription className="text-base text-[#52716a]">
                            You have reached the limit of 1 active resume on the Free tier.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-w-md mx-auto pt-2">
                        <p className="text-sm text-[#102b2b]/70">
                            Upgrade to <strong>Pro</strong> to unlock unlimited resumes, all 8 ATS-optimized templates, AI bullet optimization, and export formats.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center pb-4">
                        <Button
                            size="lg"
                            className="h-12 rounded-none bg-[#d8f36b] px-8 font-bold text-[#102b2b] hover:bg-[#c9e95c] shadow-sm"
                            onClick={() => router.push("/dashboard/subscription")}
                        >
                            Upgrade to Pro
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 px-2 py-4 sm:px-4">
            {/* Header & Step Progress Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#102b2b]/15 pb-6">
                <div className="flex items-center gap-4">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="rounded-none border border-[#102b2b]/15 bg-white text-[#102b2b] hover:bg-[#d8f36b]"
                    >
                        <Link href="/dashboard/resumes">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d8274]">
                            New Resume Creation
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#102b2b]">
                            {currentStep === "template" && "1. Select a Resume Template"}
                            {currentStep === "content" && "2. Choose Content Setup"}
                            {currentStep === "finalize" && "3. Review & Launch"}
                        </h1>
                    </div>
                </div>

                {/* Stepper Indicators */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentStep("template")}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-none border transition-colors",
                            currentStep === "template"
                                ? "bg-[#102b2b] text-white border-[#102b2b]"
                                : "bg-white/80 text-[#52716a] border-[#102b2b]/15 hover:bg-white"
                        )}
                    >
                        <span>1. Template</span>
                    </button>
                    <span className="text-[#102b2b]/30">/</span>
                    <button
                        type="button"
                        onClick={() => setCurrentStep("content")}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-none border transition-colors",
                            currentStep === "content"
                                ? "bg-[#102b2b] text-white border-[#102b2b]"
                                : "bg-white/80 text-[#52716a] border-[#102b2b]/15 hover:bg-white"
                        )}
                    >
                        <span>2. Content</span>
                    </button>
                    <span className="text-[#102b2b]/30">/</span>
                    <button
                        type="button"
                        onClick={() => setCurrentStep("finalize")}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-none border transition-colors",
                            currentStep === "finalize"
                                ? "bg-[#102b2b] text-white border-[#102b2b]"
                                : "bg-white/80 text-[#52716a] border-[#102b2b]/15 hover:bg-white"
                        )}
                    >
                        <span>3. Launch</span>
                    </button>
                </div>
            </div>

            {/* STEP 1: TEMPLATE SHOWCASE */}
            {currentStep === "template" && (
                <div className="space-y-8">
                    {/* Intro Note */}
                    <div className="bg-[#102b2b] text-[#f8f4ec] p-6 rounded-none shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[#d8f36b]" />
                                Explore 8 Professionally Crafted Templates
                            </h2>
                            <p className="text-xs text-[#a6c0b8] max-w-2xl">
                                Scroll directly through each preview card to inspect sections. Click &quot;Inspect Fullscreen&quot; to test different sample roles and color palettes. All templates are 100% interchangeable anytime in the editor.
                            </p>
                        </div>
                        <Button
                            onClick={handleContinueToContent}
                            className="rounded-none bg-[#d8f36b] text-[#102b2b] hover:bg-[#c9e95c] font-black uppercase tracking-wider text-xs px-6 h-11 shrink-0 gap-2 shadow-sm"
                        >
                            <span>Continue with {selectedTemplate.name}</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Template Gallery Component */}
                    <TemplateGallery
                        selectedTemplateId={selectedTemplateId}
                        onSelectTemplate={(tmpl, visualOverrides) => {
                            handleSelectTemplate(tmpl, visualOverrides);
                            toast.success(`Selected "${tmpl.name}" template`);
                        }}
                    />

                    {/* Sticky Bottom Bar */}
                    <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-[#102b2b]/20 p-4 shadow-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-none border border-black/20" style={{ backgroundColor: accentColor }} />
                            <div>
                                <p className="text-xs text-[#52716a] font-bold uppercase tracking-wider">Active Choice</p>
                                <p className="text-sm font-black text-[#102b2b]">{selectedTemplate.name} ({selectedTemplate.subtitle})</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleContinueToContent}
                            className="rounded-none bg-[#d8f36b] text-[#102b2b] hover:bg-[#c9e95c] font-bold px-6 h-10 gap-2 shadow-sm"
                        >
                            <span>Next: Choose Content</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 2: CONTENT ONBOARDING */}
            {currentStep === "content" && (
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-[#102b2b]">
                            How would you like to start?
                        </h2>
                        <p className="text-sm text-[#52716a] max-w-xl mx-auto">
                            Using template: <strong className="text-[#102b2b]">{selectedTemplate.name}</strong>. Choose whether to import your existing documents, start with realistic industry samples, or begin fresh.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Option 1: Import Existing Resume */}
                        <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm flex flex-col justify-between hover:border-[#102b2b]/40 transition-all">
                            <CardHeader className="space-y-3">
                                <div className="h-10 w-10 bg-[#0d8274]/10 flex items-center justify-center text-[#0d8274]">
                                    <Upload className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-lg font-bold text-[#102b2b]">
                                    Import Existing Resume
                                </CardTitle>
                                <CardDescription className="text-xs text-[#52716a] leading-relaxed">
                                    Upload a JSON Resume file, paste JSON text, or import an existing PDF/Word resume.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-2 flex flex-col gap-2">
                                <JsonImportDialog onImport={handleJSONImported}>
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-none border-[#102b2b]/20 text-xs font-bold text-[#102b2b] hover:bg-[#e9eee8] h-10 gap-1.5"
                                    >
                                        <Code className="h-3.5 w-3.5" />
                                        Import JSON Resume
                                    </Button>
                                </JsonImportDialog>
                                <ImportDialog>
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-none border-[#102b2b]/20 text-xs font-bold text-[#102b2b] hover:bg-[#e9eee8] h-10 gap-1.5"
                                    >
                                        <Upload className="h-3.5 w-3.5" />
                                        Upload PDF / Word
                                    </Button>
                                </ImportDialog>
                            </CardFooter>
                        </Card>

                        {/* Option 2: Start from Scratch */}
                        <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm flex flex-col justify-between hover:border-[#102b2b]/40 transition-all">
                            <CardHeader className="space-y-3">
                                <div className="h-10 w-10 bg-[#d8f36b] flex items-center justify-center text-[#102b2b]">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-lg font-bold text-[#102b2b]">
                                    Start from Scratch
                                </CardTitle>
                                <CardDescription className="text-xs text-[#52716a] leading-relaxed">
                                    Begin with a blank slate. Your basic profile information (name, email, location) is pre-filled automatically.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-2">
                                <Button
                                    onClick={() => {
                                        setContentSource("blank");
                                        setCurrentStep("finalize");
                                    }}
                                    className="w-full rounded-none bg-[#102b2b] text-[#f8f4ec] hover:bg-[#1a3d3d] text-xs font-bold h-10 gap-1.5"
                                >
                                    <span>Create Blank Resume</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Option 3: Role Demo Persona */}
                        <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm flex flex-col justify-between hover:border-[#102b2b]/40 transition-all">
                            <CardHeader className="space-y-3">
                                <div className="h-10 w-10 bg-[#0d8274]/10 flex items-center justify-center text-[#0d8274]">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-lg font-bold text-[#102b2b]">
                                    Start with Role Demo
                                </CardTitle>
                                <CardDescription className="text-xs text-[#52716a] leading-relaxed">
                                    Load quantifiable bullet points and industry skills for your role so you can edit rather than write from zero.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-2 flex flex-col gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setContentSource("demo_software");
                                        setTitle("Software Engineer Resume");
                                        setCurrentStep("finalize");
                                    }}
                                    className="w-full justify-start rounded-none text-xs font-semibold h-8 gap-1.5"
                                >
                                    <Code className="h-3.5 w-3.5 text-[#0d8274]" />
                                    <span>Software Engineer</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setContentSource("demo_executive");
                                        setTitle("Executive Product Leader Resume");
                                        setCurrentStep("finalize");
                                    }}
                                    className="w-full justify-start rounded-none text-xs font-semibold h-8 gap-1.5"
                                >
                                    <Briefcase className="h-3.5 w-3.5 text-[#0d8274]" />
                                    <span>Executive / Director</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setContentSource("demo_marketing");
                                        setTitle("Growth Marketing Resume");
                                        setCurrentStep("finalize");
                                    }}
                                    className="w-full justify-start rounded-none text-xs font-semibold h-8 gap-1.5"
                                >
                                    <TrendingUp className="h-3.5 w-3.5 text-[#0d8274]" />
                                    <span>Marketing & Growth</span>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="flex justify-start">
                        <Button
                            variant="ghost"
                            onClick={() => setCurrentStep("template")}
                            className="rounded-none text-xs font-bold text-[#52716a] gap-1.5"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to Templates
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 3: FINALIZE & LAUNCH */}
            {currentStep === "finalize" && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm p-6 space-y-6">
                        <div className="border-b border-[#102b2b]/10 pb-4">
                            <h2 className="text-xl font-black uppercase tracking-tight text-[#102b2b]">
                                Finalize Your Resume Setup
                            </h2>
                            <p className="text-xs text-[#52716a] mt-1">
                                Review your title and accent color before launching the interactive builder.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        {/* Title Input */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-[#52716a]">
                                Resume Title
                            </Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Senior Software Engineer - 2026"
                                className="h-11 rounded-none border-[#102b2b]/20 text-sm font-medium"
                            />
                            <p className="text-[11px] text-[#52716a]">
                                Internal title for your dashboard library. Recruiters will not see this.
                            </p>
                        </div>

                        {/* Template & Color Summary Box */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-[#f8f4ec] border border-[#102b2b]/10">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#52716a] block">
                                    Selected Template
                                </span>
                                <span className="text-sm font-black text-[#102b2b]">
                                    {selectedTemplate.name}
                                </span>
                                <p className="text-[11px] text-[#52716a]">{selectedTemplate.subtitle}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#52716a] block">
                                    Accent Color
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div
                                        className="w-5 h-5 rounded-none border border-black/20"
                                        style={{ backgroundColor: accentColor }}
                                    />
                                    <span className="text-xs font-mono font-bold text-[#102b2b] uppercase">
                                        {accentColor}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content Source Summary */}
                        <div className="flex items-center gap-2 text-xs text-[#52716a]">
                            <Layers className="h-4 w-4 text-[#0d8274]" />
                            <span>
                                Content mode:{" "}
                                <strong className="text-[#102b2b]">
                                    {contentSource === "imported" && "Imported Resume Data"}
                                    {contentSource === "blank" && "Blank Template (Clean Slate)"}
                                    {contentSource === "demo_software" && "Software Engineer Benchmark Data"}
                                    {contentSource === "demo_executive" && "Executive Leadership Benchmark Data"}
                                    {contentSource === "demo_marketing" && "Marketing & Growth Benchmark Data"}
                                </strong>
                            </span>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentStep("content")}
                                className="rounded-none text-xs font-bold text-[#52716a] gap-1.5"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Back
                            </Button>
                            <Button
                                onClick={handleCreateResume}
                                disabled={isLoading}
                                className="w-full sm:w-auto rounded-none bg-[#d8f36b] text-[#102b2b] hover:bg-[#c9e95c] font-black uppercase tracking-wider px-8 h-11 text-xs shadow-md gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating Resume...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Launch Resume Editor
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
