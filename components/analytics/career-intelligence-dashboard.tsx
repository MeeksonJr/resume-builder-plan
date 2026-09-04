"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Briefcase,
  Eye,
  Download,
  Trophy,
  Target,
  Brain,
  Mic,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface CareerIntelligenceDashboardProps {
  isPro: boolean;
}

export function CareerIntelligenceDashboard({ isPro }: CareerIntelligenceDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Fetch all career intelligence data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/career-intelligence");
      if (!res.ok) throw new Error("Failed to fetch career intelligence");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load career analytics");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!data) return;
    setGeneratingReport(true);
    try {
      const res = await fetch("/api/analytics/career-intelligence/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kpi: data.kpi,
          pipeline: data.pipeline,
          resumes: data.resumes,
          interviews: data.interviews,
          atsAnalyses: data.atsAnalyses,
          skillsGaps: data.skillsGaps,
          salaryInsights: data.salaryInsights,
          voiceTelemetry: data.voiceTelemetry,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate report");
      const report = await res.json();
      setData((prev: any) => ({
        ...prev,
        latestReport: report,
        reportGeneratedAt: new Date().toISOString(),
      }));
      toast.success("Career trajectory report generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate career report");
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-[#102b2b]/50">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Loading Career Intelligence...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-[#102b2b]/50">
        <AlertCircle className="h-8 w-8 mb-4" />
        <p className="text-sm font-bold">Failed to load analytics data</p>
        <Button onClick={fetchData} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // Prepare engagement chart data
  const rangeMap = { "7d": 7, "30d": 30, "90d": 90 };
  const rangeDays = rangeMap[timeRange];
  const dateInterval = eachDayOfInterval({
    start: startOfDay(subDays(new Date(), rangeDays - 1)),
    end: startOfDay(new Date()),
  });

  const engagementChartData = dateInterval.map((day) => {
    const dateStr = format(day, "MMM dd");
    const dayEvents = (data.events || []).filter(
      (e: any) => format(new Date(e.created_at), "MMM dd") === dateStr
    );
    return {
      date: dateStr,
      views: dayEvents.filter((e: any) => e.event_type === "view").length,
      downloads: dayEvents.filter((e: any) => e.event_type === "download").length,
    };
  });

  // Prepare interview trend data
  const interviewTrendData = (data.interviews || [])
    .filter((i: any) => i.completed_at)
    .slice(0, 20)
    .reverse()
    .map((session: any, idx: number) => ({
      session: `#${idx + 1}`,
      score: parseFloat(session.average_score) || 0,
      role: session.target_role || "General",
    }));

  // Prepare ATS score data
  const atsChartData = (data.atsAnalyses || [])
    .slice(0, 10)
    .reverse()
    .map((a: any) => ({
      role: (a.target_role || "Resume").slice(0, 20),
      score: a.score || 0,
      date: format(new Date(a.created_at), "MMM dd"),
    }));

  // Pipeline funnel data
  const funnelData = [
    { stage: "Applied", count: data.pipeline?.applied || 0, color: "#0d8274" },
    { stage: "Interviewing", count: data.pipeline?.interviewing || 0, color: "#d8f36b" },
    { stage: "Offered", count: data.pipeline?.offered || 0, color: "#22c55e" },
    { stage: "Rejected", count: data.pipeline?.rejected || 0, color: "#ef4444" },
  ];

  const kpi = data.kpi || {};
  const report = data.latestReport;

  return (
    <div className="space-y-8">
      {/* ===== SECTION 1: HERO KPI STRIP ===== */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          label="Resume Views"
          value={kpi.totalViews || 0}
          icon={<Eye className="h-4 w-4" />}
          trend={`${data.resumes?.length || 0} resumes`}
        />
        <KpiCard
          label="Conversion Rate"
          value={`${kpi.conversionRate || 0}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={`${kpi.totalApplications || 0} apps`}
          highlight={kpi.conversionRate > 15}
        />
        <KpiCard
          label="Avg Interview"
          value={`${kpi.avgInterviewScore || 0}%`}
          icon={<Brain className="h-4 w-4" />}
          trend={`${kpi.completedInterviews || 0} completed`}
          highlight={kpi.avgInterviewScore >= 80}
        />
        <KpiCard
          label="Best ATS Score"
          value={`${kpi.bestAtsScore || 0}%`}
          icon={<Target className="h-4 w-4" />}
          trend={`${data.atsAnalyses?.length || 0} scans`}
          highlight={kpi.bestAtsScore >= 80}
        />
        <KpiCard
          label="Career Ready"
          value={`${kpi.careerReadinessScore || 0}%`}
          icon={<Trophy className="h-4 w-4" />}
          trend="Composite score"
          highlight={kpi.careerReadinessScore >= 70}
        />
      </div>

      {/* ===== SECTION 2: APPLICATION PIPELINE FUNNEL ===== */}
      <div className="border border-[#102b2b]/15 bg-white p-6 sm:p-8 shadow-[8px_10px_0_rgba(16,43,43,.08)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-[#102b2b]">
              <Briefcase className="h-5 w-5 text-[#0d8274]" />
              Application Pipeline
            </h2>
            <p className="text-xs text-[#52716a] mt-1">
              Track your journey from application to offer
            </p>
          </div>
          <Badge className="bg-[#102b2b] text-[#d8f36b] font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-none">
            {data.pipeline?.total || 0} Total
          </Badge>
        </div>

        {data.pipeline?.total > 0 ? (
          <div className="space-y-4">
            {/* Funnel Bars */}
            <div className="grid grid-cols-4 gap-3">
              {funnelData.map((stage) => {
                const pct = data.pipeline.total > 0
                  ? Math.round((stage.count / data.pipeline.total) * 100)
                  : 0;
                return (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-end justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#52716a]">
                        {stage.stage}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#102b2b]">{pct}%</span>
                    </div>
                    <div className="h-10 bg-[#f0ece4] relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 transition-all duration-700"
                        style={{
                          width: `${Math.max(pct, 4)}%`,
                          backgroundColor: stage.color,
                        }}
                      />
                    </div>
                    <p className="text-center text-2xl font-black text-[#102b2b] tabular-nums">
                      {stage.count}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Conversion Flow */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-[#102b2b]/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#52716a]">
                Pipeline Conversion
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#0d8274]" />
              <span className="text-xs font-bold text-[#0d8274]">
                {data.pipeline.total > 0
                  ? `${Math.round(((data.pipeline.interviewing + data.pipeline.offered) / data.pipeline.total) * 100)}% Advanced`
                  : "No data"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-[#102b2b]/40">
            <Briefcase className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-bold">No applications tracked yet</p>
            <p className="text-xs mt-1">Start tracking jobs to see your pipeline funnel</p>
            <Button asChild variant="outline" size="sm" className="mt-4 rounded-none border-[#102b2b]/20 text-xs">
              <Link href="/dashboard/jobs">Explore Jobs →</Link>
            </Button>
          </div>
        )}
      </div>

      {/* ===== SECTION 3: RESUME ENGAGEMENT TIMELINE ===== */}
      <div className="border border-[#102b2b]/15 bg-white p-6 sm:p-8 shadow-[8px_10px_0_rgba(16,43,43,.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-[#102b2b]">
              <BarChart3 className="h-5 w-5 text-[#0d8274]" />
              Resume Engagement
            </h2>
            <p className="text-xs text-[#52716a] mt-1">
              Views and downloads across all your resumes
            </p>
          </div>
          <div className="flex items-center gap-1">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  timeRange === range
                    ? "bg-[#102b2b] text-[#d8f36b]"
                    : "bg-[#f0ece4] text-[#52716a] hover:bg-[#102b2b]/10"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={engagementChartData}>
              <defs>
                <linearGradient id="ciViewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#102b2b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#102b2b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ciDownloadsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d8274" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0d8274" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-[#102b2b] text-white px-3 py-2 text-xs shadow-xl border border-white/10">
                      <p className="font-black text-[#d8f36b] text-[10px] uppercase tracking-wider mb-1">{label}</p>
                      {payload.map((entry: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full inline-block"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="capitalize text-[#c5d7d1]">{entry.dataKey}:</span>
                          <span className="font-mono font-bold">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#102b2b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#ciViewsGrad)"
                animationDuration={1200}
              />
              <Area
                type="monotone"
                dataKey="downloads"
                stroke="#0d8274"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#ciDownloadsGrad)"
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== SECTIONS 4 & 5: INTERVIEW TRENDS + ATS HISTORY (Side by Side) ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Interview Performance Trends */}
        <div className="border border-[#102b2b]/15 bg-white p-6 sm:p-8 shadow-[8px_10px_0_rgba(16,43,43,.08)]">
          <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-[#102b2b] mb-1">
            <Brain className="h-5 w-5 text-[#0d8274]" />
            Interview Trends
          </h2>
          <p className="text-xs text-[#52716a] mb-6">Score progression across practice sessions</p>

          {interviewTrendData.length > 0 ? (
            <>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={interviewTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                    <XAxis
                      dataKey="session"
                      stroke="#9ca3af"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#9ca3af"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#102b2b] text-white px-3 py-2 text-xs shadow-xl border border-white/10">
                            <p className="font-black text-[#d8f36b]">{d.role}</p>
                            <p className="font-mono mt-1">Score: <span className="font-bold">{d.score}%</span></p>
                          </div>
                        );
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0d8274"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#0d8274", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6, fill: "#d8f36b", stroke: "#102b2b", strokeWidth: 2 }}
                      animationDuration={1200}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Voice Telemetry Mini Cards */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-[#102b2b]/10">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#52716a]">Avg WPM</p>
                  <p className="text-xl font-black text-[#102b2b] tabular-nums mt-1">
                    {data.voiceTelemetry?.avgWpm || "—"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#52716a]">Filler Words</p>
                  <p className="text-xl font-black text-[#102b2b] tabular-nums mt-1">
                    {data.voiceTelemetry?.totalFillers || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#52716a]">Sessions</p>
                  <p className="text-xl font-black text-[#102b2b] tabular-nums mt-1">
                    {data.voiceTelemetry?.sessionCount || 0}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-[#102b2b]/40">
              <Mic className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-bold">No completed interviews yet</p>
              <Button asChild variant="outline" size="sm" className="mt-4 rounded-none border-[#102b2b]/20 text-xs">
                <Link href="/dashboard/interview-prep">Start Practicing →</Link>
              </Button>
            </div>
          )}
        </div>

        {/* ATS Score History */}
        <div className="border border-[#102b2b]/15 bg-white p-6 sm:p-8 shadow-[8px_10px_0_rgba(16,43,43,.08)]">
          <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-[#102b2b] mb-1">
            <Target className="h-5 w-5 text-[#0d8274]" />
            ATS Compatibility History
          </h2>
          <p className="text-xs text-[#52716a] mb-6">Score breakdown by resume and scan date</p>

          {atsChartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={atsChartData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" opacity={0.5} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="role"
                    width={120}
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#102b2b] text-white px-3 py-2 text-xs shadow-xl border border-white/10">
                          <p className="font-black text-[#d8f36b]">{d.role}</p>
                          <p className="font-mono mt-1">
                            ATS Score: <span className="font-bold">{d.score}%</span>
                          </p>
                          <p className="text-[#c5d7d1] mt-0.5">{d.date}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 2, 2, 0]} animationDuration={1000}>
                    {atsChartData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.score >= 80
                            ? "#0d8274"
                            : entry.score >= 60
                            ? "#d8f36b"
                            : "#ef4444"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-[#102b2b]/40">
              <FileText className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-bold">No ATS scans saved yet</p>
              <Button asChild variant="outline" size="sm" className="mt-4 rounded-none border-[#102b2b]/20 text-xs">
                <Link href="/dashboard/optimize">Run ATS Scan →</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ===== SECTION 6: AI CAREER TRAJECTORY REPORT ===== */}
      <div className="border border-[#102b2b]/15 bg-white shadow-[14px_16px_0_rgba(16,43,43,.12)] overflow-hidden">
        {/* Report Header */}
        <div className="bg-[#102b2b] text-[#f8f4ec] px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#d8f36b] text-[#102b2b] font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-none gap-1">
                <Sparkles className="h-3 w-3" />
                AI Powered
              </Badge>
              {report && (
                <span className="text-[10px] text-[#a6c0b8] font-bold">
                  Generated {data.reportGeneratedAt ? format(new Date(data.reportGeneratedAt), "MMM dd, yyyy 'at' h:mm a") : ""}
                </span>
              )}
            </div>
            <h2 className="text-xl font-black tracking-tight">Career Trajectory Report</h2>
            <p className="text-sm text-[#c5d7d1] mt-1">
              AI-synthesized strategic assessment of your career data
            </p>
          </div>
          <Button
            onClick={generateReport}
            disabled={generatingReport}
            className="bg-[#d8f36b] text-[#102b2b] hover:bg-[#e5ff8b] font-bold rounded-none h-10 px-5 shrink-0 cursor-pointer"
          >
            {generatingReport ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing...
              </>
            ) : report ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Report
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>

        {/* Report Content */}
        <div className="p-6 sm:p-8">
          {generatingReport ? (
            <div className="space-y-4 py-8">
              <div className="h-6 bg-[#102b2b]/10 animate-pulse w-full" />
              <div className="h-24 bg-[#102b2b]/5 animate-pulse w-full" />
              <div className="h-6 bg-[#102b2b]/8 animate-pulse w-3/4" />
              <div className="h-20 bg-[#102b2b]/5 animate-pulse w-full" />
            </div>
          ) : report ? (
            <div className="space-y-8">
              {/* Momentum Badge */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#52716a]">
                  Career Momentum
                </span>
                <Badge
                  className={`font-black text-xs uppercase tracking-wider px-3 py-1 rounded-none ${
                    report.careerMomentum?.toLowerCase().includes("accelerat")
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : report.careerMomentum?.toLowerCase().includes("steady")
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : report.careerMomentum?.toLowerCase().includes("attention")
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-[#f0ece4] text-[#102b2b] border border-[#102b2b]/15"
                  }`}
                >
                  {report.careerMomentum || "Analyzing"}
                </Badge>
              </div>

              {/* Executive Summary */}
              <div className="bg-gradient-to-br from-[#0d8274]/10 to-transparent p-6 border border-[#0d8274]/15">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0d8274] flex items-center gap-2 mb-3">
                  <ArrowUpRight className="h-4 w-4" />
                  Executive Summary
                </h3>
                <p className="text-base font-semibold leading-relaxed text-[#102b2b]">
                  &ldquo;{report.executiveSummary}&rdquo;
                </p>
              </div>

              {/* Strengths & Growth Areas */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0d8274] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Strengths Identified
                  </h3>
                  <div className="space-y-2">
                    {(report.strengthsIdentified || []).map((s: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200">
                        <span className="h-6 w-6 shrink-0 bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-[#102b2b]">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-700 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Growth Areas
                  </h3>
                  <div className="space-y-2">
                    {(report.growthAreas || []).map((g: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200">
                        <span className="h-6 w-6 shrink-0 bg-amber-600 text-white flex items-center justify-center text-[10px] font-black">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-[#102b2b]">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 30/60/90-Day Action Plan */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#102b2b] flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-[#0d8274]" />
                  30 / 60 / 90-Day Action Plan
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <ActionPlanColumn title="First 30 Days" items={report.actionPlan30 || []} color="#0d8274" />
                  <ActionPlanColumn title="30–60 Days" items={report.actionPlan60 || []} color="#102b2b" />
                  <ActionPlanColumn title="60–90 Days" items={report.actionPlan90 || []} color="#52716a" />
                </div>
              </div>

              {/* Market Position */}
              <div className="bg-[#f0ece4] p-6 border border-[#102b2b]/10">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#102b2b] flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-[#0d8274]" />
                  Market Position Assessment
                </h3>
                <p className="text-sm leading-relaxed text-[#102b2b]/80 font-medium">
                  {report.marketPositionAssessment}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-[#102b2b]/40">
              <div className="h-20 w-20 bg-[#102b2b]/5 flex items-center justify-center mb-4">
                <Sparkles className="h-10 w-10 opacity-40" />
              </div>
              <p className="text-sm font-bold">No career report generated yet</p>
              <p className="text-xs mt-1 max-w-sm text-center">
                Click &ldquo;Generate Report&rdquo; to create a comprehensive AI analysis of your entire career data.
              </p>
              <Button
                onClick={generateReport}
                className="mt-6 bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] font-bold rounded-none cursor-pointer"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate My Career Report
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Sub-Components =====

function KpiCard({
  label,
  value,
  icon,
  trend,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  highlight?: boolean;
}) {
  return (
    <div className="border border-[#102b2b]/15 bg-white p-5 shadow-[6px_8px_0_rgba(16,43,43,.06)] transition-all hover:shadow-[8px_10px_0_rgba(16,43,43,.1)] hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#52716a]">{label}</span>
        <div
          className={`h-7 w-7 flex items-center justify-center ${
            highlight ? "bg-[#d8f36b] text-[#102b2b]" : "bg-[#f0ece4] text-[#52716a]"
          }`}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-[#102b2b] tabular-nums leading-none">{value}</p>
      <p className="text-[10px] font-bold text-[#52716a] mt-2 uppercase tracking-wider">{trend}</p>
    </div>
  );
}

function ActionPlanColumn({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3" style={{ backgroundColor: color }} />
        <span className="text-xs font-black uppercase tracking-wider text-[#102b2b]">{title}</span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-3 bg-[#f8f4ec] border border-[#102b2b]/10 text-sm text-[#102b2b]"
          >
            <span
              className="h-5 w-5 shrink-0 flex items-center justify-center text-[9px] font-black text-white mt-0.5"
              style={{ backgroundColor: color }}
            >
              {i + 1}
            </span>
            <span className="font-medium leading-snug">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
