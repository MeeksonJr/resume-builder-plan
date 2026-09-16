"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Copy,
  Check,
  Download,
  Bot,
  Zap,
  ShieldCheck,
  FileCode2,
  ExternalLink,
} from "lucide-react";
import {
  generateAtsPayload,
  downloadJsonPayload,
  type AtsPlatform,
  type CandidatePreferences,
} from "@/lib/jobs/form-filler-payload";
import { toast } from "sonner";

interface AutoApplyPayloadDialogProps {
  resumeData: any;
  jobRole?: string;
  companyName?: string;
  triggerButton?: React.ReactNode;
}

export function AutoApplyPayloadDialog({
  resumeData,
  jobRole,
  companyName,
  triggerButton,
}: AutoApplyPayloadDialogProps) {
  const [platform, setPlatform] = useState<AtsPlatform>("universal");
  const [workAuth, setWorkAuth] = useState<CandidatePreferences["workAuthorization"]>("citizen");
  const [noticeWeeks, setNoticeWeeks] = useState<number>(2);
  const [desiredSalary, setDesiredSalary] = useState<string>("$150,000");
  const [copied, setCopied] = useState(false);

  const preferences: CandidatePreferences = useMemo(() => ({
    workAuthorization: workAuth,
    noticePeriodWeeks: noticeWeeks,
    desiredSalary: desiredSalary || undefined,
  }), [workAuth, noticeWeeks, desiredSalary]);

  const payload = useMemo(() => {
    return generateAtsPayload(resumeData, platform, preferences);
  }, [resumeData, platform, preferences]);

  const jsonString = useMemo(() => {
    return JSON.stringify(payload, null, 2);
  }, [payload]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success(`${platform.toUpperCase()} application payload copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy payload");
    }
  };

  const handleDownload = () => {
    const filename = `${companyName ? `${companyName}_` : ""}${platform}_autofill.json`.toLowerCase().replace(/\s+/g, "_");
    const success = downloadJsonPayload(payload, filename);
    if (success) {
      toast.success(`Exported ${filename}`);
    } else {
      toast.error("Export failed");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs gap-1.5 border-neutral-300 hover:bg-neutral-100 rounded-none"
            title="Export 1-Click Form-Fill Payload"
          >
            <Bot className="h-3.5 w-3.5 text-indigo-600" />
            <span>Auto-Apply Payload</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl rounded-none border-neutral-800 p-0 overflow-hidden bg-white">
        {/* Modal Header */}
        <div className="bg-[#102b2b] text-[#f8f4ec] p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-[#d8f36b]/20 text-[#d8f36b] border border-[#d8f36b]/30">
              <Zap className="h-4 w-4" />
            </span>
            <DialogTitle className="text-base font-bold text-white tracking-tight">
              ATS Form-Fill Payload Generator
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-300">
            Export structured application dossiers pre-mapped for Greenhouse, Lever, Workday, and Ashby.
            {companyName && ` Tailored for ${jobRole || "role"} at ${companyName}.`}
          </DialogDescription>
        </div>

        <div className="p-6 space-y-4">
          {/* Target ATS Platform Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700">Target ATS Portal:</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(
                [
                  { id: "universal", label: "Universal" },
                  { id: "greenhouse", label: "Greenhouse" },
                  { id: "lever", label: "Lever" },
                  { id: "workday", label: "Workday" },
                  { id: "ashby", label: "Ashby" },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={`py-1.5 text-xs font-bold border transition-colors ${
                    platform === p.id
                      ? "bg-[#102b2b] text-white border-[#102b2b]"
                      : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Preferences Config */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-neutral-50 border border-neutral-200 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Work Authorization</label>
              <Select
                value={workAuth}
                onValueChange={(val: any) => setWorkAuth(val)}
              >
                <SelectTrigger className="h-8 text-xs bg-white rounded-none border-neutral-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="citizen">US Citizen</SelectItem>
                  <SelectItem value="permanent_resident">Permanent Resident (GC)</SelectItem>
                  <SelectItem value="work_visa">Valid Work Visa (H-1B / TN / OPT)</SelectItem>
                  <SelectItem value="sponsorship_required">Requires Sponsorship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Notice Period</label>
              <Select
                value={String(noticeWeeks)}
                onValueChange={(val) => setNoticeWeeks(Number(val))}
              >
                <SelectTrigger className="h-8 text-xs bg-white rounded-none border-neutral-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="0">Immediate</SelectItem>
                  <SelectItem value="2">2 Weeks</SelectItem>
                  <SelectItem value="4">4 Weeks / 1 Month</SelectItem>
                  <SelectItem value="8">8 Weeks / 2 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Desired Compensation</label>
              <Input
                value={desiredSalary}
                onChange={(e) => setDesiredSalary(e.target.value)}
                placeholder="$150,000"
                className="h-8 text-xs bg-white rounded-none border-neutral-300"
              />
            </div>
          </div>

          {/* JSON Payload Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-neutral-500" />
                Formatted Payload ({platform}.json):
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {Math.round(jsonString.length / 1024 * 10) / 10} KB
              </span>
            </div>

            <pre className="h-44 p-3 bg-neutral-900 text-neutral-100 text-[11px] font-mono overflow-auto rounded-none border border-neutral-800 leading-relaxed select-all">
              {jsonString}
            </pre>
          </div>

          {/* Actions & Browser Extension Notice */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Compatible with Simplify, Teal & ResumeForge Autofill</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-8 text-xs font-bold rounded-none border-neutral-300 gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download .json
              </Button>

              <Button
                size="sm"
                onClick={handleCopy}
                className="h-8 text-xs font-bold rounded-none bg-[#102b2b] hover:bg-[#102b2b]/90 text-white gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy Payload"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
