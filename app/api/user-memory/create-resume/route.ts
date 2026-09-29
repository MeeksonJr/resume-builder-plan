import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UserMemory } from "@/lib/types/user-memory";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { memory: providedMemory, title, templateId = "modern", accentColor = "#0f172a" } = body;

    let memory: UserMemory = providedMemory;

    // If memory not passed in body, fetch from profile
    if (!memory) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", user.id)
        .single();

      memory = profile?.settings?.user_memory;
    }

    if (!memory || !memory.basics) {
      return NextResponse.json(
        { error: "No user memory found to generate resume from." },
        { status: 400 }
      );
    }

    const resumeTitle = title || `${memory.basics.full_name || "Professional"} Resume`;

    // 1. Create Resume Entry
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: resumeTitle,
        template_id: templateId,
        is_primary: false,
        settings: {
          visualConfig: {
            accentColor,
            fontFamily: "Inter",
            fontSize: "standard",
            lineHeight: "relaxed",
            nav_style: "standard",
            margins: "standard",
          },
          contact: {
            full_name: memory.basics.full_name,
            email: memory.basics.email,
            phone: memory.basics.phone,
            location: memory.basics.location,
            headline: memory.basics.headline,
            bio: memory.basics.bio,
            website: memory.socials?.portfolio || "",
            linkedin: memory.socials?.linkedin || "",
            github: memory.socials?.github || "",
            twitter: memory.socials?.twitter || "",
          },
        },
      })
      .select()
      .single();

    if (resumeError || !resume) {
      throw new Error(resumeError?.message || "Failed to create resume record");
    }

    const resumeId = resume.id;

    // 2. Insert Work Experiences
    if (memory.experiences && memory.experiences.length > 0) {
      const experiencesToInsert = memory.experiences.map((exp, idx) => ({
        user_id: user.id,
        resume_id: resumeId,
        company: exp.company || "Company",
        position: exp.position || "Position",
        location: exp.location || null,
        start_date: exp.start_date || null,
        end_date: exp.end_date || null,
        is_current: !!exp.is_current,
        description: exp.description || null,
        highlights: exp.highlights || [],
        display_order: idx,
      }));

      await supabase.from("work_experiences").insert(experiencesToInsert);
    }

    // 3. Insert Educations
    if (memory.education && memory.education.length > 0) {
      const educationToInsert = memory.education.map((edu, idx) => ({
        user_id: user.id,
        resume_id: resumeId,
        institution: edu.institution || "Institution",
        degree: edu.degree || null,
        field_of_study: edu.field_of_study || null,
        location: edu.location || null,
        start_date: edu.start_date || null,
        end_date: edu.end_date || null,
        gpa: edu.gpa || null,
        highlights: edu.highlights || [],
        display_order: idx,
      }));

      await supabase.from("educations").insert(educationToInsert);
    }

    // 4. Insert Skills
    if (memory.skills && memory.skills.length > 0) {
      const skillsToInsert = memory.skills.map((skill, idx) => ({
        user_id: user.id,
        resume_id: resumeId,
        name: skill.name,
        category: skill.category || "Languages",
        proficiency_level: skill.proficiency || 4,
        display_order: idx,
      }));

      await supabase.from("skills").insert(skillsToInsert);
    }

    // 5. Insert Projects
    if (memory.projects && memory.projects.length > 0) {
      const projectsToInsert = memory.projects.map((proj, idx) => ({
        user_id: user.id,
        resume_id: resumeId,
        name: proj.name,
        description: proj.description || null,
        technologies: proj.technologies || [],
        url: proj.url || null,
        highlights: proj.highlights || [],
        display_order: idx,
      }));

      await supabase.from("projects").insert(projectsToInsert);
    }

    // 6. Insert Certifications
    if (memory.certifications && memory.certifications.length > 0) {
      const certsToInsert = memory.certifications.map((cert, idx) => ({
        user_id: user.id,
        resume_id: resumeId,
        name: cert.name,
        issuer: cert.issuer || null,
        issue_date: cert.issue_date || null,
        expiry_date: cert.expiry_date || null,
        credential_id: cert.credential_id || null,
        credential_url: cert.credential_url || null,
        display_order: idx,
      }));

      await supabase.from("certifications").insert(certsToInsert);
    }

    return NextResponse.json({
      success: true,
      resumeId,
      message: `Resume "${resumeTitle}" successfully synthesized from User Memory!`,
    });
  } catch (error: any) {
    console.error("[CreateResumeFromMemory] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create resume from memory" },
      { status: 500 }
    );
  }
}
