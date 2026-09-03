import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
    ModernTemplate,
    MinimalTemplate,
    CorporateTemplate,
    CreativeTemplate,
} from "@/components/portfolio/templates";

interface PortfolioPageProps {
    params: Promise<{
        slug: string;
    }>;
}

// Define metadataBase for resolving absolute URLs in this route segment
export const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL || "https://resumebuilder.ai");

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: portfolio } = await supabase
        .from("portfolios")
        .select("full_name, bio, tagline, seo_title, seo_description, og_image_url")
        .eq("slug", slug)
        .single();

    if (!portfolio) return { title: "Portfolio Not Found" };

    const title = portfolio.seo_title || `${portfolio.full_name || slug} - Professional Portfolio`;
    const description = portfolio.seo_description || portfolio.bio || portfolio.tagline || "Professional career portfolio and showcase.";
    const ogImage = portfolio.og_image_url;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "profile",
            url: `${baseUrl}/p/${slug}`,
            images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ogImage ? [ogImage] : undefined,
        },
    };
}

export default async function PublicPortfolioPage({ params }: PortfolioPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // 1. Fetch portfolio by slug
    const { data: portfolio, error: pError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!portfolio || pError) {
        notFound();
    }

    if (!portfolio.is_public) {
        notFound();
    }

    // 2. Fetch profile, resumes, projects, testimonials, and Canvas verified courses
    const [
        { data: profile },
        { data: rawResumes },
        { data: projects },
        { data: testimonials },
        { data: canvasCourses }
    ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", portfolio.user_id).single(),
        supabase.from("resumes").select("*").eq("user_id", portfolio.user_id).order("updated_at", { ascending: false }),
        supabase.from("projects").select("*").eq("user_id", portfolio.user_id).order("created_at", { ascending: false }),
        supabase.from("portfolio_testimonials").select("*").eq("portfolio_id", portfolio.id).eq("is_active", true),
        supabase.from("canvas_courses").select("id, name, course_code").eq("user_id", portfolio.user_id),
    ]);

    // 2b. Hydrate resumes with their full child tables (summary, skills, work, education, projects)
    const resumeIds = (rawResumes || []).map(r => r.id);
    let enrichedResumes: any[] = rawResumes || [];

    if (resumeIds.length > 0) {
        const [
            { data: allPersonalInfo },
            { data: allWork },
            { data: allSkills },
            { data: allEdu },
            { data: allProjects }
        ] = await Promise.all([
            supabase.from("personal_info").select("*").in("resume_id", resumeIds),
            supabase.from("work_experiences").select("*").in("resume_id", resumeIds).order("sort_order"),
            supabase.from("skills").select("*").in("resume_id", resumeIds).order("sort_order"),
            supabase.from("education").select("*").in("resume_id", resumeIds).order("sort_order"),
            supabase.from("projects").select("*").in("resume_id", resumeIds).order("sort_order"),
        ]);

        enrichedResumes = (rawResumes || []).map(r => {
            const pi = allPersonalInfo?.find(p => p.resume_id === r.id);
            const skills = allSkills?.filter(s => s.resume_id === r.id).flatMap(s => s.skills || (s.name ? [s.name] : []));
            const work = allWork?.filter(w => w.resume_id === r.id);
            const edu = allEdu?.filter(e => e.resume_id === r.id);
            const projs = allProjects?.filter(p => p.resume_id === r.id);

            return {
                ...r,
                personal_info: pi || null,
                professional_summary: pi?.summary || "",
                skills: skills || [],
                work_experiences: work || [],
                education: edu || [],
                projects: projs || [],
            };
        });
    }

    // 3. Increment view count (fire and forget)
    try {
        const headersList = await import("next/headers").then((h) => h.headers());
        const referrer = headersList.get("referer") || "direct";
        const userAgent = headersList.get("user-agent") || "unknown";

        await supabase.rpc("increment_portfolio_views", {
            portfolio_id_param: portfolio.id,
            referrer_param: referrer,
            path_param: `/p/${slug}`,
            user_agent_param: userAgent
        });
    } catch (error) {
        console.error("Failed to increment view count:", error);
    }

    // 4. Filter to only featured items
    const featuredProjectIds = portfolio.featured_projects || [];
    const featuredResumes = (portfolio.featured_resumes || [])
        .map((id: string) => enrichedResumes.find((r) => r.id === id))
        .filter(Boolean);

    // Improved project filtering
    let featuredProjects = [];
    if (featuredProjectIds.length > 0 && projects) {
        featuredProjects = projects.filter((p) => featuredProjectIds.includes(p.id));
    }

    // Fallback: If filtering resulted in 0 projects (but user has projects), 
    // AND they haven't explicitly selected an empty list (i.e., if featuredProjectIds was empty to begin with),
    // show the latest ones.
    if (featuredProjects.length === 0 && (!featuredProjectIds.length || featuredProjectIds.length === 0)) {
        featuredProjects = (projects || []).slice(0, 6);
    }

    // 5. Select template based on portfolio setting
    const template = portfolio.template || "modern";
    const layoutStyle = portfolio.theme_settings?.style || "professional";

    const templateProps = {
        portfolio,
        resumes: featuredResumes.length > 0 ? featuredResumes : enrichedResumes,
        projects: featuredProjects,
        profile: profile || { email: portfolio.user_id },
        testimonials: testimonials || [],
        canvasCourses: canvasCourses || [],
        accentColor: portfolio.accent_color || "#3b82f6",
        layoutStyle, // Passing the layout style
    };

    // 6. Render the selected template
    switch (template) {
        case "minimal":
            return <MinimalTemplate {...templateProps} />;
        case "corporate":
            return <CorporateTemplate {...templateProps} />;
        case "creative":
            return <CreativeTemplate {...templateProps} />;
        case "modern":
        default:
            return <ModernTemplate {...templateProps} />;
    }
}
