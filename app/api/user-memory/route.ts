import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_USER_MEMORY, UserMemory } from "@/lib/types/user-memory";

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

    // 1. Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile?.settings?.user_memory) {
      return NextResponse.json({
        memory: profile.settings.user_memory,
        source: "database",
      });
    }

    // 2. If no saved memory yet, try harvesting from primary resume + profile
    const { data: primaryResume } = await supabase
      .from("resumes")
      .select("id, title")
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .maybeSingle();

    const targetResumeId = primaryResume?.id;

    let workList: any[] = [];
    let eduList: any[] = [];
    let skillsList: any[] = [];
    let projList: any[] = [];
    let certList: any[] = [];

    if (targetResumeId) {
      const [wRes, eRes, sRes, pRes, cRes] = await Promise.all([
        supabase.from("work_experiences").select("*").eq("resume_id", targetResumeId).order("display_order"),
        supabase.from("educations").select("*").eq("resume_id", targetResumeId).order("display_order"),
        supabase.from("skills").select("*").eq("resume_id", targetResumeId).order("display_order"),
        supabase.from("projects").select("*").eq("resume_id", targetResumeId).order("display_order"),
        supabase.from("certifications").select("*").eq("resume_id", targetResumeId).order("display_order"),
      ]);

      workList = wRes.data || [];
      eduList = eRes.data || [];
      skillsList = sRes.data || [];
      projList = pRes.data || [];
      certList = cRes.data || [];
    }

    // If profile has data, create an initial user memory
    if (profile?.full_name || workList.length > 0 || skillsList.length > 0) {
      const contactSettings = profile?.settings?.contact || {};
      const initialMemory: UserMemory = {
        version: 1,
        last_updated: new Date().toISOString(),
        sources: ["Profile & Primary Resume Bootstrap"],
        basics: {
          full_name: profile?.full_name || "Professional",
          headline: profile?.settings?.headline || "Software Engineer",
          email: profile?.email || user.email || "",
          phone: contactSettings.phone || profile?.phone || "",
          location: profile?.location || "",
          bio: profile?.bio || profile?.summary || "",
          avatar_url: profile?.avatar_url || "",
        },
        socials: {
          linkedin: contactSettings.linkedin || profile?.linkedin_url || "",
          github: contactSettings.github || profile?.github_url || "",
          portfolio: profile?.website_url || "",
        },
        experiences: workList.map((w, idx) => ({
          id: w.id || `exp_${idx}`,
          company: w.company,
          position: w.position,
          location: w.location || "",
          start_date: w.start_date || "",
          end_date: w.end_date || (w.is_current ? "Present" : ""),
          is_current: !!w.is_current,
          description: w.description || "",
          highlights: Array.isArray(w.highlights) ? w.highlights : [],
        })),
        education: eduList.map((e, idx) => ({
          id: e.id || `edu_${idx}`,
          institution: e.institution,
          degree: e.degree || "",
          field_of_study: e.field_of_study || "",
          location: e.location || "",
          start_date: e.start_date || "",
          end_date: e.end_date || "",
          gpa: e.gpa || "",
          honors: "",
          highlights: Array.isArray(e.highlights) ? e.highlights : [],
        })),
        skills: skillsList.map((s, idx) => ({
          id: s.id || `sk_${idx}`,
          name: s.name,
          category: (s.category as any) || "Languages",
          proficiency: s.proficiency_level || 4,
        })),
        projects: projList.map((p, idx) => ({
          id: p.id || `proj_${idx}`,
          name: p.name,
          description: p.description || "",
          technologies: Array.isArray(p.technologies) ? p.technologies : [],
          url: p.url || "",
          github_url: "",
          highlights: Array.isArray(p.highlights) ? p.highlights : [],
        })),
        certifications: certList.map((c, idx) => ({
          id: c.id || `cert_${idx}`,
          name: c.name,
          issuer: c.issuer || "",
          issue_date: c.issue_date || "",
          expiry_date: c.expiry_date || "",
          credential_id: c.credential_id || "",
          credential_url: c.credential_url || "",
        })),
        preferences: DEFAULT_USER_MEMORY.preferences,
      };

      // Persist into user profile
      const updatedSettings = {
        ...(profile?.settings || {}),
        user_memory: initialMemory,
      };

      await supabase
        .from("profiles")
        .update({ settings: updatedSettings, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      return NextResponse.json({
        memory: initialMemory,
        source: "bootstrapped",
      });
    }

    return NextResponse.json({
      memory: null,
      source: "empty",
    });
  } catch (error: any) {
    console.error("[UserMemory GET] Unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load user memory" },
      { status: 500 }
    );
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
    const { memory } = body;

    if (!memory) {
      return NextResponse.json({ error: "Missing memory payload" }, { status: 400 });
    }

    // Fetch existing profile settings
    const { data: profile } = await supabase
      .from("profiles")
      .select("settings, full_name, bio, location, phone, website_url, linkedin_url, github_url")
      .eq("id", user.id)
      .single();

    const currentSettings = profile?.settings || {};
    const updatedSettings = {
      ...currentSettings,
      user_memory: {
        ...memory,
        last_updated: new Date().toISOString(),
      },
      contact: {
        ...(currentSettings.contact || {}),
        phone: memory.basics?.phone || currentSettings.contact?.phone || "",
        linkedin: memory.socials?.linkedin || currentSettings.contact?.linkedin || "",
        github: memory.socials?.github || currentSettings.contact?.github || "",
      },
    };

    // Update profiles table
    const profileUpdate: Record<string, any> = {
      settings: updatedSettings,
      updated_at: new Date().toISOString(),
    };

    if (memory.basics?.full_name) profileUpdate.full_name = memory.basics.full_name;
    if (memory.basics?.bio) profileUpdate.bio = memory.basics.bio;
    if (memory.basics?.location) profileUpdate.location = memory.basics.location;
    if (memory.basics?.phone) profileUpdate.phone = memory.basics.phone;
    if (memory.socials?.portfolio) profileUpdate.website_url = memory.socials.portfolio;
    if (memory.socials?.linkedin) profileUpdate.linkedin_url = memory.socials.linkedin;
    if (memory.socials?.github) profileUpdate.github_url = memory.socials.github;

    const { error: updateError } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", user.id);

    if (updateError) {
      console.warn("[UserMemory POST] Profile update warning:", updateError);
    }

    return NextResponse.json({
      success: true,
      last_updated: updatedSettings.user_memory.last_updated,
    });
  } catch (error: any) {
    console.error("[UserMemory POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user memory" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("settings")
      .eq("id", user.id)
      .single();

    const currentSettings = profile?.settings || {};
    delete currentSettings.user_memory;

    await supabase
      .from("profiles")
      .update({
        settings: currentSettings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({ success: true, message: "User memory cleared" });
  } catch (error: any) {
    console.error("[UserMemory DELETE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clear user memory" },
      { status: 500 }
    );
  }
}
