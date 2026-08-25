import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return new NextResponse("Missing prompt", { status: 400 });
    }

    // 1. Fetch user's latest resume to extract academic profile context
    const { data: resumes } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1);

    let resumeSummary = "No active resume details found.";
    if (resumes && resumes.length > 0) {
      const resumeId = resumes[0].id;
      const [personalResult, educationResult, skillsResult] = await Promise.all([
        supabase.from("personal_info").select("*").eq("resume_id", resumeId).maybeSingle(),
        supabase.from("education").select("*").eq("resume_id", resumeId),
        supabase.from("skills").select("*").eq("resume_id", resumeId)
      ]);

      const personal = personalResult.data;
      const education = educationResult.data || [];
      const skills = skillsResult.data || [];

      resumeSummary = `
        Full Name: ${personal?.full_name || ""}
        Education: ${education.map(e => `${e.degree} in ${e.field_of_study}`).join(", ")}
        GPA: ${education.map(e => e.gpa).filter(Boolean).join(", ")}
        Skills: ${skills.map(s => s.name).join(", ")}
      `;
    }

    // 2. Query active opportunities to inject matching opportunities as grounding context
    const { data: opportunities } = await supabase
      .from("funding_opportunities")
      .select("title, provider, amount_min, amount_max, kind")
      .eq("is_active", true)
      .limit(5);

    const oppsContext = opportunities && opportunities.length > 0 
      ? opportunities.map(o => `- ${o.title} (${o.kind}) by ${o.provider}: Amount ${o.amount_max || o.amount_min || "Varies"}`).join("\n")
      : "No scholarships currently in database.";

    const systemPrompt = `
      You are "Premio AI Coach", a professional scholarship and college funding strategist.
      Your goal is to answer the user's questions about college aid, scholarship essays, Pell grants, or application strategies.
      Use the candidate's academic profile below to tailor your advice. Reference specific details from their resume when advising them.

      CANDIDATE PROFILE:
      ${resumeSummary}

      DATABASE OPPORTUNITIES AVAILABLE:
      ${oppsContext}

      INSTRUCTIONS:
      - Answer in a encouraging, highly professional, and strategic tone.
      - Keep responses concise (under 120 words) as they are displayed in a dashboard widget.
      - If they ask for recommendations, suggest matching kinds of opportunities from the database context or standard steps (like filing FAFSA).
    `;

    const result = await generateText({
      model: googleAI("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: prompt,
    });

    return NextResponse.json({ response: result.text.trim() });

  } catch (error: any) {
    console.error("Coach API error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
