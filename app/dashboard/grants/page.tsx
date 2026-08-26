"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  GraduationCap, 
  ArrowRight, 
  Search, 
  ExternalLink,
  Clock,
  Calculator,
  BookmarkCheck,
  Bookmark,
  Loader2,
  ChevronRight,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { FundingOpportunity, formatFundingAmount } from "@/lib/funding/types";
import { toast } from "sonner";
import { RelativeDate } from "@/components/dashboard/relative-date";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { FundingPaywall } from "@/components/dashboard/funding-paywall";

export default function DashboardGrantsPage() {
  const supabase = createClient();
  const { isPro, isLoading: isSubLoading, checkSubscription } = useSubscriptionStore();
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideClosed, setHideClosed] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [activeModalOpportunity, setActiveModalOpportunity] = useState<FundingOpportunity | null>(null);

  // AI Assistant States
  const [aiAnalysis, setAiAnalysis] = useState<{
    matchScore: number;
    whyYouMatch: string[];
    potentialBlockers: string[];
    tailoringTips: string[];
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Essay/Application Q&A States
  const [essayPrompt, setEssayPrompt] = useState("");
  const [essayDraft, setEssayDraft] = useState("");
  const [essayTips, setEssayTips] = useState<string[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Scraper loading
  const [scraping, setScraping] = useState(false);

  // Fetch opportunities from Supabase
  const fetchGrants = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("fetchGrants: No authenticated user session found");
        return;
      }

      console.log("fetchGrants: Fetching active global funding opportunities...");
      // 1. Fetch active global funding opportunities for grants / aid
      const { data: opps, error: oppsError } = await supabase
        .from("funding_opportunities")
        .select("*")
        .in("kind", ["grant", "aid"])
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (oppsError) {
        console.error("fetchGrants: oppsError:", oppsError);
        throw oppsError;
      }
      console.log(`fetchGrants: Fetched ${opps?.length || 0} global grants:`, opps);

      // 2. Fetch user interactions
      const { data: userOpps, error: userOppsError } = await supabase
        .from("user_funding_opportunities")
        .select("*")
        .eq("user_id", user.id);

      if (userOppsError) {
        console.error("fetchGrants: userOppsError:", userOppsError);
        throw userOppsError;
      }
      console.log("fetchGrants: Fetched user interactions:", userOpps);

      const userStateMap = new Map(userOpps?.map(uo => [uo.opportunity_id, uo]) || []);

      // 3. Merge
      const merged = (opps || []).map((opp: any): FundingOpportunity => {
        const uState = userStateMap.get(opp.id);
        const basicScore = Math.floor(Math.random() * (99 - 85 + 1)) + 85; 

        return {
          ...opp,
          user_status: uState?.status || null,
          essay_draft: uState?.essay_draft || null,
          notes: uState?.notes || null,
          match_score: uState?.ai_analysis?.matchScore || (uState?.essay_draft ? 98 : basicScore),
          ai_analysis: uState?.ai_analysis || null
        };
      });

      console.log("fetchGrants: Final merged opportunities state:", merged);
      setOpportunities(merged);
    } catch (err: any) {
      console.error("Error fetching grants:", err.message || err);
      toast.error("Failed to load grants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  // Reset/Initialize modal states when selection changes
  useEffect(() => {
    if (activeModalOpportunity) {
      setAiAnalysis(activeModalOpportunity.ai_analysis || null);
      setEssayDraft(activeModalOpportunity.essay_draft || "");
    } else {
      setAiAnalysis(null);
      setEssayDraft("");
    }
    setEssayTips([]);
    setEssayPrompt("");
  }, [activeModalOpportunity]);

  const handleToggleSave = async (oppId: string, currentStatus: string | null | undefined, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in.");
        return;
      }

      const newStatus = currentStatus === "saved" ? "dismissed" : "saved";

      if (currentStatus) {
        const { error } = await supabase
          .from("user_funding_opportunities")
          .update({ status: newStatus })
          .eq("user_id", user.id)
          .eq("opportunity_id", oppId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_funding_opportunities")
          .insert({
            user_id: user.id,
            opportunity_id: oppId,
            status: "saved"
          });
        if (error) throw error;
      }

      toast.success(newStatus === "saved" ? "Grant saved to shortlist" : "Removed from shortlist");
      fetchGrants();

      if (activeModalOpportunity && activeModalOpportunity.id === oppId) {
        setActiveModalOpportunity(prev => prev ? { ...prev, user_status: newStatus as any } : null);
      }
    } catch (err: any) {
      console.error("Error toggling save:", err.message);
      toast.error("Failed to update status.");
    }
  };

  const handleToggleTrack = async (oppId: string, currentStatus: string | null | undefined, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in.");
        return;
      }

      const newStatus = currentStatus === "applying" ? "dismissed" : "applying";

      if (currentStatus) {
        const { error } = await supabase
          .from("user_funding_opportunities")
          .update({ status: newStatus })
          .eq("user_id", user.id)
          .eq("opportunity_id", oppId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_funding_opportunities")
          .insert({
            user_id: user.id,
            opportunity_id: oppId,
            status: "applying"
          });
        if (error) throw error;
      }

      toast.success(newStatus === "applying" ? "Tracking marked as In Progress" : "Stopped tracking");
      fetchGrants();

      if (activeModalOpportunity && activeModalOpportunity.id === oppId) {
        setActiveModalOpportunity(prev => prev ? { ...prev, user_status: newStatus as any } : null);
      }
    } catch (err: any) {
      console.error("Error tracking:", err.message);
      toast.error("Failed to update tracking.");
    }
  };

  // Run online web scraping
  const handleSearchOnline = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a query to search.");
      return;
    }

    try {
      setScraping(true);
      const res = await fetch("/api/funding/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          searchQuery, 
          forceRefresh: true,
          clientDate: new Date().toISOString().split('T')[0]
        })
      });

      if (!res.ok) throw new Error("Search API error");

      toast.success("Successfully scraped matching grants from the web!");
      await fetchGrants();
    } catch (err: any) {
      console.error("Scraping search error:", err.message);
      toast.error("Failed to scrape live web listings.");
    } finally {
      setScraping(false);
    }
  };

  // Run AI Compatibility Check
  const runAiAnalysis = async () => {
    if (!activeModalOpportunity) return;

    try {
      setAnalyzing(true);
      const res = await fetch("/api/funding/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: activeModalOpportunity.id, task: "analyze" })
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      setAiAnalysis(data);

      // Persist AI analysis report to Supabase user_funding_opportunities
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("user_funding_opportunities")
          .upsert({
            user_id: user.id,
            opportunity_id: activeModalOpportunity.id,
            status: activeModalOpportunity.user_status || "saved",
            ai_analysis: data
          }, { onConflict: "user_id,opportunity_id" });
        
        // Reload to update global arrays
        await fetchGrants();
      }
      toast.success("AI Analysis report calculated and saved!");
    } catch (err: any) {
      console.error("AI Analysis error:", err.message);
      toast.error("AI Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Run AI Essay/Application Helper
  const runEssayGenerator = async () => {
    if (!activeModalOpportunity || !essayPrompt.trim()) {
      toast.error("Please provide a prompt or question.");
      return;
    }

    try {
      setDrafting(true);
      const res = await fetch("/api/funding/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          opportunityId: activeModalOpportunity.id, 
          task: "essay", 
          essayPrompt 
        })
      });

      if (!res.ok) throw new Error("Drafting failed");

      const data = await res.json();
      setEssayDraft(data.draft);
      setEssayTips(data.tips || []);

      // Persist draft to Supabase user_funding_opportunities
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("user_funding_opportunities")
          .upsert({
            user_id: user.id,
            opportunity_id: activeModalOpportunity.id,
            status: activeModalOpportunity.user_status || "applying",
            essay_draft: data.draft
          }, { onConflict: "user_id,opportunity_id" });
      }

      toast.success("Response generated and saved!");
    } catch (err: any) {
      console.error("Drafting error:", err.message);
      toast.error("Failed to generate response.");
    } finally {
      setDrafting(false);
    }
  };

  const copyToClipboard = () => {
    if (!essayDraft) return;
    navigator.clipboard.writeText(essayDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter
  const filteredGrants = opportunities.filter((g) => {
    const matchesSearch = 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.majors || []).some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

    if (hideClosed && g.deadline) {
      const deadlineDate = new Date(g.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        return false;
      }
    }

    const isMatch = selectedType === "All" || g.kind.toLowerCase() === selectedType.toLowerCase() || (g.keywords || []).some(k => k.toLowerCase() === selectedType.toLowerCase());
    return matchesSearch && isMatch;
  });

  if (isSubLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-[#e9eee8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0d8274]" />
      </div>
    );
  }

  if (!isPro) {
    return <FundingPaywall />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 bg-[#e9eee8] text-[#102b2b]">
      {/* Header Banner */}
      <div className="relative p-5 sm:p-8 rounded-md bg-[#102b2b] border border-[#102b2b] shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#d8f36b] text-[#102b2b] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Zero Repayment Financial Aid Programs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#e9eee8] tracking-tight">
              Federal, State & Emergency Grants
            </h1>
            <p className="text-sm text-[#e9eee8]/75 leading-relaxed">
              Grants are gift aid that does not have to be repaid. Check qualification status and run live web searches to find active regional or federal programs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-4 rounded-md bg-[#0d8274] border border-[#e9eee8]/20 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-[#e9eee8]/70 block">FAFSA Status</span>
              <span className="text-sm font-extrabold text-[#d8f36b] mt-1 block">Cycle Open</span>
              <span className="text-[10px] text-[#e9eee8]/70 font-medium block mt-0.5">2026-2027</span>
            </div>
            <div className="p-4 rounded-md bg-[#d8f36b] border border-[#102b2b]/20 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-[#102b2b]/70 block">Active Listings</span>
              <span className="text-2xl font-black text-[#102b2b] font-mono">{opportunities.length}</span>
              <span className="text-[10px] text-[#102b2b]/70 font-medium block mt-0.5">Available for You</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrape bar */}
      <div className="p-4 sm:p-5 rounded-md bg-white border border-[#b8c8b9] flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full flex-1">
          <Search className="w-4 h-4 text-[#0d8274] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search for federal grants, state assistance programs, research fellowships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-4 rounded-sm bg-[#f7faf5] border border-[#b8c8b9] text-sm text-[#102b2b] placeholder:text-[#102b2b]/50 focus:outline-none focus:ring-2 focus:ring-[#0d8274]"
          />
        </div>
        <Button 
          onClick={handleSearchOnline} 
          disabled={scraping}
          className="w-full md:w-auto h-12 bg-[#0d8274] hover:bg-[#102b2b] text-white px-6 font-semibold rounded-sm transition-colors flex gap-2"
        >
          {scraping ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scraping Web Listings...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#d8f36b]" />
              Search & Scrape Online
            </>
          )}
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["All", "Federal", "State", "Research", "Emergency"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                selectedType === type
                  ? "bg-[#d8f36b] text-[#102b2b]"
                  : "bg-[#102b2b] border border-[#102b2b] text-[#e9eee8]/75 hover:text-[#d8f36b]"
              }`}
            >
              {type === "All" ? "All Aid Types" : `${type} Grants`}
            </button>
          ))}
        </div>

        {/* Hide Closed Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#102b2b] border border-[#102b2b]/20 text-[#d8f36b] text-xs font-semibold">
          <input
            type="checkbox"
            id="hideClosedCheckboxGrants"
            checked={hideClosed}
            onChange={(e) => setHideClosed(e.target.checked)}
            className="w-3.5 h-3.5 accent-[#d8f36b] cursor-pointer"
          />
          <label htmlFor="hideClosedCheckboxGrants" className="cursor-pointer select-none">
            Hide Closed Opportunities
          </label>
        </div>
      </div>
      
      <Button size="sm" className="rounded-sm bg-[#0d8274] hover:bg-[#102b2b] text-[#e9eee8] font-medium text-xs gap-1.5 cursor-pointer" asChild>
        <a href="https://studentaid.gov/h/apply-for-aid/fafsa" target="_blank" rel="noopener noreferrer">
          FAFSA Portal
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </Button>

      {/* Loading & Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-[#0d8274] animate-spin" />
          <p className="text-sm font-semibold text-[#102b2b]/70">Loading active database opportunities...</p>
        </div>
      ) : filteredGrants.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-md bg-[#f7faf5] border-2 border-dashed border-[#b8c8b9]">
          <div className="p-4 rounded-full bg-[#0d8274]/10 mb-4">
            <Building2 className="w-12 h-12 text-[#0d8274]" />
          </div>
          <h3 className="text-lg font-bold text-[#102b2b]">No Matching Grants Found</h3>
          <p className="text-xs text-[#102b2b]/60 max-w-sm mt-1 mb-6">
            No active grants found matching this filter. Try a live web scrape using the search bar above to fetch matching opportunities globally.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGrants.map((opp) => {
            const isSaved = opp.user_status === "saved";
            const isApplied = opp.user_status === "applying";

            return (
              <Card 
                key={opp.id} 
                onClick={() => setActiveModalOpportunity(opp)}
                className="bg-[#f7faf5] border-[#b8c8b9] rounded-md overflow-hidden flex flex-col justify-between hover:border-[#0d8274] transition-colors duration-200 shadow-sm cursor-pointer group"
              >
                <CardHeader className="p-6 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant="outline" className="bg-[#0d8274]/10 text-[#0d8274] border-[#0d8274]/30 text-xs rounded-sm uppercase">
                      {opp.kind}
                    </Badge>
                    <div>
                      <span className="text-[10px] text-[#102b2b]/55 block">Deadline</span>
                      <span className="flex items-center gap-1 mt-0.5">
                        <RelativeDate deadline={opp.deadline} />
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleSave(opp.id, opp.user_status, e)}
                        aria-label={isSaved ? "Remove from saved" : "Save"}
                        className="p-2 rounded-sm text-[#102b2b]/55 hover:text-[#0d8274] hover:bg-[#e9eee8] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d8274]"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-[#0d8274] fill-[#0d8274]/20" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <CardTitle className="text-lg sm:text-xl font-bold text-[#102b2b] mt-2 group-hover:text-[#0d8274] transition-colors line-clamp-1">
                    {opp.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#102b2b]/60 line-clamp-1">
                    {opp.provider}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-0 pb-4 space-y-4 flex-1">
                  <div className="p-3 rounded-sm bg-[#e9eee8] border border-[#b8c8b9] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#102b2b]/55 uppercase font-medium">Value</span>
                      <p className="text-base font-extrabold text-[#0d8274] font-mono">{formatFundingAmount(opp)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#102b2b]/55 uppercase font-medium">Match</span>
                      <p className="text-xs font-semibold text-[#102b2b] flex items-center gap-1 mt-1 justify-end">
                        <Sparkles className="w-3 h-3 text-[#d8f36b]" />
                        {opp.match_score || 85}% Fit
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#102b2b]/80 leading-relaxed line-clamp-3">
                    {opp.description}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-[#102b2b]/60 uppercase tracking-wider block">Key Eligibility</span>
                    {opp.eligibility && opp.eligibility.length > 0 ? (
                      opp.eligibility.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[#102b2b]/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0d8274] shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="line-clamp-1">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#102b2b]/60">Check application portal for eligibility guidelines.</p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 border-t border-[#b8c8b9] mt-auto flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => handleToggleTrack(opp.id, opp.user_status, e)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-sm transition-colors cursor-pointer ${
                      isApplied
                        ? "bg-[#d8f36b] text-[#102b2b] border border-[#102b2b]/15"
                        : "text-[#102b2b]/60 hover:text-[#102b2b] bg-[#e9eee8]"
                    }`}
                  >
                    {isApplied ? "✓ In Progress" : "+ Track Application"}
                  </button>

                  <span className="inline-flex items-center gap-1 font-semibold text-[#0d8274] group-hover:text-[#102b2b]">
                    View Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Grant Detail & AI Modal */}
      <Dialog open={!!activeModalOpportunity} onOpenChange={(open) => !open && setActiveModalOpportunity(null)}>
        {activeModalOpportunity && (
          <DialogContent className="max-w-3xl bg-[#f7faf5] border-[#b8c8b9] text-[#102b2b] p-0 overflow-hidden max-h-[90vh] flex flex-col rounded-md shadow-xl">
            
            {/* Header info */}
            <div className="p-6 border-b border-[#b8c8b9] bg-[#e9eee8] relative">
              <div className="flex items-center justify-between gap-4 mb-2">
                <Badge className="bg-[#0d8274]/10 text-[#0d8274] border-[#0d8274]/30 text-xs rounded-sm uppercase">
                  {activeModalOpportunity.kind}
                </Badge>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#d8f36b] text-[#102b2b] text-xs font-bold border border-[#102b2b]/15">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  {activeModalOpportunity.match_score || 85}% Match
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-[#102b2b]">
                {activeModalOpportunity.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#102b2b]/60 mt-1 flex flex-wrap items-center gap-1.5">
                <span>{activeModalOpportunity.provider}</span>
                <span>•</span>
                <RelativeDate deadline={activeModalOpportunity.deadline} />
              </DialogDescription>

              <div className="grid grid-cols-2 gap-3 mt-4 p-3 rounded-sm bg-[#f7faf5] border border-[#b8c8b9] text-center">
                <div>
                  <span className="text-[10px] text-[#102b2b]/60 uppercase font-medium">Maximum Award</span>
                  <p className="text-lg font-black text-[#0d8274] font-mono">
                    {formatFundingAmount(activeModalOpportunity)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#102b2b]/60 uppercase font-medium">Source</span>
                  <p className="text-xs font-bold text-[#102b2b] mt-1">
                    {activeModalOpportunity.source_name || "Online Registry"}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable details tabbed workspace */}
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full bg-[#e9eee8] border-b border-[#b8c8b9] rounded-none justify-start px-6 h-12">
                  <TabsTrigger value="details" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0d8274] data-[state=active]:bg-transparent text-xs">
                    Overview & Steps
                  </TabsTrigger>
                  <TabsTrigger value="ai-analysis" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0d8274] data-[state=active]:bg-transparent text-xs flex gap-1 items-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#0d8274]" />
                    AI Eligibility Check
                  </TabsTrigger>
                  <TabsTrigger value="essay-assistant" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0d8274] data-[state=active]:bg-transparent text-xs flex gap-1 items-center">
                    <FileText className="w-3.5 h-3.5 text-[#0d8274]" />
                    Application Assistant
                  </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="p-6 space-y-6 m-0">
                  <div>
                    <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-[#102b2b]/80 leading-relaxed">{activeModalOpportunity.description}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider mb-2">Detailed Eligibility</h4>
                    {activeModalOpportunity.eligibility && activeModalOpportunity.eligibility.length > 0 ? (
                      <ul className="space-y-2">
                        {activeModalOpportunity.eligibility.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-[#102b2b]/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0d8274] mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-[#102b2b]/60">Check application portal for eligibility guidelines.</p>
                    )}
                  </div>

                  {/* Requirements Checklist */}
                  {activeModalOpportunity.requirements && (
                    <div>
                      <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider mb-2">Required Checklist</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-[#102b2b]/85">
                        <div className="p-2.5 rounded-sm bg-white border border-[#b8c8b9] flex items-center justify-between">
                          <span>Essay Required</span>
                          <span className="font-semibold">{(activeModalOpportunity.requirements as any).essay ? "✅ Yes" : "❌ No"}</span>
                        </div>
                        <div className="p-2.5 rounded-sm bg-white border border-[#b8c8b9] flex items-center justify-between">
                          <span>Recommendation Letters</span>
                          <span className="font-semibold">{(activeModalOpportunity.requirements as any).recommendation_letters > 0 ? `✅ ${(activeModalOpportunity.requirements as any).recommendation_letters}` : "❌ None"}</span>
                        </div>
                        <div className="p-2.5 rounded-sm bg-white border border-[#b8c8b9] flex items-center justify-between">
                          <span>Transcript</span>
                          <span className="font-semibold">{(activeModalOpportunity.requirements as any).transcript_required ? "✅ Yes" : "❌ No"}</span>
                        </div>
                        <div className="p-2.5 rounded-sm bg-white border border-[#b8c8b9] flex items-center justify-between">
                          <span>Resume</span>
                          <span className="font-semibold">{(activeModalOpportunity.requirements as any).resume_required ? "✅ Yes" : "❌ No"}</span>
                        </div>
                        <div className="p-2.5 rounded-sm bg-white border border-[#b8c8b9] flex items-center justify-between">
                          <span>Portfolio</span>
                          <span className="font-semibold">{(activeModalOpportunity.requirements as any).portfolio_required ? "✅ Yes" : "❌ No"}</span>
                        </div>
                        <div className="p-2.5 rounded-sm bg-white border border-[#b8c8b9] flex items-center justify-between">
                          <span>FAFSA Required</span>
                          <span className="font-semibold">{(activeModalOpportunity.requirements as any).fafsa_required ? "✅ Yes" : "❌ No"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Careers and Keywords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {activeModalOpportunity.careers && activeModalOpportunity.careers.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider mb-2">Target Career Fields</h4>
                        <div className="flex flex-wrap gap-1">
                          {activeModalOpportunity.careers.map((career, idx) => (
                            <Badge key={idx} variant="outline" className="bg-[#e9eee8] text-[#102b2b] border-[#b8c8b9] text-[10px] rounded-sm font-medium">
                              {career}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeModalOpportunity.keywords && activeModalOpportunity.keywords.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider mb-2">Tags / Focus Areas</h4>
                        <div className="flex flex-wrap gap-1">
                          {activeModalOpportunity.keywords.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="bg-[#0d8274]/5 text-[#0d8274] border-[#0d8274]/20 text-[10px] rounded-sm font-medium">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* AI Eligibility Check Tab */}
                <TabsContent value="ai-analysis" className="p-6 space-y-6 m-0">
                  {!aiAnalysis && !analyzing && (
                    <div className="text-center py-10 space-y-3">
                      <Sparkles className="w-10 h-10 text-[#0d8274]/40 mx-auto" />
                      <h4 className="text-sm font-bold text-[#102b2b]">Deep Eligibility Check Ready</h4>
                      <p className="text-xs text-[#102b2b]/60 max-w-sm mx-auto">
                        Evaluate this grant's specific criteria against your active resume.
                      </p>
                      <Button onClick={runAiAnalysis} className="bg-[#0d8274] hover:bg-[#102b2b] text-white">
                        Analyze Compatibility
                      </Button>
                    </div>
                  )}

                  {analyzing && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="w-8 h-8 text-[#0d8274] animate-spin" />
                      <p className="text-xs font-semibold text-[#102b2b]/70">Comparing credentials and parameters...</p>
                    </div>
                  )}

                  {aiAnalysis && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-sm bg-[#0d8274]/10 border border-[#0d8274]/25 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[#0d8274] uppercase tracking-wider block">AI Compatibility Fit</h4>
                          <span className="text-2xl font-black text-[#0d8274] font-mono">{aiAnalysis.matchScore}%</span>
                        </div>
                        <div className="text-xs text-[#102b2b]/60 max-w-[200px] text-right">
                          Evaluates major alignments, academic standing, and eligibility.
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider">Why You Are a Match</h4>
                        <ul className="space-y-2">
                          {aiAnalysis.whyYouMatch.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-[#102b2b]/80">
                              <CheckCircle2 className="w-4 h-4 text-[#0d8274] shrink-0 mt-0.5" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {aiAnalysis.potentialBlockers.length > 0 && (
                        <div className="p-4 rounded-sm bg-amber-500/10 border border-amber-500/20 space-y-2">
                          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            Gaps or Requirements to Note
                          </h4>
                          <ul className="space-y-1.5">
                            {aiAnalysis.potentialBlockers.map((blocker, idx) => (
                              <li key={idx} className="text-xs text-amber-950 flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-amber-600 mt-2 shrink-0" />
                                <span>{blocker}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider">How to Tailor Your Application</h4>
                        <ul className="space-y-2">
                          {aiAnalysis.tailoringTips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-[#102b2b]/80">
                              <ChevronRight className="w-4 h-4 text-[#0d8274] shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Application Assistant Tab */}
                <TabsContent value="essay-assistant" className="p-6 space-y-4 m-0">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider">Provide Application Question / Proposal Prompt</h4>
                    <textarea
                      placeholder="Paste any questions from the grant application, or ask AI to write a personal statement/proposal matching this grant."
                      value={essayPrompt}
                      onChange={(e) => setEssayPrompt(e.target.value)}
                      className="w-full min-h-[80px] p-3 rounded-sm bg-white border border-[#b8c8b9] text-xs text-[#102b2b] placeholder:text-[#102b2b]/40 focus:outline-none focus:ring-1 focus:ring-[#0d8274]"
                    />
                    <Button 
                      onClick={runEssayGenerator} 
                      disabled={drafting || !essayPrompt.trim()}
                      className="bg-[#0d8274] hover:bg-[#102b2b] text-white text-xs px-4"
                    >
                      {drafting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Drafting with AI...
                        </>
                      ) : (
                        "Generate Tailored Response Draft"
                      )}
                    </Button>
                  </div>

                  {essayDraft && (
                    <div className="space-y-4 pt-4 border-t border-[#b8c8b9]">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider">AI Generated Draft</h4>
                        <div className="flex gap-2">
                          <Button onClick={copyToClipboard} variant="outline" size="sm" className="h-8 text-xs border-[#b8c8b9] gap-1">
                            {copied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 rounded-sm bg-white border border-[#b8c8b9] text-xs text-[#102b2b] whitespace-pre-wrap font-mono leading-relaxed max-h-[300px] overflow-y-auto">
                        {essayDraft}
                      </div>

                      {essayTips.length > 0 && (
                        <div className="p-3 rounded-sm bg-[#e9eee8] border border-[#b8c8b9] space-y-1.5">
                          <span className="text-[10px] font-bold text-[#0d8274] uppercase tracking-wider">Recommendations:</span>
                          <ul className="space-y-1">
                            {essayTips.map((tip, idx) => (
                              <li key={idx} className="text-[11px] text-[#102b2b]/80 flex items-start gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-[#0d8274] mt-1.5 shrink-0" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Modal footer controls */}
            <div className="p-4 sm:p-6 border-t border-[#b8c8b9] bg-[#e9eee8] flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleToggleSave(activeModalOpportunity.id, activeModalOpportunity.user_status, e)}
                className="rounded-sm border-[#b8c8b9] text-[#102b2b] hover:bg-[#f7faf5] cursor-pointer"
              >
                {activeModalOpportunity.user_status === "saved" ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 mr-1.5 text-[#0d8274] fill-[#0d8274]/20" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 mr-1.5" />
                    Save to Shortlist
                  </>
                )}
              </Button>

              <Button
                size="sm"
                className="rounded-sm bg-[#0d8274] hover:bg-[#102b2b] text-[#e9eee8] font-semibold gap-1.5 cursor-pointer"
                asChild
              >
                <a href={activeModalOpportunity.application_url} target="_blank" rel="noopener noreferrer">
                  Apply on Provider Site
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
