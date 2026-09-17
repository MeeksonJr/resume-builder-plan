"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Users, Copy, Check, Sparkles, UserPlus, Shield, Eye } from "lucide-react";
import type { PeerCursor, PeerUser } from "@/lib/collaboration/realtime-cursors";
import { toast } from "sonner";

interface LiveCollabToolbarProps {
  resumeId: string;
  activePeers: PeerCursor[];
  isSimulating: boolean;
  onToggleSimulation: () => void;
  className?: string;
}

export function LiveCollabToolbar({
  resumeId,
  activePeers,
  isSimulating,
  onToggleSimulation,
  className = "",
}: LiveCollabToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [roleInvite, setRoleInvite] = useState<"coach" | "reviewer" | "mentor">("coach");

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/resume/${resumeId}?collab=true&role=${roleInvite}`
      : `https://resumeforge.app/dashboard/resume/${resumeId}?collab=true&role=${roleInvite}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Live pair-editing link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy invite link");
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Active Peers Avatar Stack */}
      <div className="flex items-center -space-x-1.5 overflow-hidden">
        {activePeers.map((peer) => (
          <div
            key={peer.userId}
            style={{ borderColor: peer.color || "#0d8274" }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 text-[10px] font-bold text-neutral-800 shadow-xs ring-1 ring-black/5"
            title={`${peer.name} (${peer.role})`}
          >
            {peer.name.charAt(0)}
          </div>
        ))}
        {activePeers.length === 0 && (
          <div className="h-7 w-7 rounded-full bg-neutral-200/80 flex items-center justify-center text-[10px] font-semibold text-neutral-600 border border-neutral-300">
            You
          </div>
        )}
      </div>

      {/* Invite Coach & Share Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs gap-1.5 border-neutral-300 bg-white hover:bg-neutral-100 rounded-none text-neutral-800 font-bold"
            title="Invite Career Coach or Peer for Live Pair-Review"
          >
            <UserPlus className="h-3.5 w-3.5 text-[#0d8274]" />
            <span className="hidden sm:inline">Pair Review</span>
            {activePeers.length > 0 && (
              <span className="ml-0.5 px-1 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-mono">
                {activePeers.length} online
              </span>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md rounded-none border-neutral-800 p-0 overflow-hidden bg-white">
          <div className="bg-[#102b2b] text-[#f8f4ec] p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Users className="h-4 w-4" />
              </span>
              <DialogTitle className="text-base font-bold text-white tracking-tight">
                Live Collaborative Pair-Editing
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-neutral-300">
              Invite a career coach or peer to review your resume in real time with synchronized cursors and live annotations.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4">
            {/* Role Invite Choice */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Collaborator Role:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "coach", label: "Career Coach", icon: Shield },
                  { id: "mentor", label: "Senior Mentor", icon: Sparkles },
                  { id: "reviewer", label: "Peer Reviewer", icon: Eye },
                ].map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setRoleInvite(role.id as any)}
                      className={`p-2 text-xs font-bold border transition-colors flex flex-col items-center gap-1 ${
                        roleInvite === role.id
                          ? "bg-[#102b2b] text-white border-[#102b2b]"
                          : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Link Copy Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Direct Invitation Link:</label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={inviteUrl}
                  className="h-8 text-xs bg-neutral-50 rounded-none border-neutral-300 font-mono select-all"
                />
                <Button
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-8 px-3 rounded-none bg-[#102b2b] hover:bg-[#102b2b]/90 text-white text-xs font-bold shrink-0 gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Instant Ghost Simulation Mode */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-neutral-800 block">Simulate Coach Presence</span>
                <span className="text-[11px] text-neutral-500 block">
                  Test live cursors and pair-editing with an AI Career Coach.
                </span>
              </div>
              <Button
                variant={isSimulating ? "default" : "outline"}
                size="sm"
                onClick={onToggleSimulation}
                className={`h-8 text-xs font-bold rounded-none gap-1.5 ${
                  isSimulating
                    ? "bg-[#0d8274] hover:bg-[#0d8274]/90 text-white"
                    : "border-neutral-300 hover:bg-neutral-100 text-neutral-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isSimulating ? "Stop Sim" : "Start Sim"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
