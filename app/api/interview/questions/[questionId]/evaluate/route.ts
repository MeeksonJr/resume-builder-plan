import { createClient } from "@/lib/supabase/server";
import { evaluateInterviewAnswer } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ questionId: string }> }
) {
    try {
        const { questionId } = await params;
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { answer } = await req.json();

        if (!answer || answer.trim().length === 0) {
            return new NextResponse("Answer is required", { status: 400 });
        }

        // Get question details
        const { data: question, error: questionError } = await supabase
            .from("interview_questions")
            .select("*, interview_sessions!inner(user_id)")
            .eq("id", questionId)
            .single();

        if (questionError) throw questionError;

        // Verify ownership
        if (question.interview_sessions.user_id !== user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Evaluate answer using AI
        const feedback = await evaluateInterviewAnswer(
            question.question_text,
            answer,
            question.question_type as "behavioral" | "technical" | "situational"
        );

        // Save answer and feedback
        const { error: updateError } = await supabase
            .from("interview_questions")
            .update({
                user_answer: answer,
                ai_feedback: feedback,
                answered_at: new Date().toISOString(),
            })
            .eq("id", questionId);

        if (updateError) throw updateError;

        return NextResponse.json(feedback);
    } catch (error) {
        console.error("[EVALUATE_ANSWER_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
