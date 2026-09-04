import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch applications that have tailored resumes linked
    const { data: applications, error: appError } = await supabase
      .from("applications")
      .select(`
        id,
        company,
        role,
        status,
        salary_range,
        location,
        url,
        notes,
        applied_at,
        created_at,
        resume_id,
        cover_letter_id
      `)
      .eq("user_id", user.id)
      .not("resume_id", "is", null)
      .order("created_at", { ascending: false });

    if (appError) {
      console.error("[AutopilotPackets GET Error]", appError);
      return NextResponse.json({ error: appError.message }, { status: 500 });
    }

    const appList = applications || [];
    if (appList.length === 0) {
      return NextResponse.json({ packets: [] });
    }

    const resumeIds = appList.map((a) => a.resume_id).filter(Boolean);
    const coverLetterIds = appList.map((a) => a.cover_letter_id).filter(Boolean);

    // 2. Fetch linked resumes, cover letters, and interview sessions in parallel
    const [
      { data: resumes },
      { data: coverLetters },
      { data: interviewSessions },
    ] = await Promise.all([
      supabase.from("resumes").select("id, title, template, visual_config, updated_at").in("id", resumeIds),
      coverLetterIds.length > 0
        ? supabase.from("cover_letters").select("id, title, content, created_at").in("id", coverLetterIds)
        : Promise.resolve({ data: [] }),
      supabase.from("interview_sessions").select("id, resume_id, target_role, target_company, difficulty, question_count, answered_count, average_score, completed_at, session_mode, voice_analysis").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    const resumeMap = new Map((resumes || []).map((r) => [r.id, r]));
    const coverLetterMap = new Map((coverLetters || []).map((c) => [c.id, c]));
    const allSessions = interviewSessions || [];

    // 3. Assemble complete packet payloads
    const packets = appList.map((app) => {
      const linkedResume = app.resume_id ? resumeMap.get(app.resume_id) : null;
      const linkedCoverLetter = app.cover_letter_id ? coverLetterMap.get(app.cover_letter_id) : null;

      // Find best matching interview session (by exact resume_id first, then company/role)
      const matchingSession = allSessions.find(
        (s) => s.resume_id === app.resume_id
      ) || allSessions.find(
        (s) => s.target_company?.toLowerCase() === app.company?.toLowerCase() &&
               s.target_role?.toLowerCase() === app.role?.toLowerCase()
      ) || null;

      return {
        id: app.id,
        company: app.company,
        role: app.role,
        status: app.status || "applied",
        salaryRange: app.salary_range,
        location: app.location,
        url: app.url,
        appliedAt: app.applied_at || app.created_at,
        createdAt: app.created_at,
        notes: app.notes || "",
        newResumeId: app.resume_id,
        newResumeTitle: linkedResume?.title || `${app.role} — ${app.company}`,
        coverLetterId: app.cover_letter_id,
        coverLetterTitle: linkedCoverLetter?.title || `${app.role} Cover Letter`,
        coverLetterContent: linkedCoverLetter?.content || "",
        tailoredSummary: linkedResume?.title || "",
        appliedChanges: [
          "STAR method bullet points formatted with quantified outcomes",
          "Hard keywords aligned with job specification",
          "Cloned and isolated from primary resume record",
        ],
        interviewSession: matchingSession ? {
          id: matchingSession.id,
          targetRole: matchingSession.target_role,
          targetCompany: matchingSession.target_company,
          difficulty: matchingSession.difficulty,
          questionCount: matchingSession.question_count,
          answeredCount: matchingSession.answered_count,
          averageScore: matchingSession.average_score,
          completedAt: matchingSession.completed_at,
          sessionMode: matchingSession.session_mode,
          voiceAnalysis: matchingSession.voice_analysis,
        } : null,
      };
    });

    return NextResponse.json({ packets });
  } catch (err: any) {
    console.error("[AutopilotPackets GET Exception]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, notes, isSaved } = body;

    if (!applicationId) {
      return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (notes !== undefined) updatePayload.notes = notes;

    const { error: updateError } = await supabase
      .from("applications")
      .update(updatePayload)
      .eq("id", applicationId)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Application packet updated" });
  } catch (err: any) {
    console.error("[AutopilotPackets POST Exception]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
