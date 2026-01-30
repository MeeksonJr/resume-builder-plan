import { createClient } from "@/lib/supabase/server";
import { ResumeList } from "@/components/dashboard/resume-list";
import { EmptyState } from "@/components/dashboard/empty-state";

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
        <ResumeList resumes={resumes} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
