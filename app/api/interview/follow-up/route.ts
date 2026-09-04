import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generateInterviewFollowUpQuestion } from "@/lib/ai";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
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
      questionId,
      questionText,
      userAnswer,
      targetRole = "Software Engineer",
      difficulty = "Mid-Level",
      company = "the company",
    } = body;

    if (!userAnswer || !userAnswer.trim()) {
      return NextResponse.json(
        { error: "User answer is required to generate a follow-up" },
        { status: 400 }
      );
    }

    const followUp = await generateInterviewFollowUpQuestion({
      question: questionText || "Tell me about your technical experience.",
      answer: userAnswer,
      targetRole,
      difficulty,
      company,
    });

    // Optionally record the follow up question in database if questionId provided
    if (questionId) {
      try {
        await supabase
          .from("interview_questions")
          .update({
            follow_up_question: followUp.followUpQuestion,
          })
          .eq("id", questionId);
      } catch {
        // Gracefully ignore if column does not exist
      }
    }

    return NextResponse.json(followUp);
  } catch (error: any) {
    console.error("[Interview Follow-Up API Error]", error);
    return NextResponse.json(
      {
        conversationalTransition: "Thanks for explaining that.",
        followUpQuestion:
          "Could you elaborate on the most challenging trade-off you encountered during that project?",
        rationale: "Default fallback follow-up exploring technical trade-offs.",
      },
      { status: 200 }
    );
  }
}
