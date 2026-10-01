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

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_student: true,
        school_verified: true,
        school_email: record.school_email,
        university_name: record.university_name,
        university_slug: record.university_slug,
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
