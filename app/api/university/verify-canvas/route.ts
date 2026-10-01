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

    const { canvasInstanceUrl, canvasAccessToken, schoolName } = await req.json();

    if (!canvasInstanceUrl || !canvasAccessToken) {
      return NextResponse.json(
        { error: "Please provide both Canvas URL and Access Token" },
        { status: 400 }
      );
    }

    const baseUrl = canvasInstanceUrl.replace(/\/$/, "");

    // Test Canvas Connection with provided token
    const testRes = await fetch(`${baseUrl}/api/v1/users/self/profile`, {
      headers: {
        Authorization: `Bearer ${canvasAccessToken.trim()}`,
      },
    });

    if (!testRes.ok) {
      return NextResponse.json(
        { error: "Could not connect to Canvas. Please verify the URL and Token." },
        { status: 400 }
      );
    }

    const profileData = await testRes.json();
    const resolvedSchoolName =
      schoolName ||
      (baseUrl.includes("canvas.") ? baseUrl.split("canvas.")[1].split(".")[0] : "University Student");

    const universitySlug = resolvedSchoolName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Save verified credentials to profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_student: true,
        school_verified: true,
        university_name: resolvedSchoolName,
        university_slug: universitySlug,
        canvas_instance_url: baseUrl,
        canvas_access_token: canvasAccessToken.trim(),
        canvas_sync_settings: {
          sync_courses: true,
          sync_assignments: true,
          sync_grades: true,
        },
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("[CANVAS_VERIFY_ERROR]", updateError);
      return NextResponse.json({ error: "Failed to update profile verification" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      studentName: profileData.name || profileData.short_name,
      university_slug: universitySlug,
      university_name: resolvedSchoolName,
    });
  } catch (err: any) {
    console.error("[CANVAS_VERIFY_ROUTE_ERROR]", err);
    return NextResponse.json({ error: err.message || "Failed to verify Canvas token" }, { status: 500 });
  }
}
