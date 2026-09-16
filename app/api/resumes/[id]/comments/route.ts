import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const supabase = await createClient();

    const { data: comments, error } = await supabase
      .from("resume_comments")
      .select("*")
      .eq("resume_id", resumeId)
      .order("created_at", { ascending: false });

    if (error) {
      // If table doesn't exist yet in Supabase local environment, return empty list gracefully
      console.warn("[COMMENTS_GET_WARNING]", error.message);
      return NextResponse.json({ comments: [] });
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error: any) {
    console.error("[COMMENTS_GET_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const {
      authorName,
      authorEmail,
      authorRole = "mentor",
      sectionTarget = "general",
      content,
      suggestedText,
    } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    const { data: comment, error } = await supabase
      .from("resume_comments")
      .insert({
        resume_id: resumeId,
        user_id: user?.id || null,
        author_name: authorName || (user?.email ? user.email.split("@")[0] : "Mentor Reviewer"),
        author_email: authorEmail || user?.email || null,
        author_role: authorRole,
        section_target: sectionTarget,
        content: content.trim(),
        suggested_text: suggestedText ? suggestedText.trim() : null,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      console.error("[COMMENTS_INSERT_ERROR]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comment, message: "Comment successfully submitted!" });
  } catch (error: any) {
    console.error("[COMMENTS_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id: resumeId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { commentId, status } = body;

    if (!commentId || !["open", "resolved", "applied"].includes(status)) {
      return NextResponse.json({ error: "Valid commentId and status are required" }, { status: 400 });
    }

    const { data: comment, error } = await supabase
      .from("resume_comments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", commentId)
      .eq("resume_id", resumeId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comment, message: `Comment marked as ${status}` });
  } catch (error: any) {
    console.error("[COMMENTS_PATCH_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
