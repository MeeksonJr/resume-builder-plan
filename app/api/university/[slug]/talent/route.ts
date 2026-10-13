import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeInstitutionSlug } from "@/lib/university/access-control";
import { resolveUniversityTenant } from "@/lib/tenant/university-portal";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export interface RecruiterInterviewRequest {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  recruiter_name: string;
  recruiter_email: string;
  recruiter_company: string;
  position: string;
  interview_date: string;
  interview_type: "virtual" | "on_campus" | "phone";
  message?: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
}

interface RouteParams {
  params: Promise<{ slug: string }>;
}

async function getCampusInquiries(schoolSlug: string): Promise<RecruiterInterviewRequest[]> {
  try {
    const { data } = await supabaseAdmin
      .from("university_insights_cache")
      .select("raw_search_data")
      .eq("school_slug", schoolSlug)
      .maybeSingle();

    const raw = (data?.raw_search_data as any) || {};
    return Array.isArray(raw.talent_inquiries) ? raw.talent_inquiries : [];
  } catch (e) {
    console.warn("[GET_INQUIRIES_WARN]", e);
    return [];
  }
}

async function saveCampusInquiries(schoolSlug: string, inquiries: RecruiterInterviewRequest[]): Promise<void> {
  try {
    const { data } = await supabaseAdmin
      .from("university_insights_cache")
      .select("raw_search_data, school_name")
      .eq("school_slug", schoolSlug)
      .maybeSingle();

    const currentRaw = (data?.raw_search_data as any) || {};
    const updatedRaw = {
      ...currentRaw,
      talent_inquiries: inquiries,
    };

    const tenant = resolveUniversityTenant(schoolSlug);

    const { error: upsertErr } = await supabaseAdmin
      .from("university_insights_cache")
      .upsert(
        {
          school_slug: schoolSlug,
          school_name: data?.school_name || tenant.name,
          raw_search_data: updatedRaw,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "school_slug" }
      );

    if (upsertErr) {
      console.warn("[SAVE_INQUIRIES_UPSERT_ERR]", upsertErr);
    }
  } catch (e) {
    console.warn("[SAVE_INQUIRIES_WARN]", e);
  }
}


/**
 * GET: Retrieves recruiter talent interview inquiries and stats
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing school slug" }, { status: 400 });
    }

    const normalizedSlug = normalizeInstitutionSlug(slug);
    const tenant = resolveUniversityTenant(normalizedSlug);

    const inquiries = await getCampusInquiries(normalizedSlug);

    return NextResponse.json({
      school_slug: normalizedSlug,
      school_name: tenant.name,
      inquiries,
      total_inquiries: inquiries.length,
      pending_interviews: inquiries.filter((i) => i.status === "pending").length,
    });
  } catch (error: any) {
    console.error("[TALENT_GET_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch talent requests" },
      { status: 500 }
    );
  }
}

/**
 * POST: Handles Recruiter Interview Requests & Shortlist Audit Logging
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing school slug" }, { status: 400 });
    }

    const normalizedSlug = normalizeInstitutionSlug(slug);
    const tenant = resolveUniversityTenant(normalizedSlug);
    const body = await req.json();

    const {
      candidateId,
      candidateName,
      candidateEmail,
      recruiterName,
      recruiterEmail,
      recruiterCompany,
      position,
      interviewDate,
      interviewType = "virtual",
      message,
    } = body;

    if (!candidateId || !candidateName || !recruiterCompany) {
      return NextResponse.json(
        { error: "Candidate information and recruiting company are required" },
        { status: 400 }
      );
    }

    const inquiryRecord: RecruiterInterviewRequest = {
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      candidate_id: candidateId,
      candidate_name: candidateName,
      candidate_email: candidateEmail || "student@institution.edu",
      recruiter_name: recruiterName || "Campus Recruiter",
      recruiter_email: recruiterEmail || "recruiting@company.com",
      recruiter_company: recruiterCompany,
      position: position || "Software Engineer Intern / New Grad",
      interview_date: interviewDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      interview_type: interviewType,
      message: message || "We were impressed with your verified resume and would love to schedule a technical conversation.",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    // Save to persistent cache
    const existing = await getCampusInquiries(normalizedSlug);
    await saveCampusInquiries(normalizedSlug, [inquiryRecord, ...existing]);

    return NextResponse.json({
      success: true,
      message: `Interview request dispatched for ${candidateName} at ${recruiterCompany}!`,
      inquiry: inquiryRecord,
    });
  } catch (error: any) {
    console.error("[TALENT_POST_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to process recruiter request" },
      { status: 500 }
    );
  }
}
