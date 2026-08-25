import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

const opportunitySchema = z.object({
  id: z.string().describe("A unique slug representing the scholarship, e.g. lowercase-words-separated-by-dashes"),
  kind: z.enum(['scholarship', 'grant', 'fellowship', 'aid']),
  title: z.string(),
  provider: z.string(),
  description: z.string(),
  amount_min: z.number().nullable(),
  amount_max: z.number().nullable(),
  currency: z.string().default('USD'),
  deadline: z.string().nullable().describe("ISO date format YYYY-MM-DD or null if rolling/unavailable"),
  application_url: z.string().describe("A real URL to apply on, or the provider's home page if specific URL is unavailable"),
  source_url: z.string().describe("Source URL or provider homepage"),
  source_name: z.string().describe("E.g., Department of Education, organization name"),
  education_levels: z.array(z.string()).describe("E.g., Undergraduate, Graduate, High School Senior"),
  majors: z.array(z.string()).describe("List of majors, or ['All Majors']"),
  careers: z.array(z.string()).describe("Associated career fields"),
  keywords: z.array(z.string()).describe("Keywords for matching, e.g., STEM, female, financial-need, first-gen"),
  year: z.number().nullable().default(2026),
  eligibility: z.array(z.string()).describe("Bullet points of eligibility criteria"),
  requirements: z.object({
    essay: z.boolean().default(false),
    recommendation_letters: z.number().default(0),
    transcript_required: z.boolean().default(false),
    resume_required: z.boolean().default(false),
    portfolio_required: z.boolean().default(false),
    fafsa_required: z.boolean().default(false),
  }).describe("Specific application checklist requirements")
});

const searchSchema = z.object({
  opportunities: z.array(opportunitySchema)
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchQuery } = await req.json();

    if (!searchQuery) {
      return new NextResponse("Missing search query", { status: 400 });
    }

    // 1. Fetch user's latest resume to extract academic profile context
    const { data: resumes } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1);

    let profileSummary = "No active resume details found.";
    let userMajors: string[] = [];
    let userGpa = "";
    let userEducationLevel = "";

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

      userMajors = education.map(e => e.field_of_study).filter(Boolean) as string[];
      const GPAs = education.map(e => e.gpa).filter(Boolean) as string[];
      userGpa = GPAs[0] || "";
      userEducationLevel = education.map(e => e.degree).filter(Boolean)[0] || "";

      profileSummary = `
        Full Name: ${personal?.full_name || ""}
        Education Level: ${userEducationLevel}
        Majors: ${userMajors.join(", ")}
        GPA: ${userGpa}
        Skills: ${skills.map(s => s.name).join(", ")}
      `;
    }

    // 2. Call Gemini model with Google Search Grounding enabled
    const promptText = `
      You are an expert student financial aid finder.
      Find 10 REAL-WORLD, ACTIVE, currently open scholarships, grants, fellowships, or aid opportunities matching the query.
      Make sure to return actual valid URLs and accurate details.

      SEARCH QUERY: "${searchQuery}"
      USER PROFILE CONTEXT:
      ${profileSummary}

      CRITICAL INSTRUCTIONS:
      1. Search the live web for active opportunities. Do not generate fictional or placeholder data.
      2. Ensure kinds align: 'scholarship' or 'fellowship' for academic/talent awards; 'grant' or 'aid' for government or need-based aid.
      3. For the application_url, use the direct application link or provider home page.
      4. Populate majors, education levels, and keywords so they can be matched globally with other users who fit those criteria.
    `;

    let result;
    try {
      // Try search grounding first
      result = await generateObject({
        model: googleAI("gemini-2.5-flash", {
          useSearchGrounding: true,
        }),
        schema: searchSchema,
        prompt: promptText,
      });
    } catch (err) {
      console.warn("Failed search grounding, falling back to standard generation:", err);
      result = await generateObject({
        model: googleAI("gemini-2.5-flash"),
        schema: searchSchema,
        prompt: promptText,
      });
    }

    const opportunities = result.object.opportunities || [];

    if (opportunities.length > 0) {
      // 3. Save these opportunities globally in our database using user client (bypasses RLS write check via auth policy)
      const dbOpportunities = opportunities.map(opp => ({
        id: opp.id,
        kind: opp.kind,
        title: opp.title,
        provider: opp.provider,
        description: opp.description,
        amount_min: opp.amount_min,
        amount_max: opp.amount_max,
        currency: opp.currency,
        deadline: opp.deadline || null,
        application_url: opp.application_url,
        source_url: opp.source_url,
        source_name: opp.source_name,
        education_levels: opp.education_levels,
        majors: opp.majors,
        careers: opp.careers,
        keywords: opp.keywords,
        year: opp.year || 2026,
        eligibility: opp.eligibility,
        requirements: opp.requirements,
        raw_data: opp,
        is_active: true,
        fetched_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: upsertError } = await supabase
        .from("funding_opportunities")
        .upsert(dbOpportunities, { onConflict: "id" });

      if (upsertError) {
        console.error("Supabase upsert error:", upsertError);
      }
    }

    return NextResponse.json({ success: true, opportunities });

  } catch (error: any) {
    console.error("Scraping search error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
