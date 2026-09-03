import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      resumeId,
      conversionType, // 'project' | 'coursework'
      courseName,
      courseCode,
      grade,
      projectName,
      description,
      technologies,
      highlights,
    } = body;

    if (!resumeId || !conversionType || !courseName) {
      return NextResponse.json(
        { error: "Missing required fields: resumeId, conversionType, and courseName are required." },
        { status: 400 }
      );
    }

    // 1. Verify user owns the target resume
    const { data: resume, error: rError } = await supabase
      .from("resumes")
      .select("id, title")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (rError || !resume) {
      return NextResponse.json({ error: "Target resume not found or access denied." }, { status: 404 });
    }

    // 2. Handle Project Conversion Mode
    if (conversionType === "project") {
      const formattedBullets = Array.isArray(highlights) && highlights.length > 0
        ? highlights.map((h: string) => `• ${h.replace(/^[•\-\*]\s*/, "")}`).join("\n")
        : "";

      const finalDescription = description
        ? `${description.trim()}${formattedBullets ? `\n\n${formattedBullets}` : ""}`
        : formattedBullets || `Technical project demonstrating core competencies in ${courseName}.`;

      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("resume_id", resumeId);

      const { data: newProject, error: pError } = await supabase
        .from("projects")
        .insert({
          resume_id: resumeId,
          name: projectName || `${courseName} (${courseCode || "Capstone Project"})`,
          description: finalDescription,
          technologies: Array.isArray(technologies) ? technologies : [],
          sort_order: count ?? 0,
        })
        .select()
        .single();

      if (pError) {
        console.error("[Convert to Project Error]", pError);
        throw new Error("Failed to insert project into resume.");
      }

      // Touch resume updated_at
      await supabase.from("resumes").update({ updated_at: new Date().toISOString() }).eq("id", resumeId);

      return NextResponse.json({
        success: true,
        resumeId,
        resumeTitle: resume.title,
        conversionType: "project",
        item: newProject,
        message: `Successfully added "${projectName || courseName}" to ${resume.title}!`,
      });
    }

    // 3. Handle Coursework Highlight Mode
    if (conversionType === "coursework") {
      const highlightText = `${courseName} (${courseCode || "Course"})${grade ? ` — Grade: ${grade}` : ""}`;

      const { data: eduList } = await supabase
        .from("education")
        .select("*")
        .eq("resume_id", resumeId)
        .order("sort_order", { ascending: true });

      if (eduList && eduList.length > 0) {
        const primaryEdu = eduList[0];
        const currentAchievements = Array.isArray(primaryEdu.achievements) ? [...primaryEdu.achievements] : [];

        // Avoid exact duplicate
        if (!currentAchievements.some(a => a.toLowerCase().includes(courseName.toLowerCase()))) {
          currentAchievements.push(highlightText);
          await supabase
            .from("education")
            .update({ achievements: currentAchievements })
            .eq("id", primaryEdu.id);
        }
      } else {
        // Insert baseline education entry with coursework
        await supabase.from("education").insert({
          resume_id: resumeId,
          institution: "University Academic Program",
          degree: "Academic Studies",
          field_of_study: courseName,
          achievements: [highlightText],
          sort_order: 0,
        });
      }

      // Touch resume updated_at
      await supabase.from("resumes").update({ updated_at: new Date().toISOString() }).eq("id", resumeId);

      return NextResponse.json({
        success: true,
        resumeId,
        resumeTitle: resume.title,
        conversionType: "coursework",
        highlight: highlightText,
        message: `Added academic highlight to ${resume.title}!`,
      });
    }

    return NextResponse.json({ error: "Invalid conversion type." }, { status: 400 });
  } catch (error: any) {
    console.error("[API: Canvas Convert to Resume]", error);
    return NextResponse.json(
      { error: error.message || "Failed to convert coursework to resume." },
      { status: 500 }
    );
  }
}
