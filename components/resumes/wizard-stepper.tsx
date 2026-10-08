"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

interface WizardStepperProps {
  steps: WizardStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  canProceed?: boolean;
  isSubmitting?: boolean;
  onComplete?: () => void;
  nextLabel?: string;
  backLabel?: string;
  completeLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export function WizardStepper({
  steps,
  currentStepIndex,
  onStepChange,
  canProceed = true,
  isSubmitting = false,
  onComplete,
  nextLabel = "Continue",
  backLabel = "Back",
  completeLabel = "Complete",
  children,
  className,
}: WizardStepperProps) {
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;
  const currentStep = steps[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  const handleNext = () => {
    if (!canProceed || isSubmitting) return;
    if (isLast) {
      onComplete?.();
    } else {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (isFirst || isSubmitting) return;
    onStepChange(currentStepIndex - 1);
  };

  return (
    <div className={cn("flex flex-col min-h-[600px] w-full", className)}>
      {/* ── Header: Responsive Stepper ─────────────────────────────── */}
      <div className="border-b border-border/80 pb-5 mb-6">
        {/* Mobile View (< md) */}
        <div className="md:hidden space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-muted-foreground font-bold">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="font-bold text-primary">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <h2 className="text-lg font-bold text-foreground mt-2">
            {currentStep.title}
          </h2>
          {currentStep.description && (
            <p className="text-xs text-muted-foreground">{currentStep.description}</p>
          )}
        </div>

        {/* Desktop View (>= md) */}
        <div className="hidden md:block space-y-4">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <li key={step.id} className="relative flex-1">
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => isCompleted && onStepChange(idx)}
                        disabled={!isCompleted}
                        className={cn(
                          "relative flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs transition-all",
                          isCompleted && "bg-primary text-primary-foreground cursor-pointer shadow-sm",
                          isCurrent && "border-2 border-primary bg-primary/10 text-primary ring-2 ring-primary/20",
                          !isCompleted && !isCurrent && "border border-border bg-muted/50 text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                      </button>
                      <div className="ml-3">
                        <p className={cn(
                          "text-xs font-bold leading-tight",
                          isCurrent ? "text-foreground" : isCompleted ? "text-foreground/80" : "text-muted-foreground"
                        )}>
                          {step.title}
                        </p>
                      </div>
                      {idx !== steps.length - 1 && (
                        <div className={cn(
                          "flex-1 h-0.5 mx-4 transition-colors",
                          idx < currentStepIndex ? "bg-primary" : "bg-border"
                        )} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Step Body Content ───────────────────────────────────────── */}
      <div className="flex-1 pb-24 md:pb-8">
        {children}
      </div>

      {/* ── Responsive Sticky Bottom Actions Bar ─────────────────────── */}
      <div className="sticky bottom-14 md:bottom-0 inset-x-0 z-30 bg-card/95 dark:bg-[#090d16]/95 backdrop-blur-xl border-t border-border/80 p-3 sm:p-4 -mx-4 sm:-mx-6 px-4 sm:px-6 mt-auto shadow-lg flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={isFirst || isSubmitting}
          className="h-10 text-xs font-bold rounded-xl gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backLabel}</span>
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="h-10 px-5 text-xs font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] rounded-xl gap-2 cursor-pointer shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : isLast ? (
            <>
              <span>{completeLabel}</span>
              <Check className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>{nextLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
