import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, User, Calendar, HelpCircle, CornerDownRight } from "lucide-react";

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
  let discussionThread: any = null;
  let fetchError = false;

  try {
    // 1. Fetch main topic details
    const res = await fetch(`${baseUrl}/api/v1/courses/${courseId}/discussion_topics/${discussionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      next: { revalidate: 60 }
    });

    if (res.ok) {
      discussionData = await res.json();

      // 2. Fetch full thread view (participants and replies)
      const threadRes = await fetch(`${baseUrl}/api/v1/courses/${courseId}/discussion_topics/${discussionId}/view`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        next: { revalidate: 60 }
      });
      if (threadRes.ok) {
        discussionThread = await threadRes.json();
      }
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

  // Create participant lookup map
  const participantsMap = new Map(
    (discussionThread?.participants || []).map((p: any) => [p.id, p])
  );

  const replies = discussionThread?.view || [];

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
        {/* Thread and Topic Detail (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Topic Detail */}
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#102b2b]/10 bg-[#f7faf5] py-5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-none border-[#102b2b]/15 text-[#52716a] text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#0d8274]" /> Discussion Board
                </Badge>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-black mt-3 text-[#102b2b] leading-tight">
                {discussionData.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Message Prompt Body */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d8274]">Topic Prompt</h3>
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

          {/* Discussion Thread Replies */}
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#102b2b]/10 bg-[#f7faf5] py-4">
              <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0d8274]" />
                Forum replies ({replies.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {replies.length === 0 ? (
                <p className="text-xs text-[#52716a] p-4 text-center italic border border-dashed border-[#102b2b]/10 bg-[#f8faf5]">
                  No replies posted in this thread yet.
                </p>
              ) : (
                <div className="space-y-5">
                  {replies.map((reply: any) => {
                    const author = participantsMap.get(reply.user_id) as any;
                    return (
                      <div key={reply.id} className="p-4 bg-[#f8faf5] border border-[#102b2b]/10 rounded-none space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full border border-[#102b2b]/15 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                            {author?.avatar_image_url ? (
                              <img src={author.avatar_image_url} alt="replier" className="h-8 w-8 object-cover" />
                            ) : (
                              <User className="h-4 w-4 text-[#52716a]" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#102b2b]">{author?.display_name || "Student"}</p>
                            <p className="text-[9px] text-[#52716a] mt-0.5">{new Date(reply.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div 
                          className="prose prose-sm text-xs text-[#102b2b] pl-11 leading-relaxed overflow-x-auto whitespace-pre-line"
                          dangerouslySetInnerHTML={{ __html: reply.message }}
                        />

                        {/* Nested Replies / Sub-comments */}
                        {reply.replies && reply.replies.length > 0 && (
                          <div className="pl-11 pt-3 border-t border-[#102b2b]/5 mt-3 space-y-3">
                            {reply.replies.map((sub: any) => {
                              const subAuthor = participantsMap.get(sub.user_id) as any;
                              return (
                                <div key={sub.id} className="p-3 bg-white border border-[#102b2b]/5 flex gap-3 text-[11px]">
                                  <CornerDownRight className="w-4 h-4 text-[#0d8274] shrink-0 mt-0.5" />
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-1.5 font-bold text-[#102b2b]">
                                      <span>{subAuthor?.display_name || "Student"}</span>
                                      <span className="text-[9px] text-[#52716a] font-normal">• {new Date(sub.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div 
                                      className="prose prose-sm text-xs text-[#102b2b]/80 leading-relaxed overflow-x-auto whitespace-pre-line"
                                      dangerouslySetInnerHTML={{ __html: sub.message }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#102b2b]/10 bg-[#f7faf5] py-4">
              <CardTitle className="text-sm font-black uppercase tracking-tight">
                Thread Author & Info
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
                  <p className="font-bold text-[#102b2b]">{discussionData.author?.display_name || "Topic Creator"}</p>
                  <p className="text-[10px] text-[#52716a] mt-0.5">Author</p>
                </div>
              </div>

              <div className="space-y-1 border-t border-[#102b2b]/5 pt-3">
                <span className="text-[10px] uppercase font-bold text-[#52716a] tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Posted Date
                </span>
                <p className="font-extrabold text-[#102b2b]">
                  {new Date(discussionData.created_at).toLocaleString()}
                </p>
              </div>

              {discussionData.discussion_subentry_count !== undefined && (
                <div className="space-y-1 border-t border-[#102b2b]/5 pt-3">
                  <span className="text-[10px] uppercase font-bold text-[#52716a] tracking-wider">Total Responses</span>
                  <p className="font-extrabold text-[#0d8274] font-mono text-sm">
                    {discussionData.discussion_subentry_count} Replies
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
