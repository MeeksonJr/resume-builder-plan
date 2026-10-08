"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, GraduationCap, ArrowRight, BookOpen } from "lucide-react"

interface CanvasCourseWidgetProps {
  hasConfig: boolean
  courses: any[]
  assignments: any[]
  grades: any[]
}

export function CanvasCourseWidget({ hasConfig, courses, assignments, grades }: CanvasCourseWidgetProps) {
  if (!hasConfig) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden text-card-foreground">
        <CardHeader className="pb-3 flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">Canvas LMS Connection</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Import your academic coursework</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Link your Canvas account to automatically synchronize your coursework, assignments, and GPA. This feeds directly into our AI Matcher and Interview Lab to customize prep based on your current classes.
          </p>
          <Button asChild size="sm" className="h-10 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm">
            <Link href="/dashboard/settings" className="flex items-center gap-2">
              Connect Canvas LMS <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Map grades by course ID
  const gradesMap = new Map(grades.map(g => [g.canvas_course_id, g]))

  // Find assignments due in the future
  const today = new Date()
  const upcomingAssignments = assignments
    .filter(a => a.due_at && new Date(a.due_at) > today)
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
    .slice(0, 4)

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden text-card-foreground">
      <CardHeader className="pb-3 border-b border-border bg-muted/30 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">LMS Coursework</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Synced from Canvas</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary hover:bg-muted h-8 rounded-lg">
            <Link href="/dashboard/canvas">Workspace</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-xs font-medium text-muted-foreground hover:bg-muted h-8 rounded-lg">
            <Link href="/dashboard/settings">Settings</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 space-y-5">
        {/* Course Grades List */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Current Enrollments & Grades
          </h4>
          {courses.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No courses synced yet. Click sync in settings.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {courses.slice(0, 6).map((course) => {
                const gradeInfo = gradesMap.get(course.canvas_course_id)
                return (
                  <div key={course.id} className="p-2.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between gap-2 hover:border-primary/50 transition-colors">
                    <Link href={`/dashboard/canvas/${course.canvas_course_id}`} className="min-w-0 flex-1 block">
                      <p className="text-xs font-bold text-foreground truncate leading-tight hover:text-primary" title={course.name}>
                        {course.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate">
                        {course.course_code || "Class"}
                      </p>
                    </Link>
                    {gradeInfo && (
                      <div className="text-right shrink-0">
                        <Badge className="rounded-md bg-primary text-primary-foreground font-bold font-mono text-[10px] px-1.5 py-0.5">
                          {gradeInfo.current_grade || "N/A"}
                        </Badge>
                        {gradeInfo.current_score && (
                          <p className="text-[9px] text-muted-foreground font-bold font-mono mt-0.5">
                            {gradeInfo.current_score.toFixed(1)}%
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Assignments Deadline checklist */}
        <div className="space-y-2.5 pt-1 border-t border-border">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Upcoming Assignments
          </h4>
          {upcomingAssignments.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No upcoming assignments found.</p>
          ) : (
            <div className="space-y-2">
              {upcomingAssignments.map((assign) => {
                return (
                  <div key={assign.id} className="p-2.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate" title={assign.name}>
                        {assign.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>Due: {new Date(assign.due_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    {assign.points_possible && (
                      <div className="shrink-0 text-right">
                        <Badge variant="outline" className="rounded-md text-muted-foreground border-border font-mono text-[9px] px-1.5 py-0.5">
                          {assign.points_possible} pts
                        </Badge>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
