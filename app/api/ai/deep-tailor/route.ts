import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  harvestUserCareerContext,
  generateDeepTailoredPackage,
  persistTailoredPackage,
  JobTargetInput,
} from "@/lib/ai/deep-job-tailor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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
    const { role, company, description, salary_range, location, url, applicationId } = body;

    if (!role || !company) {
      return NextResponse.json(
        { error: "Role and company name are required" },
        { status: 400 }
      );
    }

    const jobInput: JobTargetInput = {
      role: role.trim(),
      company: company.trim(),
      description: (description || "").trim(),
      salary_range: salary_range?.trim(),
      location: location?.trim(),
      url: url?.trim(),
      applicationId,
    };

    // 1. Check user's subscription tier
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro, subscription_status")
      .eq("id", user.id)
      .maybeSingle();

    const isProUser =
      profile?.is_pro === true ||
      profile?.subscription_status === "active" ||
      profile?.subscription_status === "trialing";

    // 2. Harvest all career records (Canvas courses, profiles, past resumes, work, skills, education)
    const context = await harvestUserCareerContext(supabase, user.id);

    // 3. Deep AI generation
    const packageResult = await generateDeepTailoredPackage(jobInput, context);

    // 4. Persist to database (resumes, cover_letters, applications)
    const persistenceResult = await persistTailoredPackage(
      supabase,
      user.id,
      jobInput,
      packageResult,
      isProUser
    );

    return NextResponse.json({
      success: true,
      data: {
        ...persistenceResult,
        isProUser,
        package: packageResult,
      },
    });
  } catch (error: any) {
    console.error("Deep job tailoring error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate tailored job suite" },
      { status: 500 }
    );
  }
}
