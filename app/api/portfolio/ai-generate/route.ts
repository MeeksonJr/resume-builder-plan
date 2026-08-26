import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

const PROMPTS: Record<string, (ctx: string) => string> = {
  bio: (ctx) =>
    `You are a professional career branding copywriter. Based on the following resume context, write a compelling, first-person professional bio for a portfolio website. It should be 2-3 sentences, confident, specific, and end with a forward-looking statement. Do not use generic filler phrases like "passionate about" or "results-driven". Return only the bio text, no quotes, no preamble.\n\nResume context:\n${ctx}`,

  tagline: (ctx) =>
    `You are a professional career branding copywriter. Based on the following resume context, write a punchy, memorable one-line tagline (max 10 words) for a portfolio website hero section. It should convey expertise and personality. Return only the tagline text, no quotes.\n\nResume context:\n${ctx}`,

  seo_title: (ctx) =>
    `You are an SEO expert. Based on the following resume context, write a concise, keyword-rich portfolio page meta title (max 60 characters) for search engines. Format: "Full Name | Role / Specialty". Return only the title text.\n\nResume context:\n${ctx}`,

  seo_description: (ctx) =>
    `You are an SEO expert. Based on the following resume context, write a compelling meta description (max 155 characters) for a professional portfolio page. It should include key skills and invite clicks. Return only the description text, no quotes.\n\nResume context:\n${ctx}`,
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { field, resumeContext } = await req.json();

    if (!field || !PROMPTS[field]) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    const promptFn = PROMPTS[field];
    const prompt = promptFn(resumeContext || "No resume context provided.");

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    return NextResponse.json({ result: text.trim() });
  } catch (err: any) {
    console.error("[portfolio/ai-generate]", err);
    return NextResponse.json({ error: err.message || "Generation failed" }, { status: 500 });
  }
}
