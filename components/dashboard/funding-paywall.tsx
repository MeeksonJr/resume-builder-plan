"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ShieldAlert, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function FundingPaywall() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-4 bg-[#e9eee8] text-[#102b2b]">
      <Card className="max-w-xl w-full bg-[#102b2b] text-[#e9eee8] border border-[#102b2b] shadow-2xl relative overflow-hidden">
        {/* Glow Background Effect */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#d8f36b]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#0d8274]/15 blur-3xl" />

        <CardHeader className="text-center relative z-10 pt-8 pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#d8f36b]/10 flex items-center justify-center border border-[#d8f36b]/30 mb-4 animate-bounce">
            <Sparkles className="w-6 h-6 text-[#d8f36b]" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight">
            Unlock Premium Funding & AI Tools
          </CardTitle>
          <CardDescription className="text-sm text-[#e9eee8]/70 mt-2 max-w-sm mx-auto">
            This premium dashboard is reserved for Pro plan subscribers. Upgrade today to access live opportunities.
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 px-6 sm:px-8 py-4 space-y-4">
          <div className="p-4 rounded bg-[#e9eee8]/5 border border-[#e9eee8]/10 space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-[#d8f36b] font-bold">What's included in Pro:</h4>
            
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#d8f36b] shrink-0 mt-0.5" />
                <span><strong>Live Web Scrapes</strong>: Find real-world scholarships and grants matching your exact major, GPA, and skills.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#d8f36b] shrink-0 mt-0.5" />
                <span><strong>AI Match Analysis</strong>: Let the AI calculate a compatibility score, identify potential eligibility blockers, and provide tailoring advice.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#d8f36b] shrink-0 mt-0.5" />
                <span><strong>Essay Draft Generator</strong>: Paste essay prompts and get customized drafts matching the projects and experiences in your resume.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#d8f36b] shrink-0 mt-0.5" />
                <span><strong>Dynamic Tracking</strong>: Save deadlines relative to your system date, get close-warning badges, and hide expired opportunities.</span>
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="relative z-10 px-6 sm:px-8 pb-8 pt-2 flex flex-col sm:flex-row gap-3 items-center">
          <Button 
            onClick={() => router.push("/dashboard/subscription")} 
            className="w-full bg-[#d8f36b] hover:bg-[#c4dd5a] text-[#102b2b] font-bold text-sm h-11 rounded-sm gap-2"
          >
            Upgrade to Pro Plan
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => router.push("/dashboard")} 
            className="w-full sm:w-auto text-[#e9eee8]/70 hover:text-[#e9eee8] text-xs font-semibold"
          >
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
      
      <div className="flex items-center gap-1.5 mt-4 text-xs text-[#102b2b]/50">
        <ShieldCheck className="w-4 h-4" />
        <span>Secure 256-bit Stripe payments. Cancel anytime.</span>
      </div>
    </div>
  );
}
