"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Check,
  ChevronRight,
  ThumbsUp,
  X,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";

export interface ResumeComment {
  id: string;
  resume_id: string;
  author_name: string;
  author_email?: string;
  author_role: "mentor" | "recruiter" | "peer" | "career_coach" | string;
  section_target: "summary" | "experience" | "education" | "skills" | "general" | string;
  content: string;
  suggested_text?: string;
  status: "open" | "resolved" | "applied";
  created_at: string;
}

interface MentorFeedbackDrawerProps {
  resumeId: string;
  candidateName: string;
  isOwner?: boolean;
}

export function MentorFeedbackDrawer({
  resumeId,
  candidateName,
  isOwner = false,
}: MentorFeedbackDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<ResumeComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("mentor");
  const [sectionTarget, setSectionTarget] = useState("general");
  const [content, setContent] = useState("");
  const [suggestedText, setSuggestedText] = useState("");

  const fetchComments = async () => {
    if (!resumeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, resumeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please provide feedback comments");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim() || "Mentor Reviewer",
          authorRole,
          sectionTarget,
          content: content.trim(),
          suggestedText: suggestedText.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit comment");
      }

      toast.success("Feedback submitted to candidate!");
      setContent("");
      setSuggestedText("");
      fetchComments();
    } catch (err: any) {
      toast.error(err.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (commentId: string, newStatus: "resolved" | "applied" | "open") => {
    try {
      const res = await fetch(`/api/resumes/${resumeId}/comments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Marked as ${newStatus}`);
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      toast.error("Could not update comment status");
    }
  };

  const openCount = comments.filter((c) => c.status === "open").length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-white dark:bg-slate-900 border-primary/20 hover:border-primary/40 text-xs font-bold gap-2 shadow-lg shadow-black/5 hover:scale-105 transition-all print:hidden"
        >
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          <span>Peer Review</span>
          {openCount > 0 && (
            <Badge className="h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black">
              {openCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md bg-slate-950/95 border-primary/10 backdrop-blur-2xl p-6 flex flex-col text-foreground">
        <SheetHeader className="space-y-1 text-left pb-4 border-b border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="h-4 w-4" />
              </div>
              <SheetTitle className="text-base font-black tracking-tight">
                Peer Review &amp; Mentor Feedback
              </SheetTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary">
              Phase 43
            </Badge>
          </div>
          <SheetDescription className="text-xs text-muted-foreground/80">
            Review {candidateName}&apos;s resume, leave section-targeted critique, and suggest bullet improvements.
          </SheetDescription>
        </SheetHeader>

        {/* Comment Thread List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
              Loading review comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground space-y-2 border border-dashed border-primary/10 rounded-2xl p-6">
              <UserCheck className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="font-bold text-foreground">No Mentor Reviews Yet</p>
              <p className="text-muted-foreground/70 text-[11px]">
                Be the first to provide helpful critique or suggest punchier action verbs!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3.5 rounded-2xl border text-xs space-y-2 transition-all ${
                  comment.status === "resolved"
                    ? "bg-emerald-500/5 border-emerald-500/20 opacity-75"
                    : "bg-slate-900/60 border-primary/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-xs">{comment.author_name}</span>
                    <Badge variant="secondary" className="text-[9px] uppercase tracking-wider py-0 px-1.5 font-bold">
                      {comment.author_role}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-[9px] capitalize text-muted-foreground/70">
                    Target: {comment.section_target}
                  </Badge>
                </div>

                <p className="text-muted-foreground leading-relaxed">{comment.content}</p>

                {comment.suggested_text && (
                  <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                      Suggested Revision:
                    </span>
                    <p className="font-mono text-[11px] text-blue-300 leading-relaxed">
                      &quot;{comment.suggested_text}&quot;
                    </p>
                  </div>
                )}

                {/* Status and Action Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-primary/5 text-[10px]">
                  <span className="text-muted-foreground/50">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {comment.status === "open" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(comment.id, "resolved")}
                        className="h-6 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1 px-2"
                      >
                        <Check className="h-3 w-3" /> Mark Resolved
                      </Button>
                    ) : (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Resolved
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Comment Submission Form */}
        <form onSubmit={handleSubmit} className="pt-3 border-t border-primary/10 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Your Name
              </Label>
              <Input
                placeholder="e.g. Sarah (Senior Eng)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="h-8 text-xs bg-slate-900/40 border-primary/10 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Your Role
              </Label>
              <select
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                aria-label="Your Role"
                className="w-full h-8 text-xs bg-slate-900/40 border border-primary/10 rounded-xl px-2 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="mentor">Mentor</option>
                <option value="recruiter">Recruiter</option>
                <option value="career_coach">Career Coach</option>
                <option value="peer">Peer Reviewer</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Section Focus
              </Label>
              <select
                value={sectionTarget}
                onChange={(e) => setSectionTarget(e.target.value)}
                aria-label="Section Focus"
                className="h-6 text-[10px] bg-slate-900/40 border border-primary/10 rounded-lg px-1.5 text-foreground font-medium"
              >
                <option value="general">Entire Document</option>
                <option value="summary">Summary &amp; Headline</option>
                <option value="experience">Work Experience Bullets</option>
                <option value="skills">Technical Skills</option>
                <option value="education">Education &amp; Credentials</option>
              </select>
            </div>
            <Textarea
              placeholder="Leave feedback or coaching pointers..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[70px] text-xs bg-slate-900/40 border-primary/10 rounded-xl resize-none"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              Suggested Rewrite (Optional)
            </Label>
            <Input
              placeholder="e.g. Speaheaded cross-functional pod..."
              value={suggestedText}
              onChange={(e) => setSuggestedText(e.target.value)}
              className="h-8 text-xs bg-slate-900/40 border-primary/10 rounded-xl font-mono text-[11px]"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || !content.trim()}
            className="w-full h-9 rounded-xl font-black uppercase tracking-wider text-xs bg-primary hover:bg-primary/90 gap-1.5 shadow-lg shadow-primary/20"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Post Review Comment</span>
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
