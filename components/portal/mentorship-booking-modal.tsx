"use client";

import * as React from "react";
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  X,
  Building2,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export interface AlumniMentor {
  id: string;
  name: string;
  role: string;
  company: string;
  gradYear: number;
  major: string;
  avatarUrl?: string;
  topics: string[];
}

interface MentorshipBookingModalProps {
  mentor: AlumniMentor | null;
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
}

export function MentorshipBookingModal({
  mentor,
  isOpen,
  onClose,
  studentName = "Student",
}: MentorshipBookingModalProps) {
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedTopic, setSelectedTopic] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    if (mentor && mentor.topics.length > 0) {
      setSelectedTopic(mentor.topics[0]);
    }
    setIsSuccess(false);
  }, [mentor]);

  if (!mentor) return null;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API reservation dispatch
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsSubmitting(false);
    setIsSuccess(true);
    toast.success(`Coffee chat requested with ${mentor.name}! Check your student email for the calendar invite.`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
              {mentor.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Connect with {mentor.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Building2 className="h-3 w-3 text-primary" />
                <span>{mentor.role} at {mentor.company}</span>
                <span>&bull;</span>
                <span>Class of &apos;{mentor.gradYear.toString().slice(-2)}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Coffee Chat Requested!</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                An invite has been dispatched to {mentor.name}. You will receive a Google Meet / Teams link upon their confirmation.
              </p>
            </div>
            <Button 
              onClick={onClose}
              className="w-full h-10 font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] rounded-xl text-xs"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Discussion Topic
              </label>
              <div className="flex flex-wrap gap-1.5">
                {mentor.topics.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    className={`px-3 py-1.5 text-xs rounded-xl font-medium transition cursor-pointer ${
                      selectedTopic === t
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Proposed Date &amp; Time
              </label>
              <Input
                type="datetime-local"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 text-xs rounded-xl bg-card border-border"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Introduction &amp; Goals for Session
              </label>
              <Textarea
                rows={3}
                required
                placeholder={`Hi ${mentor.name.split(" ")[0]}, I am a ${mentor.major} student interested in your work at ${mentor.company}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-xs rounded-xl bg-card border-border resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-10 text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-5 text-xs font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] rounded-xl gap-2 shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Requesting..." : "Send Request"}</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
