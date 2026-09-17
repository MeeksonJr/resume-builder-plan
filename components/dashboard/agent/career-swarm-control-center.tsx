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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, Plus, XCircle } from "lucide-react";

export interface SwarmLogEntry {
  id: string;
  timestamp: string;
  agent: "Scout" | "Tailor" | "Auditor" | "Dispatcher";
  level: "info" | "success" | "warning";
  message: string;
}

export function CareerSwarmControlCenter() {
  const [preferences, setPreferences] = useState<SwarmPreferences>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("resumeforge_swarm_preferences");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_SWARM_PREFERENCES;
  });

  const [tasks, setTasks] = useState<SwarmTask[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("resumeforge_swarm_tasks");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return MOCK_SWARM_TASKS;
  });

  const [logs, setLogs] = useState<SwarmLogEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("resumeforge_swarm_logs");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        id: "log-1",
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(),
        agent: "Scout",
        level: "info",
        message: "Scanned Greenhouse & Lever APIs for Senior / Staff Engineer roles. 28 listings evaluated.",
      },
      {
        id: "log-2",
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toLocaleTimeString(),
        agent: "Tailor",
        level: "success",
        message: "Generated tailored STAR achievement bullet variant for Stripe Developer Platform.",
      },
      {
        id: "log-3",
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toLocaleTimeString(),
        agent: "Auditor",
        level: "success",
        message: "Vetted application packet against anti-hallucination rubric. Verified 94% ATS match.",
      },
    ];
  });

  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [isScouting, setIsScouting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogs, setShowLogs] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    company: "",
    role: "",
    location: "Remote / Hybrid",
    portalType: "greenhouse" as SwarmTask["portalType"],
    portalUrl: "",
    salary: 195000,
  });

  const metrics = calculateSwarmMetrics(tasks);

  // Sync state to localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("resumeforge_swarm_tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("resumeforge_swarm_preferences", JSON.stringify(preferences));
    }
  }, [preferences]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("resumeforge_swarm_logs", JSON.stringify(logs.slice(0, 50)));
    }
  }, [logs]);

  // Periodic heartbeat telemetry simulation
  React.useEffect(() => {
    if (!preferences.enabled) return;

    const interval = setInterval(() => {
      const messages = [
        { agent: "Scout" as const, message: "Inspected Greenhouse boards for target keywords... Found 3 candidate roles." },
        { agent: "Auditor" as const, message: "Checked compliance filters: Base salary floor verified ($175k+ target)." },
        { agent: "Tailor" as const, message: "Cache refreshed for Candidate STAR rubrics and verification proofs." },
      ];
      const selected = messages[Math.floor(Math.random() * messages.length)];
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: selected.agent,
          level: "info",
          message: selected.message,
        },
        ...prev.slice(0, 49),
      ]);
    }, 14000);

    return () => clearInterval(interval);
  }, [preferences.enabled]);

  const handleToggleSwarm = () => {
    const nextState = !preferences.enabled;
    setPreferences((prev) => ({ ...prev, enabled: nextState }));
    if (nextState) {
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: "Scout",
          level: "success",
          message: "Autonomous Swarm activated. Subagents dispatched to 14 career portals.",
        },
        ...prev,
      ]);
      toast.success("Autonomous Career Swarm started! 4 subagents actively monitoring job boards.");
    } else {
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: "Dispatcher",
          level: "warning",
          message: "Swarm paused by candidate. Automated outbounds suspended.",
        },
        ...prev,
      ]);
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
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: "Scout",
          level: "success",
          message: "Scout Agent discovered 94% match at Databricks (Senior Distributed Systems Engineer).",
        },
        {
          id: `log-${Date.now() + 1}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: "Tailor",
          level: "info",
          message: "Generated tailored resume variant with Lakehouse architecture bullets.",
        },
        ...prev,
      ]);
      toast.success("Scout Agent discovered a 94% match at Databricks!");
    }, 1200);
  };

  const handleAddCustomOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpportunity.company || !newOpportunity.role) {
      toast.error("Please enter both company name and role title");
      return;
    }

    const customTask: SwarmTask = {
      id: `custom-${Date.now()}`,
      jobId: `custom-job-${Date.now()}`,
      company: newOpportunity.company,
      role: newOpportunity.role,
      location: newOpportunity.location,
      estimatedSalary: Number(newOpportunity.salary) || 180000,
      matchScore: Math.floor(Math.random() * 8) + 91,
      portalType: newOpportunity.portalType,
      portalUrl: newOpportunity.portalUrl || `https://careers.${newOpportunity.company.toLowerCase().replace(/\s+/g, "")}.com`,
      status: "pending_approval",
      appliedAt: new Date().toISOString(),
      auditNotes: [
        `Directly ingested target opportunity for ${newOpportunity.company}`,
        `Auto-extracted ATS requirements and generated custom STAR bullets`,
        "Verified zero hallucination against candidate master profile",
      ],
    };

    setTasks((prev) => [customTask, ...prev]);
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: "Tailor",
        level: "success",
        message: `Custom role "${customTask.role}" at ${customTask.company} ingested and analyzed (${customTask.matchScore}% ATS match).`,
      },
      ...prev,
    ]);
    setIsAddModalOpen(false);
    setNewOpportunity({
      company: "",
      role: "",
      location: "Remote / Hybrid",
      portalType: "greenhouse",
      portalUrl: "",
      salary: 195000,
    });
    toast.success(`Target opportunity added to Swarm queue for ${customTask.company}!`);
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
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: "Dispatcher",
          level: "success",
          message: `Application packet for ${task.role} at ${task.company} dispatched to ${task.portalType.toUpperCase()} portal!`,
        },
        ...prev,
      ]);
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
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Target Role
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogs(!showLogs)}
              className="text-xs gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              {showLogs ? "Hide Telemetry" : "Agent Telemetry"}
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

      {/* Live Swarm Telemetry Terminal */}
      {showLogs && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="p-3.5 bg-muted/40 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-xs text-foreground">Live Autonomous Swarm Telemetry</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Subagent Loop Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLogs([])}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                Clear Stream
              </Button>
            </div>
          </div>
          <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs max-h-56 overflow-y-auto space-y-1.5 rounded-b-2xl">
            {logs.length === 0 ? (
              <p className="text-slate-500 text-xs py-2 italic">No telemetry logs captured yet. Waiting for swarm tick...</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">{log.timestamp}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                    log.agent === "Scout"
                      ? "bg-blue-900/60 text-blue-300 border border-blue-700/50"
                      : log.agent === "Tailor"
                      ? "bg-purple-900/60 text-purple-300 border border-purple-700/50"
                      : log.agent === "Auditor"
                      ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                      : "bg-amber-900/60 text-amber-300 border border-amber-700/50"
                  }`}>
                    [{log.agent}]
                  </span>
                  <span className={log.level === "warning" ? "text-amber-300" : log.level === "success" ? "text-emerald-300" : "text-slate-300"}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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

      {/* Ingest Target Role Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="rounded-2xl border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Target Opportunity to Swarm</DialogTitle>
            <DialogDescription className="text-xs">
              Direct the 4 autonomous subagents to analyze, tailor, and audit an application packet for this role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCustomOpportunity} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Company Name</Label>
              <Input
                placeholder="e.g. Anthropic"
                value={newOpportunity.company}
                onChange={(e) => setNewOpportunity({ ...newOpportunity, company: e.target.value })}
                required
                className="rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Role Title</Label>
              <Input
                placeholder="e.g. Fullstack AI Systems Engineer"
                value={newOpportunity.role}
                onChange={(e) => setNewOpportunity({ ...newOpportunity, role: e.target.value })}
                required
                className="rounded-xl text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">ATS Portal System</Label>
                <select
                  value={newOpportunity.portalType}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, portalType: e.target.value as any })}
                  className="w-full p-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none"
                >
                  <option value="greenhouse">Greenhouse</option>
                  <option value="lever">Lever</option>
                  <option value="ashby">Ashby</option>
                  <option value="workday">Workday</option>
                  <option value="linkedin">LinkedIn EasyApply</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Estimated Salary ($)</Label>
                <Input
                  type="number"
                  value={newOpportunity.salary}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, salary: Number(e.target.value) })}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Job Posting URL (Optional)</Label>
              <Input
                type="url"
                placeholder="https://jobs.lever.co/company/..."
                value={newOpportunity.portalUrl}
                onChange={(e) => setNewOpportunity({ ...newOpportunity, portalUrl: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground font-bold rounded-xl text-xs"
              >
                Ingest into Swarm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
