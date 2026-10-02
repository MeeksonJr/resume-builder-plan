"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, Clock, ShieldAlert, Sparkles, ArrowRight, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface VerificationGateModalProps {
  /** ISO timestamp when the demo trial started. Null if never started. */
  demoStartedAt: string | null;
  /** True if user's email is already verified in auth.users */
  isEmailVerified: boolean;
  /** User email for resend flow */
  userEmail: string;
}

/** 
 * Inescapable full-screen modal that blocks dashboard access for unverified users 
 * whose 24-hour trial has expired (or who never started a trial).
 * 
 * NO close button. NO backdrop dismiss. Exits ONLY on successful verification.
 */
export function VerificationGateModal({
  demoStartedAt,
  isEmailVerified,
  userEmail,
}: VerificationGateModalProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Determine if this modal should be shown
  const shouldShow = !isEmailVerified && (
    !demoStartedAt ||
    new Date(demoStartedAt).getTime() + 24 * 60 * 60 * 1000 < Date.now()
  );

  // Calculate trial time remaining
  useEffect(() => {
    if (!demoStartedAt || isEmailVerified) return;

    const trialEnd = new Date(demoStartedAt).getTime() + 24 * 60 * 60 * 1000;
    const now = Date.now();
    const remaining = trialEnd - now;

    if (remaining <= 0) {
      setIsTrialExpired(true);
      setIsVisible(true);
      return;
    }

    // Trial still active — show countdown but no full block
    setTimeLeft(Math.floor(remaining / 1000));
    setIsTrialExpired(false);

    const interval = setInterval(() => {
      const newRemaining = trialEnd - Date.now();
      if (newRemaining <= 0) {
        setIsTrialExpired(true);
        setIsVisible(true);
        clearInterval(interval);
      } else {
        setTimeLeft(Math.floor(newRemaining / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [demoStartedAt, isEmailVerified]);

  // Show modal if expired or never started
  useEffect(() => {
    if (shouldShow) {
      setIsVisible(true);
      setIsTrialExpired(true);
    }
  }, [shouldShow]);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Block keyboard events from reaching the page behind
  useEffect(() => {
    if (!isVisible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [isVisible]);

  const handleResend = useCallback(async () => {
    if (!userEmail || resendCooldown > 0) return;
    setIsResending(true);
    setResendStatus(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: userEmail,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });

      if (error) {
        setResendStatus(`Error: ${error.message}`);
      } else {
        setResendStatus(`Verification email resent to ${userEmail}`);
        setResendCooldown(60);
      }
    } catch (err: any) {
      setResendStatus("Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  }, [userEmail, resendCooldown]);

  const handleVerifyNow = () => {
    router.push(`/auth/login?mode=confirm&email=${encodeURIComponent(userEmail)}`);
  };

  if (!isVisible) return null;

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <AnimatePresence>
      <motion.div
        key="verification-gate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ pointerEvents: "all" }}
        // Prevent any click from passing through
        onClick={(e) => e.stopPropagation()}
      >
        {/* Frosted glass backdrop — inescapable */}
        <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl" />

        {/* Liquid animated blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#d8f36b]/15 blur-3xl"
          />
        </div>

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.92, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
          className="relative z-10 mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-emerald-600/30 bg-gradient-to-b from-[#0a2420]/98 via-[#061816]/98 to-[#030e0c]/98 shadow-[0_32px_80px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.1)]"
          style={{ pointerEvents: "all" }}
          // Also block clicks inside the card from bubbling to backdrop
          onClick={(e) => e.stopPropagation()}
        >
          {/* Neon top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-[#d8f36b] to-teal-400 shadow-[0_0_20px_rgba(216,243,107,0.5)]" />

          <div className="p-8 space-y-6">
            {/* Icon + Title */}
            <div className="text-center space-y-3">
              <motion.div
                animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/15 shadow-[0_0_24px_rgba(245,158,11,0.3)]"
              >
                {isTrialExpired ? (
                  <Lock className="h-8 w-8 text-amber-400" />
                ) : (
                  <Clock className="h-8 w-8 text-amber-400" />
                )}
              </motion.div>

              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  {isTrialExpired ? "Trial Period Ended" : "Demo Access Active"}
                </h2>
                <p className="mt-1 text-sm font-bold text-emerald-200/80">
                  {isTrialExpired
                    ? "Your 24-hour demo trial has expired. Verify your email to regain full access."
                    : `Verify your email to unlock permanent access to all features.`}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            {isTrialExpired ? (
              <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-400" />
                <div>
                  <p className="text-sm font-black text-red-300">Access Restricted</p>
                  <p className="text-xs font-bold text-red-400/70 mt-0.5">
                    Complete email verification to unlock all dashboard pages.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <Clock className="h-5 w-5 flex-shrink-0 text-amber-400" />
                <div>
                  <p className="text-sm font-black text-amber-300">Trial Access Expires In</p>
                  <p className="text-2xl font-black text-[#d8f36b] font-mono mt-0.5">
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
            )}

            {/* Email info */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-600/30 bg-emerald-950/60 p-3.5">
              <Mail className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wider text-emerald-400/70">
                  Verification Email Sent To
                </p>
                <p className="text-sm font-black text-white truncate">{userEmail || "your email address"}</p>
              </div>
            </div>

            {/* Resend status */}
            {resendStatus && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center text-xs font-bold ${resendStatus.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}
              >
                {resendStatus}
              </motion.p>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {/* Primary: Enter verification code */}
              <Button
                onClick={handleVerifyNow}
                className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#d8f36b] via-[#cce850] to-[#bfe843] text-sm font-black text-[#051412] shadow-[0_6px_25px_rgba(216,243,107,0.45)] transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Enter Verification Code
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Secondary: Resend email */}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-600/40 bg-emerald-950/60 text-xs font-black text-emerald-300 transition-all hover:border-emerald-400/60 hover:text-white disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
                {isResending
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend Verification Email"}
              </button>
            </div>

            {/* Footer note */}
            <p className="text-center text-[11px] font-bold text-emerald-500/60 leading-relaxed">
              🔒 This page is locked until your email is verified.
              <br />
              Check your spam folder if you don&apos;t see the email.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
