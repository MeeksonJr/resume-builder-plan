import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const contactSettings = profile.settings?.contact || {};

    const contact = {
      full_name: profile.full_name || "",
      email: profile.email || user.email || "",
      bio: profile.bio || "",
      summary: profile.bio || "",
      location: profile.location || "",
      website: profile.website_url || "",
      phone: contactSettings.phone || profile.phone || "",
      linkedin: contactSettings.linkedin || profile.linkedin_url || "",
      github: contactSettings.github || profile.github_url || "",
    };

    const { count: resumeCount } = await supabase
      .from("resumes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    return NextResponse.json({
      profile,
      contact,
      resumeCount: resumeCount || 0,
    });
  } catch (err: any) {
    console.error("[ProfileSync GET] Unexpected error:", err);
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
    const { action, contactData } = body;

    if (!contactData) {
      return NextResponse.json({ error: "Missing contactData payload" }, { status: 400 });
    }

    // 1. Fetch existing profile to preserve settings JSONB
    const { data: profile } = await supabase
      .from("profiles")
      .select("settings, bio, website_url, location")
      .eq("id", user.id)
      .single();

    const currentSettings = profile?.settings || {};
    const updatedContactSettings = {
      ...(currentSettings.contact || {}),
      phone: contactData.phone ?? currentSettings.contact?.phone ?? "",
      linkedin: contactData.linkedin ?? contactData.linkedin_url ?? currentSettings.contact?.linkedin ?? "",
      github: contactData.github ?? contactData.github_url ?? currentSettings.contact?.github ?? "",
    };

    const newSettings = {
      ...currentSettings,
      contact: updatedContactSettings,
    };

    // Update global profile table
    const profileUpdatePayload: Record<string, any> = {
      settings: newSettings,
    };

    if (contactData.full_name !== undefined) profileUpdatePayload.full_name = contactData.full_name;
    if (contactData.summary !== undefined) profileUpdatePayload.bio = contactData.summary;
    else if (contactData.bio !== undefined) profileUpdatePayload.bio = contactData.bio;
    if (contactData.location !== undefined) profileUpdatePayload.location = contactData.location;
    if (contactData.website !== undefined) profileUpdatePayload.website_url = contactData.website;
    else if (contactData.website_url !== undefined) profileUpdatePayload.website_url = contactData.website_url;

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update(profileUpdatePayload)
      .eq("id", user.id);

    if (updateProfileError) {
      console.error("[ProfileSync] Error updating profile:", updateProfileError);
      return NextResponse.json({ error: updateProfileError.message }, { status: 500 });
    }

    // 2. Handle specific actions
    if (action === "broadcast_to_resumes") {
      // Find all resumes owned by user
      const { data: resumes, error: resumesError } = await supabase
        .from("resumes")
        .select("id")
        .eq("user_id", user.id);

      if (resumesError) {
        return NextResponse.json({ error: resumesError.message }, { status: 500 });
      }

      const resumeList = resumes || [];
      let updatedCount = 0;

      for (const res of resumeList) {
        // Fetch existing personal_info to preserve fields not supplied
        const { data: existingInfo } = await supabase
          .from("personal_info")
          .select("*")
          .eq("resume_id", res.id)
          .maybeSingle();

        const upsertPayload = {
          resume_id: res.id,
          full_name: contactData.full_name || existingInfo?.full_name || "",
          email: contactData.email || existingInfo?.email || user.email || "",
          phone: contactData.phone ?? existingInfo?.phone ?? "",
          location: contactData.location ?? existingInfo?.location ?? "",
          linkedin: contactData.linkedin ?? contactData.linkedin_url ?? existingInfo?.linkedin ?? "",
          website: contactData.website ?? contactData.website_url ?? existingInfo?.website ?? "",
          github: contactData.github ?? contactData.github_url ?? existingInfo?.github ?? "",
          summary: contactData.summary ?? existingInfo?.summary ?? "",
        };

        const { error: upsertError } = await supabase
          .from("personal_info")
          .upsert(upsertPayload, { onConflict: "resume_id" });

        if (!upsertError) {
          updatedCount++;
        } else {
          console.error(`[ProfileSync] Failed to update resume ${res.id}:`, upsertError);
        }
      }

      return NextResponse.json({
        success: true,
        action: "broadcast_to_resumes",
        updatedCount,
        totalResumes: resumeList.length,
        message: `Successfully synchronized contact details across ${updatedCount} resume(s).`,
      });
    }

    if (action === "push_from_resume") {
      return NextResponse.json({
        success: true,
        action: "push_from_resume",
        message: "Account default profile updated from resume.",
      });
    }

    return NextResponse.json({
      success: true,
      action: "update_profile",
      message: "Profile contact info updated successfully.",
    });
  } catch (err: any) {
    console.error("[ProfileSync POST] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
