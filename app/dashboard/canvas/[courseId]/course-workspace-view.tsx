"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, CheckCircle2, ChevronRight, MessageSquare, Megaphone, FileText } from "lucide-react"

interface CourseWorkspaceViewProps {
  courseId: string
  upcomingAssignments: any[]
  pastAssignments: any[]
  announcements: any[]
  discussions: any[]
}

export function CourseWorkspaceView({
  courseId,
  upcomingAssignments,
  pastAssignments,
  announcements,
  discussions
}: CourseWorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState<"assignments" | "announcements" | "discussions">("assignments")

  return (
    <div className="space-y-6">
      {/* Tab Switcher Headers */}
      <div className="flex border-b border-[#102b2b]/15 gap-2">
        <button
          onClick={() => setActiveTab("assignments")}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "assignments"
              ? "border-[#0d8274] text-[#0d8274]"
              : "border-transparent text-[#52716a] hover:text-[#102b2b]"
          }`}
        >
          Assignments ({upcomingAssignments.length + pastAssignments.length})
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "announcements"
              ? "border-[#0d8274] text-[#0d8274]"
              : "border-transparent text-[#52716a] hover:text-[#102b2b]"
          }`}
        >
          Announcements ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab("discussions")}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "discussions"
              ? "border-[#0d8274] text-[#0d8274]"
              : "border-transparent text-[#52716a] hover:text-[#102b2b]"
          }`}
        >
          Discussions ({discussions.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          {/* Upcoming Assignments */}
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d8274] mb-4 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Upcoming Tasks & Deadlines ({upcomingAssignments.length})
              </h3>
              {upcomingAssignments.length === 0 ? (
                <p className="text-xs text-[#52716a] italic py-4 text-center">No upcoming assignments due.</p>
              ) : (
                <div className="divide-y divide-[#102b2b]/10">
                  {upcomingAssignments.map((assign) => (
                    <Link
                      key={assign.id}
                      href={`/dashboard/canvas/${courseId}/assignments/${assign.canvas_assignment_id}`}
                      className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4 text-xs group hover:bg-[#f8faf5]/40 transition-colors"
                    >
                      <div>
                        <p className="font-extrabold text-sm text-[#102b2b] group-hover:text-[#0d8274] transition-colors">
                          {assign.name}
                        </p>
                        <div className="flex items-center gap-2 text-[#52716a] text-[10px] mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Due: {new Date(assign.due_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right flex items-center gap-3">
                        <div>
                          {assign.points_possible && (
                            <Badge variant="outline" className="rounded-none border-[#102b2b]/10 text-[#0d8274] font-mono text-[9px] px-1.5 py-0.5">
                              {assign.points_possible} pts
                            </Badge>
                          )}
                          <p className="text-[10px] text-amber-600 font-bold uppercase mt-1">
                            {assign.submission_status === "submitted" ? "✓ Submitted" : "Pending Sync"}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#52716a] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past/Closed Assignments */}
          <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#52716a] mb-4 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Completed & Past Assignments ({pastAssignments.length})
              </h3>
              {pastAssignments.length === 0 ? (
                <p className="text-xs text-[#52716a] italic py-4 text-center">No past coursework found.</p>
              ) : (
                <div className="divide-y divide-[#102b2b]/10 max-h-[300px] overflow-y-auto pr-2">
                  {pastAssignments.map((assign) => (
                    <Link
                      key={assign.id}
                      href={`/dashboard/canvas/${courseId}/assignments/${assign.canvas_assignment_id}`}
                      className="py-3 first:pt-0 last:pb-0 flex justify-between items-center gap-4 text-xs group hover:bg-[#f8faf5]/40"
                    >
                      <div>
                        <p className="font-bold text-xs text-[#102b2b]/70 group-hover:text-[#0d8274] truncate max-w-md">{assign.name}</p>
                        <p className="text-[9px] text-[#52716a] mt-0.5">
                          Closed: {assign.due_at ? new Date(assign.due_at).toLocaleDateString() : "No date"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {assign.points_possible && (
                          <span className="text-[10px] font-mono text-[#52716a]">{assign.points_possible} pts</span>
                        )}
                        <ChevronRight className="w-4 h-4 text-[#52716a]/50 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "announcements" && (
        <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d8274] mb-4 flex items-center gap-1.5">
              <Megaphone className="w-4 h-4" />
              Latest Course Announcements ({announcements.length})
            </h3>
            {announcements.length === 0 ? (
              <p className="text-xs text-[#52716a] italic py-6 text-center">No announcements posted for this course.</p>
            ) : (
              <div className="divide-y divide-[#102b2b]/10">
                {announcements.map((announce) => (
                  <Link
                    key={announce.id}
                    href={`/dashboard/canvas/${courseId}/announcements/${announce.id}`}
                    className="py-4 first:pt-0 last:pb-0 block group hover:bg-[#f8faf5]/40"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-extrabold text-sm text-[#102b2b] group-hover:text-[#0d8274] transition-colors leading-tight">
                          {announce.title}
                        </p>
                        <p className="text-[10px] text-[#52716a] mt-1">
                          By {announce.author?.display_name || "Instructor"} • {new Date(announce.posted_at || announce.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#52716a] group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>
                    {announce.message && (
                      <p className="text-[11px] text-[#52716a] line-clamp-2 mt-2 leading-relaxed">
                        {announce.message.replace(/<[^>]*>/g, "")}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "discussions" && (
        <Card className="rounded-none border-[#102b2b]/15 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d8274] mb-4 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              Discussion Topics ({discussions.length})
            </h3>
            {discussions.length === 0 ? (
              <p className="text-xs text-[#52716a] italic py-6 text-center">No discussion topics found.</p>
            ) : (
              <div className="divide-y divide-[#102b2b]/10">
                {discussions.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/dashboard/canvas/${courseId}/discussions/${topic.id}`}
                    className="py-4 first:pt-0 last:pb-0 block group hover:bg-[#f8faf5]/40"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-extrabold text-sm text-[#102b2b] group-hover:text-[#0d8274] transition-colors leading-tight">
                          {topic.title}
                        </p>
                        <p className="text-[10px] text-[#52716a] mt-1">
                          Started by {topic.author?.display_name || "Unknown"} • {new Date(topic.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#52716a] group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
