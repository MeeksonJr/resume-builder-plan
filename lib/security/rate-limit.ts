import { createClient } from "@/lib/supabase/server";

export type AIFeature =
    | "ai_improve"
    | "ai_tailor"
    | "ai_summary"
    | "ai_ats"
    | "ai_interview"
    | "ai_parse"
    | "ai_keywords"
    | "ai_generate";

const LIMITS: Record<AIFeature, number> = {
    ai_improve: 50,
    ai_tailor: 20,
    ai_summary: 30,
    ai_ats: 20,
    ai_interview: 15,
    ai_parse: 10,
    ai_keywords: 30,
    ai_generate: 10
};

export async function checkRateLimit(feature: AIFeature): Promise<{ allowed: boolean; remaining: number }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { allowed: false, remaining: 0 };

        const dateBucket = new Date().toISOString().split('T')[0];
        const limit = LIMITS[feature];

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
            return { allowed: true, remaining: 1 }; // Fail open for UX safety
        }

        const currentCount = usage?.usage_count || 0;

        if (currentCount >= limit) {
            return { allowed: false, remaining: 0 };
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

        return { allowed: true, remaining: limit - (currentCount + 1) };
    } catch (error) {
        console.error("Critical error in rate limit check:", error);
        return { allowed: true, remaining: 1 };
    }
}
