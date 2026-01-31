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

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: portfolio } = await supabase
        .from("portfolios")
        .select("full_name, bio, tagline")
        .eq("slug", slug)
        .single();

    if (!portfolio) return { title: "Portfolio Not Found" };

    const title = `${portfolio.full_name || slug} - Professional Portfolio`;
    const description = portfolio.bio || portfolio.tagline || "Professional career portfolio and showcase.";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "profile",
            url: `https://yourdomain.com/p/${slug}`,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
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

    // 2. Fetch profile, resumes, projects, and testimonials
    const [
        { data: profile },
        { data: resumes },
        { data: projects },
        { data: testimonials }
    ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", portfolio.user_id).single(),
        supabase.from("resumes").select("*").eq("user_id", portfolio.user_id).order("updated_at", { ascending: false }),
        supabase.from("projects").select("*").eq("user_id", portfolio.user_id).order("created_at", { ascending: false }),
        supabase.from("portfolio_testimonials").select("*").eq("portfolio_id", portfolio.id).eq("is_active", true)
    ]);

    // 3. Increment view count (fire and forget)
    try {
        await supabase.rpc("increment_portfolio_views", { portfolio_id_param: portfolio.id });
    } catch (error) {
        console.error("Failed to increment view count:", error);
    }

    // 4. Select template based on portfolio setting
    const template = portfolio.template || "modern";
    const templateProps = {
        portfolio,
        resumes: resumes || [],
        projects: projects || [],
        profile: profile || { email: portfolio.user_id },
        testimonials: testimonials || [],
    };

    // 5. Render the selected template
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
