import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { evaluateInterviewAnswer } from "@/lib/ai/interview-evaluator";

export async function POST(
    request: NextRequest,
    { params }: { params: { answerId: string } }
) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { answerId } = params;

        // Fetch the answer and associated question
        const { data: answer, error: fetchError } = await supabase
            .from("interview_answers")
            .select(
                `
        *,
        interview_questions (
          id,
          question_text,
          question_type,
          difficulty
        )
      `
            )
            .eq("id", answerId)
            .eq("user_id", session.user.id)
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
                { feedback: existingFeedback },
                { status: 200 }
            );
        }

        // Evaluate the answer using AI
        const evaluation = await evaluateInterviewAnswer({
            question: answer.interview_questions.question_text,
            questionType: answer.interview_questions.question_type,
            answer: answer.answer_text,
            difficulty: answer.interview_questions.difficulty,
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

        return NextResponse.json({ feedback }, { status: 201 });
    } catch (error) {
        console.error("Error evaluating answer:", error);
        return NextResponse.json(
            { error: "Failed to evaluate answer" },
            { status: 500 }
        );
    }
}
