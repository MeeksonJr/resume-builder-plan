"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Coins,
    TrendingUp,
    Sparkles,
    CheckCircle2,
    Loader2,
    MapPin,
    ArrowUpRight,
    ArrowDownRight,
    CircleDot,
    Save,
    History,
    Pin,
    Trash2,
    Search,
    SlidersHorizontal,
    Unlock,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface SalaryInsightsContentProps {
    profile: any;
    resumes: any[];
}

interface SalaryInsightsAnalysis {
    id?: string;
    currency: string;
    low: number;
    median: number;
    high: number;
    marketDemand: "High" | "Moderate" | "Steady";
    locationMultiplier: number;
    skillsValuation: { skill: string; estimatedBoost: string; explanation: string }[];
    negotiationPoints: string[];
    is_pinned?: boolean;
}

export function SalaryInsightsContent({ profile, resumes }: SalaryInsightsContentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [insights, setInsights] = useState<SalaryInsightsAnalysis | null>(null);
    const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
    const [targetRole, setTargetRole] = useState(profile?.target_role || "");
    const [locationInput, setLocationInput] = useState(profile?.location || "Remote");
    
    // History and Filter States
    const [savedHistory, setSavedHistory] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPinned, setFilterPinned] = useState(false);
    const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);

    const isProUser = profile?.is_pro === true ||
                      profile?.subscription_status === "active" ||
                      profile?.subscription_status === "trialing";

    useEffect(() => {
        loadSavedHistory();
    }, []);

    const loadSavedHistory = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("saved_salary_insights")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setSavedHistory(data || []);
        } catch (error) {
            console.error("Error loading saved history:", error);
        }
    };

    const runAnalysis = async () => {
        if (!selectedResumeId) {
            toast.error("Please select a resume to analyze.");
            return;
        }
        if (!targetRole.trim()) {
            toast.error("Please enter a target role (e.g. Senior React Developer).");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/ai/career/salary-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resumeId: selectedResumeId,
                    targetRole: targetRole.trim(),
                    location: locationInput.trim()
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                if (response.status === 429 && errData.error === "LIMIT_EXCEEDED") {
                    throw new Error(errData.message);
                }
                throw new Error("Failed to run salary insights analysis");
            }

            const data = await response.json();
            setInsights(data);
            toast.success("Salary insights calculated successfully!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to query salary insights. Check your AI keys.");
        } finally {
            setIsLoading(false);
        }
    };

    const saveInsights = async () => {
        if (!insights) return;

        setIsSaving(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Direct check for free tier limit (maximum 1 saved item)
            if (!isProUser && savedHistory.length >= 1) {
                toast.error("Free plan limit reached. Free users can only save 1 Salary Insight. Please upgrade to Pro or delete your existing saved item.", {
                    duration: 6000,
                });
                setIsSaving(false);
                return;
            }

            const { data, error } = await supabase
                .from("saved_salary_insights")
                .insert({
                    user_id: user.id,
                    resume_id: selectedResumeId || null,
                    target_role: targetRole.trim(),
                    location: locationInput.trim(),
                    currency: insights.currency,
                    low: insights.low,
                    median: insights.median,
                    high: insights.high,
                    market_demand: insights.marketDemand,
                    location_multiplier: insights.locationMultiplier,
                    skills_valuation: insights.skillsValuation,
                    negotiation_points: insights.negotiationPoints,
                })
                .select()
                .single();

            if (error) throw error;

            setInsights({ ...insights, id: data.id });
            await loadSavedHistory();
            toast.success("Salary insight saved successfully!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save salary insight");
        } finally {
            setIsSaving(false);
        }
    };

    const togglePin = async (id: string, currentPinned: boolean) => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("saved_salary_insights")
                .update({ is_pinned: !currentPinned })
                .eq("id", id);

            if (error) throw error;
            
            setSavedHistory(prev =>
                prev.map(item => item.id === id ? { ...item, is_pinned: !currentPinned } : item)
            );
            
            if (insights?.id === id) {
                setInsights(prev => prev ? { ...prev, is_pinned: !currentPinned } : null);
            }
            
            toast.success(currentPinned ? "Unpinned from history" : "Pinned to top of history");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to pin item");
        }
    };

    const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Avoid loading the clicked item
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("saved_salary_insights")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setSavedHistory(prev => prev.filter(item => item.id !== id));
            if (insights?.id === id) {
                // Remove ID so it can be saved again if desired
                setInsights(prev => prev ? { ...prev, id: undefined } : null);
            }
            toast.success("Insight deleted from history");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to delete insight");
        }
    };

    const loadFromHistory = (item: any) => {
        setInsights({
            id: item.id,
            currency: item.currency,
            low: Number(item.low),
            median: Number(item.median),
            high: Number(item.high),
            marketDemand: item.market_demand,
            locationMultiplier: Number(item.location_multiplier),
            skillsValuation: item.skills_valuation || [],
            negotiationPoints: item.negotiation_points || [],
            is_pinned: item.is_pinned
        });
        setTargetRole(item.target_role);
        setLocationInput(item.location);
        if (item.resume_id) {
            setSelectedResumeId(item.resume_id);
        }
        setShowHistoryPanel(false);
        toast.info(`Loaded saved report for ${item.target_role}`);
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getMarkerPercentage = (val: number, low: number, high: number) => {
        if (high <= low) return 50;
        const pct = ((val - low) / (high - low)) * 100;
        return Math.min(Math.max(pct, 5), 95);
    };

    // Filter and Sort History
    const filteredHistory = savedHistory
        .filter(item => {
            const matchesSearch = item.target_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  item.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPinned = filterPinned ? item.is_pinned : true;
            return matchesSearch && matchesPinned;
        })
        .sort((a, b) => {
            // Pinned items always stay on top
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortBy === "newest" ? dateB - dateA : dateA - dateB;
        });

    return (
        <div className="space-y-6">
            {/* Limit Warning/Upgrade Callout */}
            {!isProUser && (
                <div className="flex items-center justify-between border border-amber-200 bg-amber-50/50 p-4 rounded-none">
                    <div className="flex gap-2.5 items-start">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-amber-800">Free Account Limits</p>
                            <p className="text-[11px] text-amber-700 mt-0.5">
                                You can run 1 Salary Insights check per day and save 1 report in your history. Upgrade to Pro for unlimited checks and saves!
                            </p>
                        </div>
                    </div>
                    <Button asChild size="sm" className="rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] font-bold text-xs shrink-0 ml-4 h-8">
                        <a href="/pricing">Upgrade <Unlock className="h-3 w-3 ml-1" /></a>
                    </Button>
                </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border border-[#102b2b]/15 bg-[#f4f7f2] p-4">
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                        variant="outline"
                        className={cn(
                            "h-11 gap-2 rounded-none border-[#102b2b]/25 font-bold text-[#102b2b]",
                            showHistoryPanel && "bg-[#102b2b] text-white hover:bg-[#102b2b]"
                        )}
                    >
                        <History className="h-4 w-4" />
                        History ({savedHistory.length})
                    </Button>
                    
                    {insights && !insights.id && (
                        <Button 
                            onClick={saveInsights} 
                            disabled={isSaving} 
                            className="h-11 gap-2 rounded-none bg-[#0d8274] text-white hover:bg-[#102b2b] font-bold shadow-none"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Search Results
                        </Button>
                    )}

                    {insights?.id && (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="h-10 gap-2 rounded-none border border-[#0d8274]/20 bg-[#0d8274]/10 px-4 font-bold text-[#0d8274]">
                                <CheckCircle2 className="h-4 w-4" />
                                Saved to History
                            </Badge>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => togglePin(insights.id!, insights.is_pinned || false)}
                                className="h-10 w-10 border-[#102b2b]/15 rounded-none text-[#102b2b]/70 hover:text-[#102b2b]"
                            >
                                <Pin className={cn("h-4 w-4", insights.is_pinned && "fill-[#0d8274] text-[#0d8274]")} />
                            </Button>
                        </div>
                    )}
                </div>

                {insights && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setInsights(null);
                        }}
                        className="h-11 text-xs font-bold text-[#102b2b]/60 hover:text-[#102b2b] hover:bg-transparent"
                    >
                        Clear Screen
                    </Button>
                )}
            </div>

            {/* History Panel */}
            <AnimatePresence>
                {showHistoryPanel && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border border-[#102b2b]/15 bg-white p-5 space-y-4"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#102b2b]/10 pb-4">
                            <h3 className="text-sm font-bold text-[#102b2b] uppercase tracking-wider flex items-center gap-2">
                                <History className="h-4 w-4 text-[#0d8274]" />
                                Salary Search History
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                {/* Search */}
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by role or location..."
                                        className="h-9 w-full sm:w-60 pl-9 rounded-none border-[#102b2b]/15 text-xs bg-white"
                                    />
                                </div>
                                {/* Filter Pin */}
                                <Button
                                    size="sm"
                                    variant={filterPinned ? "secondary" : "outline"}
                                    onClick={() => setFilterPinned(!filterPinned)}
                                    className="h-9 gap-1.5 rounded-none border-[#102b2b]/15 text-xs font-bold text-[#102b2b]"
                                >
                                    <Pin className={cn("h-3.5 w-3.5", filterPinned && "fill-[#0d8274] text-[#0d8274]")} />
                                    {filterPinned ? "Pinned Only" : "All Saved"}
                                </Button>
                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={(e: any) => setSortBy(e.target.value)}
                                    className="h-9 px-2 text-xs font-bold border border-[#102b2b]/15 rounded-none bg-white text-[#102b2b]"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>
                        </div>

                        {filteredHistory.length === 0 ? (
                            <div className="text-center py-10 text-xs text-muted-foreground italic border border-dashed border-[#102b2b]/10">
                                {savedHistory.length === 0 ? "Your search history is empty." : "No saved reports match your search criteria."}
                            </div>
                        ) : (
                            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {filteredHistory.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => loadFromHistory(item)}
                                        className={cn(
                                            "group border p-4 bg-[#fcfdfe] hover:bg-[#e9eee8]/35 transition-all duration-200 cursor-pointer relative flex flex-col justify-between min-h-[140px]",
                                            insights?.id === item.id ? "border-[#0d8274] bg-[#e9eee8]/10" : "border-[#102b2b]/10"
                                        )}
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex items-start justify-between">
                                                <span className="font-heading font-black text-xs text-[#102b2b] block truncate pr-8">
                                                    {item.target_role}
                                                </span>
                                                <div className="flex items-center gap-1.5 absolute right-3 top-3">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            togglePin(item.id, item.is_pinned);
                                                        }}
                                                        className="h-7 w-7 opacity-50 hover:opacity-100 rounded-none hover:bg-transparent"
                                                    >
                                                        <Pin className={cn("h-3.5 w-3.5", item.is_pinned && "fill-[#0d8274] text-[#0d8274] opacity-100")} />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={(e) => deleteHistoryItem(item.id, e)}
                                                        className="h-7 w-7 text-red-600 hover:text-red-700 opacity-50 hover:opacity-100 rounded-none hover:bg-transparent"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                                                <MapPin className="h-3 w-3 shrink-0 text-[#0d8274]" />
                                                <span>{item.location}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between border-t border-[#102b2b]/5 pt-3 mt-4">
                                            <span className="font-mono text-xs font-black text-[#0d8274]">
                                                {formatCurrency(Number(item.median), item.currency)}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground font-bold">
                                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Dashboard Form */}
            <Card className="border border-[#102b2b]/15 bg-white shadow-none rounded-none">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-heading font-black flex items-center gap-2">
                        <Coins className="h-5 w-5 text-[#0d8274]" />
                        Salary Insights Engine
                    </CardTitle>
                    <CardDescription>
                        Estimate market rate salary ranges and premium skills values based on your target role, location, and resume.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Resume Selector */}
                        <div className="space-y-2">
                            <Label htmlFor="resume-select" className="text-sm font-bold">Select Resume</Label>
                            <select
                                id="resume-select"
                                value={selectedResumeId}
                                onChange={(e) => setSelectedResumeId(e.target.value)}
                                className="w-full h-11 px-3 border border-[#102b2b]/15 bg-white text-[#102b2b] text-sm focus:outline-none focus:ring-1 focus:ring-[#0d8274] transition-all rounded-none"
                            >
                                <option value="" disabled>Select a resume...</option>
                                {resumes.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Target Role Input */}
                        <div className="space-y-2">
                            <Label htmlFor="target-role-input" className="text-sm font-bold">Target Role</Label>
                            <Input
                                id="target-role-input"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. Senior Software Engineer"
                                className="h-11 rounded-none border-[#102b2b]/15 bg-white text-[#102b2b]"
                            />
                        </div>

                        {/* Location Input */}
                        <div className="space-y-2">
                            <Label htmlFor="location-input" className="text-sm font-bold">Target Location</Label>
                            <Input
                                id="location-input"
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                placeholder="e.g. New York, NY or Remote"
                                className="h-11 rounded-none border-[#102b2b]/15 bg-white text-[#102b2b]"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={runAnalysis}
                        disabled={isLoading || !selectedResumeId || !targetRole.trim()}
                        className="rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] h-11 px-6 font-bold w-full md:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing Compensation...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Get Salary Insights
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Results Render */}
            <AnimatePresence mode="wait">
                {insights && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Compensation Range Slider Visualizer */}
                        <Card className="border border-[#102b2b]/15 bg-white shadow-none rounded-none">
                            <CardHeader className="pb-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#0d8274]">Annual Base Compensation</span>
                                <CardTitle className="text-xl font-heading font-black">Benchmark Salary Curve</CardTitle>
                                <CardDescription>Estimated compensation ranges for <strong>{targetRole}</strong> in <strong>{locationInput}</strong></CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-4 pb-6">
                                {/* Track Gauge */}
                                <div className="relative pt-6 px-2">
                                    {/* Slider Line Track */}
                                    <div className="h-2 w-full bg-[#102b2b]/10 rounded-full relative">
                                        {/* Highlighted Middle Range */}
                                        <div 
                                            className="absolute h-full bg-[#0d8274]/20" 
                                            style={{ left: "15%", right: "15%" }}
                                        />
                                    </div>

                                    {/* Tick Markers */}
                                    <div className="absolute top-[22px] w-full flex justify-between px-1 text-[10px] font-bold text-muted-foreground">
                                        <div className="flex flex-col items-center">
                                            <CircleDot className="h-3 w-3 text-red-500 fill-white" />
                                            <span className="mt-1">Low End</span>
                                            <span className="font-mono text-[#102b2b]">{formatCurrency(insights.low, insights.currency)}</span>
                                        </div>
                                        <div className="flex flex-col items-center absolute" style={{ left: "50%", transform: "translateX(-50%)" }}>
                                            <CircleDot className="h-3 w-3 text-[#102b2b] fill-white" />
                                            <span className="mt-1">Median</span>
                                            <span className="font-mono text-[#102b2b]">{formatCurrency(insights.median, insights.currency)}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <CircleDot className="h-3 w-3 text-green-500 fill-white" />
                                            <span className="mt-1">High End</span>
                                            <span className="font-mono text-[#102b2b]">{formatCurrency(insights.high, insights.currency)}</span>
                                        </div>
                                    </div>

                                    {/* Current Adjusted Median Marker Pin */}
                                    <motion.div 
                                        className="absolute -top-3 flex flex-col items-center group cursor-help z-10"
                                        style={{ left: `${getMarkerPercentage(insights.median * insights.locationMultiplier, insights.low, insights.high)}%`, transform: "translateX(-50%)" }}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                                    >
                                        <div className="bg-[#102b2b] text-[#d8f36b] text-xs font-black px-2.5 py-1.5 shadow-md flex items-center gap-1">
                                            <MapPin className="h-3 w-3 shrink-0 text-[#d8f36b]" />
                                            {formatCurrency(insights.median * insights.locationMultiplier, insights.currency)}
                                        </div>
                                        <div className="w-1.5 h-1.5 bg-[#102b2b] rotate-45 -mt-1" />
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-[#102b2b]/60 mt-1">Location Adjusted</span>
                                    </motion.div>
                                </div>

                                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 border-t border-[#102b2b]/10 pt-6 mt-10">
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Market Demand</span>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-[#0d8274]" />
                                            <span className="font-black text-sm text-[#102b2b]">{insights.marketDemand} Demand</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Location Multiplier</span>
                                        <div className="flex items-center gap-1.5">
                                            {insights.locationMultiplier >= 1.0 ? (
                                                <ArrowUpRight className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <ArrowDownRight className="h-4 w-4 text-red-600" />
                                            )}
                                            <span className="font-black text-sm text-[#102b2b]">{insights.locationMultiplier}x</span>
                                            <span className="text-[10px] text-muted-foreground">({insights.locationMultiplier >= 1.0 ? `+${Math.round((insights.locationMultiplier - 1.0) * 100)}%` : `-${Math.round((1.0 - insights.locationMultiplier) * 100)}%`})</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 col-span-2 sm:col-span-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Target Region</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-sm text-[#102b2b]">{locationInput}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* High-Value Skills premiums & negotiation points */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Skills Premium Valuation */}
                            <Card className="border border-[#102b2b]/15 bg-white shadow-none rounded-none">
                                <CardHeader>
                                    <CardTitle className="text-md font-bold flex items-center gap-2">
                                        <Coins className="h-4 w-4 text-[#0d8274]" />
                                        High-Value Resume Skills
                                    </CardTitle>
                                    <CardDescription>Premium skills present on your resume that drive higher starting pay</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {insights.skillsValuation.length === 0 ? (
                                        <div className="text-xs text-muted-foreground italic p-4 text-center border border-dashed border-[#102b2b]/10">
                                            No skill premium valuations available.
                                        </div>
                                    ) : (
                                        insights.skillsValuation.map((item, idx) => (
                                            <div key={idx} className="border border-[#102b2b]/10 p-3.5 bg-[#f5f7f2]/40 hover:bg-[#f5f7f2] transition-all flex items-start gap-4">
                                                <div className="bg-[#102b2b] text-[#d8f36b] font-mono font-bold text-xs px-2.5 py-1 shrink-0 mt-0.5">
                                                    {item.estimatedBoost}
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="font-black text-xs text-[#102b2b] block">{item.skill}</span>
                                                    <p className="text-[11px] text-[#102b2b]/70 leading-relaxed">
                                                        {item.explanation}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            {/* Custom Negotiation Strategy Guide */}
                            <Card className="border border-[#102b2b]/15 bg-white shadow-none rounded-none">
                                <CardHeader>
                                    <CardTitle className="text-md font-bold flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-[#0d8274]" />
                                        Negotiation Strategies
                                    </CardTitle>
                                    <CardDescription>Custom strategies leveraging your specific project achievements</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {insights.negotiationPoints.map((point, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-xs leading-5 text-[#102b2b]/80">
                                                <div className="h-1.5 w-1.5 rounded-full bg-[#0d8274] shrink-0 mt-2" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
