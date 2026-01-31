import { createClient } from "@/lib/supabase/server";
import { createResumeSnapshot } from "@/lib/version-control";
import { generateInterviewQuestions } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch all user's interview sessions
        const { data: sessions, error } = await supabase
            .from("interview_sessions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json(sessions || []);
    } catch (error) {
        console.error("[INTERVIEW_SESSIONS_GET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { resumeId, targetRole, difficulty, questionCount = 12 } = await req.json();

        if (!targetRole || !difficulty) {
            return new NextResponse("Target role and difficulty are required", { status: 400 });
        }

        // Get resume data for personalized questions
        let resumeData: any = {};
        if (resumeId) {
            resumeData = await createResumeSnapshot(resumeId);
        }

        // Generate questions using AI
        const { questions } = await generateInterviewQuestions(
            resumeData as any,
            targetRole,
            difficulty as "junior" | "mid" | "senior"
        );

        // Limit to requested count
        const selectedQuestions = questions.slice(0, questionCount);

        // Create session
        const { data: session, error: sessionError } = await supabase
            .from("interview_sessions")
            .insert({
                user_id: user.id,
                resume_id: resumeId || null,
                target_role: targetRole,
                difficulty,
                question_count: selectedQuestions.length,
            })
            .select()
            .single();

        if (sessionError) throw sessionError;

        // Insert questions
        const questionInserts = selectedQuestions.map((q, index) => ({
            session_id: session.id,
            question_type: q.type,
            question_text: q.question,
            sort_order: index,
        }));

        const { error: questionsError } = await supabase
            .from("interview_questions")
            .insert(questionInserts);

        if (questionsError) throw questionsError;

        return NextResponse.json({
            sessionId: session.id,
            message: "Interview session created successfully",
        });
    } catch (error) {
        console.error("[INTERVIEW_SESSIONS_POST_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
