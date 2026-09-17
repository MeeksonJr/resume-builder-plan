"use client";

import React, { useState } from "react";
import {
  Bot,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  Send,
  Trash2,
  Building,
  DollarSign,
  Briefcase,
  Search,
  RotateCcw,
  Zap,
} from "lucide-react";
import {
  DEFAULT_SWARM_PREFERENCES,
  MOCK_SWARM_TASKS,
  SwarmPreferences,
  SwarmTask,
  calculateSwarmMetrics,
} from "@/lib/agent/career-swarm-agent";
import { executeApplicationDispatch } from "@/lib/jobs/auto-apply-dispatcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function CareerSwarmControlCenter() {
  const [preferences, setPreferences] = useState<SwarmPreferences>(DEFAULT_SWARM_PREFERENCES);
  const [tasks, setTasks] = useState<SwarmTask[]>(MOCK_SWARM_TASKS);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [isScouting, setIsScouting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const metrics = calculateSwarmMetrics(tasks);

  const handleToggleSwarm = () => {
    const nextState = !preferences.enabled;
    setPreferences((prev) => ({ ...prev, enabled: nextState }));
    if (nextState) {
      toast.success("Autonomous Career Swarm started! 4 subagents actively monitoring job boards.");
    } else {
      toast.info("Autonomous Career Swarm paused.");
    }
  };

  const handleRunManualScout = () => {
    setIsScouting(true);
    setTimeout(() => {
      setIsScouting(false);
      const newJob: SwarmTask = {
        id: `swarm-scout-${Date.now()}`,
        jobId: `job-databricks-${Date.now()}`,
        role: "Senior Distributed Systems Engineer",
        company: "Databricks",
        portalType: "greenhouse",
        portalUrl: "https://boards.greenhouse.io/databricks/jobs/592819",
        matchScore: 94,
        status: "pending_approval",
        location: "San Francisco, CA (Hybrid)",
        estimatedSalary: 220000,
        appliedAt: new Date().toISOString(),
        auditNotes: [
          "Matched 94% skills: Go, Kubernetes, Kafka, Distributed Systems",
          "Generated custom STAR resume tailored for Databricks Lakehouse architecture",
          "Passed automated anti-hallucination verification",
        ],
      };
      setTasks((prev) => [newJob, ...prev]);
      toast.success("Scout Agent discovered a 94% match at Databricks!");
    }, 1200);
  };

  const handleApproveDispatch = async (task: SwarmTask) => {
    setDispatchingId(task.id);
    try {
      await executeApplicationDispatch(task.id, task.portalType, {
        fullName: "Mohamed Lamine Datt",
        email: "d.mohamed1504@gmail.com",
        phone: "+1 555-0199",
        location: "San Francisco, CA",
        linkedinUrl: "https://linkedin.com/in/mohamed-datt",
        portfolioUrl: "https://resumeforge.pro/p/d.mohamed1504",
        githubUrl: "https://github.com/MeeksonJr",
        yearsOfExperience: 6,
        workAuthorization: "us_citizen",
      });

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === task.id) {
            return {
              ...t,
              status: "dispatched",
              appliedAt: new Date().toISOString(),
              auditNotes: [
                ...t.auditNotes,
                "Approved by candidate & dispatched directly to ATS portal",
              ],
            };
          }
          return t;
        })
      );
      toast.success(`Application packet dispatched directly to ${task.company}!`);
    } catch (err) {
      toast.error("Dispatch runner failed. Please check network connection.");
    } finally {
      setDispatchingId(null);
    }
  };

  const handleRejectTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    toast.info("Target opportunity dismissed from swarm queue.");
  };

  return (
    <div className="space-y-6">
      {/* Hero Control Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-xs">
                <Bot className="w-3.5 h-3.5 mr-1" />
                24/7 Autonomous Career Agent Swarm
              </Badge>
              <Badge
                variant={preferences.enabled ? "default" : "secondary"}
                className={
                  preferences.enabled
                    ? "bg-emerald-600 text-white animate-pulse text-xs"
                    : "text-muted-foreground text-xs"
                }
              >
                {preferences.enabled ? "● Swarm Active & Scouting" : "○ Swarm Paused"}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Autonomous Career Agent Swarm
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              A continuous 4-agent swarm (Scout, Tailor, Auditor, Dispatcher) that monitors job boards, custom-tailors ATS-proof resumes, and submits verified applications on autopilot.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunManualScout}
              disabled={isScouting}
              className="text-xs gap-1.5"
            >
              <Search className={`w-3.5 h-3.5 ${isScouting ? "animate-spin" : ""}`} />
              {isScouting ? "Scouting Boards..." : "Trigger Scout Run"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Tune Swarm
            </Button>

            <Button
              size="sm"
              onClick={handleToggleSwarm}
              className={
                preferences.enabled
                  ? "bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
              }
            >
              {preferences.enabled ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Swarm
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start Swarm
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-border">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
            <span className="text-xs text-muted-foreground font-medium">Scouted Roles</span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{metrics.totalScouted}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
            <span className="text-xs text-muted-foreground font-medium">Tailored Resumes</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {metrics.tailoredCount}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
            <span className="text-xs text-muted-foreground font-medium">Dispatched Today</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {metrics.dispatchedToday}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
            <span className="text-xs text-muted-foreground font-medium">Avg Match Quality</span>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-0.5">
              {metrics.averageMatchScore}%
            </p>
          </div>
        </div>
      </div>

      {/* Swarm Settings Drawer */}
      {showSettings && (
        <div className="p-5 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Swarm Guardrails &amp; Target Configuration
            </h2>
            <button
              onClick={() => setShowSettings(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Dispatch Mode</label>
              <select
                value={preferences.mode}
                onChange={(e) => setPreferences({ ...preferences, mode: e.target.value as any })}
                className="w-full p-2 rounded-lg bg-background border border-border text-foreground text-xs outline-none"
              >
                <option value="human_approval">Human-in-the-Loop (Approval Gate)</option>
                <option value="autonomous">Fully Autonomous (Auto-Apply &gt; 85%)</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">
                Min ATS Match Threshold: {preferences.minMatchScore}%
              </label>
              <input
                type="range"
                min="70"
                max="95"
                value={preferences.minMatchScore}
                onChange={(e) =>
                  setPreferences({ ...preferences, minMatchScore: Number(e.target.value) })
                }
                className="w-full accent-blue-600 cursor-pointer mt-2"
              />
            </div>
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">
                Min Base Salary Floor ($)
              </label>
              <input
                type="number"
                value={preferences.minBaseSalary}
                onChange={(e) =>
                  setPreferences({ ...preferences, minBaseSalary: Number(e.target.value) })
                }
                className="w-full p-2 rounded-lg bg-background border border-border text-foreground text-xs outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4 Agent Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            name: "Scout Agent",
            role: "Greenhouse / Lever Scraper",
            status: "Scanning 14 portals",
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            name: "Tailor Agent",
            role: "ATS Keyword Optimizer",
            status: "Active (STAR rubrics)",
            color: "text-purple-600 dark:text-purple-400",
          },
          {
            name: "Auditor Agent",
            role: "Anti-Hallucination Gate",
            status: "100% checks passed",
            color: "text-emerald-600 dark:text-emerald-400",
          },
          {
            name: "Dispatcher Agent",
            role: "Autonomous Form-Filler",
            status: preferences.mode === "autonomous" ? "Autonomous Dispatch" : "Human Approval Gate",
            color: "text-amber-600 dark:text-amber-400",
          },
        ].map((agent, i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-card shadow-xs text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm">{agent.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-muted-foreground text-xs">{agent.role}</p>
            <p className={`pt-2 font-mono text-[11px] font-semibold ${agent.color}`}>
              ● {agent.status}
            </p>
          </div>
        ))}
      </div>

      {/* Actionable Swarm Task Queue */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-foreground">Target Opportunities &amp; Swarm Queue</h2>
            <Badge variant="outline" className="text-[10px] font-mono">
              {tasks.length} Roles Tracked
            </Badge>
          </div>
        </div>

        <div className="divide-y divide-border">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-5 hover:bg-muted/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground text-base">{task.role}</span>
                  <Badge variant="secondary" className="text-xs font-semibold">
                    <Building className="w-3 h-3 mr-1" /> {task.company}
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold">
                    {task.matchScore}% ATS Overlap
                  </Badge>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {task.portalType}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-0.5">
                  <span>{task.location}</span>
                  {task.estimatedSalary && (
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-600" />
                      ${task.estimatedSalary.toLocaleString()} / yr
                    </span>
                  )}
                  <span>Scouted {new Date(task.appliedAt || Date.now()).toLocaleDateString()}</span>
                </div>

                {/* Audit checklist */}
                <div className="pt-2 space-y-1">
                  {task.auditNotes.map((note, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {task.status === "dispatched" ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold py-1 px-3 gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched to Portal
                  </Badge>
                ) : (
                  <>
                    <Button
                      size="sm"
                      disabled={dispatchingId === task.id}
                      onClick={() => handleApproveDispatch(task)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm"
                    >
                      {dispatchingId === task.id ? (
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      {dispatchingId === task.id ? "Dispatching..." : "Approve & Dispatch"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectTask(task.id)}
                      className="text-xs text-red-600 hover:bg-red-500/10 gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
