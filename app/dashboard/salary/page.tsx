import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SalaryIntelligenceHub } from "@/components/dashboard/career/salary-intelligence-hub";

export const metadata = {
  title: "Compensation Benchmark & Negotiation Coach | ResumeForge",
  description: "Live salary benchmarking, total compensation offer evaluator, and AI counter-offer negotiation scripts.",
};

interface SalaryPageProps {
  searchParams: Promise<{
    role?: string;
    company?: string;
  }>;
}

export default async function SalaryPage({ searchParams }: SalaryPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const resolvedSearchParams = await searchParams;

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 2. Fetch User Resumes
  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, target_role")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  // 3. Fetch User Applications
  const { data: applications } = await supabase
    .from("applications")
    .select("id, company, role, salary_target, salary_range")
    .eq("user_id", user.id)
    .order("applied_at", { ascending: false });

  return (
    <div className="min-h-full bg-[#f8f4ec] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SalaryIntelligenceHub
          profile={profile}
          resumes={resumes || []}
          applications={applications || []}
          initialRole={resolvedSearchParams.role || ""}
          initialCompany={resolvedSearchParams.company || ""}
        />
      </div>
    </div>
  );
}
