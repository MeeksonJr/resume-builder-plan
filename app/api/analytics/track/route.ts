import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
    );
}

function detectBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes("firefox")) return "Firefox";
    if (ua.includes("edg")) return "Edge";
    if (ua.includes("chrome")) return "Chrome";
    if (ua.includes("safari")) return "Safari";
    if (ua.includes("opera") || ua.includes("opr")) return "Opera";
    return "Browser";
}

function detectOS(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes("win")) return "Windows";
    if (ua.includes("mac")) return "macOS";
    if (ua.includes("linux")) return "Linux";
    if (ua.includes("android")) return "Android";
    if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "iOS";
    return "OS";
}

export async function POST(req: NextRequest) {
    try {
        const { resumeId, referrer } = await req.json();

        if (!resumeId) {
            return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
        }

        const headersList = await headers();
        const userAgent = headersList.get("user-agent") || "unknown";
        const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";

        // Simple hash for privacy
        const ipHash = ip === "unknown" ? "unknown" : Buffer.from(ip).toString("base64").slice(0, 32);

        // Device detection
        const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
        const deviceType = isMobile ? "mobile" : "desktop";
        const browser = detectBrowser(userAgent);
        const os = detectOS(userAgent);

        // Geolocation headers
        const country = headersList.get("x-vercel-ip-country") || null;
        const city = headersList.get("x-vercel-ip-city") || null;

        const supabaseAdmin = getSupabaseAdmin();

        // 1. Fetch resume to get user_id and current view_count
        const { data: resume } = await supabaseAdmin
            .from("resumes")
            .select("id, user_id, view_count")
            .eq("id", resumeId)
            .maybeSingle();

        // 2. Insert into resume_views
        const { error: viewError } = await supabaseAdmin.from("resume_views").insert({
            resume_id: resumeId,
            viewer_ip_hash: ipHash,
            device_type: deviceType,
            country_code: country,
            city: city,
            referrer: referrer || null,
            viewed_at: new Date().toISOString(),
        });
        if (viewError) console.error("Analytics resume_views error:", viewError);

        // 3. Insert into resume_events if user_id is found
        if (resume?.user_id) {
            const { error: eventError } = await supabaseAdmin.from("resume_events").insert({
                resume_id: resumeId,
                user_id: resume.user_id,
                event_type: "view",
                browser: browser,
                os: os,
                device: isMobile ? "Mobile" : "Desktop",
                city: city,
                country: country,
                created_at: new Date().toISOString(),
            });
            if (eventError) console.error("Analytics resume_events error:", eventError);
        }

        // 4. Increment view_count on resumes table
        if (resume) {
            await supabaseAdmin
                .from("resumes")
                .update({
                    view_count: (resume.view_count || 0) + 1,
                    last_viewed_at: new Date().toISOString(),
                })
                .eq("id", resumeId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
