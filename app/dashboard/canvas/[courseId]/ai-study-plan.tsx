"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2, BookOpen, AlertCircle, FileText } from "lucide-react"

interface AIStudyPlanWidgetProps {
  courseName: string
  courseCode: string
  assignments: any[]
}

export function AIStudyPlanWidget({ courseName, courseCode, assignments }: AIStudyPlanWidgetProps) {
  const [generating, setGenerating] = useState(false)
  const [studyPlan, setStudyPlan] = useState<string | null>(null)

  const handleGeneratePlan = async () => {
    setGenerating(true)
    try {
      const response = await fetch("/api/user/canvas/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName,
          courseCode,
          assignments: assignments.map(a => ({
            name: a.name,
            due_at: a.due_at,
            points_possible: a.points_possible
          }))
        })
      })

      if (!response.ok) {
        throw new Error("Failed to generate AI study plan.")
      }

      const data = await response.json()
      setStudyPlan(data.studyPlan)
    } catch (error) {
      console.error(error)
      setStudyPlan("Failed to generate plan. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
      <CardHeader className="border-b border-[#102b2b]/10 bg-[#f7faf5] py-4">
        <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-[#0d8274]" />
          AI Course Study Guide
        </CardTitle>
        <CardDescription className="text-xs text-[#52716a]">
          Generate a tailored weekly study guide and preparation checklists for this class.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {!studyPlan ? (
          <div className="space-y-4">
            <p className="text-xs text-[#52716a] leading-relaxed">
              Our AI reviews your upcoming Canvas assignments, points, and deadlines to build a custom weekly prep checklist and study tracker.
            </p>
            <Button
              onClick={handleGeneratePlan}
              disabled={generating || assignments.length === 0}
              className="w-full h-11 rounded-none bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] font-bold text-xs gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Coursework...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Custom Study Plan
                </>
              )}
            </Button>
            {assignments.length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center italic">
                (Generate study plan is disabled because there are no upcoming assignments)
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="prose prose-sm max-h-[380px] overflow-y-auto border border-[#102b2b]/10 p-3 bg-[#f8faf5] text-xs text-[#102b2b] leading-relaxed whitespace-pre-line rounded-none">
              {studyPlan}
            </div>
            <Button
              onClick={() => setStudyPlan(null)}
              variant="outline"
              className="w-full h-10 rounded-none border-[#102b2b]/20 text-xs font-bold"
            >
              Re-generate Guide
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
