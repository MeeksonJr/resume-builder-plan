import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { DedicatedJobPortfolioView } from "@/components/portfolio/dedicated-job-portfolio-view";
import { Lock, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DedicatedJobPageProps {
  params: Promise<{
    slug: string;
    applicationId: string;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: DedicatedJobPageProps): Promise<Metadata> {
  const { slug, applicationId } = await params;
  const supabase = await createClient();

  const { data: application } = await supabase
    .from("applications")
    .select("company, role, dedicated_portfolio_enabled")
    .eq("id", applicationId)
    .maybeSingle();

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("full_name")
    .eq("slug", slug)
    .maybeSingle();

  const candidateName = portfolio?.full_name || "Candidate";
  const company = application?.company || "Company";
  const role = application?.role || "Position";

  return {
    title: `${candidateName} - Tailored Dossier for ${company} (${role})`,
    description: `Personalized career portfolio and verified credentials prepared by ${candidateName} for the ${role} role at ${company}.`,
  };
}

export default async function DedicatedJobPage({ params }: DedicatedJobPageProps) {
  const { slug, applicationId } = await params;
  const supabase = await createClient();

  // 1. Fetch portfolio by slug
  const { data: portfolio, error: pError } = await supabase
    .from("portfolios")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!portfolio || pError || !portfolio.is_public) {
    notFound();
  }

  // 2. Fetch application
  const { data: application, error: aError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (!application || aError || application.user_id !== portfolio.user_id) {
    notFound();
  }

  // 3. Plan Tier Check: Dedicated job portfolio page requires dedicated_portfolio_enabled = true
  if (!application.dedicated_portfolio_enabled) {
    return (
      <div className="min-h-screen bg-[#070b12] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl border border-white/10 bg-[#0d1422] text-center space-y-5 shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">Dedicated Job Dossier (Pro Feature)</h1>
            <p className="text-xs text-white/60 leading-relaxed">
              Dedicated job microsites tailored specifically for company applications require a verified Pro subscription.
            </p>
          </div>
          <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 rounded-xl">
            <Link href={`/p/${slug}`}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Return to Public Portfolio
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // 4. Fetch Profile, Canvas Courses, Tailored Resume and Cover Letter
  const [
    { data: profile },
    { data: canvasCourses },
    { data: coverLetter },
    { data: rawResume },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", portfolio.user_id).single(),
    supabase.from("canvas_courses").select("id, name, course_code").eq("user_id", portfolio.user_id),
    application.cover_letter_id
      ? supabase.from("cover_letters").select("*").eq("id", application.cover_letter_id).maybeSingle()
      : Promise.resolve({ data: null }),
    (application.tailored_resume_id || application.resume_id)
      ? supabase.from("resumes").select("*").eq("id", application.tailored_resume_id || application.resume_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  // 5. Hydrate tailored resume child records
  let enrichedResume = rawResume;
  if (rawResume?.id) {
    const [
      { data: pi },
      { data: work },
      { data: skills },
      { data: edu },
      { data: projs },
    ] = await Promise.all([
      supabase.from("personal_info").select("*").eq("resume_id", rawResume.id).maybeSingle(),
      supabase.from("work_experiences").select("*").eq("resume_id", rawResume.id).order("sort_order"),
      supabase.from("skills").select("*").eq("resume_id", rawResume.id).order("sort_order"),
      supabase.from("education").select("*").eq("resume_id", rawResume.id).order("sort_order"),
      supabase.from("projects").select("*").eq("resume_id", rawResume.id).order("sort_order"),
    ]);

    enrichedResume = {
      ...rawResume,
      personal_info: pi || null,
      work_experiences: work || [],
      skills: skills || [],
      education: edu || [],
      projects: projs || [],
    };
  }

  return (
    <DedicatedJobPortfolioView
      portfolio={portfolio}
      profile={profile || {}}
      application={application}
      tailoredResume={enrichedResume}
      coverLetter={coverLetter}
      canvasCourses={canvasCourses || []}
      slug={slug}
    />
  );
}
