"use client";

import React, { useState } from "react";
import {
  AlumniMentor,
  MentorshipSession,
  MentorshipTrack,
  SAMPLE_ALUMNI_MENTORS,
  calculateAlumniMatchScore,
  bookMentorshipSession,
  updateSessionStatus,
} from "@/lib/alumni/mentorship-mesh";
import {
  GraduationCap,
  Users,
  Briefcase,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Video,
  ExternalLink,
  ChevronRight,
  Send,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AlumniMentorshipMeshTabProps {
  universityName: string;
  studentTargetCompany?: string;
  studentTargetRole?: string;
}

export function AlumniMentorshipMeshTab({
  universityName,
  studentTargetCompany = "Google",
  studentTargetRole = "Research Engineer",
}: AlumniMentorshipMeshTabProps) {
  const [mentors] = useState<AlumniMentor[]>(SAMPLE_ALUMNI_MENTORS);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<AlumniMentor | null>(null);

  // Booking form state
  const [selectedTrack, setSelectedTrack] = useState<MentorshipTrack>("Executive Referral Sponsorship");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [customNotes, setCustomNotes] = useState(
    `Hi! I am a senior at ${universityName} targeting ${studentTargetRole} roles at ${studentTargetCompany}. Would love your feedback on my resume and guidance on executive referral pathways.`
  );

  const handleOpenBooking = (mentor: AlumniMentor) => {
    setSelectedMentor(mentor);
    setSelectedTimeSlot(mentor.availableTimeSlots[0] || "");
  };

  const handleConfirmBooking = () => {
    if (!selectedMentor) return;

    const newSession = bookMentorshipSession({
      mentorId: selectedMentor.id,
      studentId: "current-student-id",
      studentName: "Alex Rivera",
      studentEmail: "arivera@stanford.edu",
      track: selectedTrack,
      targetRole: studentTargetRole,
      targetCompany: selectedMentor.currentCompany,
      timeSlot: selectedTimeSlot,
      customNotes,
    });

    setSessions((prev) => [newSession, ...prev]);
    setSelectedMentor(null);
    toast.success(`Mentorship & referral session requested with ${selectedMentor.name}!`);
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Alumni Mentorship &amp; Career Sponsorship Mesh
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {universityName} Alumni Referral Mesh
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Book 1:1 sessions directly with alumni mentors at Google, Stripe, Apple, and leading unicorns. Get direct executive referral sponsorship, portfolio teardowns, and interview prep.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-2 rounded-xl bg-muted/60 border border-border text-center">
            <span className="text-lg font-black text-foreground">81</span>
            <span className="text-[10px] text-muted-foreground block font-medium">Referrals Given</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">94%</span>
            <span className="text-[10px] text-emerald-600/80 block font-medium">Placement Rate</span>
          </div>
        </div>
      </div>

      {/* Active / Booked Sessions */}
      {sessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Your Scheduled Alumni Sessions ({sessions.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((sess) => {
              const mentor = mentors.find((m) => m.id === sess.mentorId);
              return (
                <div
                  key={sess.id}
                  className="bg-card border border-emerald-500/30 rounded-xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-foreground">{mentor?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {mentor?.currentRole} • {mentor?.currentCompany}
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
                      {sess.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-foreground/80">
                    <span className="font-semibold text-foreground">Track:</span> {sess.track}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <Clock className="w-3.5 h-3.5" /> {sess.timeSlot}
                    </span>
                    <a
                      href={sess.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-semibold"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Google Meet
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alumni Mentors Directory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
            Available Verified Alumni Mentors
          </h3>
          <span className="text-xs text-muted-foreground">
            Ranked by match compatibility with your target company & role
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {mentors.map((mentor) => {
            const matchScore = calculateAlumniMatchScore(
              mentor,
              studentTargetCompany,
              studentTargetRole,
              "Executive Referral Sponsorship"
            );

            return (
              <div
                key={mentor.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-blue-500/40 transition-all group"
              >
                <div className="space-y-3">
                  {/* Match Score & Status Header */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Sparkles className="w-3 h-3" />
                      {matchScore}% Match Score
                    </div>
                    {mentor.isAcceptingMentees ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Accepting Mentees
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Cohort Full</span>
                    )}
                  </div>

                  {/* Mentor Info */}
                  <div>
                    <h4 className="text-base font-bold text-foreground">{mentor.name}</h4>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {mentor.currentRole}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" /> {mentor.currentCompany}
                    </p>
                  </div>

                  {/* Academic Background */}
                  <div className="text-[11px] text-muted-foreground border-t border-border/60 pt-2 space-y-0.5">
                    <div>
                      Class of {mentor.graduationYear} • {mentor.degree}
                    </div>
                    <div>Past: {mentor.previousCompanies.join(", ")}</div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-muted-foreground italic line-clamp-3">
                    "{mentor.bio}"
                  </p>

                  {/* Tracks */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Mentorship Tracks Offered:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {mentor.mentorshipTracks.map((tr) => (
                        <span
                          key={tr}
                          className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-foreground/80"
                        >
                          {tr}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Booking Trigger */}
                <div className="pt-4 mt-3 border-t border-border/60">
                  <Button
                    size="sm"
                    disabled={!mentor.isAcceptingMentees}
                    onClick={() => handleOpenBooking(mentor)}
                    className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book Referral & Mentorship 1:1
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Book Mentorship & Referral Session */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Schedule 1:1 with {selectedMentor.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedMentor.currentRole} at {selectedMentor.currentCompany}
                </p>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Select Mentorship Track
                </label>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value as MentorshipTrack)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                >
                  {selectedMentor.mentorshipTracks.map((track) => (
                    <option key={track} value={track}>
                      {track}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Available Calendar Time Slot
                </label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                >
                  {selectedMentor.availableTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Notes & Context for {selectedMentor.name}
                </label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setSelectedMentor(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmBooking}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Confirm 1:1 Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
