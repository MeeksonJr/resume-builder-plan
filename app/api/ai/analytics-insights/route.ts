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
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const { resumes = [], events = [], force = false } = body;

        // 1. Check for cached insights (bypass if force is true)
        if (!force) {
            try {
                const { data: cachedData } = await supabase
                    .from("dashboard_insights")
                    .select("*")
                    .eq("user_id", user.id)
                    .maybeSingle();

                const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
                const isCacheValid = cachedData?.insights && cachedData?.updated_at &&
                    (new Date().getTime() - new Date(cachedData.updated_at).getTime() < CACHE_TTL_MS);

                if (isCacheValid) {
                    console.log("[AI] Returning cached insights for user:", user.id);
                    return NextResponse.json(cachedData.insights);
                }
            } catch (cacheErr) {
                console.warn("[AI] Cache lookup error, proceeding with generation:", cacheErr);
            }
        } else {
            console.log("[AI] Force re-analyze requested. Bypassing cache for user:", user.id);
        }

        // 2. Fetch new insights from AI if no cache or stale
        console.log("[AI] Cache miss/stale. Fetching new insights from AI...");
        const result = await getAnalyticsInsights(resumes, events);

        // 3. Update cache non-blockingly
        try {
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
                console.warn("[ANALYTICS_CACHE_ERROR]", upsertError);
            }
        } catch (upsertCatch) {
            console.warn("[ANALYTICS_CACHE_CATCH]", upsertCatch);
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("[ANALYTICS_INSIGHTS_ERROR]", error);
        return NextResponse.json({
            insights: [
                "Structure key accomplishments with the STAR method (Situation, Task, Action, Result) to maximize impact.",
                "Ensure technical proficiencies directly mirror high-frequency ATS keywords in your target job descriptions.",
                "Share your portfolio link directly across your professional network to accelerate discovery.",
                "Highlight measurable achievements (% efficiency gained, revenue generated, latency reduced)."
            ],
            keywordSuggestions: ["Full-Stack", "System Architecture", "Cloud Native", "DevOps", "REST APIs"],
            performanceVerdict: "Resume portfolio is active and indexed; refine ATS keywords to convert views into recruiter conversations."
        });
    }
}

