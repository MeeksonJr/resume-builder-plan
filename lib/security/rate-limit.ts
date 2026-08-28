import { createClient } from "@/lib/supabase/server";

export type AIFeature =
    | "ai_improve"
    | "ai_tailor"
    | "ai_summary"
    | "ai_ats"
    | "ai_interview"
    | "ai_parse"
    | "ai_keywords"
    | "ai_generate"
    | "career_coach"
    | "skills_gap"
    | "salary_insights";

// Limits for Free users
const FREE_LIMITS: Record<AIFeature, number> = {
    ai_improve: 5,
    ai_tailor: 0,      // Upgrade required
    ai_summary: 5,
    ai_ats: 2,
    ai_interview: 1,   // Daily limit for interview evaluates
    ai_parse: 2,
    ai_keywords: 0,    // Upgrade required
    ai_generate: 5,
    career_coach: 1,
    skills_gap: 1,
    salary_insights: 1
};

// Limits for Pro users
const PRO_LIMITS: Record<AIFeature, number> = {
    ai_improve: 200,
    ai_tailor: 100,
    ai_summary: 100,
    ai_ats: 50,
    ai_interview: 50,
    ai_parse: 30,
    ai_keywords: 100,
    ai_generate: 100,
    career_coach: 50,
    skills_gap: 50,
    salary_insights: 50
};

export async function checkRateLimit(feature: AIFeature): Promise<{ allowed: boolean; remaining: number; isPro: boolean }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { allowed: false, remaining: 0, isPro: false };

        // Get user profile to determine plan status
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_pro, subscription_status")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
            console.error("Error fetching user profile for rate limit:", profileError);
        }

        const isPro = profile?.is_pro === true ||
                      profile?.subscription_status === "active" ||
                      profile?.subscription_status === "trialing";

        const limit = isPro ? PRO_LIMITS[feature] : FREE_LIMITS[feature];
        const dateBucket = new Date().toISOString().split('T')[0];

        // Get current usage
        const { data: usage, error } = await supabase
            .from("user_usage")
            .select("usage_count")
            .eq("user_id", user.id)
            .eq("feature_name", feature)
            .eq("date_bucket", dateBucket)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error("Rate limit check error:", error);
            return { allowed: true, remaining: 1, isPro }; // Fail open for UX safety
        }

        const currentCount = usage?.usage_count || 0;

        if (currentCount >= limit) {
            return { allowed: false, remaining: 0, isPro };
        }

        // Increment usage
        if (!usage) {
            await supabase.from("user_usage").insert({
                user_id: user.id,
                feature_name: feature,
                usage_count: 1,
                date_bucket: dateBucket
            });
        } else {
            await supabase.from("user_usage")
                .update({ usage_count: currentCount + 1, last_usage: new Date().toISOString() })
                .eq("user_id", user.id)
                .eq("feature_name", feature)
                .eq("date_bucket", dateBucket);
        }

        return { allowed: true, remaining: limit - (currentCount + 1), isPro };
    } catch (error) {
        console.error("Critical error in rate limit check:", error);
        return { allowed: true, remaining: 1, isPro: false };
    }
}
