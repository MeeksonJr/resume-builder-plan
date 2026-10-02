import { NextRequest, NextResponse } from "next/server";
import { refreshUniversityRoutine } from "@/lib/rapidapi/google-search-master";

export const maxDuration = 60; // Allow sufficient execution window for background routine

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || undefined;

    const result = await refreshUniversityRoutine(slug);

    return NextResponse.json({
      status: "success",
      date: new Date().toISOString().slice(0, 10),
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    console.error("[CAMPUS_ROUTINE_CRON_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute daily campus refresh routine" },
      { status: 500 }
    );
  }
}
