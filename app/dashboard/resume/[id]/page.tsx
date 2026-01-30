import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResumeEditor } from "@/components/editor/resume-editor";

interface ResumePageProps {
  params: Promise<{ id: string }>;
}

export default async function ResumePage({ params }: ResumePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch resume
  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!resume) {
    notFound();
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch work experiences
  const { data: workExperiences } = await supabase
    .from("work_experiences")
    .select("*")
    .eq("resume_id", id)
    .order("display_order");

  // Fetch education
  const { data: education } = await supabase
    .from("education")
    .select("*")
    .eq("resume_id", id)
    .order("display_order");

  // Fetch skills
  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("resume_id", id)
    .order("display_order");

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("resume_id", id)
    .order("display_order");

  // Fetch certifications
  const { data: certifications } = await supabase
    .from("certifications")
    .select("*")
    .eq("resume_id", id)
    .order("display_order");

  // Fetch languages
  const { data: languages } = await supabase
    .from("languages")
    .select("*")
    .eq("resume_id", id)
    .order("display_order");

  return (
    <ResumeEditor
      resume={resume}
      profile={profile}
      workExperiences={workExperiences || []}
      education={education || []}
      skills={skills || []}
      projects={projects || []}
      certifications={certifications || []}
      languages={languages || []}
    />
  );
}
