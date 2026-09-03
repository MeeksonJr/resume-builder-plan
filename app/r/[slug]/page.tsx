import { notFound } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { PublicTracker } from "@/components/analytics/public-tracker";
import { PublicResumeClient } from "@/components/public/public-resume-client";

interface PublicResumePageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicResumePageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createServerClient();

    // Query resume directly by slug without invalid foreign joins
    const { data: resume } = await supabase
        .from("resumes")
        .select("id, title, user_id, updated_at")
        .eq("slug", slug)
        .eq("is_public", true)
        .maybeSingle();

    if (!resume) {
        return {
            title: "Resume Not Found | ResumeForge",
            description: "The requested resume could not be found or is set to private.",
        };
    }

    // Fetch candidate identity from personal_info or profile
    const [{ data: personalInfo }, { data: profile }] = await Promise.all([
        supabase.from("personal_info").select("full_name, summary").eq("resume_id", resume.id).maybeSingle(),
        supabase.from("profiles").select("full_name").eq("id", resume.user_id).maybeSingle(),
    ]);

    const candidateName = personalInfo?.full_name || profile?.full_name || "Candidate";
    const cleanSummary =
        personalInfo?.summary?.replace(/<[^>]*>/g, "").slice(0, 160) ||
        `View ${candidateName}'s verified professional resume on ResumeForge.`;

    const pageUrl = `https://resume-builder-plan.vercel.app/r/${slug}`;

    return {
        title: `${candidateName} - ${resume.title} | ResumeForge`,
        description: cleanSummary,
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title: `${candidateName} - ${resume.title}`,
            description: cleanSummary,
            url: pageUrl,
            siteName: "ResumeForge",
            type: "profile",
            images: [
                {
                    url: `/api/og?title=${encodeURIComponent(resume.title)}&name=${encodeURIComponent(candidateName)}`,
                    width: 1200,
                    height: 630,
                    alt: `${candidateName}'s Resume`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${candidateName} - ${resume.title}`,
            description: cleanSummary,
            images: [`/api/og?title=${encodeURIComponent(resume.title)}&name=${encodeURIComponent(candidateName)}`],
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

    // 2. Fetch all related resume data in parallel
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

    // Merge profile with resume personal_info so contact details & summary are 100% available
    const mergedProfile = {
        ...profile,
        full_name: personalInfo?.full_name || profile?.full_name || "Candidate",
        email: personalInfo?.email || profile?.email || "",
        phone: personalInfo?.phone || profile?.phone || "",
        location: personalInfo?.location || profile?.location || "",
        linkedin_url: personalInfo?.linkedin || profile?.linkedin_url || "",
        website_url: personalInfo?.website || profile?.website_url || "",
        github_url: personalInfo?.github || profile?.github_url || "",
        summary: personalInfo?.summary || profile?.summary || "",
    };

    // Normalize education: map DB achievements to highlights so coursework renders seamlessly
    const mappedEducation = (education || []).map((e: any) => ({
        ...e,
        highlights: e.highlights || e.achievements || [],
        sort_order: e.sort_order,
    }));

    // Normalize languages: map DB name to language so language names never render blank
    const mappedLanguages = (languages || []).map((l: any) => ({
        ...l,
        language: l.language || l.name || "",
        sort_order: l.sort_order,
    }));

    const candidateName = mergedProfile.full_name;
    const cleanSummary = mergedProfile.summary?.replace(/<[^>]*>/g, "") || "";

    const fullData = {
        resume,
        profile: mergedProfile,
        personalInfo: personalInfo || {},
        workExperiences: workExperiences || [],
        education: mappedEducation,
        skills: skills || [],
        projects: projects || [],
        certifications: certifications || [],
        languages: mappedLanguages,
    };

    // JSON-LD Structured Data for Google/Search Engines
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        dateModified: resume.updated_at,
        mainEntity: {
            "@type": "Person",
            name: candidateName,
            description: cleanSummary.slice(0, 200),
            jobTitle: resume.title,
            url: `https://resume-builder-plan.vercel.app/r/${slug}`,
            address: mergedProfile.location || undefined,
            sameAs: [
                mergedProfile.linkedin_url,
                mergedProfile.github_url,
                mergedProfile.website_url,
            ].filter(Boolean),
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PublicTracker resumeId={resumeId} />
            <PublicResumeClient
                data={fullData}
                candidateName={candidateName}
                resumeCode={JSON.stringify(fullData)}
            />
        </>
    );
}
