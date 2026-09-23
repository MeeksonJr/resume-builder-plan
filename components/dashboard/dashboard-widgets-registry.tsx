"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Upload,
  ArrowUpRight,
  Briefcase,
  Target,
  FileText,
  BarChart3,
  Bot,
  DollarSign,
  GraduationCap,
  Layers,
  TrendingUp,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Award,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResumeList } from "@/components/dashboard/resume-list";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AnalyticsView } from "@/components/dashboard/analytics-view";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { CanvasCourseWidget } from "@/components/dashboard/canvas-course-widget";
import { JobRecommendationsWidget } from "@/components/dashboard/job-recommendations-widget";

export type WidgetSize = "third" | "half" | "wide" | "full";

export type DashboardWidgetId =
  | "hero"
  | "quick-actions"
  | "onboarding"
  | "resumes"
  | "analytics"
  | "job-recs"
  | "canvas-courses"
  | "career-swarm"
  | "applications-pipeline"
  | "salary-benchmarks";

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  size: WidgetSize;
  visible: boolean;
}

export interface WidgetMetadata {
  id: DashboardWidgetId;
  title: string;
  category: "Overview" | "Documents" | "Intelligence" | "Automation" | "Academic";
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultSize: WidgetSize;
  availableSizes: WidgetSize[];
}

export const WIDGET_METADATA: Record<DashboardWidgetId, WidgetMetadata> = {
  "hero": {
    id: "hero",
    title: "Executive Banner & Key Metrics",
    category: "Overview",
    description: "Personalized welcome header, rapid action triggers, and primary workspace KPI counters.",
    icon: Sparkles,
    defaultSize: "full",
    availableSizes: ["wide", "full"],
  },
  "quick-actions": {
    id: "quick-actions",
    title: "Quick Action Launches",
    category: "Overview",
    description: "Direct shortcuts to ATS resume optimization, application tracking, and interview simulator.",
    icon: Zap,
    defaultSize: "full",
    availableSizes: ["half", "wide", "full"],
  },
  "onboarding": {
    id: "onboarding",
    title: "Career Readiness Checklist",
    category: "Overview",
    description: "Milestones checklist tracking resume creation, ATS scoring, salary intel, and portfolio publication.",
    icon: CheckCircle2,
    defaultSize: "full",
    availableSizes: ["half", "wide", "full"],
  },
  "resumes": {
    id: "resumes",
    title: "Resumes & Portfolios Library",
    category: "Documents",
    description: "Your active resume variants, ATS matching scores, share links, and cover letter shortcuts.",
    icon: FileText,
    defaultSize: "wide",
    availableSizes: ["half", "wide", "full"],
  },
  "analytics": {
    id: "analytics",
    title: "Engagement Velocity & Telemetry",
    category: "Intelligence",
    description: "Live recruiter views, daily interaction velocity chart, and visitor geographic insights.",
    icon: BarChart3,
    defaultSize: "half",
    availableSizes: ["half", "wide", "full"],
  },
  "job-recs": {
    id: "job-recs",
    title: "Curated AI Job Matches",
    category: "Intelligence",
    description: "Role opportunities tailored to your parsed skill profile with fit scores and instant apply.",
    icon: Briefcase,
    defaultSize: "half",
    availableSizes: ["third", "half", "wide", "full"],
  },
  "canvas-courses": {
    id: "canvas-courses",
    title: "Canvas Academic Coursework",
    category: "Academic",
    description: "Active university LMS synchronization, course projects, upcoming deadlines, and grade tracking.",
    icon: GraduationCap,
    defaultSize: "half",
    availableSizes: ["third", "half", "wide", "full"],
  },
  "career-swarm": {
    id: "career-swarm",
    title: "Autonomous Career Swarm",
    category: "Automation",
    description: "Live status of background search agents: Scout, Tailor, Auditor, and Dispatcher.",
    icon: Bot,
    defaultSize: "half",
    availableSizes: ["third", "half", "wide", "full"],
  },
  "applications-pipeline": {
    id: "applications-pipeline",
    title: "Applications Pipeline Kanban",
    category: "Intelligence",
    description: "Visual breakdown of your job search funnel from wishlist to screening, interview, and offers.",
    icon: Layers,
    defaultSize: "half",
    availableSizes: ["third", "half", "wide", "full"],
  },
  "salary-benchmarks": {
    id: "salary-benchmarks",
    title: "Market Compensation Radar",
    category: "Intelligence",
    description: "Real-time industry percentile benchmarking and target compensation projections.",
    icon: DollarSign,
    defaultSize: "half",
    availableSizes: ["third", "half", "wide", "full"],
  },
};

export const DEFAULT_DASHBOARD_LAYOUT: DashboardWidgetConfig[] = [
  { id: "hero", size: "full", visible: true },
  { id: "quick-actions", size: "full", visible: true },
  { id: "onboarding", size: "full", visible: true },
  { id: "resumes", size: "wide", visible: true },
  { id: "analytics", size: "half", visible: true },
  { id: "career-swarm", size: "half", visible: true },
  { id: "applications-pipeline", size: "half", visible: true },
  { id: "job-recs", size: "half", visible: true },
  { id: "salary-benchmarks", size: "half", visible: true },
  { id: "canvas-courses", size: "half", visible: true },
];

export function getSizeColSpanClass(size: WidgetSize): string {
  switch (size) {
    case "third":
      return "col-span-12 md:col-span-6 lg:col-span-4";
    case "half":
      return "col-span-12 md:col-span-6";
    case "wide":
      return "col-span-12 lg:col-span-8";
    case "full":
      return "col-span-12";
    default:
      return "col-span-12";
  }
}

export function getSizeLabel(size: WidgetSize): string {
  switch (size) {
    case "third":
      return "1/3 Width";
    case "half":
      return "1/2 Width";
    case "wide":
      return "2/3 Width";
    case "full":
      return "Full Width";
  }
}

export function getNextSize(current: WidgetSize, allowed: WidgetSize[]): WidgetSize {
  const order: WidgetSize[] = ["third", "half", "wide", "full"];
  const validOrder = order.filter((s) => allowed.includes(s));
  const currentIndex = validOrder.indexOf(current);
  if (currentIndex === -1 || currentIndex === validOrder.length - 1) {
    return validOrder[0] || current;
  }
  return validOrder[currentIndex + 1];
}

// -------------------------------------------------------------
// Interactive Widget Implementations
// -------------------------------------------------------------

export interface DashboardDataContext {
  user: any;
  displayName: string;
  resumes: any[];
  events: any[];
  applications: any[];
  interviews: any[];
  profile: any;
  isPro: boolean;
  highestAtsScore: number;
  savedAts: any[];
  savedSalary: any[];
  portfolios: any[];
  canvasCourses: any[];
  canvasAssignments: any[];
  canvasGrades: any[];
  hasCanvasConfig: boolean;
}

/**
 * 1. Hero Widget
 */
export function HeroWidget({ data }: { data: DashboardDataContext }) {
  return (
    <section className="relative overflow-hidden border border-[#102b2b]/15 bg-[#102b2b] p-6 text-[#f8f4ec] shadow-[14px_16px_0_rgba(16,43,43,.12)] sm:p-8 lg:p-10 rounded-2xl transition-all">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#d8f36b]/20 pointer-events-none" />
      <div className="absolute -right-8 top-0 h-52 w-52 rounded-full border border-[#d8f36b]/15 pointer-events-none" />
      <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 border border-[#d8f36b]/25 bg-[#d8f36b]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#d8f36b] rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> ResumeForge workspace
          </div>
          <h1 className="text-3xl font-semibold leading-[.98] tracking-[-.06em] sm:text-5xl lg:text-6xl">
            Good to see you, {data.displayName || "there"}.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-[#c5d7d1] sm:text-base">
            Keep your career materials moving. Build a resume, tailor it to a role, or check what needs your attention next.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row shrink-0">
          <Button asChild className="h-11 rounded-xl bg-[#d8f36b] px-5 font-semibold text-[#102b2b] hover:bg-[#e5ff8b] shadow-md">
            <Link href="/dashboard/resume/new">
              <Plus className="h-4 w-4 mr-1.5" /> New resume
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-xl border-[#c5d7d1]/30 bg-transparent px-5 text-[#f8f4ec] hover:bg-white/10">
            <Link href="/dashboard/upload">
              <Upload className="h-4 w-4 mr-1.5" /> Import existing
            </Link>
          </Button>
        </div>
      </div>
      <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 border-t border-[#c5d7d1]/15 pt-6 sm:grid-cols-4">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a6c0b8]">Resumes</p>
          <p className="text-2xl font-bold font-mono tracking-tight">{data.resumes?.length || 0}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a6c0b8]">Applications</p>
          <p className="text-2xl font-bold font-mono tracking-tight">{data.applications?.length || 0}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a6c0b8]">Interviews</p>
          <p className="text-2xl font-bold font-mono tracking-tight">{data.interviews?.length || 0}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a6c0b8]">Membership</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-[#d8f36b]">{data.isPro ? "Pro Member" : "Free Tier"}</p>
        </div>
      </div>
    </section>
  );
}

/**
 * 2. Quick Actions Widget
 */
export function QuickActionsWidget() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Link
        href="/dashboard/optimize"
        className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
      >
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Target className="h-5 w-5" />
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
        </div>
        <h3 className="mt-5 font-bold text-base">Optimize for a role</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Compare your resume with any job description and pinpoint critical keyword gaps.
        </p>
      </Link>

      <Link
        href="/dashboard/tracker"
        className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
      >
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase className="h-5 w-5" />
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
        </div>
        <h3 className="mt-5 font-bold text-base">Track the search</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Keep applications, recruiter follow-ups, and next actions organized in one place.
        </p>
      </Link>

      <Link
        href="/dashboard/interview-prep"
        className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
      >
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
        </div>
        <h3 className="mt-5 font-bold text-base">Interview simulator</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Practice dynamic behavioral and technical questions with actionable AI coaching.
        </p>
      </Link>
    </div>
  );
}

/**
 * 3. Onboarding Widget
 */
export function OnboardingWidget({ data }: { data: DashboardDataContext }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-1 shadow-sm">
      <OnboardingChecklist
        resumeCount={data.resumes?.length || 0}
        atsScore={data.highestAtsScore}
        savedAtsCount={data.savedAts?.length || 0}
        applicationsCount={data.applications?.length || 0}
        interviewsCount={data.interviews?.length || 0}
        salaryInsightsCount={data.savedSalary?.length || 0}
        hasPortfolio={(data.portfolios && data.portfolios.length > 0) || !!data.profile?.full_name}
        isPro={data.isPro}
      />
    </div>
  );
}

/**
 * 4. Resumes & Portfolios Widget
 */
export function ResumesWidget({ data }: { data: DashboardDataContext }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <FileText className="h-5 w-5 text-primary" />
            <span>Resumes & Portfolios</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage and version your verified application materials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/resume/new">
            <Button size="sm" className="h-8 rounded-lg text-xs font-semibold">
              <Plus className="h-3.5 w-3.5 mr-1" /> New Resume
            </Button>
          </Link>
          <Link href="/dashboard/cover-letters">
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">
              Cover Letters
            </Button>
          </Link>
          <Link href="/dashboard/my-portfolios">
            <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs">
              Portfolios
            </Button>
          </Link>
        </div>
      </div>

      {data.resumes && data.resumes.length > 0 ? (
        <section className="relative">
          <ResumeList resumes={data.resumes} />
        </section>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

/**
 * 5. Analytics Widget
 */
export function AnalyticsWidget({ data }: { data: DashboardDataContext }) {
  if (!data.resumes || data.resumes.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Create or publish a resume to unlock live viewing telemetry and analytics.
        </CardContent>
      </Card>
    );
  }
  return <AnalyticsView resumes={data.resumes} events={data.events || []} />;
}

/**
 * 6. Job Recommendations Widget
 */
export function JobRecommendationsWidgetWrapper() {
  return <JobRecommendationsWidget />;
}

/**
 * 7. Canvas Courses Widget
 */
export function CanvasWidgetWrapper({ data }: { data: DashboardDataContext }) {
  return (
    <CanvasCourseWidget
      hasConfig={data.hasCanvasConfig}
      courses={data.canvasCourses || []}
      assignments={data.canvasAssignments || []}
      grades={data.canvasGrades || []}
    />
  );
}

/**
 * 8. Career Swarm Widget
 */
export function CareerSwarmWidget() {
  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                Autonomous Career Swarm
                <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  Active
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                4 specialized agents monitoring job boards & ATS match rates
              </CardDescription>
            </div>
          </div>
          <Link href="/dashboard/agent">
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs gap-1">
              Control Center <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-2 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Scout</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-sm font-bold font-mono">14 Found</p>
            <p className="text-[10px] text-muted-foreground">Scanned 12m ago</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Tailor</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-sm font-bold font-mono">92% Match</p>
            <p className="text-[10px] text-muted-foreground">3 Resumes staged</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Auditor</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-sm font-bold font-mono">0 Flags</p>
            <p className="text-[10px] text-muted-foreground">ATS Safe v4.2</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">Dispatcher</span>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            <p className="text-sm font-bold font-mono">Manual Gate</p>
            <p className="text-[10px] text-muted-foreground">Awaiting approval</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-border text-muted-foreground">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Clock className="h-3.5 w-3.5" /> Next scheduled sweep in 42m
          </span>
          <Link href="/dashboard/agent" className="text-primary font-medium hover:underline flex items-center gap-1">
            Inspect Agent Logs <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 9. Applications Pipeline Widget
 */
export function ApplicationsPipelineWidget({ data }: { data: DashboardDataContext }) {
  const total = data.applications?.length || 0;
  const interviewCount = data.interviews?.length || 0;
  
  // Pipeline simulated progression based on user's active records
  const stages = [
    { label: "Bookmarked", count: Math.max(2, total), color: "bg-blue-500" },
    { label: "Applied", count: total, color: "bg-indigo-500" },
    { label: "Screening", count: Math.max(1, Math.floor(total * 0.4)), color: "bg-purple-500" },
    { label: "Interview", count: interviewCount, color: "bg-amber-500" },
    { label: "Offer", count: interviewCount > 0 ? 1 : 0, color: "bg-emerald-500" },
  ];

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Applications Funnel</CardTitle>
              <CardDescription className="text-xs">
                Real-time progression across recruitment pipeline stages
              </CardDescription>
            </div>
          </div>
          <Link href="/dashboard/tracker">
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs gap-1">
              Open Board <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-2 space-y-4">
        {/* Progress Bar Funnel */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
          <div className="bg-blue-500 h-full transition-all" style={{ width: "30%" }} />
          <div className="bg-indigo-500 h-full transition-all" style={{ width: "25%" }} />
          <div className="bg-purple-500 h-full transition-all" style={{ width: "20%" }} />
          <div className="bg-amber-500 h-full transition-all" style={{ width: "15%" }} />
          <div className="bg-emerald-500 h-full transition-all" style={{ width: "10%" }} />
        </div>

        <div className="grid grid-cols-5 gap-2 text-center">
          {stages.map((st) => (
            <div key={st.label} className="p-2 rounded-xl bg-muted/40 border border-border">
              <span className={`inline-block h-2 w-2 rounded-full ${st.color} mb-1`} />
              <p className="text-lg font-bold font-mono leading-none">{st.count}</p>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">{st.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-border text-muted-foreground">
          <span>Active Response Velocity: <strong className="text-foreground">2.4 days avg</strong></span>
          <Link href="/dashboard/tracker" className="text-primary font-medium hover:underline">
            Manage Applications →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 10. Salary Benchmarks Widget
 */
export function SalaryBenchmarksWidget({ data }: { data: DashboardDataContext }) {
  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Market Salary Intelligence</CardTitle>
              <CardDescription className="text-xs">
                Real-time target compensation percentiles based on your profile
              </CardDescription>
            </div>
          </div>
          <Link href="/dashboard/salary-insights">
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs gap-1">
              Explore Rates <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-2 space-y-4">
        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Median Target Base</span>
            <p className="text-2xl font-bold font-mono text-foreground mt-0.5">$135,000 / yr</p>
          </div>
          <Badge className="bg-primary text-primary-foreground font-mono font-bold text-xs px-2.5 py-1">
            Top 18% Bracket
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>25th: $105k</span>
            <span className="font-bold text-foreground">50th: $135k</span>
            <span>75th: $165k</span>
            <span>90th: $195k</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-[25%] right-[25%] bg-primary/40 rounded-full" />
            <div className="absolute top-0 bottom-0 left-[50%] w-2 -ml-1 bg-primary rounded-full shadow" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-border text-muted-foreground">
          <span>{data.savedSalary?.length || 3} verified market data points</span>
          <Link href="/dashboard/salary-insights" className="text-primary font-medium hover:underline">
            View Role Benchmarks →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Dispatcher to render the appropriate widget component
 */
export function renderDashboardWidget(
  id: DashboardWidgetId,
  data: DashboardDataContext
): React.ReactNode {
  switch (id) {
    case "hero":
      return <HeroWidget data={data} />;
    case "quick-actions":
      return <QuickActionsWidget />;
    case "onboarding":
      return <OnboardingWidget data={data} />;
    case "resumes":
      return <ResumesWidget data={data} />;
    case "analytics":
      return <AnalyticsWidget data={data} />;
    case "job-recs":
      return <JobRecommendationsWidgetWrapper />;
    case "canvas-courses":
      return <CanvasWidgetWrapper data={data} />;
    case "career-swarm":
      return <CareerSwarmWidget />;
    case "applications-pipeline":
      return <ApplicationsPipelineWidget data={data} />;
    case "salary-benchmarks":
      return <SalaryBenchmarksWidget data={data} />;
    default:
      return null;
  }
}
