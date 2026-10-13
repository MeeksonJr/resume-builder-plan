import { NextRequest, NextResponse } from "next/server";
import { getSyndicatedCampusIntel } from "@/lib/university/collegiate-intel-service";
import { resolveUniversityTenant } from "@/lib/tenant/university-portal";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get("refresh") === "true";

    const tenant = resolveUniversityTenant(slug);
    const intel = await getSyndicatedCampusIntel(slug, tenant.name, forceRefresh);

    return NextResponse.json(intel, {
      headers: {
        "Cache-Control": "public, s-maxage=172800, stale-while-revalidate=86400", // 48-hour cache
      },
    });
  } catch (error) {
    console.error("[COLLEGIATE_INTEL_API] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve campus intelligence" },
      { status: 500 }
    );
  }
}
