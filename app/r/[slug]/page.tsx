import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // Use client for public fetch or server? Server is better for SEO but need public access.
// Using server client for fetching
import { createClient as createServerClient } from "@/lib/supabase/server";
import { ResumePreview } from "@/components/editor/resume-preview";
import { Metadata } from "next";

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
        .single();

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
        .single();

    if (!resume) {
        notFound();
    }

    const resumeId = resume.id;

    // Increment view count (fire and forget in background)
    supabase.rpc("increment_resume_view", { resume_id_param: resumeId }).then(({ error }) => {
        if (error) console.error("Error incrementing view count:", error);
    });

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
        supabase.from("profiles").select("*").eq("id", resume.user_id).single(),
        supabase.from("personal_info").select("*").eq("resume_id", resumeId).single(),
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
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-[210mm]">
                {/* We need to ensure ResumePreview can take raw data. */}
                <ResumePreview
                    data={{
                        resume,
                        profile: mergedProfile,
                        workExperiences: workExperiences || [],
                        education: education || [],
                        skills: skills || [],
                        projects: projects || [],
                        certifications: certifications || [],
                        languages: languages || []
                    }}
                    readOnly={true}
                />
            </div>
        </div>
    );
}
