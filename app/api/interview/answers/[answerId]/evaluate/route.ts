import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { evaluateInterviewAnswer } from "@/lib/ai/interview-evaluator";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ answerId: string }> }
) {
    try {
        const { answerId } = await params;
        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { allowed, remaining } = await checkRateLimit("ai_interview");
        if (!allowed) {
            return NextResponse.json({
                error: "Daily AI limit reached. Please try again tomorrow."
            }, { status: 429 });
        }

        // Fetch the answer and associated question
        const { data: answer, error: fetchError } = await supabase
            .from("interview_answers")
            .select(
                `
        *,
        interview_questions (
          id,
          question_text,
          question_type
        )
      `
            )
            .eq("id", answerId)
            .eq("user_id", user.id)
            .single();

        if (fetchError || !answer) {
            return NextResponse.json({ error: "Answer not found" }, { status: 404 });
        }

        // Check if feedback already exists
        const { data: existingFeedback } = await supabase
            .from("interview_feedback")
            .select("*")
            .eq("answer_id", answerId)
            .single();

        if (existingFeedback) {
            return NextResponse.json(
                {
                    feedback: existingFeedback,
                    answer: answer
                },
                { status: 200 }
            );
        }

        // Evaluate the answer using AI
        const evaluation = await evaluateInterviewAnswer({
            question: answer.interview_questions.question_text,
            questionType: answer.interview_questions.question_type,
            answer: answer.answer_text,
        });

        // Save the feedback
        const { data: feedback, error: insertError } = await supabase
            .from("interview_feedback")
            .insert({
                answer_id: answerId,
                score: evaluation.score,
                strengths: evaluation.strengths,
                weaknesses: evaluation.weaknesses,
                improvements: evaluation.improvements,
                overall_feedback: evaluation.overallFeedback,
                star_breakdown: evaluation.starBreakdown,
                star_scores: evaluation.scores,
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error saving feedback:", insertError);
            return NextResponse.json(
                { error: "Failed to save feedback" },
                { status: 500 }
            );
        }

        return NextResponse.json({ feedback, answer }, { status: 201 });
    } catch (error) {
        console.error("Error evaluating answer:", error);
        return NextResponse.json(
            { error: "Failed to evaluate answer" },
            { status: 500 }
        );
    }
}
