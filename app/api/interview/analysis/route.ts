import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generateVoiceCommunicationAnalysis } from "@/lib/ai";

export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const { sessionId, telemetry } = await req.json();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch session
    const { data: session } = await supabase
      .from("interview_sessions")
      .select("*, interview_questions(*)")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // If analysis already exists and no re-run requested, return it
    if (session.voice_analysis) {
      return NextResponse.json(session.voice_analysis);
    }

    const transcript = Array.isArray(session.transcript) ? session.transcript : [];
    if (transcript.length === 0) {
      return NextResponse.json({ error: "No transcript recorded for this session" }, { status: 400 });
    }

    const analysis = await generateVoiceCommunicationAnalysis({
      transcript,
      targetRole: session.target_role || "Software Engineer",
      difficulty: session.difficulty || "Mid-Level",
      telemetry: telemetry || {
        averageWpm: 130,
        totalFillers: 0,
        totalDurationSeconds: 120,
      },
    });

    // Save to DB
    await supabase
      .from("interview_sessions")
      .update({
        voice_analysis: analysis,
        overall_score: analysis.overallScore,
      })
      .eq("id", sessionId);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("[Interview Voice Analysis Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate voice analysis" },
      { status: 500 }
    );
  }
}
