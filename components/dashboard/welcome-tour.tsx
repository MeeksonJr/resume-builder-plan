"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, X, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Step {
    id: string
    label: string
    href: string
    isCompleted: boolean
}

interface WelcomeTourProps {
    resumesCount: number
    applicationsCount: number
    interviewsCount: number
    hasPortfolio: boolean
}

export function WelcomeTour({
    resumesCount,
    applicationsCount,
    interviewsCount,
    hasPortfolio
}: WelcomeTourProps) {
    const [isVisible, setIsVisible] = React.useState(true)
    const router = useRouter()

    React.useEffect(() => {
        const dismissed = localStorage.getItem("welcome_tour_dismissed")
        if (dismissed === "true") {
            setIsVisible(false)
        }
    }, [])

    const steps: Step[] = [
        {
            id: "resume",
            label: "Create your first AI Resume",
            href: "/dashboard/resume/new",
            isCompleted: resumesCount > 0
        },
        {
            id: "portfolio",
            label: "Set up your Portfolio",
            href: "/dashboard/profile",
            isCompleted: hasPortfolio
        },
        {
            id: "tracker",
            label: "Track a Job Application",
            href: "/dashboard/tracker",
            isCompleted: applicationsCount > 0
        },
        {
            id: "interview",
            label: "Practice for an Interview",
            href: "/dashboard/interview-prep",
            isCompleted: interviewsCount > 0
        }
    ]

    const completedCount = steps.filter(s => s.isCompleted).length
    const progress = (completedCount / steps.length) * 100

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem("welcome_tour_dismissed", "true")
    }

    if (!isVisible || completedCount === steps.length) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="relative mb-8 overflow-hidden"
            >
                <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 backdrop-blur-xl">
                    <div className="absolute top-0 right-0 p-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
                            onClick={handleDismiss}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                                    <Sparkles className="h-4 w-4" />
                                    <span>Welcome to ResumeForge</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight">
                                    Let's get you job-ready
                                </h2>
                                <p className="text-muted-foreground max-w-xl text-lg font-medium leading-relaxed">
                                    Complete these steps to maximize your chances of landing your dream job.
                                </p>
                            </div>

                            <div className="space-y-2 max-w-sm">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>Progress</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-3" />
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {steps.map((step, i) => (
                                <div
                                    key={step.id}
                                    onClick={() => !step.isCompleted && router.push(step.href)}
                                    className={cn(
                                        "group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
                                        step.isCompleted
                                            ? "bg-primary/10 border-primary/20 opacity-60 cursor-default"
                                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 shrink-0 rounded-full flex items-center justify-center transition-colors",
                                        step.isCompleted ? "bg-primary text-primary-foreground" : "bg-white/10 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                                    )}>
                                        {step.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span className="font-bold">{i + 1}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "font-bold truncate transition-colors",
                                            step.isCompleted ? "text-muted-foreground line-through decoration-primary/50" : "text-foreground group-hover:text-primary"
                                        )}>
                                            {step.label}
                                        </p>
                                    </div>
                                    {!step.isCompleted && (
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
