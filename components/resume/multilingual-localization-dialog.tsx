"use client";

import React, { useState } from "react";
import {
  SUPPORTED_LOCALES,
  TargetLocale,
  localizeResumeForMarket,
  localizeTechnicalBullet,
} from "@/lib/localization/multilingual-engine";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Download,
  Copy,
  BookOpen,
  FileCheck,
  Check,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface MultilingualLocalizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: {
    id?: string;
    title: string;
    summary?: string;
    skills?: string[];
    experience?: any[];
  };
  onApplyLocalization?: (localizedData: any) => void;
}

export function MultilingualLocalizationDialog({
  open,
  onOpenChange,
  resume,
  onApplyLocalization,
}: MultilingualLocalizationDialogProps) {
  const [selectedLocale, setSelectedLocale] = useState<TargetLocale>("de_DE");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeLocaleProfile = SUPPORTED_LOCALES[selectedLocale];
  const localizedResult = localizeResumeForMarket(resume, selectedLocale);

  const handleApply = () => {
    setIsTranslating(true);
    setTimeout(() => {
      setIsTranslating(false);
      if (onApplyLocalization) {
        onApplyLocalization(localizedResult);
      }
      toast.success(`Resume localized into ${activeLocaleProfile.standardName}!`);
      onOpenChange(false);
    }, 800);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(localizedResult.adaptedSummary);
    setCopied(true);
    toast.success("Localized summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-2xl border-border bg-card p-6 shadow-2xl space-y-5">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                Dynamic Resume Localization & Translation Engine
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Adapt formatting, timeline conventions, and technical idioms for German, French, Japanese, Spanish, and British markets.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Locale Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(SUPPORTED_LOCALES) as TargetLocale[]).map((locKey) => {
            const loc = SUPPORTED_LOCALES[locKey];
            const isSelected = selectedLocale === locKey;

            return (
              <button
                key={locKey}
                onClick={() => setSelectedLocale(locKey)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-500 text-foreground shadow-xs"
                    : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{loc.flag}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight truncate">{loc.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{loc.nativeName}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Market Info & Standards */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-4 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                {activeLocaleProfile.flag} {activeLocaleProfile.standardName}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-600">
                Timeline: {activeLocaleProfile.dateFormat}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{activeLocaleProfile.complianceNotes}</p>
          </div>
        </div>

        {/* Section Header Mapping & Localized Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section Headers */}
          <div className="rounded-xl border border-border/80 p-4 space-y-3 bg-card">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              Standard Section Mappings
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              {localizedResult.localizedSections.map((sec, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-muted/20">
                  <span className="text-muted-foreground">{sec.originalTitle}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
                  <span className="font-semibold text-foreground">{sec.localizedTitle}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Localized Summary & Idiom Preview */}
          <div className="rounded-xl border border-border/80 p-4 space-y-3 bg-card flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Culturally Adapted Summary
                </span>
                <button
                  onClick={handleCopySummary}
                  className="text-muted-foreground hover:text-foreground text-[10px] font-medium flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </span>
              <p className="text-xs text-foreground/90 font-mono leading-relaxed bg-muted/20 p-3 rounded-xl max-h-36 overflow-y-auto">
                {localizedResult.adaptedSummary}
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-border/60">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Target Action Verbs:</span>
              <div className="flex flex-wrap gap-1">
                {activeLocaleProfile.sampleActionVerbs.map((verb, vi) => (
                  <span key={vi} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    {verb}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Compliance checklist */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Regional ATS & Legal Compliance
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {localizedResult.regionalComplianceVerdict.map((v, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-[11px]">{v.guideline}</p>
                  <p className="text-[10px] text-muted-foreground">{v.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="rounded-xl text-xs">
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleApply}
              disabled={isTranslating}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isTranslating ? "Translating..." : `Apply ${activeLocaleProfile.name} Standards`}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
