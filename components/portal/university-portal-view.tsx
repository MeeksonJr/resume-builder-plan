"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UniversityTenant,
  StudentRosterMember,
  MOCK_STUDENT_ROSTER,
  calculateTenantStats,
} from "@/lib/tenant/university-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap,
  Users,
  Award,
  Briefcase,
  Search,
  ExternalLink,
  ShieldCheck,
  Video,
  Send,
  Download,
  Settings,
  Sparkles,
  ChevronRight,
  School,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface UniversityPortalViewProps {
  tenant: UniversityTenant;
}

export function UniversityPortalView({ tenant }: UniversityPortalViewProps) {
  const [selectedCohortId, setSelectedCohortId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("roster");

  const stats = calculateTenantStats(tenant);

  const filteredStudents = MOCK_STUDENT_ROSTER.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.targetRoles.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Institutional White-Label Header Banner */}
      <div
        style={{ borderTopColor: tenant.primaryColor }}
        className="rounded-2xl border-t-4 border-b border-x border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              style={{ backgroundColor: `${tenant.primaryColor}15`, color: tenant.primaryColor }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-inner font-black"
            >
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                  {tenant.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3" /> FERPA Compliant
                </span>
                {tenant.ssoEnabled && (
                  <span className="rounded-full bg-blue-100 dark:bg-blue-950/50 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300">
                    SAML SSO Active
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Career Center Workspace • Custom Subdomain:{" "}
                <span className="font-mono text-neutral-700 dark:text-neutral-300 font-semibold">
                  {tenant.customDomain}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Student cohort report exported as CSV")}
              className="text-xs gap-1.5 h-9"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Roster</span>
            </Button>
            <Button
              size="sm"
              style={{ backgroundColor: tenant.primaryColor }}
              onClick={() => toast.success("Batch AI Resume Audit scheduled for all 238 students")}
              className="text-xs gap-1.5 text-white font-bold h-9 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Run Batch ATS Audit</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Enrolled Candidates</span>
              <Users className="h-4 w-4 text-neutral-400" />
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              {stats.totalStudents}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              100% Canvas SIS Synced
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Cohort Avg ATS Score</span>
              <Award className="h-4 w-4 text-[#0d8274]" />
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-[#0d8274]">
              {stats.overallAvgAtsScore}
              <span className="text-xs text-muted-foreground font-normal">/100</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              +6.4 pts vs national baseline
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Placement Velocity</span>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              {stats.overallPlacementRate}%
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Target: 80% before graduation
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <CardHeader className="p-4 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Auto-Applications</span>
              <Send className="h-4 w-4 text-purple-500" />
            </span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              {stats.totalApplicationsDispatched.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Dispatched across LinkedIn & Indeed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
            <TabsTrigger value="roster" className="text-xs font-bold">
              Student Roster ({filteredStudents.length})
            </TabsTrigger>
            <TabsTrigger value="talent" className="text-xs font-bold">
              Recruiter Talent Showcase
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs font-bold">
              Portal Settings
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by student, major, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs bg-white dark:bg-neutral-900"
            />
          </div>
        </div>

        {/* Tab 1: Student Roster Table */}
        <TabsContent value="roster" className="space-y-3">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="p-3.5">Candidate Name</th>
                    <th className="p-3.5">Major / Concentration</th>
                    <th className="p-3.5 text-center">ATS Readiness</th>
                    <th className="p-3.5 text-center">60s Pitch</th>
                    <th className="p-3.5 text-center">Placement</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-neutral-900 dark:text-white">
                          {student.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{student.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {student.major}
                        </span>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Class of {student.graduationYear}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                            student.atsScore >= 90
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : student.atsScore >= 80
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {student.atsScore}/100
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {student.hasVideoPitch ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <Video className="h-3.5 w-3.5" /> Ready
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">• Pending</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            student.placementStatus === "Placed"
                              ? "bg-emerald-500 text-white"
                              : student.placementStatus === "Interviewing"
                              ? "bg-amber-500 text-white"
                              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          {student.placementStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-7 text-xs font-semibold"
                          >
                            <Link href={`/r/${student.resumeSlug}`} target="_blank">
                              <span>Resume</span>
                              <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toast.success(`Sent coach review invite to ${student.name}`)
                            }
                            className="h-7 text-xs font-semibold"
                          >
                            Coach Review
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Recruiter Talent Showcase */}
        <TabsContent value="talent" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((student) => (
              <Card
                key={student.id}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                      {student.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{student.major}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    ATS {student.atsScore}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {student.targetRoles.map((role) => (
                    <span
                      key={role}
                      className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-semibold"
                    >
                      {role}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {student.hasVideoPitch && (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <Video className="h-3 w-3" /> 60s Elevator Pitch
                      </span>
                    )}
                  </div>
                  <Button size="sm" asChild className="h-7 text-xs font-bold">
                    <Link href={`/r/${student.resumeSlug}`} target="_blank">
                      View Verified Portfolio
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Institutional Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Institutional White-Label Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Institution Name
                </label>
                <Input value={tenant.name} readOnly className="bg-neutral-50 dark:bg-neutral-800" />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Custom Domain
                </label>
                <Input
                  value={tenant.customDomain}
                  readOnly
                  className="bg-neutral-50 dark:bg-neutral-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Primary Institutional Color
                </label>
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: tenant.primaryColor }}
                    className="h-9 w-9 rounded-lg border border-neutral-300"
                  />
                  <Input
                    value={tenant.primaryColor}
                    readOnly
                    className="font-mono bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Security & Privacy
                </label>
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>FERPA Data Masking Active & SSO SAML 2.0 Enforced</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
