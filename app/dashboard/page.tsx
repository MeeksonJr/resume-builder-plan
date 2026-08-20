import { createClient } from "@/lib/supabase/server";
import { ResumeList } from "@/components/dashboard/resume-list";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AnalyticsView } from "@/components/dashboard/analytics-view";
import { WelcomeTour } from "@/components/dashboard/welcome-tour";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { FundingOverview } from "@/components/dashboard/funding-overview";
import { Sparkles, FileText, Briefcase, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: resumes } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  // Fetch recent events (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: events } = await supabase
    .from("resume_events")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  const { data: applications } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", user.id);

  const { data: interviews } = await supabase
    .from("interview_sessions")
    .select("id")
    .eq("user_id", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, bio, is_pro, full_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || profile?.username || user.email?.split("@")[0];

  return (
    <div className="relative space-y-12 pb-20">
      {/* Background Decorative Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Primary Section: AI Funding, Scholarships & Grants */}
      <FundingOverview userName={displayName} />

      {/* Secondary Section: Career Assets, Resumes, and Portfolio Tools */}
      <div className="pt-8 border-t border-slate-800/80 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Career & Application Documents</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage your tailored resumes, cover letters, and application portfolios.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/resume/new">
              <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs">
                + Create Resume
              </Button>
            </Link>
            <Link href="/dashboard/cover-letters">
              <Button size="sm" variant="outline" className="rounded-xl border-slate-700 text-slate-300 text-xs">
                Cover Letters
              </Button>
            </Link>
          </div>
        </div>

        <OnboardingChecklist resumeCount={resumes?.length || 0} isPro={!!profile?.is_pro} />
        <WelcomeTour
          resumesCount={resumes?.length || 0}
          applicationsCount={applications?.length || 0}
          interviewsCount={interviews?.length || 0}
          hasPortfolio={!!profile?.username || !!profile?.bio}
        />

        {resumes && resumes.length > 0 ? (
          <>
            <section className="relative">
              <AnalyticsView resumes={resumes} events={events || []} />
            </section>

            <section className="relative pt-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60 whitespace-nowrap">Your Resumes & Portfolios</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
              </div>
              <ResumeList resumes={resumes} />
            </section>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
