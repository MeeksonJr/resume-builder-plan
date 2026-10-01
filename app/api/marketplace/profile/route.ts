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

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "marketplace_active, marketplace_headline, marketplace_anonymous, marketplace_skills, desired_salary_min, desired_salary_max, target_role, experience_level, full_name, email"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[MARKETPLACE_PROFILE_GET]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile || {});
  } catch (err: any) {
    console.error("[MARKETPLACE_PROFILE_ERROR]", err);
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

    const body = await req.json();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        marketplace_active: !!body.marketplace_active,
        marketplace_headline: body.marketplace_headline || null,
        marketplace_anonymous: body.marketplace_anonymous !== false,
        marketplace_skills: Array.isArray(body.marketplace_skills) ? body.marketplace_skills : [],
        desired_salary_min: body.desired_salary_min ? Number(body.desired_salary_min) : null,
        desired_salary_max: body.desired_salary_max ? Number(body.desired_salary_max) : null,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("[MARKETPLACE_PROFILE_UPDATE]", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[MARKETPLACE_PROFILE_POST_ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
