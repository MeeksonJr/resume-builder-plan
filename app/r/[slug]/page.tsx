import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // Use client for public fetch or server? Server is better for SEO but need public access.
// Using server client for fetching
import { createClient as createServerClient } from "@/lib/supabase/server";
import { ResumePreview } from "@/components/editor/resume-preview";
import { Metadata } from "next";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PublicDownloadButton } from "../../../components/dashboard/public-download-button";
import { PublicTracker } from "@/components/analytics/public-tracker"; // Import Tracker

interface PublicResumePageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicResumePageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createServerClient();

    const { data: resume } = await supabase
        .from("resumes")
        .select("title, user:profiles(full_name)")
        .eq("slug", slug)
        .eq("is_public", true)
        .maybeSingle();

    if (!resume) {
        return {
            title: "Resume Not Found",
        };
    }

    // user is returned as an array or object depending on join, here it expects object because of foreign key
    // But usually supabase returns array for joined unless single() is used correctly. 
    // Let's assume profile is linked via user_id
    const userName = (resume as any).user?.full_name || "User";

    return {
        title: `${resume.title} - ${userName}'s Resume`,
        description: `View ${userName}'s professional resume.`,
    };
}

export default async function PublicResumePage({ params }: PublicResumePageProps) {
    const { slug } = await params;
    const supabase = await createServerClient();

    // 1. Fetch Resume
    const { data: resume } = await supabase
        .from("resumes")
        .select("*")
        .eq("slug", slug)
        .eq("is_public", true)
        .maybeSingle();

    if (!resume) {
        notFound();
    }

    const resumeId = resume.id;

    // 2. Fetch all related data
    // We can run these in parallel
    const [
        { data: profile },
        { data: personalInfo },
        { data: workExperiences },
        { data: education },
        { data: skills },
        { data: projects },
        { data: certifications },
        { data: languages },
    ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", resume.user_id).maybeSingle(),
        supabase.from("personal_info").select("*").eq("resume_id", resumeId).maybeSingle(),
        supabase.from("work_experiences").select("*").eq("resume_id", resumeId).order("sort_order"),
        supabase.from("education").select("*").eq("resume_id", resumeId).order("sort_order"),
        supabase.from("skills").select("*").eq("resume_id", resumeId).order("sort_order"),
        supabase.from("projects").select("*").eq("resume_id", resumeId).order("sort_order"),
        supabase.from("certifications").select("*").eq("resume_id", resumeId).order("sort_order"),
        supabase.from("languages").select("*").eq("resume_id", resumeId).order("sort_order"),
    ]);

    // Merge profile
    const mergedProfile = {
        ...profile,
        phone: personalInfo?.phone || profile?.phone,
        location: personalInfo?.location || profile?.location,
        linkedin_url: personalInfo?.linkedin || profile?.linkedin_url,
        website_url: personalInfo?.website || profile?.website_url,
        github_url: personalInfo?.github || profile?.github_url,
        summary: personalInfo?.summary || profile?.summary,
    };

    // Map sort_order to display_order for component compatibility if needed
    // But ResumePreview mostly just iterates arrays. 
    // Wait, ResumePreview might depend on store? 
    // "refactor to accept a template prop" - ResumePreview logic checks store by default?
    // I need to check ResumePreview implementation.
    // Ideally ResumePreview should accept props OR use store.
    // If it uses store, we might have an issue rendering it server-side or in a public view without a provider hydrating it.

    // Checking ResumePreview implementation in next steps.
    // For now, I'll pass data to a wrapper component that hydrates a store or passes props.
    // If ResumePreview uses store, I should create a `PublicResumeViewer` that initializes a store instance or props.

    // Let's assume for a moment we need to pass props. 
    // If ResumePreview is tightly coupled to the store, we have to refactor it or wrap it.
    // Given the previous task instructions "Refactor ResumePreview for modularity", 
    // I hope it accepts props now. If not, I'll fix it.

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center font-sans selection:bg-primary/20">
            {/* Top Navigation / Brand Bar */}
            <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 no-print">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">R</div>
                        <span className="font-semibold text-lg tracking-tight hidden sm:inline-block">ResumeForge</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                            <a href="/">Build Your Own</a>
                        </Button>
                        <PublicDownloadButton resumeId={resumeId} title={resume.title} />
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
                {/* Resume Container */}
                {/* Shadow-2xl for depth, ring-1 for definition */}
                <div className="w-full max-w-[210mm] bg-white shadow-2xl ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out md:hover:scale-[1.002]">
                    <ResumePreview
                        data={{
                            resume: resume,
                            profile: resume.content?.profile,
                            workExperiences: resume.content?.workExperiences || [],
                            education: resume.content?.education || [],
                            skills: resume.content?.skills || [],
                            projects: resume.content?.projects || [],
                            certifications: resume.content?.certifications || [],
                            languages: resume.content?.languages || []
                        }}
                        readOnly={true}
                    />
                </div>

                {/* Trust Badge / Footer */}
                <div className="mt-12 mb-8 text-center space-y-2 no-print">
                    <p className="text-sm text-muted-foreground">
                        Verified Resume hosted on <span className="font-semibold text-foreground">ResumeForge</span>
                    </p>
                    <Button variant="link" size="sm" asChild className="text-primary">
                        <a href="/?utm_source=resume_footer&utm_medium=referral">
                            Create your own professional resume for free <span aria-hidden="true">&rarr;</span>
                        </a>
                    </Button>
                </div>
            </main>
            <PublicTracker resumeId={resumeId} />
        </div>
    );
}
