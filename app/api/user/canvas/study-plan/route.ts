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
      console.log(`[AI Study Plan] Attempting generation with: ${modelConfig.name}`);
      const result = await generateText({
        model: modelConfig.creator(),
        system,
        prompt,
      });
      return result;
    } catch (e: any) {
      console.error(`[AI Study Plan] Model ${modelConfig.name} failed:`, e.message || e);
      lastError = e;
    }
  }

  throw lastError || new Error("No AI providers configured or all failed.");
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseName, courseCode, assignments } = await req.json();

    if (!courseName || !assignments) {
      return NextResponse.json({ error: "Course name and assignments list are required." }, { status: 400 });
    }

    // Build prompting context
    const assignmentsText = assignments
      .map((a: any, i: number) => `${i + 1}. ${a.name} (Due: ${new Date(a.due_at).toLocaleDateString()}, Points: ${a.points_possible || "N/A"})`)
      .join("\n");

    const systemPrompt = `You are a world-class academic advisor and study strategist. Your goal is to analyze a college student's upcoming class workload and build a structured, weekly study plan and checklist. Avoid high-level general advice; be actionable, detail-oriented, and refer directly to the actual assignments provided.`;

    const userPrompt = `Class: ${courseCode} - ${courseName}
Upcoming workload:
${assignmentsText}

Please generate a detailed, weekly Study Plan and Checklist.
Format the output with the following layout:
1. "🎯 ASSIGNMENT PREPARATION & MILESTONES": Break down specific steps to complete each assignment on time.
2. "📅 WEEKLY STUDY SCHEDULE": Offer a structured week-by-week calendar recommendation.
3. "💡 TOP STUDY & GRADES STRATEGIES": Provide 3 tailored tips to excel in this specific subject.

Keep the markdown clean, engaging, and premium in style. Use standard markdown.`;

    const response = await generateTextWithFallback({
      system: systemPrompt,
      prompt: userPrompt
    });

    return NextResponse.json({ studyPlan: response.text });
  } catch (error: any) {
    console.error("[StudyPlan API Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to generate study plan." }, { status: 500 });
  }
}
