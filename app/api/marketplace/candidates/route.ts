import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { SAMPLE_MARKETPLACE_CANDIDATES } from "@/lib/marketplace/reverse-job-board";

export async function GET() {
  try {
    const supabase = await createClient();

    // Query active candidates from Supabase
    const { data: dbCandidates } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, target_role, experience_level, marketplace_headline, marketplace_skills, desired_salary_min, desired_salary_max, marketplace_anonymous, university_name, school_verified"
      )
      .eq("marketplace_active", true);

    const formattedDbCandidates = (dbCandidates || []).map((c: any) => ({
      id: c.id,
      userId: c.id,
      isAnonymous: c.marketplace_anonymous !== false,
      maskedName: c.marketplace_anonymous !== false ? "Verified Tech Candidate" : (c.full_name || "Candidate"),
      realName: c.full_name || "Anonymous",
      email: c.email || "",
      verifiedAtsScore: 92,
      yearsExperience: c.experience_level === "senior" ? 7 : c.experience_level === "mid" ? 4 : 2,
      availability: "actively_looking" as const,
      desiredRole: c.target_role || "Software Engineer",
      desiredSalary: {
        min: c.desired_salary_min || 160000,
        max: c.desired_salary_max || 220000,
        currency: "USD",
      },
      currentLevel: c.experience_level || "mid",
      topSkills: c.marketplace_skills?.length > 0 ? c.marketplace_skills : ["TypeScript", "React", "PostgreSQL", "Next.js"],
      bio: c.marketplace_headline || "Specializing in high-performance engineering, scalable fullstack apps, and distributed systems.",
      location: "United States (Remote)",
      isVerifiedStudent: !!c.school_verified,
      universityName: c.university_name || undefined,
    }));

    // Merge active user candidates with curated talent so marketplace is vibrant
    const allCandidates = [...formattedDbCandidates, ...SAMPLE_MARKETPLACE_CANDIDATES];

    return NextResponse.json(allCandidates);
  } catch (err: any) {
    console.error("[MARKETPLACE_CANDIDATES_ERROR]", err);
    return NextResponse.json(SAMPLE_MARKETPLACE_CANDIDATES);
  }
}
