import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'assignment', 'announcement', 'discussion'
    const courseId = searchParams.get("courseId");
    const itemId = searchParams.get("itemId");

    if (!courseId) {
      return NextResponse.json({ error: "courseId parameter is required" }, { status: 400 });
    }

    // Fetch credentials from profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("canvas_instance_url, canvas_access_token")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !profile.canvas_instance_url || !profile.canvas_access_token) {
      return NextResponse.json({ error: "Canvas integration settings not found." }, { status: 404 });
    }

    const baseUrl = profile.canvas_instance_url.replace(/\/$/, "");
    const token = profile.canvas_access_token;

    let fetchUrl = "";

    if (type === "assignment") {
      if (itemId) {
        fetchUrl = `${baseUrl}/api/v1/courses/${courseId}/assignments/${itemId}`;
      } else {
        fetchUrl = `${baseUrl}/api/v1/courses/${courseId}/assignments?per_page=50`;
      }
    } else if (type === "announcement") {
      if (itemId) {
        // Individual announcement is a discussion topic
        fetchUrl = `${baseUrl}/api/v1/courses/${courseId}/discussion_topics/${itemId}`;
      } else {
        // List announcements
        fetchUrl = `${baseUrl}/api/v1/announcements?context_codes[]=course_${courseId}&per_page=30`;
      }
    } else if (type === "discussion") {
      if (itemId) {
        fetchUrl = `${baseUrl}/api/v1/courses/${courseId}/discussion_topics/${itemId}`;
      } else {
        fetchUrl = `${baseUrl}/api/v1/courses/${courseId}/discussion_topics?per_page=50`;
      }
    } else {
      return NextResponse.json({ error: "Invalid type. Must be assignment, announcement, or discussion." }, { status: 400 });
    }

    console.log(`[Canvas Proxy] Fetching: ${fetchUrl}`);
    const response = await fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Canvas Proxy] Fetch failed: ${response.status}`, errText);
      return NextResponse.json({ error: `Canvas API returned status ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Canvas Proxy Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch details from Canvas" }, { status: 500 });
  }
}
