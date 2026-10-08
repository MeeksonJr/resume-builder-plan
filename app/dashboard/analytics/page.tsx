import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CareerIntelligenceDashboard } from "@/components/analytics/career-intelligence-dashboard";

export const metadata = {
  title: "Career Analytics & Intelligence | ResumeForge",
  description:
    "Unified career intelligence dashboard — resume engagement, application pipeline, interview trends, ATS history, and AI trajectory reports.",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, is_pro, subscription_status")
    .eq("id", user.id)
    .single();

  const isPro =
    profile?.is_pro === true ||
    profile?.subscription_status === "active" ||
    profile?.subscription_status === "trialing";

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8 text-foreground min-w-0 max-w-full overflow-hidden">
      <div className="mx-auto max-w-7xl space-y-8 min-w-0">
        <div className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              Enterprise intelligence
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Career Analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Your unified command center — every data stream, every metric,
              every insight, in one place.
            </p>
          </div>
        </div>

        <CareerIntelligenceDashboard isPro={isPro} />
      </div>
    </div>
  );
}
