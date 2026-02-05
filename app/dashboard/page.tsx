import { createClient } from "@/lib/supabase/server";
import { ResumeList } from "@/components/dashboard/resume-list";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AnalyticsView } from "@/components/dashboard/analytics-view";
import { WelcomeTour } from "@/components/dashboard/welcome-tour";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";

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

  // Profile is already fetched in layout, but we need it here for logic or let's fetch essential fields
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, bio, is_pro")
    .eq("id", user.id)
    .single();

  return (
    <div className="relative space-y-12 pb-20">
      {/* Background Decorative Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-primary/2 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col gap-6 px-4 md:px-0 sm:flex-row sm:items-center sm:justify-between relative">
        <div className="space-y-1">
          <h1 className="text-4xl font-heading font-black tracking-tighter md:text-5xl lg:text-6xl gradient-text">
            My Resumes
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-lg">
            Manage your career assets with AI-powered precision.
          </p>
        </div>
      </div>

      <div className="space-y-16">
        <OnboardingChecklist resumeCount={resumes?.length || 0} isPro={!!profile?.is_pro} />
        <WelcomeTour
          resumesCount={resumes?.length || 0}
          applicationsCount={applications?.length || 0}
          interviewsCount={interviews?.length || 0}
          hasPortfolio={!!profile?.username || !!profile?.bio} // A rough check for portfolio setup
        />

        {resumes && resumes.length > 0 ? (
          <>
            <section className="relative">
              <AnalyticsView resumes={resumes} events={events || []} />
            </section>

            <section className="relative pt-4">
              <div className="flex items-center gap-4 mb-8 px-4 md:px-0">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 whitespace-nowrap">Your Portfolio</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
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
