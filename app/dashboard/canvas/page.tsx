import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Calendar, Clock, BookOpen, AlertCircle, ArrowLeft, RefreshCw, CheckCircle2, ChevronRight, Settings } from "lucide-react";
import { CanvasSyncButton } from "./sync-button";

export default async function CanvasWorkspacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch Canvas configurations and details
  const { data: profile } = await supabase
    .from("profiles")
    .select("canvas_instance_url, canvas_sync_settings")
    .eq("id", user.id)
    .single();

  const { data: coursesRaw } = await supabase
    .from("canvas_courses")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const { data: assignmentsRaw } = await supabase
    .from("canvas_assignments")
    .select("*")
    .eq("user_id", user.id)
    .order("due_at", { ascending: true });

  const courses = coursesRaw || [];
  const assignments = assignmentsRaw || [];

  const { data: grades } = await supabase
    .from("canvas_grades")
    .select("*")
    .eq("user_id", user.id);

  const gradesMap = new Map(grades?.map(g => [g.canvas_course_id, g]) || []);
  const hasConfig = !!profile?.canvas_instance_url;

  // Filter assignments
  const today = new Date();
  const upcomingAssignments = (assignments || []).filter(a => a.due_at && new Date(a.due_at) > today);
  const pastAssignments = (assignments || []).filter(a => !a.due_at || new Date(a.due_at) <= today);

  // Compute stats
  const averageGradeScore = grades && grades.length > 0
    ? (grades.reduce((sum, g) => sum + (g.current_score || 0), 0) / grades.length)
    : 0;

  return (
    <div className="space-y-8 pb-16 bg-[#e9eee8] text-[#102b2b]">
      {/* Header Back Button */}
      <div>
        <Button variant="ghost" asChild className="rounded-none px-3 text-[#102b2b]/60 hover:bg-[#102b2b]/5">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
          </Link>
        </Button>
      </div>

      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-md bg-[#102b2b] border border-[#102b2b] shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl text-[#e9eee8]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#d8f36b] text-[#102b2b] text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Canvas LMS Integration Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Academic Coursework & GPA
            </h1>
            <p className="text-sm text-[#e9eee8]/75 leading-relaxed">
              Track synced classes, grades, and upcoming assignment checklist deadlines. Canvas context feeds directly into AI modules to match scholarships and customize interview preps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            {hasConfig && <CanvasSyncButton />}
            <Button asChild variant="outline" className="h-12 rounded-none border-[#e9eee8]/20 bg-transparent text-[#e9eee8] hover:bg-white/10">
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                LMS Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {hasConfig && courses && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <span className="text-[10px] uppercase font-bold text-[#52716a] tracking-wider">Active Enrollments</span>
              <span className="text-3xl font-black text-[#102b2b] font-mono mt-2">{courses.length} Classes</span>
              <span className="text-[10px] text-[#0d8274] font-semibold mt-1">Synced courses</span>
            </CardContent>
          </Card>
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <span className="text-[10px] uppercase font-bold text-[#52716a] tracking-wider">Upcoming Tasks</span>
              <span className="text-3xl font-black text-[#102b2b] font-mono mt-2">{upcomingAssignments.length} Items</span>
              <span className="text-[10px] text-[#0d8274] font-semibold mt-1">Assignments due</span>
            </CardContent>
          </Card>
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <span className="text-[10px] uppercase font-bold text-[#52716a] tracking-wider">Average Course GPA</span>
              <span className="text-3xl font-black text-[#0d8274] font-mono mt-2">
                {averageGradeScore > 0 ? `${averageGradeScore.toFixed(1)}%` : "N/A"}
              </span>
              <span className="text-[10px] text-[#52716a] font-semibold mt-1">Average computed score</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      {!hasConfig ? (
        <Card className="rounded-none border-[#102b2b]/15 bg-[#f8f4ec] p-8 text-center max-w-2xl mx-auto shadow-sm">
          <CardHeader className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center bg-[#d8f36b] text-[#102b2b] rounded-full mb-4">
              <GraduationCap className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-black uppercase tracking-tight">Canvas LMS Disconnected</CardTitle>
            <CardDescription className="text-sm max-w-md mt-2">
              Add your university Canvas domain URL and access token in Settings to fetch coursework, grades, and deadlines.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex justify-center">
            <Button asChild className="h-12 rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] px-8 font-bold text-base">
              <Link href="/dashboard/settings">Connect Canvas Account</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Courses List Section (Col span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
              <CardHeader className="border-b border-[#102b2b]/10 bg-[#f7faf5] py-4">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#0d8274]" />
                  Active Course Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {courses.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#102b2b]/15">
                    <p className="text-sm text-[#52716a] italic">No courses synced. Trigger a sync using the button above.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {courses.map((course) => {
                      const gradeInfo = gradesMap.get(course.canvas_course_id);
                      return (
                        <Link 
                          key={course.id} 
                          href={`/dashboard/canvas/${course.canvas_course_id}`}
                          className="p-4 border border-[#102b2b]/10 hover:border-[#0d8274] bg-[#f8faf5] hover:bg-white transition-all flex flex-col justify-between gap-4 group"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <Badge variant="outline" className="rounded-none border-[#102b2b]/15 text-[#52716a] text-[9px] uppercase tracking-wider font-bold">
                                {course.course_code || "Class"}
                              </Badge>
                              {gradeInfo && (
                                <Badge className="rounded-none bg-[#0d8274] text-white font-mono text-xs px-2 py-0.5">
                                  Grade: {gradeInfo.current_grade || "N/A"}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-extrabold text-base text-[#102b2b] mt-3 group-hover:text-[#0d8274] transition-colors leading-tight line-clamp-2">
                              {course.name}
                            </h3>
                          </div>

                          <div className="flex items-center justify-between border-t border-[#102b2b]/5 pt-3 mt-2 text-xs">
                            <span className="text-[#52716a] font-medium">
                              {assignments.filter(a => a.canvas_course_id === course.canvas_course_id).length} assignments
                            </span>
                            <span className="text-[#0d8274] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              View Syllabus <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Timeline Widget */}
          <div className="space-y-6">
            <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
              <CardHeader className="border-b border-[#102b2b]/10 bg-[#f7faf5] py-4">
                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-[#0d8274]" />
                  Assignments Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {upcomingAssignments.length === 0 ? (
                  <p className="text-xs text-[#52716a] italic p-4 text-center">No upcoming assignments due.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAssignments.slice(0, 8).map((assign) => (
                      <div key={assign.id} className="p-3 bg-[#f8faf5] border border-[#102b2b]/10 flex flex-col justify-between gap-2 text-xs">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[10px] font-black text-[#52716a] uppercase">
                              {courses.find(c => c.canvas_course_id === assign.canvas_course_id)?.course_code || "ASSIGNMENT"}
                            </span>
                            {assign.points_possible && (
                              <span className="text-[10px] font-bold font-mono text-[#0d8274]">{assign.points_possible} pts</span>
                            )}
                          </div>
                          <p className="font-extrabold text-[#102b2b] mt-1 leading-snug truncate" title={assign.name}>
                            {assign.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-red-600 font-bold border-t border-[#102b2b]/5 pt-2">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>Closes: {new Date(assign.due_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
