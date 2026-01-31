import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { Metadata } from "next";

interface PortfolioPageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
    const supabase = await createClient();
    const { data: portfolio } = await supabase
        .from("portfolios")
        .select("bio")
        .eq("slug", params.slug)
        .single();

    if (!portfolio) return { title: "Portfolio Not Found" };

    return {
        title: `${params.slug}'s Career Portfolio | ResumeForge`,
        description: portfolio.bio || "Professional career portfolio and resumes.",
    };
}

export default async function PublicPortfolioPage({ params }: PortfolioPageProps) {
    const supabase = await createClient();

    // 1. Fetch portfolio by slug
    const { data: portfolio, error: pError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("slug", params.slug)
        .single();

    if (!portfolio || pError) {
        notFound();
    }

    if (!portfolio.is_public) {
        // You could return a custom "Private Portfolio" page here
        notFound();
    }

    // 2. Fetch profile, resumes, and projects for this user
    const [
        { data: profile },
        { data: resumes },
        { data: projects }
    ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", portfolio.user_id).single(),
        supabase.from("resumes").select("*").eq("user_id", portfolio.user_id).order("updated_at", { ascending: false }),
        supabase.from("projects").select("*").eq("user_id", portfolio.user_id).order("created_at", { ascending: false })
    ]);

    // Note: We'll filter resumes and projects in the PortfolioView based on the featured_resumes/featured_projects arrays in the portfolio record.

    return (
        <PortfolioView
            portfolio={portfolio}
            resumes={resumes || []}
            projects={projects || []}
            profile={profile || { email: portfolio.user_id }}
        />
    );
}
