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

        // 1. Check for cached insights
        const { data: cachedData } = await supabase
            .from("dashboard_insights")
            .select("*")
            .eq("user_id", user.id)
            .single();

        const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
        const isCacheValid = cachedData &&
            (new Date().getTime() - new Date(cachedData.updated_at).getTime() < CACHE_TTL_MS);

        if (isCacheValid) {
            console.log("[AI] Returning cached insights for user:", user.id);
            return NextResponse.json(cachedData.insights);
        }

        // 2. Fetch new insights from AI if no cache or stale
        console.log("[AI] Cache miss/stale. Fetching new insights from AI...");
        const result = await getAnalyticsInsights(resumes, events);

        // 3. Update cache
        const { error: upsertError } = await supabase
            .from("dashboard_insights")
            .upsert({
                user_id: user.id,
                insights: result,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (upsertError) {
            console.error("[ANALYTICS_CACHE_ERROR]", upsertError);
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("[ANALYTICS_INSIGHTS_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

