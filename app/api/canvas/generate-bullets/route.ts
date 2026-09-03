import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateProjectFromCourse } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { courseName, courseCode, grade, assignments } = body;

    if (!courseName) {
      return NextResponse.json({ error: "Course name is required." }, { status: 400 });
    }

    const projectData = await generateProjectFromCourse(
      courseName,
      courseCode || "",
      grade || null,
      assignments || []
    );

    return NextResponse.json(projectData);
  } catch (error: any) {
    console.error("[API: Canvas Generate Bullets]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate project bullets." },
      { status: 500 }
    );
  }
}
