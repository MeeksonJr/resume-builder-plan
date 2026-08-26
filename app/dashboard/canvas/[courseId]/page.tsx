import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseWorkspaceView } from "./course-workspace-view";
import { AIStudyPlanWidget } from "./ai-study-plan";

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch course details
  const { data: course, error: courseError } = await supabase
    .from("canvas_courses")
    .select("*")
    .eq("user_id", user.id)
    .eq("canvas_course_id", courseId)
    .single();

  if (courseError || !course) {
    redirect("/dashboard/canvas");
  }

  // Fetch credentials
  const { data: profile } = await supabase
    .from("profiles")
    .select("canvas_instance_url, canvas_access_token")
    .eq("id", user.id)
    .single();

  const baseUrl = profile?.canvas_instance_url?.replace(/\/$/, "");
  const token = profile?.canvas_access_token;

  let announcements: any[] = [];
  let discussions: any[] = [];

  // Fetch live Announcements & Discussions if settings exist
  if (baseUrl && token) {
    try {
      // Announcements
      const annRes = await fetch(`${baseUrl}/api/v1/announcements?context_codes[]=course_${courseId}&per_page=15`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 }
      });
      if (annRes.ok) {
        announcements = await annRes.json();
      }

      // Discussions
      const discRes = await fetch(`${baseUrl}/api/v1/courses/${courseId}/discussion_topics?per_page=15`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 }
      });
      if (discRes.ok) {
        const discData = await discRes.json();
        // Canvas returns announcements in discussion topics too, so filter out is_announcement: true to keep discussions separate
        discussions = Array.isArray(discData) ? discData.filter((d: any) => !d.is_announcement) : [];
      }
    } catch (e) {
      console.error("[Canvas Live Load Error]:", e);
    }
  }

  // Fetch grade info
  const { data: grade } = await supabase
    .from("canvas_grades")
    .select("*")
    .eq("user_id", user.id)
    .eq("canvas_course_id", courseId)
    .maybeSingle();

  // Fetch assignments from Supabase
  const { data: assignmentsRaw } = await supabase
    .from("canvas_assignments")
    .select("*")
    .eq("user_id", user.id)
    .eq("canvas_course_id", courseId)
    .order("due_at", { ascending: true });

  const assignments = assignmentsRaw || [];

  // Filter assignments
  const today = new Date();
  const upcomingAssignments = assignments.filter(a => a.due_at && new Date(a.due_at) > today);
  const pastAssignments = assignments.filter(a => !a.due_at || new Date(a.due_at) <= today);

  return (
    <div className="space-y-8 pb-16 bg-[#e9eee8] text-[#102b2b]">
      {/* Back to courses directory link */}
      <div>
        <Button variant="ghost" asChild className="rounded-none px-3 text-[#102b2b]/60 hover:bg-[#102b2b]/5">
          <Link href="/dashboard/canvas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Canvas Workspace</span>
          </Link>
        </Button>
      </div>

      {/* Class Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-[#102b2b]/15 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-none border-[#102b2b]/15 bg-[#f8faf5] text-[#52716a] text-[10px] uppercase font-bold tracking-wider">
              {course.course_code || "COURSE"}
            </Badge>
            {grade && (
              <Badge className="rounded-none bg-[#0d8274] text-white hover:bg-[#0d8274] text-[10px] font-bold">
                Current Grade: {grade.current_grade || "N/A"} ({grade.current_score?.toFixed(1) || "0"}%)
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[#102b2b] mt-3">
            {course.name}
          </h1>
          <p className="text-xs text-[#52716a] mt-1.5">
            LMS ID: {course.canvas_course_id} • Last synced: {new Date(course.synced_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Main Grid: Assignments and AI study plan */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Dynamic course tabs workspace */}
        <div className="lg:col-span-2 space-y-6">
          <CourseWorkspaceView
            courseId={courseId}
            upcomingAssignments={upcomingAssignments}
            pastAssignments={pastAssignments}
            announcements={announcements || []}
            discussions={discussions || []}
          />
        </div>

        {/* AI Study Planner Sidebar Widget */}
        <div className="space-y-6">
          <AIStudyPlanWidget
            courseName={course.name}
            courseCode={course.course_code || "Class"}
            assignments={upcomingAssignments}
          />
        </div>
      </div>
    </div>
  );
}
