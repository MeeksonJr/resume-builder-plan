"use client";

import { useState } from "react";
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
    CircleDot
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SalaryInsightsContentProps {
    profile: any;
    resumes: any[];
}

interface SalaryInsightsAnalysis {
    currency: string;
    low: number;
    median: number;
    high: number;
    marketDemand: "High" | "Moderate" | "Steady";
    locationMultiplier: number;
    skillsValuation: { skill: string; estimatedBoost: string; explanation: string }[];
    negotiationPoints: string[];
}

export function SalaryInsightsContent({ profile, resumes }: SalaryInsightsContentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [insights, setInsights] = useState<SalaryInsightsAnalysis | null>(null);
    const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
    const [targetRole, setTargetRole] = useState(profile?.target_role || "");
    const [locationInput, setLocationInput] = useState(profile?.location || "Remote");

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

            if (!response.ok) throw new Error("Failed to run salary insights analysis");

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

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Calculate marker percentage positioning along the Low-High slider track
    const getMarkerPercentage = (val: number, low: number, high: number) => {
        if (high <= low) return 50;
        const pct = ((val - low) / (high - low)) * 100;
        return Math.min(Math.max(pct, 5), 95); // clamp between 5% and 95% for UI layout safety
    };

    return (
        <div className="space-y-6">
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
