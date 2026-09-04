import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { autoTailorResumeForRole } from "@/lib/ai/index";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limit Check
    const { allowed, isPro } = await checkRateLimit("ai_tailor");
    if (!allowed) {
      return NextResponse.json(
        {
          error: "LIMIT_EXCEEDED",
          message: isPro
            ? "You have reached your daily limit for resume tailoring."
            : "Resume tailoring is a Pro feature. Please upgrade to unlock unlimited tailoring.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      resumeId,
      jobTitle,
      company,
      jobDescription = "",
      requirements = [],
      url = null,
      location = null,
      salaryRange = null,
      tone = "professional",
    } = body;

    if (!resumeId || !jobTitle || !company) {
      return NextResponse.json(
        { error: "Missing required fields: resumeId, jobTitle, and company are required." },
        { status: 400 }
      );
    }

    // 1. Fetch Source Resume
    const { data: sourceResume, error: srcError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (srcError || !sourceResume) {
      return NextResponse.json({ error: "Source resume not found" }, { status: 404 });
    }

    // 2. Fetch all child data in parallel
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

    // Flatten skills for AI
    const flatSkills: string[] = [];
    (skillsData || []).forEach((s) => {
      if (Array.isArray(s.skills) && s.skills.length > 0) {
        flatSkills.push(...s.skills);
      } else if (s.name) {
        flatSkills.push(s.name);
      }
    });

    const candidateName = personalInfo?.full_name || personalInfo?.fullName || "Candidate";

    // 3. Step 1: AI Tailoring for Resume
    const tailoredResult = await autoTailorResumeForRole(
      {
        title: sourceResume.title || "Resume",
        summary: personalInfo?.summary || "",
        workExperiences: (workExperiences || []).map((exp) => ({
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

    // 4. Step 2: AI Synthesis for Tailored Cover Letter
    let coverLetterText = "";
    try {
      const coverLetterPrompt = `You are an elite executive career strategist.
Write a targeted, high-conversion cover letter for ${candidateName} applying for "${jobTitle}" at "${company}".

TARGET JOB DETAILS:
Company: ${company}
Role: ${jobTitle}
Location: ${location || "Standard"}
Job Description:
${jobDescription || "No specific job description provided. Align with top industry standards for this title."}
Requirements:
${requirements.slice(0, 8).map((r: string) => `- ${r}`).join("\n")}

CANDIDATE PROFILE:
Name: ${candidateName}
Current Summary: ${tailoredResult.tailoredSummary || personalInfo?.summary || ""}
Key Skills: ${flatSkills.slice(0, 10).join(", ")}
Notable Experiences:
${(workExperiences || []).slice(0, 2).map((w: any) => `- ${w.position} at ${w.company}: ${w.description?.replace(/<[^>]*>?/gm, "").slice(0, 160)}`).join("\n")}
Notable Projects:
${(projects || []).slice(0, 2).map((p: any) => `- ${p.name}: ${p.description?.replace(/<[^>]*>?/gm, "").slice(0, 140)}`).join("\n")}

TONE & STYLE:
Tone: ${tone} (Write authentically, professionally, and compellingly)

STRICT REQUIREMENTS:
- Standard formal business letter structure.
- Address "Dear Hiring Team at ${company},"
- Open with a hook articulating strong enthusiasm for ${company}'s domain and the ${jobTitle} role.
- Include 2 specific body paragraphs bridging candidate achievements with role requirements using quantifiable impact metrics.
- Conclude with an enthusiastic, proactive call to action for an interview.
- Sign off with "Sincerely,\n${candidateName}".
- Output ONLY the letter text. No preamble, no markdown formatting fences.`;

      const aiResponse = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: coverLetterPrompt,
        temperature: 0.7,
      });

      coverLetterText = aiResponse.text.trim();
    } catch (clErr: any) {
      console.warn("[Autopilot Cover Letter AI Error]", clErr.message);
      coverLetterText = `Dear Hiring Team at ${company},\n\nI am excited to submit my application for the ${jobTitle} role at ${company}. With a proven track record in software engineering and system architecture, I am confident in my ability to deliver immediate value to your team.\n\nThroughout my career, I have focused on engineering scalable, high-performance solutions and delivering measurable business outcomes. My technical background in ${flatSkills.slice(0, 4).join(", ")} aligns directly with the core competencies you are seeking for this position.\n\nI look forward to discussing how my experience and passion can contribute to the ongoing success of ${company}.\n\nSincerely,\n${candidateName}`;
    }

    // 5. Step 3: Insert Cloned & Tailored Resume
    const newTitle = `${sourceResume.title} — ${company}`;
    const { data: newResume, error: createError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: newTitle,
        template_id: sourceResume.template_id,
        is_primary: false,
        is_public: false,
        section_order: sourceResume.section_order,
        visual_config: {
          ...(sourceResume.visual_config || {}),
          target_role: jobTitle,
          target_company: company,
        },
        language: sourceResume.language || "en",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError || !newResume) {
      throw new Error(createError?.message || "Failed to create cloned resume");
    }

    const newResumeId = newResume.id;

    // 6. Step 4: Insert Child Records with Tailored Data
    if (personalInfo) {
      await supabase.from("personal_info").insert({
        resume_id: newResumeId,
        full_name: personalInfo.full_name || personalInfo.fullName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        location: personalInfo.location,
        website_url: personalInfo.website_url,
        linkedin_url: personalInfo.linkedin_url,
        github_url: personalInfo.github_url,
        summary: tailoredResult.tailoredSummary || personalInfo.summary,
      });
    }

    if (workExperiences && workExperiences.length > 0) {
      const expInserts = workExperiences.map((exp, idx) => {
        const tailoredExp = tailoredResult.tailoredExperiences?.find((t: any) => t.id === exp.id);
        return {
          resume_id: newResumeId,
          company: exp.company,
          position: exp.position,
          location: exp.location,
          start_date: exp.start_date,
          end_date: exp.end_date,
          is_current: exp.is_current,
          description: tailoredExp ? tailoredExp.description : exp.description,
          highlights: exp.highlights,
          sort_order: exp.sort_order ?? idx,
        };
      });
      await supabase.from("work_experiences").insert(expInserts);
    }

    // Skills: Insert existing plus recommended skills
    const combinedSkillNames = Array.from(
      new Set([
        ...flatSkills,
        ...(tailoredResult.prioritizedSkills || []),
      ])
    );

    if (combinedSkillNames.length > 0) {
      const skillInserts = combinedSkillNames.map((name, idx) => ({
        resume_id: newResumeId,
        name,
        category: "Core Skills",
        proficiency_level: 4,
        sort_order: idx,
      }));
      await supabase.from("skills").insert(skillInserts);
    }

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
        achievements: edu.achievements || edu.highlights,
        sort_order: edu.sort_order ?? idx,
      }));
      await supabase.from("education").insert(eduInserts);
    }

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

    // 7. Step 5: Save Cover Letter to Database
    const { data: clRecord, error: clSaveError } = await supabase
      .from("cover_letters")
      .insert({
        user_id: user.id,
        resume_id: newResumeId,
        title: `${jobTitle} at ${company}`,
        content: coverLetterText,
        company_name: company,
        job_title: jobTitle,
      })
      .select("id, title")
      .single();

    if (clSaveError) {
      console.warn("[Autopilot: Cover Letter Save Warning]", clSaveError.message);
    }

    const coverLetterId = clRecord?.id || null;

    // 8. Step 6: Create Application Tracker Kanban Record
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
          cover_letter_id: coverLetterId,
          salary_range: salaryRange || null,
          location: location || null,
          url: url || null,
          notes: `🚀 Created via 1-Click Application Autopilot. Tailored resume & company-aligned cover letter paired.`,
        })
        .select("id")
        .single();
      applicationId = appRow?.id;
    } catch (trackErr: any) {
      console.warn("[Autopilot: Application Track Warning]", trackErr.message);
    }

    return NextResponse.json({
      success: true,
      newResumeId,
      newResumeTitle: newTitle,
      coverLetterId,
      coverLetterTitle: clRecord?.title || `${jobTitle} at ${company}`,
      coverLetterContent: coverLetterText,
      applicationId,
      tailoredSummary: tailoredResult.tailoredSummary,
      appliedChanges: tailoredResult.appliedChangesSummary,
      message: `Successfully generated full application packet for ${company}!`,
    });
  } catch (error: any) {
    console.error("[AUTOPILOT_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate application packet" },
      { status: 500 }
    );
  }
}
