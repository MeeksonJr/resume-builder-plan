import { NextResponse } from "next/server";
import { getOrGenerateQuestions } from "@/lib/rapidapi/quick-assess";

/**
 * POST /api/assessment/questions
 * Returns cached or freshly-generated multiple-choice questions for any career/skill.
 * Uses tiered waterfall: Supabase cache → RapidAPI → Gemini LLM → deterministic fallback.
 *
 * Body: { careerField: string, topic?: string, difficulty?: "junior"|"mid"|"senior"|"executive", numQuestions?: number }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      careerField,
      topic,
      difficulty = "mid",
      numQuestions = 5,
    } = body;

    if (!careerField || typeof careerField !== "string" || !careerField.trim()) {
      return NextResponse.json({ error: "careerField is required" }, { status: 400 });
    }

    const result = await getOrGenerateQuestions({
      careerField: careerField.trim(),
      topic: topic?.trim() || careerField.trim(),
      difficulty,
      numQuestions: Math.min(Math.max(Number(numQuestions) || 5, 1), 20),
    });

    return NextResponse.json({
      questions: result.questions,
      source: result.source,
      cached: result.source === "cache",
      careerField: careerField.trim(),
      difficulty,
      count: result.questions.length,
    });
  } catch (error: any) {
    console.error("[Assessment Questions API Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve questions" },
      { status: 500 }
    );
  }
}
