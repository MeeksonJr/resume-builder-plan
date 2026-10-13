import { NextRequest, NextResponse } from "next/server";
import { syncAllCampusIntel } from "@/lib/university/collegiate-intel-service";

export const maxDuration = 60; // 60-second execution window for background routine

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || undefined;
    const force = searchParams.get("force") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const secret = searchParams.get("key") || searchParams.get("secret");

    // Optional Vercel Cron & Security Protection
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");
    const userAgent = req.headers.get("user-agent") || "";
    const isVercelCron = userAgent.includes("vercel-cron");

    if (
      cronSecret &&
      process.env.NODE_ENV === "production" &&
      !isVercelCron &&
      authHeader !== `Bearer ${cronSecret}` &&
      secret !== cronSecret
    ) {
      return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
    }

    const report = await syncAllCampusIntel({
      specificSlug: slug,
      forceRefresh: force,
      batchLimit: limit,
    });

    return NextResponse.json(report, {
      status: report.status === "error" ? 500 : 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("[SYNC_CAMPUS_INTEL_CRON_ERROR]", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Failed to execute 48-hour campus intelligence sync",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
