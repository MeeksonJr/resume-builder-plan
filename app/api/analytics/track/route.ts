import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Initialize Supabase Service Role Client
// We need this to insert into resume_views since we don't have a public INSERT policy
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { resumeId, referrer } = await req.json();

        if (!resumeId) {
            return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
        }

        const headersList = await headers();
        const userAgent = headersList.get("user-agent") || "unknown";
        const ip = headersList.get("x-forwarded-for") || "unknown";

        // Simple hash for privacy (in a real app, use a daily salt)
        const ipHash = ip === "unknown" ? "unknown" : Buffer.from(ip).toString("base64");

        // Basic device detection
        const isMobile = /mobile/i.test(userAgent);
        const deviceType = isMobile ? "mobile" : "desktop";

        // Geolocation (if provided by Vercel/hosting headers)
        const country = headersList.get("x-vercel-ip-country") || null;
        const city = headersList.get("x-vercel-ip-city") || null;

        const { error } = await supabaseAdmin.from("resume_views").insert({
            resume_id: resumeId,
            viewer_ip_hash: ipHash,
            device_type: deviceType,
            country_code: country,
            city: city,
            referrer: referrer || null,
        });

        if (error) {
            console.error("Analytics Insert Error:", error);
            // Don't fail the request, just log it. Analytics shouldn't break the app.
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
