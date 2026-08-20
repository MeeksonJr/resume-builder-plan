"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, FileText, Sparkles, Upload } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Step = {
    id: string
    title: string
    description: string
    href: string
    icon: React.ElementType
    isCompleted: boolean
    cta: string
}

interface OnboardingChecklistProps {
    resumeCount: number
    isPro: boolean
}

export function OnboardingChecklist({ resumeCount, isPro }: OnboardingChecklistProps) {
    const [isVisible, setIsVisible] = useState(true)

    // Define steps based on props
    const steps: Step[] = [
        {
            id: "create-resume",
            title: "Create your first resume",
            description: "Start from scratch or use one of our professional templates.",
            href: "/dashboard/resume/new",
            icon: FileText,
            isCompleted: resumeCount > 0,
            cta: "Create Resume"
        },
        {
            id: "upgrade",
            title: "Unlock Pro features",
            description: "Get access to AI optimization, premium templates, and cover letters.",
            href: "/dashboard/subscription",
            icon: Sparkles,
            isCompleted: isPro,
            cta: "View Plans"
        }
    ]

    const completedCount = steps.filter(s => s.isCompleted).length
    const progress = (completedCount / steps.length) * 100

    // Hide if all completed
    if (completedCount === steps.length || !isVisible) return null

    return (
        <Card className="mb-8 border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-transparent text-muted-foreground"
                    onClick={() => setIsVisible(false)}
                >
                    <span className="sr-only">Dismiss</span>
                    &times;
                </Button>
            </div>
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl">Set up your workspace</CardTitle>
                    <span className="text-sm font-medium text-muted-foreground mr-6">
                        {completedCount}/{steps.length} Steps
                    </span>
                </div>
                <Progress value={progress} className="h-2 w-full max-w-md" />
                <CardDescription className="mt-2">
                    Complete these steps to get the most out of your job search tools.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={cn(
                                "group relative flex flex-col justify-between rounded-xl border p-4 transition-all hover:bg-background/80",
                                step.isCompleted
                                    ? "bg-background/50 border-primary/20 opacity-60"
                                    : "bg-background border-border shadow-sm hover:shadow-md hover:border-primary/50"
                            )}
                        >
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full",
                                        step.isCompleted ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                                    )}>
                                        {step.isCompleted ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                                    </div>
                                    <h3 className={cn("font-semibold", step.isCompleted && "line-through text-muted-foreground")}>
                                        {step.title}
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground pl-11">
                                    {step.description}
                                </p>
                            </div>

                            <div className="pl-11">
                                {step.isCompleted ? (
                                    <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                                        Completed
                                    </span>
                                ) : (
                                    <Link href={step.href}>
                                        <Button size="sm" variant="default" className="w-full sm:w-auto h-8 text-xs gap-1">
                                            {step.cta}
                                            <ChevronRight className="h-3 w-3" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
