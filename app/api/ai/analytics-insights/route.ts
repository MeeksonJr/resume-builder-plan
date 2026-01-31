import { createClient } from "@/lib/supabase/server";
import { getAnalyticsInsights } from "@/lib/ai/index";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { resumes, events } = await req.json();

        const result = await getAnalyticsInsights(resumes, events);

        return NextResponse.json(result);
    } catch (error) {
        console.error("[ANALYTICS_INSIGHTS_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
