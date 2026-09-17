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
    console.error("[ResumePage] No user found in session");
    notFound();
  }

  // Fetch resume (first check if current user is owner)
  let { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  // If not owner, check if resume exists for shared collaboration / peer review
  if (!resume) {
    const { data: sharedResume } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (sharedResume) {
      resume = sharedResume;
    } else {
      // Graceful fallback: redirect to user's most recent valid resume if this ID doesn't exist
      const { data: latestResume } = await supabase
        .from("resumes")
        .select("id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { redirect } = await import("next/navigation");
      if (latestResume && latestResume.id !== id) {
        redirect(`/dashboard/resume/${latestResume.id}`);
      } else {
        redirect("/dashboard/resume/new");
      }
    }
  }

  // Fetch profile of the resume owner so collaborator sees candidate's contact info
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", resume.user_id)
    .maybeSingle();

  // Fetch personal_info
  const { data: personalInfo } = await supabase
    .from("personal_info")
    .select("*")
    .eq("resume_id", id)
    .maybeSingle();

  // Fetch work experiences
  const { data: workExperiences } = await supabase
    .from("work_experiences")
    .select("*")
    .eq("resume_id", id)
    .order("sort_order");

  // Fetch education
  const { data: education } = await supabase
    .from("education")
    .select("*")
    .eq("resume_id", id)
    .order("sort_order");

  // Fetch skills
  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("resume_id", id)
    .order("sort_order");

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("resume_id", id)
    .order("sort_order");

  // Fetch certifications
  const { data: certifications } = await supabase
    .from("certifications")
    .select("*")
    .eq("resume_id", id)
    .order("sort_order");

  // Fetch languages
  const { data: languages } = await supabase
    .from("languages")
    .select("*")
    .eq("resume_id", id)
    .order("sort_order");

  // Merge profile and personal_info
  const mergedProfile = {
    ...profile,
    // personal_info takes precedence for resume-specific details
    // but we use profile as a fallback/base identity
    phone: personalInfo?.phone || profile?.phone,
    location: personalInfo?.location || profile?.location,
    linkedin_url: personalInfo?.linkedin || profile?.linkedin_url,
    website_url: personalInfo?.website || profile?.website_url,
    github_url: personalInfo?.github || profile?.github_url,
    summary: personalInfo?.summary || profile?.summary,
  };

  return (
    <ResumeEditor
      resume={resume}
      profile={mergedProfile}
      workExperiences={workExperiences || []}
      education={education || []}
      skills={skills || []}
      projects={projects || []}
      certifications={certifications || []}
      languages={languages || []}
    />
  );
}
