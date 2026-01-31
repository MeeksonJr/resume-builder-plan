import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { questionId, sessionId, answerText, answerDuration } = body;

        // Validate required fields
        if (!questionId || !sessionId || !answerText) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Insert the answer
        const { data: answer, error: insertError } = await supabase
            .from("interview_answers")
            .insert({
                user_id: session.user.id,
                question_id: questionId,
                session_id: sessionId,
                answer_text: answerText,
                answer_duration: answerDuration || null,
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error inserting answer:", insertError);
            return NextResponse.json(
                { error: "Failed to save answer" },
                { status: 500 }
            );
        }

        return NextResponse.json({ answer }, { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/interview/answers:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json(
                { error: "Session ID required" },
                { status: 400 }
            );
        }

        // Fetch all answers for the session
        const { data: answers, error } = await supabase
            .from("interview_answers")
            .select(
                `
        *,
        interview_questions (
          id,
          question_text,
          question_type,
          difficulty
        ),
        interview_feedback (
          id,
          score,
          strengths,
          weaknesses,
          improvements,
          overall_feedback
        )
      `
            )
            .eq("user_id", session.user.id)
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching answers:", error);
            return NextResponse.json(
                { error: "Failed to fetch answers" },
                { status: 500 }
            );
        }

        return NextResponse.json({ answers }, { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/interview/answers:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
