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
  Briefcase
} from "lucide-react";
import {
  DEFAULT_SWARM_PREFERENCES,
  MOCK_SWARM_TASKS,
  SwarmPreferences,
  SwarmTask,
  calculateSwarmMetrics
} from "@/lib/agent/career-swarm-agent";
import { executeApplicationDispatch } from "@/lib/jobs/auto-apply-dispatcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CareerSwarmControlCenter() {
  const [preferences, setPreferences] = useState<SwarmPreferences>(DEFAULT_SWARM_PREFERENCES);
  const [tasks, setTasks] = useState<SwarmTask[]>(MOCK_SWARM_TASKS);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const metrics = calculateSwarmMetrics(tasks);

  const handleToggleSwarm = () => {
    setPreferences(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleApproveDispatch = async (task: SwarmTask) => {
    setDispatchingId(task.id);
    try {
      // Execute dispatch simulation using candidate profile defaults
      await executeApplicationDispatch(
        task.id,
        task.portalType,
        {
          fullName: "Mohamed Lamine Datt",
          email: "d.mohamed1504@gmail.com",
          phone: "+1 555-0199",
          location: "San Francisco, CA",
          linkedinUrl: "https://linkedin.com/in/mohamed-datt",
          portfolioUrl: "https://resumeforge.pro/p/d.mohamed1504",
          githubUrl: "https://github.com/MeeksonJr",
          yearsOfExperience: 6,
          workAuthorization: "us_citizen",
        }
      );

      setTasks(prev => prev.map(t => {
        if (t.id === task.id) {
          return {
            ...t,
            status: "dispatched",
            appliedAt: new Date().toISOString(),
            auditNotes: [...t.auditNotes, "Approved by candidate & dispatched directly to ATS portal"],
          };
        }
        return t;
      }));
    } finally {
      setDispatchingId(null);
    }
  };

  const handleRejectTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  return (
    <div className="space-y-6">
      {/* Hero Control Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-background border border-blue-500/20 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-medium">
                <Bot className="w-3.5 h-3.5 mr-1" />
                Phase 60: 24/7 Career Agent Swarm
              </Badge>
              <Badge className={`${
                preferences.enabled 
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse" 
                  : "bg-neutral-800 text-neutral-400 border-neutral-700"
              }`}>
                {preferences.enabled ? "Swarm Active & Scouting" : "Swarm Paused"}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Autonomous Career Agent Swarm
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              A continuous 4-agent swarm (Scout, Tailor, Auditor, Dispatcher) that monitors job boards, custom-tailors ATS-proof resumes, and submits verified applications on autopilot.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs border-border/80 text-white bg-card/60"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
              Tune Swarm
            </Button>
            <Button
              onClick={handleToggleSwarm}
              className={preferences.enabled ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"}
            >
              {preferences.enabled ? (
                <>
                  <Pause className="w-4 h-4 mr-1.5" /> Pause Swarm
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1.5" /> Start Swarm
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[11px] text-muted-foreground">Scouted Roles</span>
            <p className="text-xl font-bold text-white mt-0.5">{metrics.totalScouted}</p>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[11px] text-muted-foreground">Tailored Resumes</span>
            <p className="text-xl font-bold text-blue-400 mt-0.5">{metrics.tailoredCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[11px] text-muted-foreground">Dispatched Today</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{metrics.dispatchedToday}</p>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[11px] text-muted-foreground">Avg Match Quality</span>
            <p className="text-xl font-bold text-cyan-300 mt-0.5">{metrics.averageMatchScore}%</p>
          </div>
        </div>
      </div>

      {/* Swarm Settings Drawer */}
      {showSettings && (
        <div className="p-5 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-4 animate-in fade-in">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" /> Swarm Guardrails & Target Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-muted-foreground block mb-1">Dispatch Mode</label>
              <select
                value={preferences.mode}
                onChange={(e) => setPreferences({ ...preferences, mode: e.target.value as any })}
                className="w-full p-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs outline-none"
              >
                <option value="human_approval">Human-in-the-Loop (Approval Gate)</option>
                <option value="autonomous">Fully Autonomous (Auto-Apply &gt; 85%)</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">Min ATS Match Threshold: {preferences.minMatchScore}%</label>
              <input
                type="range"
                min="70"
                max="95"
                value={preferences.minMatchScore}
                onChange={(e) => setPreferences({ ...preferences, minMatchScore: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">Min Base Salary Floor ($)</label>
              <input
                type="number"
                value={preferences.minBaseSalary}
                onChange={(e) => setPreferences({ ...preferences, minBaseSalary: Number(e.target.value) })}
                className="w-full p-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4 Agent Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { name: "Scout Agent", role: "Greenhouse / Lever Scraper", status: "Scanning 14 portals", color: "text-blue-400" },
          { name: "Tailor Agent", role: "ATS Keyword Optimizer", status: "Active (Next.js & Turbopack)", color: "text-purple-400" },
          { name: "Auditor Agent", role: "Anti-Hallucination Gate", status: "100% checks passed", color: "text-emerald-400" },
          { name: "Dispatcher Agent", role: "Autonomous Form-Filler", status: "Awaiting approval", color: "text-amber-400" },
        ].map((agent, i) => (
          <div key={i} className="p-3.5 rounded-xl border border-border/60 bg-card/50 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white">{agent.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-muted-foreground text-[11px]">{agent.role}</p>
            <p className={`mt-2 font-mono text-[11px] font-medium ${agent.color}`}>
              ● {agent.status}
            </p>
          </div>
        ))}
      </div>

      {/* Actionable Swarm Task Queue */}
      <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden shadow-lg">
        <div className="p-4 bg-muted/20 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm text-white">Target Opportunities & Swarm Queue</h2>
            <Badge variant="outline" className="text-[10px] font-mono">
              {tasks.length} Roles Tracked
            </Badge>
          </div>
        </div>

        <div className="divide-y divide-border/40">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-white/[0.02] transition flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-sm">{task.role}</span>
                  <Badge variant="secondary" className="text-[10px] font-medium">
                    <Building className="w-3 h-3 mr-1" /> {task.company}
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                    {task.matchScore}% ATS Overlap
                  </Badge>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {task.portalType}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{task.location}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">
                    ${task.estimatedSalary.toLocaleString()}/yr target
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {task.auditNotes.map((note, idx) => (
                    <span key={idx} className="text-[11px] text-neutral-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                      ✓ {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {task.status === "dispatched" ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 py-1.5 px-3">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Application Dispatched
                  </Badge>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRejectTask(task.id)}
                      className="h-8 text-xs text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Skip
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveDispatch(task)}
                      disabled={dispatchingId === task.id}
                      className="h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-600/20"
                    >
                      <Send className={`w-3.5 h-3.5 mr-1.5 ${dispatchingId === task.id ? "animate-spin" : ""}`} />
                      {dispatchingId === task.id ? "Dispatching..." : "Approve & Dispatch"}
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
