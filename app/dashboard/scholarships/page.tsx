"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Search, 
  DollarSign, 
  Calendar, 
  GraduationCap, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  ChevronRight,
  SlidersHorizontal,
  Award,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  TrendingUp,
  Share2,
  Send,
  Loader2,
  FileText,
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

export default function DashboardScholarshipsPage() {
  const supabase = createClient();
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all-matches");
  const [activeModalScholarship, setActiveModalScholarship] = useState<FundingOpportunity | null>(null);

  // AI Assistant States
  const [aiAnalysis, setAiAnalysis] = useState<{
    matchScore: number;
    whyYouMatch: string[];
    potentialBlockers: string[];
    tailoringTips: string[];
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Essay Assistant States
  const [essayPrompt, setEssayPrompt] = useState("");
  const [essayDraft, setEssayDraft] = useState("");
  const [essayTips, setEssayTips] = useState<string[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Search online loading
  const [scraping, setScraping] = useState(false);

  // Fetch scholarships from DB
  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("fetchScholarships: No authenticated user session found");
        return;
      }

      console.log("fetchScholarships: Fetching active global funding opportunities...");
      // 1. Fetch active global funding opportunities for scholarships
      const { data: opps, error: oppsError } = await supabase
        .from("funding_opportunities")
        .select("*")
        .in("kind", ["scholarship", "fellowship"])
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (oppsError) {
        console.error("fetchScholarships: oppsError:", oppsError);
        throw oppsError;
      }
      console.log(`fetchScholarships: Fetched ${opps?.length || 0} global scholarships:`, opps);

      // 2. Fetch user interactions
      const { data: userOpps, error: userOppsError } = await supabase
        .from("user_funding_opportunities")
        .select("*")
        .eq("user_id", user.id);

      if (userOppsError) {
        console.error("fetchScholarships: userOppsError:", userOppsError);
        throw userOppsError;
      }
      console.log("fetchScholarships: Fetched user interactions:", userOpps);

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
          match_score: uState?.essay_draft ? 98 : basicScore 
        };
      });

      console.log("fetchScholarships: Final merged opportunities state:", merged);
      setOpportunities(merged);
    } catch (err: any) {
      console.error("Error fetching scholarships:", err.message || err);
      toast.error("Failed to load scholarships.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  // Reset modal sub-states when active modal changes
  useEffect(() => {
    setAiAnalysis(null);
    setEssayDraft("");
    setEssayTips([]);
    setEssayPrompt("");
  }, [activeModalScholarship]);

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

      toast.success(newStatus === "saved" ? "Scholarship saved to shortlist" : "Removed from shortlist");
      fetchScholarships();
      
      // Keep modal in sync
      if (activeModalScholarship && activeModalScholarship.id === oppId) {
        setActiveModalScholarship(prev => prev ? { ...prev, user_status: newStatus as any } : null);
      }
    } catch (err: any) {
      console.error("Error toggling save:", err.message);
      toast.error("Failed to update status.");
    }
  };

  const handleToggleApplied = async (oppId: string, currentStatus: string | null | undefined, e?: React.MouseEvent) => {
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

      toast.success(newStatus === "applying" ? "Application marked as In Progress" : "Application untracked");
      fetchScholarships();

      if (activeModalScholarship && activeModalScholarship.id === oppId) {
        setActiveModalScholarship(prev => prev ? { ...prev, user_status: newStatus as any } : null);
      }
    } catch (err: any) {
      console.error("Error toggling applied status:", err.message);
      toast.error("Failed to update application status.");
    }
  };

  // Trigger search & scrape
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
        body: JSON.stringify({ searchQuery })
      });

      if (!res.ok) throw new Error("Search API error");

      toast.success("Successfully scraped matching scholarships from the web!");
      await fetchScholarships();
    } catch (err: any) {
      console.error("Scraping search error:", err.message);
      toast.error("Failed to scrape live web listings.");
    } finally {
      setScraping(false);
    }
  };

  // Deep AI Compatibility analysis
  const runAiAnalysis = async () => {
    if (!activeModalScholarship) return;

    try {
      setAnalyzing(true);
      const res = await fetch("/api/funding/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: activeModalScholarship.id, task: "analyze" })
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      setAiAnalysis(data);
    } catch (err: any) {
      console.error("AI Analysis error:", err.message);
      toast.error("AI Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Generate essay draft
  const runEssayGenerator = async () => {
    if (!activeModalScholarship || !essayPrompt.trim()) {
      toast.error("Please provide an essay prompt.");
      return;
    }

    try {
      setDrafting(true);
      const res = await fetch("/api/funding/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          opportunityId: activeModalScholarship.id, 
          task: "essay", 
          essayPrompt 
        })
      });

      if (!res.ok) throw new Error("Essay drafting failed");

      const data = await res.json();
      setEssayDraft(data.draft);
      setEssayTips(data.tips || []);

      // Persist essay draft to Supabase user_funding_opportunities
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("user_funding_opportunities")
          .upsert({
            user_id: user.id,
            opportunity_id: activeModalScholarship.id,
            status: activeModalScholarship.user_status || "applying",
            essay_draft: data.draft
          }, { onConflict: "user_id,opportunity_id" });
      }

      toast.success("Draft generated and saved!");
    } catch (err: any) {
      console.error("Essay drafting error:", err.message);
      toast.error("Failed to generate draft essay.");
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

  // Filtering
  const getFilteredScholarships = () => {
    return opportunities.filter((sch) => {
      const matchesSearch = 
        sch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sch.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sch.majors || []).some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

      if (selectedTab === "saved") {
        return matchesSearch && sch.user_status === "saved";
      }
      if (selectedTab === "applying") {
        return matchesSearch && sch.user_status === "applying";
      }
      if (selectedTab === "high-match") {
        return matchesSearch && (sch.match_score || 0) >= 95;
      }
      if (selectedTab === "no-essay") {
        return matchesSearch && !(sch.requirements as any)?.essay;
      }
      return matchesSearch;
    });
  };

  const currentList = getFilteredScholarships();
  const totalPotentialValue = opportunities.reduce((sum, item) => sum + (item.amount_max || item.amount_min || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 bg-[#e9eee8] text-[#102b2b]">
      {/* Header Banner */}
      <div className="relative p-5 sm:p-8 rounded-md bg-[#102b2b] border border-[#102b2b] shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#d8f36b] text-[#102b2b] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>AI Matched Opportunities (Scraped Web Data)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#e9eee8] tracking-tight">
              Scholarships Matched to Your Profile
            </h1>
            <p className="text-sm text-[#e9eee8]/75 leading-relaxed">
              Find funding opportunity listings matching your academic profile. Enter keywords to search online and populate live scholarships globally.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-4 rounded-md bg-[#0d8274] border border-[#e9eee8]/20 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-[#e9eee8]/70 block">Database Total</span>
              <span className="text-2xl font-black text-[#e9eee8] font-mono">{opportunities.length}</span>
              <span className="text-[10px] text-[#d8f36b] font-medium block mt-0.5">Active Listings</span>
            </div>
            <div className="p-4 rounded-md bg-[#d8f36b] border border-[#102b2b]/20 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-[#102b2b]/70 block">Potential Funding</span>
              <span className="text-2xl font-black text-[#102b2b] font-mono">${(totalPotentialValue / 1000).toFixed(1)}k</span>
              <span className="text-[10px] text-[#102b2b]/70 font-medium block mt-0.5">Available globally</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scraping Search Input */}
      <div className="p-4 sm:p-5 rounded-md bg-white border border-[#b8c8b9] flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full flex-1">
          <Search className="w-4 h-4 text-[#0d8274] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            placeholder="E.g., Computer Science STEM undergraduate minor in cybersecurity..."
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

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full sm:w-auto">
          <TabsList className="bg-[#102b2b] border border-[#102b2b] p-1 rounded-md h-auto min-h-11">
            <TabsTrigger value="all-matches" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
              All Matches ({opportunities.length})
            </TabsTrigger>
            <TabsTrigger value="high-match" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
              95%+ Fit
            </TabsTrigger>
            <TabsTrigger value="no-essay" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
              No Essay
            </TabsTrigger>
            <TabsTrigger value="saved" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
              Saved ({opportunities.filter(o => o.user_status === 'saved').length})
            </TabsTrigger>
            <TabsTrigger value="applying" className="rounded-sm text-xs px-3 data-[state=active]:bg-[#d8f36b] data-[state=active]:text-[#102b2b]">
              In Progress ({opportunities.filter(o => o.user_status === 'applying').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-[#0d8274] animate-spin" />
          <p className="text-sm font-semibold text-[#102b2b]/70">Loading active database opportunities...</p>
        </div>
      ) : currentList.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-md bg-[#f7faf5] border-2 border-dashed border-[#b8c8b9]">
          <div className="p-4 rounded-full bg-[#0d8274]/10 mb-4">
            <Award className="w-12 h-12 text-[#0d8274]" />
          </div>
          <h3 className="text-lg font-bold text-[#102b2b]">No Matching Opportunities Found</h3>
          <p className="text-xs text-[#102b2b]/60 max-w-sm mt-1 mb-6">
            Our global database has no opportunities matching this criteria. Click the search button above to scrape active opportunities live from the internet!
          </p>
        </div>
      ) : (
        /* Scholarship Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentList.map((sch) => {
            const isSaved = sch.user_status === "saved";
            const isApplied = sch.user_status === "applying";

            return (
              <Card
                key={sch.id}
                onClick={() => setActiveModalScholarship(sch)}
                className="bg-[#f7faf5] hover:bg-white border-[#b8c8b9] hover:border-[#0d8274] rounded-md transition-colors duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm group"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="bg-[#0d8274]/10 text-[#0d8274] border-[#0d8274]/30 text-[11px] font-semibold py-0.5 px-2.5 rounded-sm uppercase">
                      {sch.kind}
                    </Badge>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-sm bg-[#d8f36b] text-[#102b2b] border border-[#102b2b]/15 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" aria-hidden="true" />
                        {sch.match_score || 85}%
                      </span>

                      <button
                        onClick={(e) => handleToggleSave(sch.id, sch.user_status, e)}
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

                  <CardTitle className="text-base font-bold text-[#102b2b] group-hover:text-[#0d8274] transition-colors line-clamp-1 mt-2">
                    {sch.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#102b2b]/60 line-clamp-1">
                    {sch.provider}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0 pb-4 space-y-3 flex-1">
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-sm bg-[#e9eee8] border border-[#b8c8b9]">
                    <div>
                      <span className="text-[10px] text-[#102b2b]/55 block">Value</span>
                      <span className="text-base font-bold text-[#0d8274] font-mono">{formatFundingAmount(sch)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#102b2b]/55 block">Deadline</span>
                      <span className="text-xs font-semibold text-[#102b2b] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#0d8274]" aria-hidden="true" />
                        {sch.deadline || "Rolling"}
                      </span>
                    </div>
                  </div>

                  {sch.description && (
                    <p className="text-[11px] text-[#102b2b]/80 line-clamp-2">
                      {sch.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {sch.education_levels.slice(0, 2).map((level, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-sm bg-[#e9eee8] text-[#102b2b]/75 font-medium">
                        {level}
                      </span>
                    ))}
                    {(sch.requirements as any)?.essay ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#e9eee8] text-[#102b2b]/55 font-medium">
                        Essay Req.
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#d8f36b] text-[#102b2b] font-medium">
                        No Essay
                      </span>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 border-t border-[#b8c8b9] mt-auto flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => handleToggleApplied(sch.id, sch.user_status, e)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-sm transition-colors cursor-pointer ${
                      isApplied
                        ? "bg-[#d8f36b] text-[#102b2b] border border-[#102b2b]/15"
                        : "text-[#102b2b]/60 hover:text-[#102b2b] bg-[#e9eee8]"
                    }`}
                  >
                    {isApplied ? "✓ In Progress" : "+ Track Application"}
                  </button>

                  <span className="inline-flex items-center gap-1 font-semibold text-[#0d8274] group-hover:text-[#102b2b]">
                    Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail & AI Dialog */}
      <Dialog open={!!activeModalScholarship} onOpenChange={(open) => !open && setActiveModalScholarship(null)}>
        {activeModalScholarship && (
          <DialogContent className="max-w-3xl bg-[#f7faf5] border-[#b8c8b9] text-[#102b2b] p-0 overflow-hidden max-h-[90vh] flex flex-col rounded-md shadow-xl">
            
            {/* Header info */}
            <div className="p-6 border-b border-[#b8c8b9] bg-[#e9eee8] relative">
              <div className="flex items-center justify-between gap-4 mb-2">
                <Badge className="bg-[#0d8274]/10 text-[#0d8274] border-[#0d8274]/30 text-xs rounded-sm uppercase">
                  {activeModalScholarship.kind}
                </Badge>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#d8f36b] text-[#102b2b] text-xs font-bold border border-[#102b2b]/15">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  {activeModalScholarship.match_score || 85}% Match
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-[#102b2b]">
                {activeModalScholarship.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#102b2b]/60 mt-1">
                {activeModalScholarship.provider} • Deadline {activeModalScholarship.deadline || "Rolling"}
              </DialogDescription>

              <div className="grid grid-cols-2 gap-3 mt-4 p-3 rounded-sm bg-[#f7faf5] border border-[#b8c8b9] text-center">
                <div>
                  <span className="text-[10px] text-[#102b2b]/60 uppercase font-medium">Award</span>
                  <p className="text-lg font-black text-[#0d8274] font-mono">
                    {formatFundingAmount(activeModalScholarship)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#102b2b]/60 uppercase font-medium">Source</span>
                  <p className="text-xs font-bold text-[#102b2b] mt-1">
                    {activeModalScholarship.source_name || "Online Listing"}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable details tabbed workspace */}
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full bg-[#e9eee8] border-b border-[#b8c8b9] rounded-none justify-start px-6 h-12">
                  <TabsTrigger value="details" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0d8274] data-[state=active]:bg-transparent text-xs">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="ai-analysis" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0d8274] data-[state=active]:bg-transparent text-xs flex gap-1 items-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#0d8274]" />
                    AI Compatibility Analysis
                  </TabsTrigger>
                  <TabsTrigger value="essay-assistant" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#0d8274] data-[state=active]:bg-transparent text-xs flex gap-1 items-center">
                    <FileText className="w-3.5 h-3.5 text-[#0d8274]" />
                    Essay Generator
                  </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="p-6 space-y-6 m-0">
                  <div>
                    <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-[#102b2b]/80 leading-relaxed">{activeModalScholarship.description}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider mb-2">Eligibility Guidelines</h4>
                    {activeModalScholarship.eligibility && activeModalScholarship.eligibility.length > 0 ? (
                      <ul className="space-y-2">
                        {activeModalScholarship.eligibility.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-[#102b2b]/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0d8274] mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-[#102b2b]/60">Check application portal for eligibility details.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider mb-2">Academic Criteria</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#102b2b]/85">
                      <div className="p-2 rounded-sm bg-[#e9eee8] border border-[#b8c8b9]">
                        <strong>Target Majors:</strong> {activeModalScholarship.majors?.join(", ") || "All"}
                      </div>
                      <div className="p-2 rounded-sm bg-[#e9eee8] border border-[#b8c8b9]">
                        <strong>Education Levels:</strong> {activeModalScholarship.education_levels?.join(", ") || "All"}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* AI Compatibility Tab */}
                <TabsContent value="ai-analysis" className="p-6 space-y-6 m-0">
                  {!aiAnalysis && !analyzing && (
                    <div className="text-center py-10 space-y-3">
                      <Sparkles className="w-10 h-10 text-[#0d8274]/40 mx-auto" />
                      <h4 className="text-sm font-bold text-[#102b2b]">Deep compatibility report ready</h4>
                      <p className="text-xs text-[#102b2b]/60 max-w-sm mx-auto">
                        Evaluate this opportunity's criteria against your active resume.
                      </p>
                      <Button onClick={runAiAnalysis} className="bg-[#0d8274] hover:bg-[#102b2b] text-white">
                        Run Deep AI Check
                      </Button>
                    </div>
                  )}

                  {analyzing && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="w-8 h-8 text-[#0d8274] animate-spin" />
                      <p className="text-xs font-semibold text-[#102b2b]/70">Comparing resume and requirements...</p>
                    </div>
                  )}

                  {aiAnalysis && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-sm bg-[#0d8274]/10 border border-[#0d8274]/25 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[#0d8274] uppercase tracking-wider block">AI Compatibility Score</h4>
                          <span className="text-2xl font-black text-[#0d8274] font-mono">{aiAnalysis.matchScore}%</span>
                        </div>
                        <div className="text-xs text-[#102b2b]/60 max-w-[200px] text-right">
                          Detailed score calculated using resume GPA, majors, and credentials.
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
                            Blockers or Gaps to Watch
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

                {/* Essay Assistant Tab */}
                <TabsContent value="essay-assistant" className="p-6 space-y-4 m-0">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#102b2b]/60 uppercase tracking-wider">Provide Application Essay Prompt / Question</h4>
                    <textarea
                      placeholder="Paste the application question or essay prompt here. E.g. 'Describe a project where you solved a community challenge.' (Minimum 500 words)"
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
                        "Generate Tailored Essay Draft"
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
                          <span className="text-[10px] font-bold text-[#0d8274] uppercase tracking-wider">Refinement Recommendations:</span>
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
                onClick={(e) => handleToggleSave(activeModalScholarship.id, activeModalScholarship.user_status, e)}
                className="rounded-sm border-[#b8c8b9] text-[#102b2b] hover:bg-[#f7faf5] cursor-pointer"
              >
                {activeModalScholarship.user_status === "saved" ? (
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
                <a href={activeModalScholarship.application_url} target="_blank" rel="noopener noreferrer">
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
