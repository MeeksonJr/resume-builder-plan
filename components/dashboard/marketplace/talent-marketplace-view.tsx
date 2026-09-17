"use client";

import React, { useState } from "react";
import {
  CandidateMarketplaceProfile,
  RecruiterIntroRequest,
  AvailabilityStatus,
  SAMPLE_MARKETPLACE_CANDIDATES,
  getMaskedCandidateView,
  createIntroRequest,
  respondToIntroRequest,
} from "@/lib/marketplace/reverse-job-board";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Briefcase,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Mail,
  Send,
  Sparkles,
  DollarSign,
  MapPin,
  Clock,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function TalentMarketplaceView() {
  const [candidates, setCandidates] = useState<CandidateMarketplaceProfile[]>(SAMPLE_MARKETPLACE_CANDIDATES);
  const [introRequests, setIntroRequests] = useState<RecruiterIntroRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"browse" | "my_profile" | "inbox">("browse");

  // User's own marketplace profile state
  const [myAvailability, setMyAvailability] = useState<AvailabilityStatus>("actively_looking");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [hideCompany, setHideCompany] = useState(true);
  const [desiredSalaryMin, setDesiredSalaryMin] = useState(210000);
  const [desiredSalaryMax, setDesiredSalaryMax] = useState(260000);

  // Recruiter modal state
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [pitchCompany, setPitchCompany] = useState("Scale Systems AI");
  const [pitchRole, setPitchRole] = useState("Staff Distributed Architect");
  const [pitchSalary, setPitchSalary] = useState("$270,000 + 0.25% Equity");
  const [pitchMessage, setPitchMessage] = useState(
    "Hi there! We saw your verified 98% ATS profile and high-throughput systems experience. We'd love to connect for a confidential conversation."
  );

  const currentRecruiterId = "recruiter-current-session";

  const handleSendIntroRequest = (candidateId: string) => {
    const req = createIntroRequest(candidateId, {
      id: currentRecruiterId,
      name: "David Sterling",
      company: pitchCompany,
      email: "david@scalesystems.ai",
      jobRole: pitchRole,
      salaryOffered: pitchSalary,
      customPitch: pitchMessage,
    });
    setIntroRequests((prev) => [req, ...prev]);
    setSelectedCandidateId(null);
  };

  const handleRespondToRequest = (requestId: string, decision: "approved" | "declined") => {
    setIntroRequests((prev) =>
      prev.map((r) => (r.id === requestId ? respondToIntroRequest(r, decision) : r))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Talent Marketplace &amp; Reverse Job Board
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Confidential Reverse Job Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Let top tech employers and engineering leaders pitch you directly. Your identity, employer, and full contact details remain 100% masked until you approve an introduction request.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "browse"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Browse Candidates ({candidates.length})
          </button>
          <button
            onClick={() => setActiveTab("my_profile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "my_profile"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Availability & Privacy
          </button>
          <button
            onClick={() => setActiveTab("inbox")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
              activeTab === "inbox"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Intro Inbox
            {introRequests.filter((r) => r.status === "pending_review").length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {introRequests.filter((r) => r.status === "pending_review").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: BROWSE REVERSE JOB BOARD */}
      {activeTab === "browse" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing verified candidates ready for confidential introduction</span>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              <span>All Specialties • Active Hiring • Remote</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {candidates.map((candidate) => {
              const maskedView = getMaskedCandidateView(candidate, introRequests, currentRecruiterId);
              const hasRequested = introRequests.some(
                (r) => r.candidateId === candidate.id && r.recruiterId === currentRecruiterId
              );

              return (
                <div
                  key={candidate.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-violet-500/40 transition-all group"
                >
                  <div className="space-y-3">
                    {/* Header Tags */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="w-3 h-3" />
                        {maskedView.atsScore}% ATS Verified
                      </span>

                      {maskedView.isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                          <Unlock className="w-3.5 h-3.5" /> Identity Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                          <Lock className="w-3.5 h-3.5" /> Masked Anonymity
                        </span>
                      )}
                    </div>

                    {/* Masked Headline / Unlocked Name */}
                    <div>
                      {maskedView.isUnlocked ? (
                        <>
                          <h3 className="text-lg font-bold text-foreground">{maskedView.revealedInfo?.realName}</h3>
                          <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                            {candidate.headline}
                          </p>
                        </>
                      ) : (
                        <h3 className="text-base font-semibold text-foreground leading-snug">
                          {maskedView.maskedHeadline}
                        </h3>
                      )}
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{maskedView.displayCompany}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{maskedView.yearsExperience} yrs experience</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{maskedView.salaryRange}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{maskedView.remotePreference}</span>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs text-muted-foreground italic line-clamp-2">
                      "{maskedView.bioSnippet}"
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {maskedView.primarySkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Revealed info block if unlocked */}
                    {maskedView.isUnlocked && maskedView.revealedInfo && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                        <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                          Direct Contact Access:
                        </div>
                        <div className="text-muted-foreground">Email: {maskedView.revealedInfo.email}</div>
                        <div className="text-muted-foreground">Current Company: {maskedView.revealedInfo.currentCompany}</div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 mt-3 border-t border-border/60">
                    {maskedView.isUnlocked ? (
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Send Direct Calendar Invite
                      </Button>
                    ) : hasRequested ? (
                      <Button variant="secondary" size="sm" disabled className="w-full text-xs">
                        Introduction Requested (Pending)
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setSelectedCandidateId(candidate.id)}
                        className="w-full text-xs bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" /> Request Confidential Intro
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY AVAILABILITY & PRIVACY CONTROLS */}
      {activeTab === "my_profile" && (
        <div className="max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Candidate Reverse Market Placement</h2>
            <p className="text-xs text-muted-foreground">
              Configure how you appear to inbound recruiters and configure privacy firewalls.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">
                Hiring Availability Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "actively_looking", label: "Actively Looking", color: "border-emerald-500 text-emerald-600" },
                  { id: "open_to_offers", label: "Open to Offers", color: "border-blue-500 text-blue-600" },
                  { id: "casually_browsing", label: "Casually Browsing", color: "border-purple-500 text-purple-600" },
                  { id: "not_available", label: "Not Available", color: "border-gray-500 text-gray-500" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setMyAvailability(s.id as AvailabilityStatus)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                      myAvailability === s.id
                        ? "bg-violet-500/10 border-violet-600 text-violet-700 dark:text-violet-300 font-bold"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Toggles */}
            <div className="pt-3 border-t border-border space-y-3">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide block">
                Masked Privacy Controls
              </label>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2.5">
                  {isAnonymous ? <EyeOff className="w-4 h-4 text-violet-600" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  <div>
                    <div className="text-xs font-semibold text-foreground">Stealth Anonymous Mode</div>
                    <div className="text-[11px] text-muted-foreground">Hide full name, email, and social links until approved</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isAnonymous ? "default" : "outline"}
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className="text-xs"
                >
                  {isAnonymous ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-violet-600" />
                  <div>
                    <div className="text-xs font-semibold text-foreground">Mask Current Employer</div>
                    <div className="text-[11px] text-muted-foreground">Display as "Confidential / Stealth Employer"</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={hideCompany ? "default" : "outline"}
                  onClick={() => setHideCompany(!hideCompany)}
                  className="text-xs"
                >
                  {hideCompany ? "Masked" : "Visible"}
                </Button>
              </div>
            </div>

            {/* Desired Comp Range */}
            <div className="pt-3 border-t border-border space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide block">
                Target Compensation Floor ($ USD)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-muted-foreground">Min Base ($):</span>
                  <input
                    type="number"
                    value={desiredSalaryMin}
                    onChange={(e) => setDesiredSalaryMin(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-mono"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Target Base ($):</span>
                  <input
                    type="number"
                    value={desiredSalaryMax}
                    onChange={(e) => setDesiredSalaryMax(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs">
              Save Marketplace Preferences
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: INBOX OF INTRO REQUESTS */}
      {activeTab === "inbox" && (
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">
            Review inbound introduction requests from hiring executives. Approving will share your full resume and verified contact details.
          </div>

          {introRequests.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center space-y-2">
              <Mail className="w-8 h-8 text-muted-foreground mx-auto" />
              <h3 className="text-base font-semibold text-foreground">No Intro Requests Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Employers will discover your masked profile on the Reverse Job Board and send confidential pitches with compensation offers.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {introRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{req.recruiterCompany}</span>
                      <span className="text-xs text-muted-foreground">• {req.recruiterName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          req.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : req.status === "declined"
                            ? "bg-red-500/10 text-red-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                      Target Role: {req.jobRole} • Comp: {req.salaryOffered}
                    </div>
                    <p className="text-xs text-foreground/80 italic">"{req.customPitch}"</p>
                  </div>

                  {req.status === "pending_review" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleRespondToRequest(req.id, "approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Reveal Identity
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespondToRequest(req.id, "declined")}
                        className="text-xs text-red-600 hover:bg-red-500/10 gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Request Confidential Intro */}
      {selectedCandidateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-600" />
                <h3 className="text-base font-bold text-foreground">Request Confidential Introduction</h3>
              </div>
              <button
                onClick={() => setSelectedCandidateId(null)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Candidate identity is masked. Submit your role details and compensation package to request mutual contact unmasking.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Your Company / Team</label>
                <input
                  type="text"
                  value={pitchCompany}
                  onChange={(e) => setPitchCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Target Role</label>
                <input
                  type="text"
                  value={pitchRole}
                  onChange={(e) => setPitchRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Compensation Range Offered</label>
                <input
                  type="text"
                  value={pitchSalary}
                  onChange={(e) => setPitchSalary(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Confidential Pitch Message</label>
                <textarea
                  rows={3}
                  value={pitchMessage}
                  onChange={(e) => setPitchMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setSelectedCandidateId(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleSendIntroRequest(selectedCandidateId)}
                className="bg-violet-600 hover:bg-violet-700 text-white text-xs gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch Intro Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
