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

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "onboarding_completed, is_student, university_name, university_slug, school_verified, target_role, experience_level"
      )
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      onboardingCompleted: profile?.onboarding_completed || false,
      isStudent: profile?.is_student || false,
      universityName: profile?.university_name || null,
      universitySlug: profile?.university_slug || null,
      schoolVerified: profile?.school_verified || false,
      targetRole: profile?.target_role || null,
      experienceLevel: profile?.experience_level || null,
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
