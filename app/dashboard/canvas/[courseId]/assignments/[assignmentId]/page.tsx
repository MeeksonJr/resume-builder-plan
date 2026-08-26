import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, HelpCircle, FileText, CheckCircle2, ChevronRight } from "lucide-react";

interface AssignmentDetailPageProps {
  params: Promise<{
    courseId: string;
    assignmentId: string;
  }>;
}

export default async function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const { courseId, assignmentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get credentials
  const { data: profile } = await supabase
    .from("profiles")
    .select("canvas_instance_url, canvas_access_token")
    .eq("id", user.id)
    .single();

  if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
    redirect(`/dashboard/canvas/${courseId}`);
  }

  const baseUrl = profile.canvas_instance_url.replace(/\/$/, "");
  const token = profile.canvas_access_token;

  let assignmentData: any = null;
  let fetchError = false;

  try {
    const res = await fetch(`${baseUrl}/api/v1/courses/${courseId}/assignments/${assignmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (res.ok) {
      assignmentData = await res.json();
    } else {
      fetchError = true;
    }
  } catch (e) {
    console.error(e);
    fetchError = true;
  }

  if (fetchError || !assignmentData) {
    return (
      <div className="p-8 text-center bg-[#e9eee8] min-h-[50vh] text-[#102b2b]">
        <HelpCircle className="mx-auto h-12 w-12 text-[#102b2b]/40 mb-4" />
        <h2 className="text-xl font-bold">Assignment Details Not Found</h2>
        <p className="text-sm mt-2 text-[#52716a]">Could not retrieve details from the Canvas API. Verify your credentials or try again.</p>
        <Button asChild className="mt-4 rounded-none bg-[#102b2b] text-[#d8f36b]">
          <Link href={`/dashboard/canvas/${courseId}`}>Back to Course</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 bg-[#e9eee8] text-[#102b2b]">
      {/* Navigation */}
      <div>
        <Button variant="ghost" asChild className="rounded-none px-3 text-[#102b2b]/60 hover:bg-[#102b2b]/5">
          <Link href={`/dashboard/canvas/${courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Course</span>
          </Link>
        </Button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Detail Content (Col Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#102b2b]/10 bg-[#f7faf5] py-5">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="outline" className="rounded-none border-[#102b2b]/15 text-[#52716a] text-[9px] uppercase font-bold tracking-wider">
                  Assignment ID: {assignmentData.id}
                </Badge>
                {assignmentData.points_possible !== undefined && (
                  <Badge className="rounded-none bg-[#0d8274] text-white text-[10px] font-bold">
                    {assignmentData.points_possible} Points Possible
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl sm:text-2xl font-black mt-3 text-[#102b2b] leading-tight">
                {assignmentData.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Description HTML */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d8274]">Assignment Description</h3>
                {assignmentData.description ? (
                  <div 
                    className="prose prose-sm max-w-full text-xs text-[#102b2b] leading-relaxed border border-[#102b2b]/10 p-4 bg-[#f8faf5] overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: assignmentData.description }}
                  />
                ) : (
                  <p className="text-xs text-[#52716a] italic">No description provided for this assignment.</p>
                )}
              </div>

              {/* Submission Information */}
              <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-[#102b2b]/5 text-xs">
                <div>
                  <h4 className="font-bold text-[#102b2b]">Submission Method</h4>
                  <p className="text-muted-foreground mt-1 capitalize">
                    {assignmentData.submission_types?.join(", ")?.replace(/_/g, " ") || "No submission method specified"}
                  </p>
                </div>
                {assignmentData.allowed_extensions && (
                  <div>
                    <h4 className="font-bold text-[#102b2b]">Allowed File Extensions</h4>
                    <p className="text-muted-foreground mt-1 font-mono">
                      {assignmentData.allowed_extensions.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Canvas Raw API JSON Explorer */}
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#102b2b]/10 bg-[#f7faf5] py-4">
              <CardTitle className="text-xs font-black uppercase tracking-tight text-[#52716a]">
                Canvas API JSON Payload Explorer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-[10px] text-[#52716a] leading-relaxed mb-3">
                Below is the raw response payload returned from the university Canvas LMS API for this assignment resource.
              </p>
              <pre className="p-3 bg-[#102b2b] text-[#d8f36b] rounded-none overflow-x-auto text-[10px] font-mono leading-relaxed max-h-[300px]">
                {JSON.stringify(assignmentData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#102b2b]/10 bg-[#f7faf5] py-4">
              <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-[#0d8274]" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#52716a] tracking-wider">Due Date</span>
                <p className="font-extrabold text-[#102b2b]">
                  {assignmentData.due_at 
                    ? new Date(assignmentData.due_at).toLocaleString() 
                    : "No due date set"}
                </p>
              </div>

              {assignmentData.unlock_at && (
                <div className="space-y-1 border-t border-[#102b2b]/5 pt-3">
                  <span className="text-[10px] uppercase font-bold text-[#52716a] tracking-wider">Unlock Date</span>
                  <p className="font-medium text-[#102b2b]">
                    {new Date(assignmentData.unlock_at).toLocaleString()}
                  </p>
                </div>
              )}

              {assignmentData.lock_at && (
                <div className="space-y-1 border-t border-[#102b2b]/5 pt-3">
                  <span className="text-[10px] uppercase font-bold text-[#52716a] tracking-wider">Lock Date</span>
                  <p className="font-medium text-[#102b2b]">
                    {new Date(assignmentData.lock_at).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
