import { createClient } from "@/lib/supabase/server";
import { ResumeList } from "@/components/dashboard/resume-list";
import { EmptyState } from "@/components/dashboard/empty-state";
import dynamic from "next/dynamic";
import DashboardLoading from "./loading";

const AnalyticsView = dynamic(() => import("@/components/dashboard/analytics-view").then(mod => mod.AnalyticsView), {
  ssr: false,
  loading: () => <DashboardLoading /> // Or a more specific chunk of the skeleton
});

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, updated_at, created_at, is_public, slug, template_id, view_count, is_primary, is_archived, last_viewed_at")
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            My Resumes
          </h1>
          <p className="mt-1 text-muted-foreground">
            Create, edit, and manage your resumes
          </p>
        </div>
      </div>

      {resumes && resumes.length > 0 ? (
        <>
          <AnalyticsView resumes={resumes} events={events || []} />
          <ResumeList resumes={resumes} />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
