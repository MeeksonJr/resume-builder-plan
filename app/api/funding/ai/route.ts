import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

const analysisSchema = z.object({
  matchScore: z.number().min(0).max(100),
  whyYouMatch: z.array(z.string()).describe("3-4 bullet points detailing why the candidate's profile is a strong fit"),
  potentialBlockers: z.array(z.string()).describe("Any potential eligibility blockers (e.g. GPA, citizenship, state residency, recommendation letters)"),
  tailoringTips: z.array(z.string()).describe("How the user should tailer their resume or application description for this opportunity")
});

const essaySchema = z.object({
  draft: z.string().describe("The drafted essay content or answer, fully tailored using the user's resume details"),
  tips: z.array(z.string()).describe("Tips for refining the essay draft")
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { opportunityId, task, essayPrompt } = await req.json();

    if (!opportunityId || !task) {
      return new NextResponse("Missing opportunityId or task", { status: 400 });
    }

    // 1. Fetch the scholarship/funding opportunity details
    const { data: opportunity, error: oppError } = await supabase
      .from("funding_opportunities")
      .select("*")
      .eq("id", opportunityId)
      .maybeSingle();

    if (oppError || !opportunity) {
      return new NextResponse("Opportunity not found", { status: 404 });
    }

    // 2. Fetch the user's active resume details
    const { data: resumes } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (!resumes || resumes.length === 0) {
      return new NextResponse("Active resume not found. Please create a resume first.", { status: 400 });
    }

    const resumeId = resumes[0].id;
    const [personalResult, educationResult, skillsResult, experienceResult, projectsResult] = await Promise.all([
      supabase.from("personal_info").select("*").eq("resume_id", resumeId).maybeSingle(),
      supabase.from("education").select("*").eq("resume_id", resumeId),
      supabase.from("skills").select("*").eq("resume_id", resumeId),
      supabase.from("work_experiences").select("*").eq("resume_id", resumeId),
      supabase.from("projects").select("*").eq("resume_id", resumeId)
    ]);

    const personal = personalResult.data;
    const education = educationResult.data || [];
    const skills = skillsResult.data || [];
    const experiences = experienceResult.data || [];
    const projects = projectsResult.data || [];

    const resumeSummary = `
      NAME: ${personal?.full_name || ""}
      SUMMARY: ${personal?.summary || ""}
      EDUCATION: ${education.map(e => `${e.degree} in ${e.field_of_study} from ${e.institution} (GPA: ${e.gpa || "N/A"})`).join("; ")}
      SKILLS: ${skills.map(s => s.name).join(", ")}
      EXPERIENCE: ${experiences.map(exp => `${exp.position} at ${exp.company} (${exp.description || ""})`).join("; ")}
      PROJECTS: ${projects.map(p => `${p.name} (${p.description || ""})`).join("; ")}
    `;

    // 3. Process task
    if (task === "analyze") {
      const prompt = `
        You are a expert scholarship evaluator. Analyze how well this candidate fits the scholarship details.
        
        SCHOLARSHIP DETAILS:
        Title: ${opportunity.title}
        Provider: ${opportunity.provider}
        Description: ${opportunity.description}
        Eligibility criteria: ${JSON.stringify(opportunity.eligibility)}
        Education levels targeted: ${JSON.stringify(opportunity.education_levels)}
        Majors targeted: ${JSON.stringify(opportunity.majors)}
        Requirements: ${JSON.stringify(opportunity.requirements)}

        CANDIDATE PROFILE:
        ${resumeSummary}

        TASK:
        1. Calculate a match score from 0 to 100 based on major, GPA, education level, skills, and background.
        2. Identify specific strengths (e.g. candidate's major matches, candidate exceeds GPA).
        3. Identify potential blockers or requirements they must gather (e.g. need a recommendation letter, need transcript, or if they don't meet GPA).
        4. Give resume/essay tailoring tips.
      `;

      const result = await generateObject({
        model: googleAI("gemini-2.5-flash"),
        schema: analysisSchema,
        prompt: prompt,
      });

      return NextResponse.json(result.object);
    } 
    
    if (task === "essay") {
      if (!essayPrompt) {
        return new NextResponse("Missing essay prompt", { status: 400 });
      }

      const prompt = `
        You are a professional scholarship essay coach. Draft a compelling, personalized response/essay for the following prompt, using the candidate's actual accomplishments and credentials from their resume.

        SCHOLARSHIP / OPPORTUNITY:
        Title: ${opportunity.title}
        Provider: ${opportunity.provider}
        Description: ${opportunity.description}

        ESSAY PROMPT:
        "${essayPrompt}"

        CANDIDATE RESUME:
        ${resumeSummary}

        INSTRUCTIONS:
        1. Write a professional, polished draft (approx 250-500 words depending on the prompt).
        2. Tailor it to highlight relevant achievements from the resume (projects, experiences, academic focus).
        3. Maintain a genuine, humble, and inspiring tone.
        4. Do not use fictional placeholders (e.g., "[Insert Project Here]"). Use the actual information from their resume, or smoothly write around it.
      `;

      const result = await generateObject({
        model: googleAI("gemini-2.5-flash"),
        schema: essaySchema,
        prompt: prompt,
      });

      return NextResponse.json(result.object);
    }

    return new NextResponse("Invalid task", { status: 400 });

  } catch (error: any) {
    console.error("AI operations error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
