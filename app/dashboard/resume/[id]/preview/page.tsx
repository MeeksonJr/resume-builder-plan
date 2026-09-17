import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResumePreview } from "@/components/editor/resume-preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Share2, Edit3, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

interface ResumePreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResumePreviewStandalonePage({ params }: ResumePreviewPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Query resume (by id, whether owner or shared)
  let { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // If not found, fetch latest user resume or provide fallback
  if (!resume && user) {
    const { data: latest } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    resume = latest;
  }

  // Fetch associated child records
  const targetId = resume?.id || id;
  const [
    { data: personalInfo },
    { data: workExperiences },
    { data: education },
    { data: skills },
    { data: projects },
    { data: certifications },
    { data: languages },
  ] = await Promise.all([
    supabase.from("personal_info").select("*").eq("resume_id", targetId).maybeSingle(),
    supabase.from("work_experiences").select("*").eq("resume_id", targetId).order("sort_order"),
    supabase.from("education").select("*").eq("resume_id", targetId).order("sort_order"),
    supabase.from("skills").select("*").eq("resume_id", targetId).order("sort_order"),
    supabase.from("projects").select("*").eq("resume_id", targetId).order("sort_order"),
    supabase.from("certifications").select("*").eq("resume_id", targetId).order("sort_order"),
    supabase.from("languages").select("*").eq("resume_id", targetId).order("sort_order"),
  ]);

  // Aggregate normalized resume object for ResumePreview
  const previewData = {
    resume: resume || { title: "Draft Resume", template_id: "modern" },
    profile: personalInfo || {
      full_name: "Mohamed Lamine Datt",
      email: "d.mohamed1504@gmail.com",
    },
    personalInfo: personalInfo || {
      full_name: "Mohamed Lamine Datt",
      email: "d.mohamed1504@gmail.com",
      phone: "+1 555-0199",
      location: "San Francisco, CA",
      title: "Senior Fullstack Engineer",
      summary: "Experienced engineer specializing in distributed systems, Next.js, and high-performance applications.",
    },
    workExperiences: workExperiences || [],
    education: education || [],
    skills: skills || [],
    projects: projects || [],
    certifications: certifications || [],
    languages: languages || [],
  };

  return (
    <div className="min-h-screen bg-neutral-900/90 text-white flex flex-col">
      {/* Top Floating Action Bar (hidden on print) */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="text-neutral-300 hover:text-white gap-1.5">
            <Link href={resume ? `/dashboard/resume/${resume.id}` : "/dashboard"}>
              <ArrowLeft className="w-4 h-4" /> Back to Editor
            </Link>
          </Button>
          <div className="h-4 w-px bg-white/20 hidden sm:block" />
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              {resume?.title || "Resume Preview"}
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Ready for Print / ATS
              </span>
            </h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Updated {resume?.updated_at ? format(new Date(resume.updated_at), "MMM d, yyyy") : "Recently"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {resume && (
            <Button size="sm" variant="outline" asChild className="text-xs border-white/20 text-white bg-white/5">
              <Link href={`/dashboard/resume/${resume.id}`}>
                <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Resume
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save PDF
          </Button>
        </div>
      </header>

      {/* Main Resume Canvas */}
      <main className="flex-1 py-8 px-4 flex justify-center overflow-y-auto">
        <div className="w-full max-w-[850px] shadow-2xl rounded-sm overflow-hidden bg-white text-black print:shadow-none print:w-full print:max-w-none">
          <ResumePreview data={previewData} />
        </div>
      </main>
    </div>
  );
}
