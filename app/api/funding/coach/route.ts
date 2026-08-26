import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

const groqAI = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const openaiAI = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fallback helper for unstructured text generation
async function generateTextWithFallback({
  prompt,
  system,
}: {
  prompt: string;
  system: string;
}) {
  const models = [];

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY) {
    models.push({
      creator: () => googleAI("gemini-2.5-flash"),
      name: "Gemini 2.5 Flash"
    });
  }

  if (process.env.GROQ_API_KEY) {
    models.push({
      creator: () => groqAI("llama-3.3-70b-versatile"),
      name: "Groq Llama 3.3"
    });
  }

  if (process.env.OPENAI_API_KEY) {
    models.push({
      creator: () => openaiAI("gpt-4o-mini"),
      name: "OpenAI GPT-4o Mini"
    });
  }

  let lastError = null;
  for (const modelConfig of models) {
    try {
      console.log(`[AI] Attempting coach generation with: ${modelConfig.name}`);
      const result = await generateText({
        model: modelConfig.creator(),
        system,
        prompt,
      });
      return result;
    } catch (err: any) {
      console.error(`[AI] Model ${modelConfig.name} failed:`, err.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All AI models failed to generate response.");
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const isPro = profile?.subscription_status === "active" || profile?.subscription_status === "trialing";
    if (!isPro) {
      return new NextResponse("Forbidden: Pro subscription required", { status: 403 });
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

    // 2. Query user's specific saved/applying/applied opportunities
    const { data: userOpps } = await supabase
      .from("user_funding_opportunities")
      .select(`
        status,
        essay_draft,
        notes,
        opportunity_id
      `)
      .eq("user_id", user.id)
      .in("status", ["saved", "applying", "applied"]);

    let userOppsContext = "Candidate has not saved any scholarships to their shortlist yet.";
    
    if (userOpps && userOpps.length > 0) {
      const oppIds = userOpps.map(uo => uo.opportunity_id);
      const { data: fullOpps } = await supabase
        .from("funding_opportunities")
        .select("id, title, provider, amount_min, amount_max, kind, deadline")
        .in("id", oppIds);

      const fullOppsMap = new Map(fullOpps?.map(o => [o.id, o]) || []);
      
      userOppsContext = userOpps
        .map((uo) => {
          const fo = fullOppsMap.get(uo.opportunity_id);
          if (!fo) return null;
          return `- [${uo.status.toUpperCase()}] "${fo.title}" (${fo.kind}) by ${fo.provider} | Deadline: ${fo.deadline || "Varies"} | Notes: ${uo.notes || "None"} | Essay Drafted: ${uo.essay_draft ? "Yes" : "No"}`;
        })
        .filter(Boolean)
        .join("\n");
    }

    const systemPrompt = `
      You are "Premio AI Coach", a professional scholarship and college funding strategist.
      Your goal is to answer the user's questions about college aid, scholarship essays, Pell grants, or application strategies.
      Use the candidate's academic profile and saved opportunities below to tailor your advice. Reference their saved aid entries directly when appropriate.

      CANDIDATE PROFILE:
      ${resumeSummary}

      CANDIDATE'S SAVED FUNDING SHORTLIST:
      ${userOppsContext}


      INSTRUCTIONS:
      - Answer in a encouraging, highly professional, and strategic tone.
      - Keep responses concise (under 120 words) as they are displayed in a dashboard widget.
      - If they ask for recommendations, suggest matching kinds of opportunities from the database context or standard steps (like filing FAFSA).
    `;

    const result = await generateTextWithFallback({
      prompt,
      system: systemPrompt
    });

    return NextResponse.json({ response: result.text.trim() });

  } catch (error: any) {
    console.error("Coach API error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
