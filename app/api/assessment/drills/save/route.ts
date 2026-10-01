import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveSkillDrillResult } from "@/lib/rapidapi/quick-assess";

/**
 * POST /api/assessment/drills/save
 * Saves a completed Quick Practice Drill result for an authenticated user.
 *
 * Body: { careerField, topic, totalQuestions, correctCount, scorePercentage, timeSpentSeconds, answersReview }
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      careerField,
      topic,
      totalQuestions,
      correctCount,
      scorePercentage,
      timeSpentSeconds = 0,
      answersReview = [],
    } = body;

    if (!careerField || totalQuestions == null || correctCount == null) {
      return NextResponse.json(
        { error: "careerField, totalQuestions, and correctCount are required" },
        { status: 400 }
      );
    }

    const result = await saveSkillDrillResult({
      careerField,
      topic: topic || careerField,
      totalQuestions: Number(totalQuestions),
      correctCount: Number(correctCount),
      scorePercentage: Number(scorePercentage) || Math.round((Number(correctCount) / Number(totalQuestions)) * 100),
      timeSpentSeconds: Number(timeSpentSeconds),
      answersReview,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Drill Save API Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save drill result" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assessment/drills/save
 * Returns the authenticated user's drill history.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_skill_drills")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ drills: data || [] });
  } catch (error: any) {
    console.error("[Drill History API Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch drill history" },
      { status: 500 }
    );
  }
}
