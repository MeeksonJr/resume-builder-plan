import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch credentials from profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("canvas_instance_url, canvas_access_token, canvas_sync_settings")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Could not retrieve Canvas settings." }, { status: 404 });
    }

    const { canvas_instance_url, canvas_access_token, canvas_sync_settings } = profile;

    if (!canvas_instance_url || !canvas_access_token) {
      return NextResponse.json({ error: "Canvas instance URL or Access Token is missing." }, { status: 400 });
    }

    // Normalize instance URL (remove trailing slash)
    const baseUrl = canvas_instance_url.replace(/\/$/, "");
    const syncSettings = (canvas_sync_settings as any) || { sync_courses: true, sync_assignments: true, sync_grades: true };

    console.log(`[Canvas Sync] Connecting to ${baseUrl} for user ${user.id}...`);

    // Fetch courses with enrollment score/grades included
    const coursesRes = await fetch(`${baseUrl}/api/v1/courses?include[]=total_scores&per_page=50`, {
      headers: {
        Authorization: `Bearer ${canvas_access_token}`
      }
    });

    if (!coursesRes.ok) {
      const errText = await coursesRes.text();
      console.error("[Canvas Sync] Canvas courses fetch failed:", errText);
      return NextResponse.json({ error: `Canvas connection failed: ${coursesRes.statusText}` }, { status: coursesRes.status });
    }

    const coursesData = await coursesRes.json();
    if (!Array.isArray(coursesData)) {
      return NextResponse.json({ error: "Invalid response from Canvas API" }, { status: 502 });
    }

    const syncedCourses = [];
    const syncedAssignments = [];
    const syncedGrades = [];

    for (const canvasCourse of coursesData) {
      // Some courses returned might be blank or restricted
      if (!canvasCourse.id || !canvasCourse.name) continue;

      const courseIdStr = String(canvasCourse.id);

      // Save course if enabled
      if (syncSettings.sync_courses) {
        syncedCourses.push({
          user_id: user.id,
          canvas_course_id: courseIdStr,
          name: canvasCourse.name,
          course_code: canvasCourse.course_code || null,
          synced_at: new Date().toISOString()
        });
      }

      // Save grade if enabled
      if (syncSettings.sync_grades && canvasCourse.enrollments) {
        const studentEnrollment = canvasCourse.enrollments.find((e: any) => e.type === "student" || e.role === "StudentEnrollment");
        if (studentEnrollment) {
          syncedGrades.push({
            user_id: user.id,
            canvas_course_id: courseIdStr,
            current_grade: studentEnrollment.computed_current_grade || null,
            current_score: studentEnrollment.computed_current_score || null,
            synced_at: new Date().toISOString()
          });
        }
      }

      // Fetch assignments if enabled
      if (syncSettings.sync_assignments) {
        try {
          const assignmentsRes = await fetch(`${baseUrl}/api/v1/courses/${canvasCourse.id}/assignments?per_page=30`, {
            headers: {
              Authorization: `Bearer ${canvas_access_token}`
            }
          });
          if (assignmentsRes.ok) {
            const assignmentsData = await assignmentsRes.json();
            if (Array.isArray(assignmentsData)) {
              for (const canvasAssignment of assignmentsData) {
                syncedAssignments.push({
                  user_id: user.id,
                  canvas_course_id: courseIdStr,
                  canvas_assignment_id: String(canvasAssignment.id),
                  name: canvasAssignment.name,
                  due_at: canvasAssignment.due_at || null,
                  points_possible: canvasAssignment.points_possible || null,
                  submission_status: canvasAssignment.has_submitted_submissions ? "submitted" : "unsubmitted",
                  synced_at: new Date().toISOString()
                });
              }
            }
          }
        } catch (assignErr) {
          console.error(`[Canvas Sync] Failed to fetch assignments for course ${canvasCourse.id}:`, assignErr);
        }
      }
    }

    // Write to Supabase tables
    if (syncedCourses.length > 0) {
      const { error: err } = await supabase
        .from("canvas_courses")
        .upsert(syncedCourses, { onConflict: "user_id,canvas_course_id" });
      if (err) throw err;
    }

    if (syncedGrades.length > 0) {
      const { error: err } = await supabase
        .from("canvas_grades")
        .upsert(syncedGrades, { onConflict: "user_id,canvas_course_id" });
      if (err) throw err;
    }

    if (syncedAssignments.length > 0) {
      const { error: err } = await supabase
        .from("canvas_assignments")
        .upsert(syncedAssignments, { onConflict: "user_id,canvas_assignment_id" });
      if (err) throw err;
    }

    return NextResponse.json({
      success: true,
      coursesSynced: syncedCourses.length,
      gradesSynced: syncedGrades.length,
      assignmentsSynced: syncedAssignments.length
    });
  } catch (err: any) {
    console.error("[Canvas Sync API] Sync error:", err);
    return NextResponse.json({ error: err.message || "Canvas synchronization failed." }, { status: 500 });
  }
}
