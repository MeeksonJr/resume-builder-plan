"use client";

import * as React from "react";
import { CheckCircle2, MessageSquare, Clock, ShieldCheck, AlertCircle, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export interface StudentReviewSubmission {
  id: string;
  studentName: string;
  major: string;
  gradYear: number;
  atsScore: number;
  submittedAt: string;
  status: "Under Review" | "Approved" | "Action Required";
  advisorFeedback?: string;
}

interface AdvisorReviewQueueProps {
  submissions?: StudentReviewSubmission[];
}

export function AdvisorReviewQueue({
  submissions = [
    {
      id: "sub-1",
      studentName: "Jordan Vance",
      major: "Computer Science",
      gradYear: 2027,
      atsScore: 92,
      submittedAt: "2 hours ago",
      status: "Under Review",
    },
    {
      id: "sub-2",
      studentName: "Amira Patel",
      major: "Cybersecurity",
      gradYear: 2026,
      atsScore: 86,
      submittedAt: "Yesterday",
      status: "Approved",
      advisorFeedback: "Strong project bullets and Git metrics. Ready for Dominion Energy campus drop.",
    },
    {
      id: "sub-3",
      studentName: "Marcus Thorne",
      major: "Mechanical Engineering",
      gradYear: 2028,
      atsScore: 71,
      submittedAt: "2 days ago",
      status: "Action Required",
      advisorFeedback: "Expand on CAD internship achievements. Include FE Exam expected date.",
    },
  ],
}: AdvisorReviewQueueProps) {
  const [activeFeedbackId, setActiveFeedbackId] = React.useState<string | null>(null);
  const [feedbackText, setFeedbackText] = React.useState("");

  const handleApprove = (id: string, name: string) => {
    toast.success(`Resume for ${name} marked as Campus Verified!`);
  };

  const handleSendFeedback = (id: string, name: string) => {
    if (!feedbackText.trim()) return;
    toast.success(`Advisor feedback dispatched to ${name}.`);
    setActiveFeedbackId(null);
    setFeedbackText("");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-foreground">
          Career Center Advisor &bull; Student Review Queue
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Review, annotate, and grant Campus Verified credentials to collegiate student resumes.
        </p>
      </div>

      <div className="space-y-4">
        {submissions.map((sub) => (
          <Card key={sub.id} className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">{sub.studentName}</h3>
                  <Badge className={`text-[10px] font-bold ${
                    sub.status === "Approved" 
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : sub.status === "Action Required"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                        : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                  }`}>
                    {sub.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sub.major} &bull; Class of &apos;{sub.gradYear.toString().slice(-2)} &bull; Submitted {sub.submittedAt}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">ATS Score</span>
                  <span className="text-base font-mono font-bold text-primary">{sub.atsScore}/100</span>
                </div>
              </div>
            </div>

            {sub.advisorFeedback && (
              <div className="p-3 bg-muted/40 rounded-xl text-xs text-foreground/90 border border-border/50">
                <span className="font-bold text-primary block mb-0.5">Advisor Notes:</span>
                <p>{sub.advisorFeedback}</p>
              </div>
            )}

            {activeFeedbackId === sub.id ? (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <Textarea
                  placeholder="Enter specific resume recommendations (e.g., expand metric, format margins)..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="text-xs rounded-xl bg-card border-border resize-none"
                  rows={2}
                />
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setActiveFeedbackId(null)}
                    className="h-8 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleSendFeedback(sub.id, sub.studentName)}
                    className="h-8 text-xs font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] rounded-xl gap-1.5"
                  >
                    <Send className="h-3 w-3" />
                    <span>Send Note</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveFeedbackId(sub.id)}
                  className="h-8 text-xs font-bold rounded-xl gap-1.5"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Annotate</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(sub.id, sub.studentName)}
                  className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Grant Campus Verified</span>
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
