import { NextRequest, NextResponse } from "next/server";
import { searchJobsWithRapidApi } from "@/lib/rapidapi/jsearch";
import { estimateCommute } from "@/lib/geo/commute-calculator";
import { checkVisaSponsorship } from "@/lib/jobs/visa-sponsorship";
import { getCompanySentiment } from "@/lib/rapidapi/company-sentiment";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "Software Engineer";
    const location = searchParams.get("location") || "Virginia, USA";
    const isRemote = searchParams.get("remote") === "true";
    const campusSlug = searchParams.get("campusSlug") || "old-dominion-university";
    const page = parseInt(searchParams.get("page") || "1", 10);

    const result = await searchJobsWithRapidApi({
      query,
      location,
      isRemote,
      page,
      campusSlug,
    });

    // Enrich each job with commute, visa sponsorship, and sentiment
    const enrichedJobs = result.jobs.map((job) => {
      const commute = estimateCommute(campusSlug, job.location);
      const visa = checkVisaSponsorship(job.company);
      const sentiment = getCompanySentiment(job.company);

      return {
        ...job,
        commute,
        visa,
        sentiment: {
          overallRating: sentiment.overallRating,
          recommendRate: sentiment.recommendToFriendRate,
        },
      };
    });

    return NextResponse.json({
      success: true,
      query: result.query,
      totalResults: result.totalResults,
      jobs: enrichedJobs,
    });
  } catch (error: any) {
    console.error("[API:JOBS:SEARCH] Search error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to search jobs" },
      { status: 500 }
    );
  }
}
