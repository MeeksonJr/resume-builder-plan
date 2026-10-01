import { NextRequest, NextResponse } from "next/server";
import { getUniversityInsights } from "@/lib/rapidapi/google-search-master";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing school slug" }, { status: 400 });
    }

    const insights = await getUniversityInsights(slug);
    return NextResponse.json(insights);
  } catch (error: any) {
    console.error("[UNIVERSITY_INSIGHTS_API_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch university insights" },
      { status: 500 }
    );
  }
}
