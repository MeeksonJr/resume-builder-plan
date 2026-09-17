import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResumePreview } from "@/components/editor/resume-preview";
import { PreviewActionBar } from "@/components/editor/preview-action-bar";
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
      <PreviewActionBar
        resumeId={resume?.id}
        title={resume?.title || "Resume Preview"}
        updatedAtText={resume?.updated_at ? format(new Date(resume.updated_at), "MMM d, yyyy") : undefined}
      />

      {/* Main Resume Canvas */}
      <main className="flex-1 py-8 px-4 flex justify-center overflow-y-auto">
        <div className="w-full max-w-[850px] shadow-2xl rounded-sm overflow-hidden bg-white text-black print:shadow-none print:w-full print:max-w-none">
          <ResumePreview data={previewData} />
        </div>
      </main>
    </div>
  );
}
