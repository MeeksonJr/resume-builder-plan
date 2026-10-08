"use client";

import * as React from "react";
import { History, RotateCcw, ArrowRight, Check, X, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface ResumeVersionSnapshot {
  versionId: string;
  createdAt: string;
  author: string;
  title: string;
  diffItems: Array<{
    type: "added" | "removed" | "unchanged";
    section: string;
    text: string;
  }>;
}

interface VersionDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: ResumeVersionSnapshot | null;
  onRollback?: (versionId: string) => void;
}

export function VersionDiffModal({
  isOpen,
  onClose,
  snapshot,
  onRollback,
}: VersionDiffModalProps) {
  if (!snapshot) return null;

  const handleRestore = () => {
    onRollback?.(snapshot.versionId);
    toast.success(`Restored resume revision from ${new Date(snapshot.createdAt).toLocaleDateString()}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card border-border shadow-2xl p-6 rounded-2xl flex flex-col max-h-[85vh]">
        <DialogHeader className="border-b border-border/80 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <History className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Resume Revision Diff &bull; {snapshot.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Saved on {new Date(snapshot.createdAt).toLocaleString()} by {snapshot.author}
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              v{snapshot.versionId.slice(0, 7)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 py-3 font-mono text-xs">
          {snapshot.diffItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border leading-relaxed ${
                item.type === "added"
                  ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                  : item.type === "removed"
                    ? "bg-red-500/10 text-red-800 dark:text-red-300 border-red-500/30 line-through opacity-75"
                    : "bg-muted/40 text-foreground/80 border-border/50"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block text-muted-foreground mb-1">
                [{item.type.toUpperCase()}] &bull; {item.section}
              </span>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="h-9 text-xs font-bold rounded-xl">
            Close Diff
          </Button>
          <Button
            size="sm"
            onClick={handleRestore}
            className="h-9 px-4 text-xs font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] rounded-xl gap-2 shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Rollback to this Snapshot</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
