import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { canvasUrl, canvasToken, syncSettings } = await req.json();

    const updateData: any = {};
    if (canvasUrl !== undefined) updateData.canvas_instance_url = canvasUrl;
    if (canvasToken !== undefined) updateData.canvas_access_token = canvasToken;
    if (syncSettings !== undefined) updateData.canvas_sync_settings = syncSettings;

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      console.error("[Canvas Config API] Error updating profile:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Canvas Config API] Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
