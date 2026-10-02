import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Record demo trial start timestamp and mark as demo user
    const { error } = await supabase
      .from("profiles")
      .update({
        demo_trial_started_at: new Date().toISOString(),
        is_demo_user: true,
      })
      .eq("id", user.id);

    if (error) {
      console.error("[demo/activate] DB error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, demo_started: new Date().toISOString() });
  } catch (err: any) {
    console.error("[demo/activate] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
