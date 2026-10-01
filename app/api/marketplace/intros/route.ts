import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: requests, error } = await supabase
      .from("marketplace_intro_requests")
      .select("*")
      .or(`candidate_user_id.eq.${user.id},recruiter_user_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[MARKETPLACE_INTROS_GET]", error);
      return NextResponse.json([]);
    }

    const formatted = (requests || []).map((r: any) => ({
      id: r.id,
      candidateId: r.candidate_user_id,
      recruiter: {
        id: r.recruiter_user_id || "recruiter-id",
        name: r.recruiter_name,
        company: r.recruiter_company,
        email: r.recruiter_email,
        jobRole: r.job_role,
        salaryOffered: r.salary_offered,
        customPitch: r.custom_pitch,
      },
      status: r.status,
      timestamp: r.created_at,
      respondedAt: r.responded_at,
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("[MARKETPLACE_INTROS_ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    const { data: newRecord, error } = await supabase
      .from("marketplace_intro_requests")
      .insert({
        candidate_user_id: body.candidateId || user.id,
        recruiter_user_id: user.id,
        recruiter_name: body.recruiterName || user.user_metadata?.full_name || "Recruitment Lead",
        recruiter_company: body.recruiterCompany || "Tech Partners",
        recruiter_email: body.recruiterEmail || user.email || "recruiter@talent.com",
        job_role: body.jobRole || "Software Engineer",
        salary_offered: body.salaryOffered || "$185,000 + Equity",
        custom_pitch: body.customPitch || "We saw your verified profile and would love to connect.",
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("[MARKETPLACE_INTROS_INSERT]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, record: newRecord });
  } catch (err: any) {
    console.error("[MARKETPLACE_INTROS_POST_ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, status } = await req.json();

    const { error: updateError } = await supabase
      .from("marketplace_intro_requests")
      .update({
        status,
        responded_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("[MARKETPLACE_INTROS_PATCH]", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[MARKETPLACE_INTROS_PATCH_ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
