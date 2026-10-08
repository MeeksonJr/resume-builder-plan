import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { schoolEmail, code } = await req.json();

    if (!schoolEmail || !code) {
      return NextResponse.json({ error: "Missing school email or code" }, { status: 400 });
    }

    // Lookup code in school_verification_codes
    const { data: record, error: findError } = await supabase
      .from("school_verification_codes")
      .select("*")
      .eq("user_id", user.id)
      .eq("school_email", schoolEmail.trim().toLowerCase())
      .eq("code", code.trim())
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError || !record) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Read current profile to preserve multi-school verification history
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("settings, university_slug, university_name, school_email")
      .eq("id", user.id)
      .maybeSingle();

    const currentSettings = (currentProfile?.settings as Record<string, any>) || {};
    const verifiedSchools: Array<{ slug: string; name: string; email: string; verified_at: string }> =
      Array.isArray(currentSettings.verified_schools) ? [...currentSettings.verified_schools] : [];

    // Ensure any previously verified school is retained
    if (
      currentProfile?.university_slug &&
      !verifiedSchools.some((s) => s.slug === currentProfile.university_slug)
    ) {
      verifiedSchools.push({
        slug: currentProfile.university_slug,
        name: currentProfile.university_name || currentProfile.university_slug,
        email: currentProfile.school_email || "",
        verified_at: new Date().toISOString(),
      });
    }

    // Append / update the new verified school
    const newSchoolEntry = {
      slug: record.university_slug,
      name: record.university_name,
      email: record.school_email,
      verified_at: new Date().toISOString(),
    };
    const existingIndex = verifiedSchools.findIndex((s) => s.slug === record.university_slug);
    if (existingIndex >= 0) {
      verifiedSchools[existingIndex] = newSchoolEntry;
    } else {
      verifiedSchools.push(newSchoolEntry);
    }

    // Update profile with primary and multi-school verified settings
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_student: true,
        school_verified: true,
        school_email: record.school_email,
        university_name: record.university_name,
        university_slug: record.university_slug,
        settings: {
          ...currentSettings,
          verified_schools: verifiedSchools,
        },
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("[SCHOOL_VERIFY_CODE] Profile update error:", updateError);
      return NextResponse.json({ error: "Failed to update profile verification" }, { status: 500 });
    }

    // Clean up used code
    await supabase.from("school_verification_codes").delete().eq("id", record.id);

    return NextResponse.json({
      success: true,
      university_slug: record.university_slug,
      university_name: record.university_name,
    });
  } catch (err: any) {
    console.error("[SCHOOL_VERIFY_CODE_ERROR]", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
