import { NextRequest, NextResponse } from "next/server";
import {
  getAllRegisteredCampuses,
  getUniversityInsights,
} from "@/lib/rapidapi/google-search-master";

export async function GET() {
  try {
    const campuses = await getAllRegisteredCampuses();
    return NextResponse.json({ campuses });
  } catch (error: any) {
    console.error("[CAMPUS_LIST_API_GET_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to load registered campuses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, domain } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "University name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Deep search and cache university data (professors, departments, clubs, links)
    const insights = await getUniversityInsights(trimmedName);

    const calculatedDomain =
      domain ||
      (insights.website
        ? new URL(
            insights.website.startsWith("http")
              ? insights.website
              : `https://${insights.website}`
          ).hostname.replace(/^www\./, "")
        : `${slug.replace(/-/g, "")}.edu`);

    return NextResponse.json({
      campus: {
        name: insights.school_name || trimmedName,
        slug,
        domain: calculatedDomain,
        location: insights.location || "United States",
        studentCount: 0,
        hasPortal: true,
      },
      insights,
    });
  } catch (error: any) {
    console.error("[CAMPUS_LIST_API_POST_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to register and search university" },
      { status: 500 }
    );
  }
}
