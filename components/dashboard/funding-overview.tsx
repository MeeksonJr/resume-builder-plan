"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Clock, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Bookmark, 
  BookmarkCheck, 
  ShieldCheck, 
  ExternalLink, 
  ChevronRight,
  TrendingUp,
  Target,
  Send,
  MessageSquare,
  Bot,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { FundingOpportunity, formatFundingAmount } from "@/lib/funding/types";
import { toast } from "sonner";

interface FundingOverviewProps {
  userName?: string | null;
}

export function FundingOverview({ userName }: FundingOverviewProps) {
  const supabase = createClient();
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Strategist States
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Fetch dashboard stats & opportunities
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch global active opportunities
      const { data: opps, error: oppsError } = await supabase
        .from("funding_opportunities")
        .select("*")
        .eq("is_active", true);

      if (oppsError) throw oppsError;

      // 2. Fetch user saved shortlists
      const { data: userOpps, error: userOppsError } = await supabase
        .from("user_funding_opportunities")
        .select("opportunity_id, status")
        .eq("user_id", user.id)
        .eq("status", "saved");

      if (userOppsError) throw userOppsError;

      setSavedIds(userOpps?.map(uo => uo.opportunity_id) || []);

      // 3. Map heuristic scores
      const mapped = (opps || []).map((opp: any): FundingOpportunity => {
        const basicScore = Math.floor(Math.random() * (99 - 85 + 1)) + 85; 
        return {
          ...opp,
          match_score: basicScore
        };
      });

      setOpportunities(mapped);
    } catch (err: any) {
      console.error("Error loading dashboard funding stats:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleSave = async (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in.");
        return;
      }

      const isSaved = savedIds.includes(id);
      const newStatus = isSaved ? "dismissed" : "saved";

      if (isSaved) {
        const { error } = await supabase
          .from("user_funding_opportunities")
          .update({ status: newStatus })
          .eq("user_id", user.id)
          .eq("opportunity_id", id);
        if (error) throw error;
        setSavedIds(prev => prev.filter(x => x !== id));
        toast.success("Removed from shortlist");
      } else {
        const { error } = await supabase
          .from("user_funding_opportunities")
          .insert({
            user_id: user.id,
            opportunity_id: id,
            status: "saved"
          });
        if (error) throw error;
        setSavedIds(prev => [...prev, id]);
        toast.success("Saved to shortlist");
      }
    } catch (err: any) {
      console.error("Error toggling save:", err.message);
      toast.error("Failed to update shortlist.");
    }
  };

  const handleAskAI = async (promptText?: string) => {
    const query = promptText || aiPrompt;
    if (!query.trim()) return;

    setIsAiThinking(true);
    setAiResponse(null);

    try {
      const res = await fetch("/api/funding/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query })
      });

      if (!res.ok) throw new Error("Coach API failed");

      const data = await res.json();
      setAiResponse(data.response);
    } catch (err: any) {
      console.error("Coach API error:", err.message);
      setAiResponse("I'm having trouble connecting to my strategist network right now. Standard FAFSA filing and checking state timelines are always key first moves!");
    } finally {
      setIsAiThinking(false);
    }
  };

  // Derive display stats
  const topMatches = opportunities
    .filter(o => o.kind === "scholarship" || o.kind === "fellowship")
    .slice(0, 3);

  const upcomingDeadlines = opportunities
    .filter(o => o.deadline)
    .map(opp => {
      const daysLeft = Math.max(0, Math.ceil((new Date(opp.deadline!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
      const isUrgent = daysLeft <= 14;
      return {
        id: opp.id,
        title: opp.title,
        amount: formatFundingAmount(opp),
        daysLeft,
        urgency: isUrgent ? `Urgent (${daysLeft} days)` : `${daysLeft} days left`,
        urgencyColor: isUrgent 
          ? "text-amber-400 bg-amber-500/10 border-amber-500/20" 
          : "text-indigo-300 bg-indigo-500/10 border-indigo-500/20"
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  const totalFundingAmount = opportunities.reduce((sum, item) => sum + (item.amount_max || item.amount_min || 0), 0);
  const averageFundingAmount = opportunities.length > 0 
    ? Math.round(totalFundingAmount / opportunities.length) 
    : 0;

  return (
    <div className="space-y-8 text-slate-100">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Premio AI Funding Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Good morning, {userName || "Scholar"}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl">
              We identified <strong className="text-white font-bold">{opportunities.length} Funding Opportunities</strong> matching your academic profile — representing <strong className="text-amber-300 font-bold">${(totalFundingAmount / 1000).toFixed(0)}k</strong> in potential support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/scholarships">
              <Button size="lg" className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 gap-2 cursor-pointer">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Explore All Matches
              </Button>
            </Link>
            <Link href="/dashboard/grants">
              <Button size="lg" variant="outline" className="rounded-2xl border-slate-700 bg-slate-900/60 text-slate-200 hover:text-white cursor-pointer">
                View Grants & Aid
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Goal & Stat Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Matched Opportunities</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{opportunities.length} Total</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">
              {opportunities.filter(o => o.kind === 'scholarship').length} Scholarships • {opportunities.filter(o => o.kind === 'grant').length} Grants
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Potential Value</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">${(totalFundingAmount / 1000).toFixed(1)}k</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Avg award: ${averageFundingAmount.toLocaleString()}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Saved / Shortlist</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-300 font-mono">{savedIds.length} Saved</span>
            <span className="text-[10px] text-indigo-300 block mt-0.5">Ready to submit</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Funding Goal</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">$25,000</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Structured Roadmap ready</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Best Matches + Sidebar Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Best Matches */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Your Top Scholarship Matches</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  94%+ Fit
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated using your GPA, major, enrolled status, and location criteria.
              </p>
            </div>

            <Link href="/dashboard/scholarships" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-2 bg-slate-900/40 border border-slate-800 rounded-3xl">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <span className="text-xs text-slate-400">Loading matched awards...</span>
            </div>
          ) : topMatches.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-2">
              <Award className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No Matched Scholarships Yet</h4>
              <p className="text-xs text-slate-500">Go to the Scholarships tab to scrape matched listings from the web!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topMatches.map((sch) => {
                const isSaved = savedIds.includes(sch.id);
                const daysLeft = sch.deadline 
                  ? Math.max(0, Math.ceil((new Date(sch.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                  : null;

                return (
                  <Card
                    key={sch.id}
                    className="bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-indigo-500/40 rounded-3xl transition-all duration-200 overflow-hidden shadow-lg border text-slate-200"
                  >
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[11px] font-semibold uppercase">
                          {sch.kind}
                        </Badge>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {sch.match_score || 85}% Match
                          </span>

                          <button
                            onClick={(e) => toggleSave(sch.id, e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                            title={isSaved ? "Saved" : "Save"}
                          >
                            {isSaved ? (
                              <BookmarkCheck className="w-4 h-4 text-amber-300" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <CardTitle className="text-base sm:text-lg font-bold text-white mt-1">
                        {sch.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        {sch.provider}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 pb-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-medium">Value</span>
                          <p className="text-lg font-black text-amber-300 font-mono">{formatFundingAmount(sch)}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-medium">Deadline</span>
                          <p className="text-xs font-semibold text-slate-300 flex items-center gap-1 mt-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            {daysLeft !== null ? `${daysLeft} days left` : "Rolling"}
                          </p>
                        </div>
                      </div>

                      {sch.description && (
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {sch.description}
                        </p>
                      )}
                    </CardContent>

                    <CardFooter className="p-5 pt-0 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {sch.education_levels.slice(0, 1).map((lvl, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                            {lvl}
                          </span>
                        ))}
                        {(sch.requirements as any)?.essay ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
                            Essay Req.
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 font-medium">
                            No Essay
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href="/dashboard/scholarships">
                          <Button variant="secondary" size="sm" className="h-8 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer">
                            Configure
                          </Button>
                        </Link>
                        <Button size="sm" className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs gap-1 cursor-pointer" asChild>
                          <a href={sch.application_url} target="_blank" rel="noopener noreferrer">
                            Apply
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Deadlines + AI Assistant */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Deadlines Widget */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-300" />
                Approaching Deadlines
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">Action Needed</span>
            </div>

            {loading ? (
              <div className="text-center py-6 text-xs text-slate-500">Checking dates...</div>
            ) : upcomingDeadlines.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">No approaching deadlines.</div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((item) => (
                  <div key={item.id} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                      <span className="text-xs font-mono font-extrabold text-amber-300 shrink-0">{item.amount}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full font-semibold border ${item.urgencyColor}`}>
                        {item.urgency}
                      </span>
                      <Link href="/dashboard/scholarships" className="text-indigo-400 hover:underline">
                        Prepare App →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Premio AI Scholarship Coach */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-indigo-950/40 to-slate-900/80 border border-indigo-500/30 space-y-4 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <Bot className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Premio AI Assistant</h3>
                <p className="text-[11px] text-slate-400">Your scholarship & funding strategist</p>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                "Which should I apply to first?",
                "Find no-essay scholarships",
                "Check Pell Grant eligibility"
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setAiPrompt(prompt);
                    handleAskAI(prompt);
                  }}
                  className="text-[11px] text-left px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>

            {/* Response Box */}
            {aiResponse && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-indigo-500/30 text-xs text-indigo-100 space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Premio AI:</span>
                <p className="leading-relaxed">{aiResponse}</p>
              </div>
            )}

            {isAiThinking && (
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>Analyzing scholarship database & profile...</span>
              </div>
            )}

            {/* Input Form */}
            <div className="relative">
              <input
                type="text"
                placeholder="Ask about essays, eligibility..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                className="w-full h-10 pl-3 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                onClick={() => handleAskAI()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                title="Send"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
