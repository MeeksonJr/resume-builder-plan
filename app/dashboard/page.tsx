import { createClient } from "@/lib/supabase/server";
import { ResumeList } from "@/components/dashboard/resume-list";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AnalyticsView } from "@/components/dashboard/analytics-view";
import { WelcomeTour } from "@/components/dashboard/welcome-tour";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { CanvasCourseWidget } from "@/components/dashboard/canvas-course-widget";
import { JobRecommendationsWidget } from "@/components/dashboard/job-recommendations-widget";
import { ArrowUpRight, Briefcase, FileText, Plus, Sparkles, Target, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardPageProps {
  searchParams: Promise<{ success?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { success } = await searchParams;
  if (success === "true") {
    await supabase
      .from("profiles")
      .update({
        is_pro: true,
        subscription_status: "active"
      })
      .eq("id", user.id);
  }

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
    .select("email, bio, is_pro, subscription_status, full_name, canvas_instance_url")
    .eq("id", user.id)
    .single();

  // Derive isPro from either column so a stale is_pro boolean doesn't hide Pro status
  const isPro = profile?.is_pro === true ||
    profile?.subscription_status === "active" ||
    profile?.subscription_status === "trialing";

  console.log("[DashboardPage] Raw fetched profile:", profile);

  // Fetch Canvas coursework details
  const { data: canvasCourses } = await supabase
    .from("canvas_courses")
    .select("*")
    .eq("user_id", user.id);

  const { data: canvasAssignments } = await supabase
    .from("canvas_assignments")
    .select("*")
    .eq("user_id", user.id);

  const { data: canvasGrades } = await supabase
    .from("canvas_grades")
    .select("*")
    .eq("user_id", user.id);

  const hasCanvasConfig = !!profile?.canvas_instance_url;
  const displayName = profile?.full_name || profile?.email?.split("@")[0] || user.email?.split("@")[0];

  return (
    <div className="relative space-y-10 pb-20">
      <section className="relative overflow-hidden border border-[#102b2b]/15 bg-[#102b2b] p-6 text-[#f8f4ec] shadow-[14px_16px_0_rgba(16,43,43,.12)] sm:p-8 lg:p-10">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#d8f36b]/20" />
        <div className="absolute -right-8 top-0 h-52 w-52 rounded-full border border-[#d8f36b]/15" />
        <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 border border-[#d8f36b]/25 bg-[#d8f36b]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#d8f36b]">
              <Sparkles className="h-3.5 w-3.5" /> ResumeForge workspace
            </div>
            <h1 className="text-4xl font-semibold leading-[.98] tracking-[-.06em] sm:text-6xl">Good to see you, {displayName || "there"}.</h1>
            <p className="max-w-xl text-base leading-relaxed text-[#c5d7d1] sm:text-lg">Keep your career materials moving. Build a resume, tailor it to a role, or check what needs your attention next.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-none bg-[#d8f36b] px-5 font-semibold text-[#102b2b] hover:bg-[#e5ff8b]"><Link href="/dashboard/resume/new"><Plus className="h-4 w-4" /> New resume</Link></Button>
            <Button asChild variant="outline" className="h-12 rounded-none border-[#c5d7d1]/30 bg-transparent px-5 text-[#f8f4ec] hover:bg-white/10"><Link href="/dashboard/upload"><Upload className="h-4 w-4" /> Import existing</Link></Button>
          </div>
        </div>
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-3 border-t border-[#c5d7d1]/15 pt-6 sm:grid-cols-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a6c0b8]">Resumes</p><p className="mt-1 text-2xl font-semibold">{resumes?.length || 0}</p></div>
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a6c0b8]">Applications</p><p className="mt-1 text-2xl font-semibold">{applications?.length || 0}</p></div>
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a6c0b8]">Interviews</p><p className="mt-1 text-2xl font-semibold">{interviews?.length || 0}</p></div>
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a6c0b8]">Plan</p><p className="mt-1 text-2xl font-semibold text-[#d8f36b]">{isPro ? "Pro" : "Free"}</p></div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/optimize" className="group border border-[#102b2b]/15 bg-[#f8f4ec] p-5 transition-colors hover:border-[#0d8274]/50 hover:bg-white"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center bg-[#d8f36b]"><Target className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-[#0d8274] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div><h2 className="mt-6 font-semibold">Optimize for a role</h2><p className="mt-1 text-sm leading-relaxed text-[#52716a]">Compare your resume with a job description and find the gaps worth fixing.</p></Link>
        <Link href="/dashboard/tracker" className="group border border-[#102b2b]/15 bg-[#f8f4ec] p-5 transition-colors hover:border-[#0d8274]/50 hover:bg-white"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center bg-[#dbe8df]"><Briefcase className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-[#0d8274] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div><h2 className="mt-6 font-semibold">Track the search</h2><p className="mt-1 text-sm leading-relaxed text-[#52716a]">Keep applications, follow-ups, and next actions in one visible place.</p></Link>
        <Link href="/dashboard/interview-prep" className="group border border-[#102b2b]/15 bg-[#f8f4ec] p-5 transition-colors hover:border-[#0d8274]/50 hover:bg-white"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center bg-[#dbe8df]"><Sparkles className="h-5 w-5 text-[#0d8274]" /></span><ArrowUpRight className="h-4 w-4 text-[#0d8274] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div><h2 className="mt-6 font-semibold">Prepare for the room</h2><p className="mt-1 text-sm leading-relaxed text-[#52716a]">Practice answers and turn feedback into a stronger interview plan.</p></Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 border-t border-[#102b2b]/15 pt-8">
        {/* Main Document Workspace */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-[-.04em]">
                <FileText className="h-5 w-5 text-[#0d8274]" />
                <span>Career & Application Documents</span>
              </h2>
              <p className="text-xs text-[#52716a] sm:text-sm">
                Manage the documents and decisions that support your next move.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/dashboard/resume/new">
                <Button size="sm" className="rounded-none bg-[#102b2b] text-xs font-medium text-[#f8f4ec] hover:bg-[#164743]">
                  <Plus className="h-3.5 w-3.5" /> Create resume
                </Button>
              </Link>
              <Link href="/dashboard/cover-letters">
                <Button size="sm" variant="outline" className="rounded-none border-[#102b2b]/20 text-xs text-[#365950]">
                  Cover Letters
                </Button>
              </Link>
            </div>
          </div>

          <OnboardingChecklist resumeCount={resumes?.length || 0} isPro={isPro} />
          <WelcomeTour
            resumesCount={resumes?.length || 0}
            applicationsCount={applications?.length || 0}
            interviewsCount={interviews?.length || 0}
            hasPortfolio={!!profile?.full_name || !!profile?.bio}
          />

          {resumes && resumes.length > 0 ? (
            <>
              <section className="relative">
                <AnalyticsView resumes={resumes} events={events || []} />
              </section>

              <section className="relative pt-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#0d8274]/20 to-transparent" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0d8274]/60 whitespace-nowrap">Your Resumes & Portfolios</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#0d8274]/20 to-transparent" />
                </div>
                <ResumeList resumes={resumes} />
              </section>
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Sidebar Workspace */}
        <div className="space-y-8">
          <CanvasCourseWidget
            hasConfig={hasCanvasConfig}
            courses={canvasCourses || []}
            assignments={canvasAssignments || []}
            grades={canvasGrades || []}
          />
          <JobRecommendationsWidget />
        </div>
      </div>
    </div>
  );
}
