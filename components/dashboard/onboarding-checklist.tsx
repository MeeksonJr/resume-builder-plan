"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    CheckCircle2,
    Lock,
    ChevronRight,
    Sparkles,
    Trophy,
    FileText,
    Target,
    Briefcase,
    Mic,
    TrendingUp,
    Globe,
    ChevronDown,
    ChevronUp,
    X
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { computeCareerMilestones, MilestoneBadge } from "@/lib/profile/gamification"

interface OnboardingChecklistProps {
    resumeCount: number
    atsScore?: number
    savedAtsCount?: number
    applicationsCount?: number
    interviewsCount?: number
    salaryInsightsCount?: number
    hasPortfolio?: boolean
    isPro?: boolean
}

export function OnboardingChecklist({
    resumeCount,
    atsScore = 0,
    savedAtsCount = 0,
    applicationsCount = 0,
    interviewsCount = 0,
    salaryInsightsCount = 0,
    hasPortfolio = false,
    isPro = false,
}: OnboardingChecklistProps) {
    const [isVisible, setIsVisible] = useState(true)
    const [isExpanded, setIsExpanded] = useState(true)

    useEffect(() => {
        const dismissed = localStorage.getItem("career_launchpad_dismissed")
        if (dismissed === "true") {
            setIsVisible(false)
        }
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem("career_launchpad_dismissed", "true")
    }

    const {
        badges,
        unlockedCount,
        totalCount,
        completionPercentage,
        levelTitle,
        isAllCompleted,
    } = computeCareerMilestones({
        resumeCount,
        atsScore,
        savedAtsCount,
        applicationsCount,
        interviewsCount,
        salaryInsightsCount,
        hasPortfolio,
    })

    if (!isVisible) return null

    const renderIcon = (iconName: string, isUnlocked: boolean) => {
        const props = { className: cn("h-4 w-4", isUnlocked ? "text-[#102b2b]" : "text-[#52716a]") }
        switch (iconName) {
            case "FileText": return <FileText {...props} />
            case "Target": return <Target {...props} />
            case "Briefcase": return <Briefcase {...props} />
            case "Mic": return <Mic {...props} />
            case "TrendingUp": return <TrendingUp {...props} />
            case "Globe": return <Globe {...props} />
            default: return <Sparkles {...props} />
        }
    }

    return (
        <Card className="rounded-none border-[#102b2b]/15 bg-[#f8f4ec] shadow-[6px_6px_0_rgba(16,43,43,0.06)] overflow-hidden transition-all mb-8">
            {/* Top Command Banner */}
            <CardHeader className="bg-[#102b2b] text-[#f8f4ec] p-5 sm:p-6 border-b border-[#102b2b]/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center bg-[#d8f36b] text-[#102b2b]">
                                <Trophy className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d8f36b]">
                                Career Launchpad & Milestones
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
                            <span>{levelTitle}</span>
                            <span className="text-xs font-mono font-bold px-2 py-0.5 border border-[#d8f36b]/40 bg-[#d8f36b]/10 text-[#d8f36b]">
                                {completionPercentage}%
                            </span>
                        </h2>
                        <p className="text-xs text-[#a6c0b8] max-w-xl">
                            Unlock every core tool in your career arsenal to maximize interview conversion rates.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-8 rounded-none text-xs font-bold text-[#c5d7d1] hover:bg-white/10 hover:text-white"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="h-3.5 w-3.5 mr-1" /> Collapse
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-3.5 w-3.5 mr-1" /> Expand ({unlockedCount}/{totalCount})
                                </>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDismiss}
                            className="h-8 w-8 rounded-none text-[#c5d7d1] hover:bg-white/10 hover:text-white"
                            title="Dismiss Launchpad"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-4">
                    <div className="flex-1 bg-white/10 h-2 overflow-hidden">
                        <div
                            className="h-full bg-[#d8f36b] transition-all duration-700 ease-out"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#d8f36b] whitespace-nowrap">
                        {unlockedCount} of {totalCount} Badges Unlocked
                    </span>
                </div>
            </CardHeader>

            {/* Badges Grid */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CardContent className="p-5 sm:p-6">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {badges.map((badge) => (
                                    <div
                                        key={badge.id}
                                        className={cn(
                                            "flex flex-col justify-between p-4 border transition-all",
                                            badge.isUnlocked
                                                ? "bg-white border-[#102b2b]/20 shadow-sm"
                                                : "bg-[#f2efe6] border-[#102b2b]/10 opacity-80 hover:opacity-100 hover:bg-white"
                                        )}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className={cn(
                                                        "flex h-8 w-8 items-center justify-center border",
                                                        badge.isUnlocked
                                                            ? "bg-[#d8f36b] border-[#102b2b]/20"
                                                            : "bg-white border-[#102b2b]/15"
                                                    )}
                                                >
                                                    {renderIcon(badge.iconName, badge.isUnlocked)}
                                                </div>

                                                {badge.isUnlocked ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#0d8274] bg-[#0d8274]/10 px-2 py-0.5">
                                                        <CheckCircle2 className="h-3 w-3" /> Unlocked
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#52716a] bg-black/5 px-2 py-0.5">
                                                        <Lock className="h-3 w-3" /> Locked
                                                    </span>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-black tracking-tight text-[#102b2b]">
                                                    {badge.title}
                                                </h3>
                                                <p className="text-[11px] font-bold text-[#0d8274] uppercase tracking-wider">
                                                    {badge.subtitle}
                                                </p>
                                                <p className="mt-1 text-xs text-[#52716a] leading-relaxed line-clamp-2">
                                                    {badge.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-[#102b2b]/10 flex items-center justify-between">
                                            <span className="text-[11px] font-mono text-[#52716a]">
                                                {badge.progressText}
                                            </span>

                                            {!badge.isUnlocked ? (
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 rounded-none border-[#102b2b]/20 text-[11px] font-bold text-[#102b2b] hover:bg-[#d8f36b]/40 px-2.5 gap-1"
                                                >
                                                    <Link href={badge.href}>
                                                        <span>{badge.ctaText}</span>
                                                        <ChevronRight className="h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Link
                                                    href={badge.href}
                                                    className="text-[11px] font-bold text-[#0d8274] hover:underline flex items-center gap-1"
                                                >
                                                    <span>View</span>
                                                    <ChevronRight className="h-3 w-3" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Completed Banner if 100% */}
                            {isAllCompleted && (
                                <div className="mt-4 p-4 border border-[#0d8274]/30 bg-[#0d8274]/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-[#0d8274]" />
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-wider text-[#102b2b]">
                                                Master Credential Achieved
                                            </p>
                                            <p className="text-xs text-[#52716a]">
                                                You have successfully exercised all key tools in ResumeForge. Your profile is in the top 5% of candidate readiness.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        asChild
                                        size="sm"
                                        className="rounded-none bg-[#102b2b] text-white text-xs font-bold"
                                    >
                                        <Link href="/dashboard/tracker">
                                            Manage Pipeline
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}
