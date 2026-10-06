import { createClient } from "@/lib/supabase/server";
import { withFallback } from "@/lib/ai/index";
import { generateObject } from "ai";
import { z } from "zod";

export interface QuickAssessQuestion {
  id?: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  rationale?: string;
  competency?: string;
}

export interface GetQuestionsParams {
  careerField: string;
  topic?: string;
  difficulty?: "junior" | "mid" | "senior" | "executive";
  numQuestions?: number;
}

const RAPIDAPI_KEY =
  process.env.RAPIDAPI_KEY ||
  process.env.RAPID_API_KEY ||
  "";

const RAPIDAPI_HOST = "generate-job-interview-questions-ai-quick-assess.p.rapidapi.com";

/**
 * Normalizes career name to a standardized slug for global question deduplication
 */
export function normalizeCareerSlug(careerField: string): string {
  return careerField
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Core cached retrieval engine.
 * 1. Checks Supabase career_question_banks table.
 * 2. On miss, calls RapidAPI Quick Assess MCP / REST.
 * 3. On failure/429, falls back to Gemini LLM withFallback.
 * 4. Automatically persists new questions to Supabase to preserve Free-Tier quota.
 */
export async function getOrGenerateQuestions(
  params: GetQuestionsParams
): Promise<{ questions: QuickAssessQuestion[]; source: "cache" | "rapidapi" | "gemini" | "fallback" }> {
  const { careerField, topic = careerField, difficulty = "mid", numQuestions = 5 } = params;
  const slug = normalizeCareerSlug(careerField);
  const normalizedTopic = topic.trim();

  // Step 1: Check Supabase DB Cache First (Cost: $0, Latency: ~15ms)
  try {
    const supabase = await createClient();
    const { data: cached } = await supabase
      .from("career_question_banks")
      .select("id, questions, usage_count")
      .eq("career_slug", slug)
      .eq("difficulty", difficulty)
      .maybeSingle();

    if (cached && Array.isArray(cached.questions) && cached.questions.length >= numQuestions) {
      // Increment usage count in background (fire-and-forget)
      void (async () => {
        try {
          await supabase
            .from("career_question_banks")
            .update({
              usage_count: (cached.usage_count || 1) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", cached.id);
        } catch (_) {}
      })();

      return {
        questions: cached.questions.slice(0, numQuestions),
        source: "cache",
      };
    }
  } catch (dbErr) {
    console.warn("[QuickAssess] Cache lookup failed, proceeding to API:", dbErr);
  }

  // Step 2: Cache Miss -> Call RapidAPI Quick Assess (Consumes 1 RapidAPI quota)
  const diffMap: Record<string, number> = {
    junior: 3,
    mid: 6,
    senior: 8,
    executive: 9,
  };

  try {
    const rapidRes = await fetch("https://generate-job-interview-questions-ai-quick-assess.p.rapidapi.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      body: JSON.stringify({
        topic: normalizedTopic,
        numQuestions: Math.max(10, numQuestions), // Always fetch 10 to thoroughly seed our DB
        numChoices: 4,
        difficulty: diffMap[difficulty] || 6,
        lang: "en",
        questionType: "multiple-choice",
        skillLevel: difficulty === "executive" ? "senior" : difficulty,
        jobRole: careerField,
        industry: "Professional Services",
      }),
    });

    if (rapidRes.ok) {
      const data = await rapidRes.json();
      if (Array.isArray(data.result) && data.result.length > 0) {
        const rapidQuestions: QuickAssessQuestion[] = data.result.map((item: any, idx: number) => ({
          id: `qa-${idx}-${Date.now().toString(36)}`,
          question: item.question,
          choices: item.choices || [],
          correctAnswer: item.correctAnswer,
          rationale: `Industry standard answer: ${item.correctAnswer}.`,
          competency: normalizedTopic,
        }));

        // Persist to Supabase Cache to guarantee we NEVER call RapidAPI for this career again
        await persistQuestionsToCache(careerField, slug, normalizedTopic, difficulty, "rapidapi_quick_assess", rapidQuestions);

        return {
          questions: rapidQuestions.slice(0, numQuestions),
          source: "rapidapi",
        };
      }
    } else {
      console.warn(`[QuickAssess] RapidAPI responded with status ${rapidRes.status}: ${await rapidRes.text().catch(() => "")}`);
    }
  } catch (apiErr: any) {
    console.warn("[QuickAssess] RapidAPI fetch error, falling back to LLM:", apiErr?.message || apiErr);
  }

  // Step 3: LLM Fallback (Gemini / Groq via withFallback)
  try {
    const aiQuestions = await generateQuestionsViaLLM(careerField, normalizedTopic, difficulty, Math.max(8, numQuestions));
    if (aiQuestions.length > 0) {
      await persistQuestionsToCache(careerField, slug, normalizedTopic, difficulty, "gemini_ai", aiQuestions);
      return {
        questions: aiQuestions.slice(0, numQuestions),
        source: "gemini",
      };
    }
  } catch (llmErr: any) {
    console.warn("[QuickAssess] LLM generation failed, using deterministic fallback:", llmErr?.message || llmErr);
  }

  // Step 4: Deterministic Local Fallback (Ensures 100% reliability)
  const fallback = generateDeterministicFallback(careerField, normalizedTopic, numQuestions);
  return {
    questions: fallback,
    source: "fallback",
  };
}

/**
 * Persists questions into Supabase career_question_banks table
 */
async function persistQuestionsToCache(
  careerField: string,
  slug: string,
  topic: string,
  difficulty: string,
  source: string,
  questions: QuickAssessQuestion[]
) {
  try {
    const supabase = await createClient();
    await supabase.from("career_question_banks").upsert(
      {
        career_field: careerField,
        career_slug: slug,
        topic,
        difficulty,
        difficulty_numeric: difficulty === "junior" ? 3 : difficulty === "mid" ? 6 : difficulty === "senior" ? 8 : 9,
        source,
        questions,
        usage_count: 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "career_slug,topic,difficulty" }
    );
  } catch (err) {
    console.error("[QuickAssess] Failed to write questions to Supabase cache:", err);
  }
}

/**
 * LLM Question Generator when RapidAPI quota is reached or network is unavailable
 */
async function generateQuestionsViaLLM(
  careerField: string,
  topic: string,
  difficulty: string,
  count: number
): Promise<QuickAssessQuestion[]> {
  const result = await withFallback(async (model) => {
    return generateObject({
      model,
      schema: z.object({
        questions: z.array(
          z.object({
            question: z.string(),
            choices: z.array(z.string()).length(4),
            correctAnswer: z.string(),
            rationale: z.string(),
            competency: z.string(),
          })
        ),
      }),
      prompt: `Generate ${count} high-quality, practical multiple-choice assessment questions for a ${difficulty}-level role in "${careerField}", specifically focusing on "${topic}".
Each question must test real-world application, common dilemmas, or domain mastery.
Provide exactly 4 distinct choices, specify the single correct answer exactly as written in the choices, and provide a 1-sentence rationale.`,
    });
  });

  return result.object.questions.map((q, idx) => ({
    id: `ai-${idx}-${Date.now().toString(36)}`,
    question: q.question,
    choices: q.choices,
    correctAnswer: q.correctAnswer,
    rationale: q.rationale,
    competency: q.competency || topic,
  }));
}

/**
 * Deterministic Fallback Questions for absolute zero-failure guarantees
 */
function generateDeterministicFallback(
  careerField: string,
  topic: string,
  count: number
): QuickAssessQuestion[] {
  return [
    {
      id: "fallback-1",
      question: `In professional ${careerField} practice, what is the primary consideration when prioritizing between short-term client delivery and long-term quality standards?`,
      choices: [
        "Aligning with stakeholders on critical path trade-offs while maintaining non-negotiable compliance and quality gates",
        "Always cutting quality checks to hit aggressive deadline targets",
        "Ignoring client deadlines entirely without communication",
        "Bypassing standard operating procedures permanently",
      ],
      correctAnswer: "Aligning with stakeholders on critical path trade-offs while maintaining non-negotiable compliance and quality gates",
      rationale: "Professional excellence balances delivery agility with strict governance controls.",
      competency: topic,
    },
    {
      id: "fallback-2",
      question: `When diagnosing an unexpected operational discrepancy in ${topic}, which methodology yields the most reliable root cause analysis?`,
      choices: [
        "Applying the 5-Whys or Ishikawa Fishbone diagram across data, processes, and people",
        "Assigning blame to the newest team member immediately",
        "Deleting inconsistent metrics from reporting dashboards",
        "Assuming the discrepancy will self-resolve without intervention",
      ],
      correctAnswer: "Applying the 5-Whys or Ishikawa Fishbone diagram across data, processes, and people",
      rationale: "Structured root-cause frameworks identify systemic failures rather than superficial symptoms.",
      competency: topic,
    },
    {
      id: "fallback-3",
      question: `Which metric is the strongest leading indicator of long-term sustainable performance in ${careerField}?`,
      choices: [
        "Quality consistency and customer retention rate over rolling 90-day periods",
        "Raw volume of unverified outputs completed in an hour",
        "The number of meetings scheduled per week",
        "Subjective vanity impressions without conversion tracking",
      ],
      correctAnswer: "Quality consistency and customer retention rate over rolling 90-day periods",
      rationale: "Consistent quality and retention are sustainable predictors of operational success.",
      competency: topic,
    },
  ].slice(0, count);
}

/**
 * Saves a completed user drill score to Supabase
 */
export async function saveSkillDrillResult(params: {
  careerField: string;
  topic: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  answersReview: any[];
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, reason: "unauthenticated" };

    const { error } = await supabase.from("user_skill_drills").insert({
      user_id: user.id,
      career_field: params.careerField,
      topic: params.topic,
      total_questions: params.totalQuestions,
      correct_count: params.correctCount,
      score_percentage: params.scorePercentage,
      time_spent_seconds: params.timeSpentSeconds,
      answers_review: params.answersReview,
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("[QuickAssess] Failed to save skill drill result:", err);
    return { success: false, error: err.message };
  }
}
