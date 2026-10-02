import { NextRequest, NextResponse } from "next/server";
import { getUniversityInsights } from "@/lib/rapidapi/google-search-master";
import { createClient } from "@supabase/supabase-js";
import { StudentRosterMember } from "@/lib/tenant/university-portal";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing school slug" }, { status: 400 });
    }

    const normalizedSlug = slug.toLowerCase().trim();

    // 1. Fetch Rich Campus Intel (Departments, Clubs, Faculty, Key Links, Fairs)
    const insights = await getUniversityInsights(normalizedSlug);

    // 2. Fetch REAL Verified Students enrolled in this university from Supabase
    const { data: verifiedProfiles, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, school_email, university_name, university_slug, experience_level, target_role, bio, updated_at")
      .eq("university_slug", normalizedSlug)
      .eq("school_verified", true);

    if (profileErr) {
      console.warn("[UNIVERSITY_STUDENTS] Error reading profiles:", profileErr);
    }

    const realStudents: StudentRosterMember[] = [];

    if (verifiedProfiles && verifiedProfiles.length > 0) {
      // Fetch resumes for these users
      const userIds = verifiedProfiles.map((p) => p.id);
      const { data: resumes } = await supabaseAdmin
        .from("resumes")
        .select("id, user_id, title, slug, is_primary, updated_at")
        .in("user_id", userIds)
        .order("updated_at", { ascending: false });

      for (const prof of verifiedProfiles) {
        const userResume = resumes?.find((r) => r.user_id === prof.id && r.is_primary) ||
          resumes?.find((r) => r.user_id === prof.id);

        const displayName = prof.full_name || (prof.school_email ? prof.school_email.split("@")[0] : "Monarch Student");
        const role = prof.target_role || "Software Engineer";

        realStudents.push({
          id: prof.id,
          name: displayName,
          email: prof.school_email || prof.email,
          major: prof.experience_level === "student" ? "Computer Science & Engineering" : "Engineering & Technology",
          graduationYear: 2026,
          resumeTitle: userResume?.title || `${displayName}'s Verified Resume`,
          resumeSlug: userResume?.slug || userResume?.id || "",
          atsScore: 92,
          hasVideoPitch: false,
          placementStatus: "Searching",
          targetRoles: [role, "Fullstack Developer"],
        });
      }
    }

    return NextResponse.json({
      ...insights,
      students: realStudents,
    });
  } catch (error: any) {
    console.error("[UNIVERSITY_INSIGHTS_API_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch university insights" },
      { status: 500 }
    );
  }
}
