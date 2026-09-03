"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonImportDialog } from "@/components/import/json-import-dialog";
import type { ParsedResumeData } from "@/lib/export/json-import";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export function ImportResumeButton() {
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async (data: ParsedResumeData) => {
    setIsImporting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be signed in to import a resume.");
        return;
      }

      // Create a new resume in the database
      const { data: newResume, error: resumeError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: data.title || "Imported Resume",
          template: "modern",
        })
        .select("id")
        .single();

      if (resumeError || !newResume) {
        throw new Error(resumeError?.message || "Failed to create resume");
      }

      const resumeId = newResume.id;

      // Save profile data
      if (data.profile) {
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: data.profile.full_name || null,
          email: data.profile.email || null,
          phone: data.profile.phone || null,
          location: data.profile.location || null,
          linkedin_url: data.profile.linkedin_url || null,
          github_url: data.profile.github_url || null,
          website_url: data.profile.website_url || null,
          summary: data.profile.summary || null,
        });
      }

      // Save work experiences
      if (data.workExperiences.length > 0) {
        await supabase.from("work_experiences").insert(
          data.workExperiences.map((w, i) => ({
            resume_id: resumeId,
            company: w.company,
            position: w.position,
            location: w.location || null,
            start_date: w.start_date || null,
            end_date: w.end_date || null,
            is_current: w.is_current,
            description: w.description || null,
            highlights: w.highlights || [],
            sort_order: i,
          }))
        );
      }

      // Save education
      if (data.education.length > 0) {
        await supabase.from("education").insert(
          data.education.map((e, i) => ({
            resume_id: resumeId,
            institution: e.institution,
            degree: e.degree || null,
            field_of_study: e.field_of_study || null,
            start_date: e.start_date || null,
            end_date: e.end_date || null,
            gpa: e.gpa || null,
            highlights: e.highlights || [],
            sort_order: i,
          }))
        );
      }

      // Save skills
      if (data.skills.length > 0) {
        await supabase.from("skills").insert(
          data.skills.map((s, i) => ({
            resume_id: resumeId,
            name: s.name,
            category: s.category || null,
            proficiency_level: s.proficiency_level || 3,
            sort_order: i,
          }))
        );
      }

      // Save projects
      if (data.projects.length > 0) {
        await supabase.from("projects").insert(
          data.projects.map((p, i) => ({
            resume_id: resumeId,
            name: p.name,
            description: p.description || null,
            technologies: p.technologies || [],
            url: p.url || null,
            highlights: p.highlights || [],
            sort_order: i,
          }))
        );
      }

      // Save certifications
      if (data.certifications.length > 0) {
        await supabase.from("certifications").insert(
          data.certifications.map((c, i) => ({
            resume_id: resumeId,
            name: c.name,
            issuer: c.issuer || null,
            issue_date: c.issue_date || null,
            credential_url: c.credential_url || null,
            sort_order: i,
          }))
        );
      }

      // Save languages
      if (data.languages.length > 0) {
        await supabase.from("languages").insert(
          data.languages.map((l, i) => ({
            resume_id: resumeId,
            name: l.name,
            proficiency: l.proficiency || "Professional working",
            sort_order: i,
          }))
        );
      }

      toast.success("Resume imported and saved!");
      router.push(`/dashboard/resume/${resumeId}`);
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error("Failed to import resume", { description: error.message });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <JsonImportDialog onImport={handleImport}>
      <Button
        variant="outline"
        className="min-h-11 rounded-none border-[#102b2b]/15 px-5 font-bold text-[#102b2b] shadow-none hover:bg-[#e9eee8] gap-2"
        disabled={isImporting}
      >
        <Upload className="h-4 w-4" />
        Import JSON
      </Button>
    </JsonImportDialog>
  );
}
