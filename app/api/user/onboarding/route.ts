import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { detectSchoolFromEmail, isAcademicDomain } from "@/lib/university/detect";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "onboarding_completed, is_student, university_name, university_slug, school_verified, school_email, target_role, experience_level"
      )
      .eq("id", user.id)
      .maybeSingle();

    const email = user.email || "";
    const emailDomain = email.split("@")[1]?.toLowerCase().trim();
    const isAcademic = isAcademicDomain(emailDomain);
    const detected = isAcademic ? detectSchoolFromEmail(email) : null;
    const isConfirmedUser = !!user.email_confirmed_at || !!user.confirmed_at;

    // A user with an academic email confirmed in auth is automatically school-verified
    const effectiveSchoolVerified = Boolean(
      profile?.school_verified ||
      (isAcademic && isConfirmedUser)
    );

    const effectiveUniversityName =
      profile?.university_name ||
      user.user_metadata?.campus_affiliation ||
      user.user_metadata?.university_name ||
      detected?.name ||
      null;

    const effectiveUniversitySlug =
      profile?.university_slug ||
      user.user_metadata?.university_slug ||
      detected?.slug ||
      (effectiveUniversityName
        ? effectiveUniversityName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        : null);

    return NextResponse.json({
      onboardingCompleted: profile?.onboarding_completed || false,
      isStudent: profile?.is_student !== undefined ? profile.is_student : (isAcademic ? true : false),
      universityName: effectiveUniversityName,
      universitySlug: effectiveUniversitySlug,
      schoolVerified: effectiveSchoolVerified,
      schoolEmail: profile?.school_email || (isAcademic ? email : null),
      targetRole: profile?.target_role || null,
      experienceLevel: profile?.experience_level || null,
      email,
      isAcademicEmail: isAcademic,
      detectedSchool: detected,
    });
  } catch (err: any) {
    console.error("[ONBOARDING_STATUS_ERROR]", err);
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

    const {
      targetRole,
      experienceLevel,
      isStudent,
      universityName,
      universitySlug,
      schoolVerified,
      schoolEmail,
    } = await req.json();

    const updatePayload: Record<string, any> = {
      onboarding_completed: true,
      target_role: targetRole || null,
      experience_level: experienceLevel || null,
      is_student: !!isStudent,
    };

    if (universityName) {
      updatePayload.university_name = universityName;
      updatePayload.university_slug =
        universitySlug ||
        universityName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
    }

    if (schoolVerified !== undefined) {
      updatePayload.school_verified = schoolVerified;
    }

    if (schoolEmail) {
      updatePayload.school_email = schoolEmail;
    } else if (schoolVerified && user.email) {
      updatePayload.school_email = user.email;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id);

    if (updateError) {
      console.error("[ONBOARDING_UPDATE_ERROR]", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[ONBOARDING_COMPLETE_ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
