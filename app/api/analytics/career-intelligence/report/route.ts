import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateCareerTrajectoryReport } from "@/lib/ai/index";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const careerData = await req.json();

    // Generate AI report
    const report = await generateCareerTrajectoryReport(careerData);

    // Save snapshot
    const { error: insertError } = await supabase
      .from("career_analytics_snapshots")
      .insert({
        user_id: user.id,
        snapshot_type: "trajectory_report",
        data: report,
      });

    if (insertError) {
      console.error("[SNAPSHOT_INSERT_ERROR]", insertError);
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("[CAREER_REPORT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
