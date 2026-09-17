import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VisualPortfolioBuilderStudioClient } from "@/components/portfolio/visual-portfolio-builder-studio-client";

export const metadata = {
  title: "Visual Portfolio Canvas Studio | ResumeForge",
  description: "Canva and Scratch-style drag-and-drop visual canvas editor for your career portfolio.",
};

export default async function PortfolioStudioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user portfolio
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch resumes
  const { data: resumes } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  // Fetch projects
  const { data: projects } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("portfolio_id", portfolio?.id || "")
    .order("created_at", { ascending: false });

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <VisualPortfolioBuilderStudioClient
        initialPortfolio={portfolio}
        resumes={resumes || []}
        projects={projects || []}
        profile={profile}
      />
    </div>
  );
}
