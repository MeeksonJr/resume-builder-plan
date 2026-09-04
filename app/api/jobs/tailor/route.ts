import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { autoTailorResumeForRole } from "@/lib/ai/index";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check plan-wise daily rate limits
    const { allowed, isPro } = await checkRateLimit("ai_tailor");
    if (!allowed) {
      return NextResponse.json(
        { 
          error: "LIMIT_EXCEEDED", 
          message: isPro 
            ? "You have reached your daily limit for resume tailoring." 
            : "Resume tailoring is a Pro feature. Please upgrade to Pro to unlock unlimited tailoring." 
        }, 
        { status: 429 }
      );
    }

    const { 
      resumeId, 
      jobTitle, 
      company, 
      jobDescription, 
      requirements = [], 
      url, 
      location, 
      salaryRange 
    } = await req.json();

    if (!resumeId || !jobTitle || !company) {
      return NextResponse.json({ error: "Missing required fields: resumeId, jobTitle, company" }, { status: 400 });
    }

    // 1. Fetch source resume
    const { data: sourceResume, error: srcError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (srcError || !sourceResume) {
      return NextResponse.json({ error: "Source resume not found" }, { status: 404 });
    }

    // 2. Fetch all source resume child records
    const [
      { data: personalInfo },
      { data: workExperiences },
      { data: education },
      { data: skillsData },
      { data: projects },
      { data: certifications },
      { data: languages },
    ] = await Promise.all([
      supabase.from("personal_info").select("*").eq("resume_id", resumeId).maybeSingle(),
      supabase.from("work_experiences").select("*").eq("resume_id", resumeId).order("sort_order"),
      supabase.from("education").select("*").eq("resume_id", resumeId).order("sort_order"),
      supabase.from("skills").select("*").eq("resume_id", resumeId).order("sort_order"),
      supabase.from("projects").select("*").eq("resume_id", resumeId).order("sort_order"),
      supabase.from("certifications").select("*").eq("resume_id", resumeId).order("sort_order"),
      supabase.from("languages").select("*").eq("resume_id", resumeId).order("sort_order"),
    ]);

    // Flatten existing skills
    const flatSkills: string[] = [];
    (skillsData || []).forEach(s => {
      if (Array.isArray(s.skills) && s.skills.length > 0) {
        flatSkills.push(...s.skills);
      } else if (s.name) {
        flatSkills.push(s.name);
      }
    });

    // 3. Execute AI resume tailoring
    const tailoredResult = await autoTailorResumeForRole(
      {
        title: sourceResume.title,
        summary: personalInfo?.summary || "",
        workExperiences: (workExperiences || []).map(exp => ({
          id: exp.id,
          position: exp.position,
          company: exp.company,
          description: exp.description || "",
        })),
        skills: flatSkills,
      },
      {
        role: jobTitle,
        company,
        description: jobDescription || `Position: ${jobTitle} at ${company}`,
        requirements: Array.isArray(requirements) ? requirements : [],
      }
    );

    // 4. Create cloned resume row
    const newTitle = `${sourceResume.title || "Resume"} — ${company}`;
    const { data: newResume, error: newResumeError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: newTitle,
        template: sourceResume.template || sourceResume.template_id || "modern",
        template_id: sourceResume.template_id || sourceResume.template || "modern",
        visual_config: {
          ...(sourceResume.visual_config || {}),
          target_role: jobTitle,
          target_company: company,
        },
      })
      .select("id")
      .single();

    if (newResumeError || !newResume) {
      throw new Error(newResumeError?.message || "Failed to create tailored resume row");
    }

    const newResumeId = newResume.id;

    // 5. Populate tailored child records
    // Personal Info
    if (personalInfo) {
      await supabase.from("personal_info").insert({
        resume_id: newResumeId,
        full_name: personalInfo.full_name,
        email: personalInfo.email,
        phone: personalInfo.phone,
        location: personalInfo.location,
        website: personalInfo.website,
        linkedin: personalInfo.linkedin,
        github: personalInfo.github,
        summary: tailoredResult.tailoredSummary || personalInfo.summary,
      });
    }

    // Work Experiences (inject tailored descriptions where available)
    if (workExperiences && workExperiences.length > 0) {
      const expInserts = workExperiences.map((exp, idx) => {
        const tailoredExp = tailoredResult.tailoredExperiences[idx];
        return {
          resume_id: newResumeId,
          company: exp.company,
          position: exp.position,
          location: exp.location,
          start_date: exp.start_date,
          end_date: exp.end_date,
          is_current: exp.is_current,
          description: tailoredExp?.description || exp.description,
          sort_order: exp.sort_order ?? idx,
        };
      });
      await supabase.from("work_experiences").insert(expInserts);
    }

    // Skills (store prioritized skills)
    if (tailoredResult.prioritizedSkills.length > 0) {
      await supabase.from("skills").insert({
        resume_id: newResumeId,
        name: "Core Skills & Technologies",
        skills: tailoredResult.prioritizedSkills,
        sort_order: 0,
      });
    } else if (skillsData && skillsData.length > 0) {
      const skillInserts = skillsData.map((s, idx) => ({
        resume_id: newResumeId,
        name: s.name,
        skills: s.skills,
        level: s.level,
        sort_order: s.sort_order ?? idx,
      }));
      await supabase.from("skills").insert(skillInserts);
    }

    // Education (copy directly)
    if (education && education.length > 0) {
      const eduInserts = education.map((edu, idx) => ({
        resume_id: newResumeId,
        institution: edu.institution,
        degree: edu.degree,
        field_of_study: edu.field_of_study,
        location: edu.location,
        start_date: edu.start_date,
        end_date: edu.end_date,
        gpa: edu.gpa,
        achievements: edu.achievements,
        sort_order: edu.sort_order ?? idx,
      }));
      await supabase.from("education").insert(eduInserts);
    }

    // Projects (copy directly)
    if (projects && projects.length > 0) {
      const projInserts = projects.map((p, idx) => ({
        resume_id: newResumeId,
        name: p.name,
        description: p.description,
        technologies: p.technologies,
        url: p.url,
        sort_order: p.sort_order ?? idx,
      }));
      await supabase.from("projects").insert(projInserts);
    }

    // Certifications & Languages (copy directly)
    if (certifications && certifications.length > 0) {
      const certInserts = certifications.map((c, idx) => ({
        resume_id: newResumeId,
        name: c.name,
        issuer: c.issuer,
        date: c.date,
        url: c.url,
        sort_order: c.sort_order ?? idx,
      }));
      await supabase.from("certifications").insert(certInserts);
    }

    if (languages && languages.length > 0) {
      const langInserts = languages.map((l, idx) => ({
        resume_id: newResumeId,
        language: l.language,
        proficiency: l.proficiency,
        sort_order: l.sort_order ?? idx,
      }));
      await supabase.from("languages").insert(langInserts);
    }

    // 6. Automatically add to Job Tracker (applications table)
    let applicationId: string | undefined = undefined;
    try {
      const { data: appRow } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          company,
          role: jobTitle,
          status: "applied",
          resume_id: newResumeId,
          salary_range: salaryRange || null,
          location: location || null,
          url: url || null,
          notes: `Auto-tailored from "${sourceResume.title}". Tailored summary & highlighted matching requirements.`,
        })
        .select("id")
        .single();
      applicationId = appRow?.id;
    } catch (trackErr: any) {
      console.warn("[JOBS_TAILOR] Could not create application record:", trackErr.message);
    }

    return NextResponse.json({
      success: true,
      newResumeId,
      newResumeTitle: newTitle,
      applicationId,
      tailoredSummary: tailoredResult.tailoredSummary,
      appliedChanges: tailoredResult.appliedChangesSummary,
      message: `Successfully cloned and tailored resume for ${company}!`,
    });
  } catch (error: any) {
    console.error("[JOBS_TAILOR_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to auto-tailor resume" }, { status: 500 });
  }
}
