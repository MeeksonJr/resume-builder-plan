"use client";

import React, { useState } from "react";
import {
  SourcingAgentConfig,
  SourcingEvaluationResult,
  DEFAULT_AGENT_CONFIG,
  evaluateRecruiterRequest,
  runSourcingAgentBatch,
} from "@/lib/agent/recruiter-sourcing-agent";
import { RecruiterIntroRequest, CandidateMarketplaceProfile, SAMPLE_MARKETPLACE_CANDIDATES } from "@/lib/marketplace/reverse-job-board";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  HelpCircle,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

interface RecruiterSourcingAgentViewProps {
  candidate?: CandidateMarketplaceProfile;
}

const SAMPLE_INCOMING_REQUESTS: RecruiterIntroRequest[] = [
  {
    id: "req-scale-ai",
    candidateId: "cand-default",
    recruiterId: "rec-101",
    recruiterName: "Maya Lin",
    recruiterCompany: "Scale AI",
    recruiterEmail: "maya@scale.com",
    jobRole: "Senior Fullstack Systems Engineer",
    salaryOffered: "$205,000 - $240,000 + Top-Tier Equity",
    customPitch: "Saw your verified public portfolio and distributed systems projects. We are scaling our data engine and your background is an exceptional match.",
    status: "pending_review",
    requestedAt: "10 mins ago",
  },
  {
    id: "req-vague-startup",
    candidateId: "cand-default",
    recruiterId: "rec-102",
    recruiterName: "Brad Hunter",
    recruiterCompany: "Stealth Autonomous Fleet",
    recruiterEmail: "brad@stealthfleet.ai",
    jobRole: "Core Platform Architect",
    salaryOffered: "Competitive Market Package",
    customPitch: "Backed by tier-1 VC. Building the next generation of autonomous freight infrastructure.",
    status: "pending_review",
    requestedAt: "45 mins ago",
  },
  {
    id: "req-unmatched",
    candidateId: "cand-default",
    recruiterId: "rec-103",
    recruiterName: "Vikram Mehta",
    recruiterCompany: "CryptoCasino Ltd",
    recruiterEmail: "vikram@cryptocasino.biz",
    jobRole: "Offshore Solidity Web3 Lead",
    salaryOffered: "$130k base",
    customPitch: "Fast paced gambling project looking for immediate contract hire.",
    status: "pending_review",
    requestedAt: "2 hours ago",
  },
];

export function RecruiterSourcingAgentView({ candidate = SAMPLE_MARKETPLACE_CANDIDATES[0] }: RecruiterSourcingAgentViewProps) {
  const [config, setConfig] = useState<SourcingAgentConfig>(DEFAULT_AGENT_CONFIG);
  const [incomingRequests, setIncomingRequests] = useState<RecruiterIntroRequest[]>(SAMPLE_INCOMING_REQUESTS);
  const [isScanning, setIsScanning] = useState(false);

  // Run initial batch
  const { evaluations, stats } = runSourcingAgentBatch(incomingRequests, candidate, config);

  const handleSimulateInboundScout = () => {
    setIsScanning(true);
    toast.info("Autonomous Sourcing Agent scanning inbound recruiter requests...");

    setTimeout(() => {
      const newInbound: RecruiterIntroRequest = {
        id: `req-inbound-${Date.now()}`,
        candidateId: candidate.id,
        recruiterId: `rec-${Date.now()}`,
        recruiterName: "Elena Rostova",
        recruiterCompany: "Datadog",
        recruiterEmail: "elena@datadoghq.com",
        jobRole: "Staff Distributed Observability Engineer",
        salaryOffered: "$230,000 - $275,000 + RSUs",
        customPitch: "We came across your verified high-concurrency systems background and would love to schedule a direct screening for our Core Telemetry Engine.",
        status: "pending_review",
        requestedAt: "Just now",
      };

      setIncomingRequests((prev) => [newInbound, ...prev]);
      setIsScanning(false);
      toast.success("New inbound recruiter request received, evaluated, and qualified!");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-foreground">Autonomous Recruiter Sourcing Agent</h2>
              <Badge className="bg-emerald-600 text-white border-none text-[10px] font-mono">
                {config.enabled ? "ACTIVE 24/7" : "PAUSED"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatically qualifies inbound reverse job board introductions against your salary floor and auto-replies with direct calendar booking slots.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleSimulateInboundScout}
            disabled={isScanning}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl shadow-sm gap-1.5"
          >
            {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Simulate Inbound Request</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 bg-card p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Requests Scanned</span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </span>
          <div className="text-2xl font-black text-foreground">{stats.totalScanned}</div>
          <p className="text-[11px] text-muted-foreground">Inbound introductions</p>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Qualified & Scheduled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </span>
          <div className="text-2xl font-black text-emerald-600">{stats.qualifiedAndScheduled}</div>
          <p className="text-[11px] text-emerald-600 font-semibold">Sent direct Cal.com invite</p>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Needs Compensation Clarification</span>
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </span>
          <div className="text-2xl font-black text-amber-600">{stats.pendingClarification}</div>
          <p className="text-[11px] text-muted-foreground">Queried salary band</p>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Declined (Out of Scope)</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </span>
          <div className="text-2xl font-black text-foreground">{stats.declinedUnmatched}</div>
          <p className="text-[11px] text-muted-foreground">Politely filtered</p>
        </Card>
      </div>

      {/* Main Grid: Rules & Real-time Auto-Reply Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Agent Rules & Availability Configuration */}
        <Card className="lg:col-span-4 rounded-2xl border-border/80 bg-card p-5 space-y-5 shadow-sm">
          <div className="border-b border-border/70 pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Sourcing Agent Rules
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Define qualification filters and auto-booking links.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20">
              <div>
                <p className="font-bold text-foreground">Agent Auto-Reply</p>
                <p className="text-[11px] text-muted-foreground">Send vetted calendar invites automatically</p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => {
                  setConfig({ ...config, enabled: checked });
                  toast.success(checked ? "Agent activated" : "Agent paused");
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Minimum Salary Floor ($/yr)</Label>
              <Input
                type="number"
                value={config.minSalaryThreshold}
                onChange={(e) => setConfig({ ...config, minSalaryThreshold: Number(e.target.value) })}
                className="h-9 rounded-xl text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Inquiries below this are politely questioned or declined.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Direct Calendar Booking Link</Label>
              <Input
                value={config.calendarBookingUrl}
                onChange={(e) => setConfig({ ...config, calendarBookingUrl: e.target.value })}
                placeholder="e.g. https://cal.com/username/intro"
                className="h-9 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Weekly Availability Windows</Label>
              <Input
                value={config.availabilitySlotsSummary}
                onChange={(e) => setConfig({ ...config, availabilitySlotsSummary: e.target.value })}
                className="h-9 rounded-xl text-xs"
              />
            </div>

            <div className="p-3 rounded-xl border border-border/80 bg-muted/20 text-muted-foreground text-[11px] space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Anti-Spam Privacy Protection
              </span>
              <p>Your calendar link is provided ONLY to recruiters who offer verified compensation exceeding your floor.</p>
            </div>
          </div>
        </Card>

        {/* Live Evaluated Recruiter Requests */}
        <Card className="lg:col-span-8 rounded-2xl border-border/80 bg-card p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Inbound Evaluation & Auto-Reply Dispatch Queue
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time decisions generated by the sourcing agent.</p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              {evaluations.length} Scanned
            </Badge>
          </div>

          <div className="space-y-4">
            {evaluations.map((ev, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-border/80 bg-muted/20 space-y-3.5 transition-all hover:border-emerald-500/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{ev.jobRole}</h4>
                      <span className="text-xs text-muted-foreground">&bull; {ev.recruiterCompany}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {ev.evaluationReasons.join(" • ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Match {ev.matchScore}%
                    </span>
                    <Badge
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        ev.status === "qualified_scheduled"
                          ? "bg-emerald-600 text-white"
                          : ev.status === "needs_clarification"
                          ? "bg-amber-600 text-white"
                          : "bg-neutral-500 text-white"
                      }`}
                    >
                      {ev.status === "qualified_scheduled"
                        ? "Scheduled"
                        : ev.status === "needs_clarification"
                        ? "Clarification Sent"
                        : "Declined"}
                    </Badge>
                  </div>
                </div>

                {/* Synthesized Auto-Reply Preview */}
                <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Generated Auto-Reply</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(ev.generatedReplyMessage);
                        toast.success("Copied reply message");
                      }}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </span>
                  <p className="text-xs text-foreground/90 font-mono whitespace-pre-line leading-relaxed">
                    {ev.generatedReplyMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
