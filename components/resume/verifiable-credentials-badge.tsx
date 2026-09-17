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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Blocks,
  Award,
  GraduationCap,
  Briefcase,
  FileCode2,
  Sparkles,
} from "lucide-react";
import {
  VerifiableCredential,
  verifyCredential,
  formatAddressOrHash,
  DEMO_VERIFIABLE_CREDENTIALS,
} from "@/lib/web3/verifiable-credentials";
import { toast } from "sonner";

interface VerifiableCredentialsBadgeProps {
  credentials?: VerifiableCredential[];
  className?: string;
  compact?: boolean;
}

export function VerifiableCredentialsBadge({
  credentials = DEMO_VERIFIABLE_CREDENTIALS,
  className = "",
  compact = false,
}: VerifiableCredentialsBadgeProps) {
  const [selectedCred, setSelectedCred] = useState<VerifiableCredential>(credentials[0]);
  const [copied, setCopied] = useState(false);

  const verification = useMemo(() => {
    return verifyCredential(selectedCred);
  }, [selectedCred]);

  const jsonString = useMemo(() => {
    return JSON.stringify(selectedCred, null, 2);
  }, [selectedCred]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success("W3C Verifiable Credential JSON-LD copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy JSON");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "education":
        return <GraduationCap className="w-3.5 h-3.5 text-purple-600" />;
      case "certification":
        return <Award className="w-3.5 h-3.5 text-amber-600" />;
      case "employment":
        return <Briefcase className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border shadow-xs hover:scale-105 active:scale-95 cursor-pointer ${
            compact
              ? "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
              : "bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-purple-600/15 hover:from-purple-600/20 hover:to-indigo-600/20 text-purple-900 dark:text-purple-200 border-purple-300/60 dark:border-purple-700"
          } ${className}`}
          title="Click to view W3C Cryptographic Proofs on Polygon"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="font-semibold">W3C DID Verified</span>
          <Badge className="bg-purple-600 text-white font-mono text-[9px] px-1.5 py-0 h-4 border-0">
            Polygon
          </Badge>
        </button>
      </DialogTrigger>

      <DialogContent className="w-[96vw] max-w-3xl sm:max-w-2xl md:max-w-3xl max-h-[92vh] overflow-hidden p-0 rounded-2xl flex flex-col bg-white dark:bg-slate-950 border border-purple-200 dark:border-purple-900 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <DialogTitle className="text-xl font-heading font-black tracking-tight text-purple-950 dark:text-purple-100 flex items-center gap-2">
                  Verifiable Credential Proofs
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                    Cryptographically Valid
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  W3C standard JSON-LD credentials signed by accredited institutions & anchored on Polygon (EIP-155:137).
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Credentials Selector Pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Select Verified Achievement:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {credentials.map((cred) => (
                <button
                  key={cred.id}
                  type="button"
                  onClick={() => setSelectedCred(cred)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedCred.id === cred.id
                      ? "bg-purple-50 dark:bg-purple-950/50 border-purple-500 ring-2 ring-purple-500/20 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {getCategoryIcon(cred.credentialSubject.category)}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {cred.credentialSubject.organization}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-foreground line-clamp-1">
                    {cred.credentialSubject.achievementName}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Credential Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/60 to-indigo-50/60 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-200/60 dark:border-purple-800/60">
              <div>
                <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                  Accredited Issuer
                </div>
                <div className="text-base font-black text-purple-950 dark:text-purple-100">
                  {selectedCred.issuer.name}
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-mono border-purple-300 dark:border-purple-700 bg-white/60 dark:bg-slate-900/60 self-start sm:self-auto">
                Issued: {new Date(selectedCred.issuanceDate).toLocaleDateString()}
              </Badge>
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-foreground">
                {selectedCred.credentialSubject.achievementName}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedCred.credentialSubject.criteriaSummary}
              </p>
              {selectedCred.credentialSubject.gradeOrLevel && (
                <div className="pt-1">
                  <Badge className="bg-purple-600/15 text-purple-700 dark:text-purple-300 hover:bg-purple-600/20 border-purple-200 text-xs font-semibold">
                    {selectedCred.credentialSubject.gradeOrLevel}
                  </Badge>
                </div>
              )}
            </div>

            {/* Cryptographic Proof Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900 space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                  <Blocks className="w-3 h-3 text-purple-600" />
                  Polygon Transaction
                </div>
                <div className="font-mono text-purple-700 dark:text-purple-300 font-semibold truncate">
                  {selectedCred.proof.polygonTxHash}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Block #{selectedCred.proof.blockNumber} • Polygon Mainnet
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900 space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">
                  Subject DID Identifier
                </div>
                <div className="font-mono text-foreground font-semibold truncate">
                  {selectedCred.credentialSubject.id}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Signature: {selectedCred.proof.type}
                </div>
              </div>
            </div>
          </div>

          {/* Raw W3C JSON-LD Inspector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5" />
                W3C Verifiable Credential JSON-LD:
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs gap-1 text-purple-700 hover:text-purple-800 dark:text-purple-300"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy Raw JSON-LD"}
              </Button>
            </div>
            <pre className="h-44 p-3.5 bg-neutral-900 text-neutral-100 text-[11px] font-mono overflow-auto rounded-xl border border-neutral-800 leading-relaxed select-all">
              {jsonString}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographic Proof Status: Verified (EIP-155:137)</span>
          </div>

          <Button
            size="sm"
            asChild
            className="h-9 px-4 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white gap-1.5 shadow-sm"
          >
            <a
              href={verification.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>View on Polygonscan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
