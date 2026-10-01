"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  featureName?: string;
}

export function UpgradeModal({
  open,
  onOpenChange,
  title = "Unlock Pro Capabilities",
  description = "This feature is reserved for ResumeForge Pro members.",
  featureName,
}: UpgradeModalProps) {
  const router = useRouter();

  const PRO_PERKS = [
    "Unlimited Tailored Resumes & Cover Letters",
    "Autonomous 24/7 Career Agent Swarm & 1-Click Dispatch",
    "Real-Time Voice Mock Interviews with Speech Analytics",
    "Public Live Portfolio with Custom Slug & QR Code",
    "Dedicated Job Portfolio Microsites for Target Employers",
    "ATS Keyword Heatmap & Automatic Tailoring",
    "Verified Canvas LMS Academic Coursework Badges",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-none border-2 border-[#102b2b] bg-[#f8f4ec] shadow-2xl">
        {/* Header Banner */}
        <div className="bg-[#102b2b] text-[#f8f4ec] p-6 text-center space-y-2 relative">
          <div className="mx-auto w-12 h-12 bg-[#0d8274] border border-[#0d8274]/40 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#0d8274]/20 border border-[#0d8274]/40 rounded-none text-[#f8f4ec] text-[10px] uppercase font-black tracking-widest">
            <Lock className="w-3 h-3" />
            {featureName ? `${featureName} • Pro Feature` : "Pro Plan Required"}
          </div>

          <DialogTitle className="text-xl font-black uppercase tracking-tight text-white mt-1">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#a6c0b8] max-w-xs mx-auto leading-relaxed">
            {description}
          </DialogDescription>
        </div>

        {/* Benefits List */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0d8274]">
              Included in Pro ($19/month):
            </span>
          </div>

          <div className="space-y-2.5">
            {PRO_PERKS.map((perk, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[#102b2b]">
                <CheckCircle2 className="w-4 h-4 text-[#0d8274] shrink-0 mt-0.5" />
                <span className="font-medium leading-snug">{perk}</span>
              </div>
            ))}
          </div>

          {/* Pricing Box */}
          <div className="p-3 bg-white border border-[#102b2b]/15 flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-[#102b2b]">ResumeForge Pro</div>
              <div className="text-[10px] text-[#102b2b]/60">Cancel or pause anytime</div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-[#0d8274] font-mono">$19</span>
              <span className="text-[10px] text-[#102b2b]/60">/mo</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={() => {
                onOpenChange(false);
                router.push("/dashboard/subscription");
              }}
              className="w-full h-11 bg-[#102b2b] hover:bg-[#0d8274] text-[#f8f4ec] font-bold rounded-none text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
            >
              <Zap className="w-4 h-4 text-[#f8f4ec]" />
              <span>Upgrade to Pro Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                router.push("/pricing");
              }}
              className="w-full h-9 rounded-none border-[#102b2b]/20 text-[#102b2b] hover:bg-[#102b2b]/5 text-xs font-semibold cursor-pointer"
            >
              Compare All Plans
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
