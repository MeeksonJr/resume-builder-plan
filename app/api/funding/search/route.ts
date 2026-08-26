import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchLocalCatalog, runApifySearch } from "@/lib/funding/crawler";

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

const groqAI = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const openaiAI = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

// Fallback helper for structured object generation
async function generateObjectWithFallback<T>({
  schema,
  prompt,
}: {
  schema: z.ZodType<T>;
  prompt: string;
}) {
  const models = [];

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY) {
    // 1. Google search grounded
    models.push({
      creator: () => googleAI("gemini-2.5-flash", { useSearchGrounding: true }),
      name: "Gemini 2.5 Flash (Search Grounded)"
    });
    // 2. Google parametric
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
      console.log(`[AI] Attempting search generation with: ${modelConfig.name}`);
      const result = await generateObject({
        model: modelConfig.creator(),
        schema,
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

    const { searchQuery, forceRefresh, clientDate } = await req.json();

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

    // Determine keywords for database filtering
    const keywords = [
      ...userMajors, 
      userEducationLevel, 
      searchQuery.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    ].filter(Boolean);

    // 2. Perform cache-first search in global catalog
    console.log(`[Search Route] Running cache-first catalog query for: "${searchQuery}"`);
    let catalogResults = await searchLocalCatalog({
      query: searchQuery,
      majors: userMajors,
      educationLevels: userEducationLevel ? [userEducationLevel] : [],
      keywords
    });

    console.log(`[Search Route] Cache lookup returned ${catalogResults.length} matches.`);

    // 3. Scrape-on-Demand: Trigger scraper if matches are sparse (< 5) or forceRefresh is true
    if (catalogResults.length < 5 || forceRefresh === true) {
      console.log(`[Search Route] Matches are sparse or forceRefresh is active. Triggering live scraper...`);
      
      let opportunities: any[] = [];
      const apifyToken = process.env.APIFY_TOKEN || process.env.APIFY_API_KEY;

      if (apifyToken) {
        // Run Apify Google Search Scraper
        const apifyRawResults = await runApifySearch(searchQuery);
        if (apifyRawResults && apifyRawResults.length > 0) {
          // Use LLM to structure Apify raw Google results into our catalog schema
          const todayStr = clientDate || new Date().toISOString().split('T')[0];
          const promptText = `
            You are an expert student financial aid crawler.
            Below is raw web search result data from a Google Search API.
            Convert this data into exactly 4 REAL-WORLD, ACTIVE, currently open opportunities conforming to the schema.
            
            CRITICAL INSTRUCTIONS:
            1. All opportunities MUST have application deadlines after ${todayStr}. Do not return any opportunities with deadlines before this date.
            2. Extract real details and URLs.

            RAW SEARCH DATA:
            ${JSON.stringify(apifyRawResults.slice(0, 15))}
            
            USER PROFILE CONTEXT:
            ${profileSummary}
          `;
          const result = await generateObjectWithFallback({
            schema: searchSchema,
            prompt: promptText
          });
          opportunities = (result.object.opportunities || []).slice(0, 4);
        }
      } 
      
      // Fallback: If Apify is not configured or failed to return items, run Gemini Search Grounding
      if (opportunities.length === 0) {
        console.log("[Search Route] Using Gemini Search Grounding fallback...");
        const todayStr = clientDate || new Date().toISOString().split('T')[0];
        const promptText = `
          You are an expert student financial aid finder.
          Find exactly 4 REAL-WORLD, ACTIVE, currently open scholarships, grants, fellowships, or aid opportunities matching the query.
          Make sure to return actual valid URLs and accurate details.

          SEARCH QUERY: "${searchQuery}"
          USER PROFILE CONTEXT:
          ${profileSummary}

          CRITICAL INSTRUCTIONS:
          1. Search the live web or use your knowledge base for active opportunities. Do not generate fictional or placeholder data.
          2. Do not return any opportunities with application deadlines before ${todayStr}. All deadlines must be in the future.
          3. Ensure kinds align: 'scholarship' or 'fellowship' for academic/talent awards; 'grant' or 'aid' for government or need-based aid.
          4. For the application_url, use the direct application link or provider home page.
          5. Populate majors, education levels, and keywords so they can be matched globally with other users who fit those criteria.
        `;
        const result = await generateObjectWithFallback({
          schema: searchSchema,
          prompt: promptText
        });
        opportunities = (result.object.opportunities || []).slice(0, 4);
      }

      if (opportunities.length > 0) {
        // Save opportunities globally in our database using user client (bypasses RLS check via auth policy)
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

        console.log(`[Search Route] Saving ${dbOpportunities.length} opportunities to global catalog...`);
        const { error: upsertError } = await supabase
          .from("funding_opportunities")
          .upsert(dbOpportunities, { onConflict: "id" });

        if (upsertError) {
          console.error("[Search Route] Supabase upsert error:", upsertError);
        } else {
          console.log("[Search Route] Global catalog updated successfully.");
        }

        // Re-query catalog to return fully merged listings
        catalogResults = await searchLocalCatalog({
          query: searchQuery,
          majors: userMajors,
          educationLevels: userEducationLevel ? [userEducationLevel] : [],
          keywords
        });
      }
    }

    return NextResponse.json({ success: true, opportunities: catalogResults });

  } catch (error: any) {
    console.error("Scraping search error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
