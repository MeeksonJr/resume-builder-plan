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
        openGraph: {
            title: `${userName} - ${resume.title}`,
            description: `View ${userName}'s professional resume hosted on ResumeForge.`,
            images: [
                {
                    url: `/api/og?title=${encodeURIComponent(resume.title)}&name=${encodeURIComponent(userName)}`,
                    width: 1200,
                    height: 630,
                    alt: `${userName}'s Resume`,
                },
            ],
            type: "profile",
        },
        twitter: {
            card: "summary_large_image",
            title: `${userName} - ${resume.title}`,
            description: `View ${userName}'s professional resume on ResumeForge.`,
            images: [`/api/og?title=${encodeURIComponent(resume.title)}&name=${encodeURIComponent(userName)}`],
        },
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

    // 3. Render
    // Ensure we pass safe defaults. mismatched join types (array vs object) can cause issues,
    // but here we are fetching directly from tables so we get objects or null (with maybeSingle) or arrays (with just select).
    // The queries above use `order()` which implies returning arrays for lists.
    // `maybeSingle()` returns object or null.

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <PublicTracker resumeId={resumeId} />
            {/* Force light mode for the resume container to match print styles, or handle themes properly */}
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{resume.title}</h1>
                        <p className="text-muted-foreground">
                            Last updated {new Date(resume.updated_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <PublicDownloadButton
                            user={resume.user}
                            resumeId={resume.id}
                            title={resume.title}
                            resumeCode={JSON.stringify({
                                resume,
                                profile: profile || {},
                                personalInfo: personalInfo || {},
                                workExperiences: workExperiences || [],
                                education: education || [],
                                skills: skills || [],
                                projects: projects || [],
                                certifications: certifications || [],
                                languages: languages || [],
                            })}
                        />
                    </div>
                </div>

                <div className="mx-auto max-w-[210mm] shadow-2xl print:shadow-none print:max-w-none">
                    <ResumePreview
                        data={{
                            resume,
                            profile: profile || {},
                            personalInfo: personalInfo || {},
                            workExperiences: workExperiences || [],
                            education: education || [],
                            skills: skills || [],
                            projects: projects || [],
                            certifications: certifications || [],
                            languages: languages || [],
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
        </div>
    );
}
