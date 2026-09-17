"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  Copy,
  Check,
  Sparkles,
  Calendar,
  Users,
  Linkedin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock
} from "lucide-react";
import {
  generateOutreachSequence,
  formatLinkedInOutreachNote,
  OutreachPersona,
  OutreachCampaign
} from "@/lib/outreach/cold-email-sequence";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ReferralSequenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCompany?: string;
  defaultRole?: string;
  candidateName?: string;
  portfolioUrl?: string;
}

export function ReferralSequenceModal({
  open,
  onOpenChange,
  defaultCompany = "Stripe",
  defaultRole = "Staff Software Engineer",
  candidateName = "Mohamed Lamine Datt",
  portfolioUrl = "https://resumeforge.pro/p/d.mohamed1504",
}: ReferralSequenceModalProps) {
  const [targetCompany, setTargetCompany] = useState(defaultCompany);
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [recipientName, setRecipientName] = useState("");
  const [persona, setPersona] = useState<OutreachPersona>("hiring_manager");
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedLinkedIn, setCopiedLinkedIn] = useState(false);

  const campaign: OutreachCampaign = generateOutreachSequence({
    candidateName,
    candidateTitle: "Senior Fullstack Engineer & AI Solutions Architect",
    targetCompany,
    targetRole,
    recipientName: recipientName || undefined,
    persona,
    topAchievement: "architecting microservices handling 40M+ daily events with 99.99% uptime",
    portfolioUrl,
  });

  const currentStep = campaign.steps.find(s => s.stepNumber === activeStep) || campaign.steps[0];
  const linkedInNote = formatLinkedInOutreachNote(candidateName, targetCompany, targetRole, portfolioUrl);

  const handleCopy = (text: string, type: "subject" | "body" | "linkedin") => {
    navigator.clipboard.writeText(text);
    if (type === "subject") {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else if (type === "body") {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    } else {
      setCopiedLinkedIn(true);
      setTimeout(() => setCopiedLinkedIn(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  const handleLaunchMailto = () => {
    const subject = encodeURIComponent(currentStep.subject);
    const body = encodeURIComponent(currentStep.body);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl lg:max-w-5xl bg-neutral-950 border-neutral-800 text-neutral-100 p-6 sm:p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[92vh]">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                Cold Email & Executive Referral Sequence Builder
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-neutral-400">
                Phase 61: Personalized 3-stage outbound campaign targeting hiring managers, recruiters, and alumni.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Target Inputs & Persona Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-black/40 border border-neutral-800 text-xs">
          <div>
            <label className="text-neutral-400 block mb-1 font-medium">Target Company</label>
            <Input
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="h-8 text-xs bg-neutral-900 border-neutral-700"
            />
          </div>
          <div>
            <label className="text-neutral-400 block mb-1 font-medium">Target Role</label>
            <Input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="h-8 text-xs bg-neutral-900 border-neutral-700"
            />
          </div>
          <div>
            <label className="text-neutral-400 block mb-1 font-medium">Recipient Name (Optional)</label>
            <Input
              value={recipientName}
              placeholder="e.g. Sarah Jenkins"
              onChange={(e) => setRecipientName(e.target.value)}
              className="h-8 text-xs bg-neutral-900 border-neutral-700"
            />
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
          <span className="text-xs text-neutral-400 font-semibold mr-1">Target Persona:</span>
          {[
            { id: "hiring_manager", label: "Hiring Manager / VP Eng", icon: Users },
            { id: "recruiter", label: "Technical Recruiter", icon: Mail },
            { id: "alumni_peer", label: "Alumni Peer / Insider", icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = persona === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPersona(item.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  isSelected 
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30" 
                    : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {item.label}
              </button>
            );
          })}
        </div>

        {/* 3-Touch Timeline & Content Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Sequence Stepper */}
          <div className="lg:col-span-4 space-y-3">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              3-Touch Outbound Cadence
            </p>
            {campaign.steps.map((step) => {
              const isSelected = activeStep === step.stepNumber;
              return (
                <div
                  key={step.stepNumber}
                  onClick={() => setActiveStep(step.stepNumber)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                    isSelected
                      ? "bg-violet-950/40 border-violet-500/50 ring-1 ring-violet-500/40"
                      : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Touch #{step.stepNumber}</span>
                    <Badge variant="outline" className="text-[10px] font-mono text-neutral-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {step.delayDays === 0 ? "Immediate" : `+${step.delayDays} days`}
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-300 font-medium line-clamp-1">{step.subject}</p>
                  <p className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-violet-400" />
                    Goal: {step.callToAction}
                  </p>
                </div>
              );
            })}

            {/* InMail Quick Card */}
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-blue-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Linkedin className="w-4 h-4" /> LinkedIn InMail Note
                </span>
                <span className="font-mono text-[10px] text-blue-300">{linkedInNote.length}/300 chars</span>
              </div>
              <p className="text-[11px] text-neutral-300 italic bg-black/40 p-2.5 rounded-lg border border-white/5">
                &ldquo;{linkedInNote}&rdquo;
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(linkedInNote, "linkedin")}
                className="w-full h-7 text-xs border-blue-500/40 text-blue-300 hover:bg-blue-500/20 gap-1.5"
              >
                {copiedLinkedIn ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy LinkedIn Note
              </Button>
            </div>
          </div>

          {/* Right Column: Step Preview & Launch */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400">
                  Touch #{currentStep.stepNumber} Subject Line:
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(currentStep.subject, "subject")}
                  className="h-6 text-[11px] text-neutral-400 hover:text-white gap-1"
                >
                  {copiedSubject ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy Subject
                </Button>
              </div>
              <p className="text-sm font-bold text-white bg-black/40 p-2.5 rounded-lg border border-white/5 select-all">
                {currentStep.subject}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-neutral-400">
                  Email Body Content:
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(currentStep.body, "body")}
                  className="h-6 text-[11px] text-neutral-400 hover:text-white gap-1"
                >
                  {copiedBody ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy Body
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-black/60 border border-white/5 font-mono text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap select-all max-h-72 overflow-y-auto">
                {currentStep.body}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Est. {campaign.estimatedReplyRate}% Reply Rate</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(currentStep.body, "body")}
                    className="h-8 text-xs border-neutral-700 text-neutral-200"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy All
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleLaunchMailto}
                    className="h-8 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold gap-1.5 shadow-md shadow-violet-600/20"
                  >
                    <Send className="w-3.5 h-3.5" /> Launch Mail App
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
