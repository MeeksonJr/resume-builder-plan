import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, User, Calendar, HelpCircle } from "lucide-react";

interface DiscussionDetailPageProps {
  params: Promise<{
    courseId: string;
    discussionId: string;
  }>;
}

export default async function DiscussionDetailPage({ params }: DiscussionDetailPageProps) {
  const { courseId, discussionId } = await params;
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

  let discussionData: any = null;
  let fetchError = false;

  try {
    const res = await fetch(`${baseUrl}/api/v1/courses/${courseId}/discussion_topics/${discussionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      next: { revalidate: 60 }
    });

    if (res.ok) {
      discussionData = await res.json();
    } else {
      fetchError = true;
    }
  } catch (e) {
    console.error(e);
    fetchError = true;
  }

  if (fetchError || !discussionData) {
    return (
      <div className="p-8 text-center bg-[#e9eee8] min-h-[50vh] text-[#102b2b]">
        <HelpCircle className="mx-auto h-12 w-12 text-[#102b2b]/40 mb-4" />
        <h2 className="text-xl font-bold">Discussion Topic Not Found</h2>
        <p className="text-sm mt-2 text-[#52716a]">Could not retrieve discussion topic details from the Canvas API.</p>
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

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Content (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#102b2b]/10 bg-[#f7faf5] py-5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-none border-[#102b2b]/15 text-[#52716a] text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#0d8274]" /> Discussion
                </Badge>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-black mt-3 text-[#102b2b] leading-tight">
                {discussionData.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Message Body */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d8274]">Topic & Prompt Description</h3>
                {discussionData.message ? (
                  <div 
                    className="prose prose-sm max-w-full text-xs text-[#102b2b] leading-relaxed border border-[#102b2b]/10 p-4 bg-[#f8faf5] overflow-x-auto whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: discussionData.message }}
                  />
                ) : (
                  <p className="text-xs text-[#52716a] italic">No description prompt provided for this topic.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Raw JSON Explorer */}
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#102b2b]/10 bg-[#f7faf5] py-4">
              <CardTitle className="text-xs font-black uppercase tracking-tight text-[#52716a]">
                Canvas API JSON Payload Explorer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <pre className="p-3 bg-[#102b2b] text-[#d8f36b] rounded-none overflow-x-auto text-[10px] font-mono leading-relaxed max-h-[300px]">
                {JSON.stringify(discussionData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#102b2b]/10 bg-[#f7faf5] py-4">
              <CardTitle className="text-sm font-black uppercase tracking-tight">
                Author & Date
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#102b2b]/5 rounded-full flex items-center justify-center border border-[#102b2b]/10">
                  {discussionData.author?.avatar_image_url ? (
                    <img src={discussionData.author.avatar_image_url} alt="author" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-[#52716a]" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-[#102b2b]">{discussionData.author?.display_name || "Unknown User"}</p>
                  <p className="text-[10px] text-[#52716a] mt-0.5">Topic Creator</p>
                </div>
              </div>

              <div className="space-y-1 border-t border-[#102b2b]/5 pt-3">
                <span className="text-[10px] uppercase font-bold text-[#52716a] tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Created Date
                </span>
                <p className="font-extrabold text-[#102b2b]">
                  {new Date(discussionData.created_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
