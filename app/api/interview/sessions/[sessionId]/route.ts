import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch session with questions
        const { data: session, error: sessionError } = await supabase
            .from("interview_sessions")
            .select("*")
            .eq("id", sessionId)
            .eq("user_id", user.id)
            .single();

        if (sessionError) throw sessionError;

        const { data: questions, error: questionsError } = await supabase
            .from("interview_questions")
            .select("*")
            .eq("session_id", sessionId)
            .order("sort_order");

        if (questionsError) throw questionsError;

        return NextResponse.json({
            ...session,
            questions: questions || [],
        });
    } catch (error) {
        console.error("[INTERVIEW_SESSION_GET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { completed } = await req.json();

        const updateData: any = {};
        if (completed) {
            updateData.completed_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from("interview_sessions")
            .update(updateData)
            .eq("id", sessionId)
            .eq("user_id", user.id);

        if (error) throw error;

        return NextResponse.json({ message: "Session updated successfully" });
    } catch (error) {
        console.error("[INTERVIEW_SESSION_PATCH_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
