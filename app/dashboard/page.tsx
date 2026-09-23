import { createClient } from "@/lib/supabase/server";
import { CustomizableDashboardView } from "@/components/dashboard/customizable-dashboard-view";

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

  const { data: savedAts } = await supabase
    .from("saved_ats_analyses")
    .select("score")
    .eq("user_id", user.id);

  const { data: savedSalary } = await supabase
    .from("saved_salary_insights")
    .select("id")
    .eq("user_id", user.id);

  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id);

  const highestAtsScore = Math.max(0, ...(savedAts?.map((a: any) => a.score || 0) || [0]));

  // Derive isPro from either column so a stale is_pro boolean doesn't hide Pro status
  const isPro = profile?.is_pro === true ||
    profile?.subscription_status === "active" ||
    profile?.subscription_status === "trialing";

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
    <CustomizableDashboardView
      user={user}
      displayName={displayName}
      resumes={resumes || []}
      events={events || []}
      applications={applications || []}
      interviews={interviews || []}
      profile={profile}
      isPro={isPro}
      highestAtsScore={highestAtsScore}
      savedAts={savedAts || []}
      savedSalary={savedSalary || []}
      portfolios={portfolios || []}
      canvasCourses={canvasCourses || []}
      canvasAssignments={canvasAssignments || []}
      canvasGrades={canvasGrades || []}
      hasCanvasConfig={hasCanvasConfig}
    />
  );
}

