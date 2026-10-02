"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  Mail,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthTabBar } from "@/components/auth/auth-tab-bar";
import { AuthSuccessCelebration } from "@/components/auth/auth-success-celebration";

function ConfirmEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryEmail = searchParams?.get("email") || "";
  const queryCode = searchParams?.get("code") || "";

  const [email, setEmail] = useState(queryEmail);
  const [token, setToken] = useState(queryCode);
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (queryEmail && !email) setEmail(queryEmail);
    if (queryCode && !token) setToken(queryCode);
  }, [queryEmail, queryCode, email, token]);

  // Cooldown timer for resending email
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendStatus(null);
    setIsLoading(true);

    const cleanToken = token.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your account email address.");
      setIsLoading(false);
      return;
    }

    if (cleanToken.length < 6) {
      setError("Please enter the complete 6-digit confirmation code.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: "signup",
      });

      if (verifyError) {
        // Try 'email' type fallback in case it was a magic link/login OTP
        const { error: secondError } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: "email",
        });

        if (secondError) {
          setError(verifyError.message || secondError.message);
          setIsLoading(false);
          return;
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Failed to verify code. Please check and try again.");
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email above before requesting a new code.");
      return;
    }

    setError(null);
    setIsResending(true);
    setResendStatus(null);

    try {
      const supabase = createClient();
      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (resendErr) {
        setError(resendErr.message);
      } else {
        setResendStatus(`New verification code dispatched to ${cleanEmail}`);
        setCooldown(60);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to resend confirmation email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-[#163833] bg-[#081515]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-10">
      
      {/* Decorative Top Accent Glow */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#0d8274] via-[#d8f36b] to-[#0d8274]" />

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <AuthSuccessCelebration
            key="success"
            title="Email Verified Successfully! 🎉"
            subtitle="Your student workspace is activated. Redirecting you to your career studio..."
            destinationLabel="Entering Dashboard"
          />
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header Tabs */}
            <AuthTabBar activeTab="confirm" />

            {/* Title & Subtitle */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8f36b]/30 bg-[#d8f36b]/10 text-[#d8f36b]">
                  <KeyRound className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d8f36b]">
                  Token Verification
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Confirm Your Email
              </h1>
              <p className="text-sm text-[#7ea89f]">
                Check your inbox for the 6-digit confirmation code or activation link sent from ResumeForge.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5"
              >
                <Alert
                  variant="destructive"
                  className="rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-200"
                >
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  <AlertDescription className="text-xs leading-relaxed">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Resend Status Notification */}
            {resendStatus && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5"
              >
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{resendStatus}</span>
                </div>
              </motion.div>
            )}

            {/* OTP Verification Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              
              {/* Account Email */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm-email" className="text-xs font-semibold text-[#8bbcb2]">
                  Account email address <span className="text-[#d8f36b]">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52716a]" />
                  <Input
                    id="confirm-email"
                    type="email"
                    placeholder="name@university.edu or you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 rounded-xl border-[#163833] bg-[#050e0e]/80 pl-10 text-sm text-white placeholder:text-[#425d57] focus:border-[#d8f36b] focus:ring-2 focus:ring-[#d8f36b]/20"
                  />
                </div>
              </div>

              {/* 6-Digit OTP Token */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm-code" className="text-xs font-semibold text-[#8bbcb2]">
                  6-Digit Verification Code <span className="text-[#d8f36b]">*</span>
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52716a]" />
                  <Input
                    id="confirm-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={10}
                    placeholder="e.g. 948215"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-14 tracking-[0.4em] font-mono text-center text-xl font-black rounded-xl border-[#163833] bg-[#050e0e]/80 text-[#d8f36b] placeholder:text-[#425d57] placeholder:tracking-normal focus:border-[#d8f36b] focus:ring-2 focus:ring-[#d8f36b]/20"
                  />
                </div>
              </div>

              {/* Neon Lime Verify Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="mt-3 h-12 w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#d8f36b] to-[#c7e955] text-sm font-extrabold text-[#081211] shadow-[0_4px_20px_rgba(216,243,107,0.35)] transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#081211]" />
                    Validating token...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 text-[#081211]" />
                    Verify Code &amp; Activate Workspace
                    <ArrowRight className="ml-2 h-4 w-4 text-[#081211]" />
                  </>
                )}
              </Button>

              {/* Resend Action Pill */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#7ea89f]">Didn&apos;t receive code?</span>
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={isResending || cooldown > 0}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#d8f36b] transition-colors hover:underline disabled:opacity-50 disabled:hover:no-underline"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
                  <span>
                    {cooldown > 0
                      ? `Resend available in ${cooldown}s`
                      : "Resend Confirmation Email"}
                  </span>
                </button>
              </div>

              {/* Outlook & Campus Deliverability Guidance */}
              <div className="mt-4 rounded-xl border border-[#163833] bg-[#050e0e]/60 p-3.5">
                <div className="flex items-start gap-2.5 text-xs text-[#8bbcb2]">
                  <Info className="h-4 w-4 text-[#20b2aa] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-white">Using University Outlook or Microsoft 365?</p>
                    <p className="text-[11px] leading-relaxed text-[#7ea89f]">
                      University filters often place activation emails in the <strong>Other</strong> tab or <strong>Junk Email</strong> folder. You can also click the direct confirmation link inside the email to activate instantly.
                    </p>
                  </div>
                </div>
              </div>

            </form>

            {/* Bottom Redirect */}
            <div className="mt-6 border-t border-[#163833] pt-4 text-center">
              <p className="text-xs text-[#7ea89f]">
                Already confirmed your account?{" "}
                <Link
                  href="/auth/login"
                  className="font-bold text-[#d8f36b] transition-colors hover:underline"
                >
                  Sign in now &rarr;
                </Link>
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center text-center text-sm text-[#7ea89f]">
          <Loader2 className="h-6 w-6 animate-spin text-[#d8f36b] mr-2" />
          Loading verification interface...
        </div>
      }
    >
      <ConfirmEmailForm />
    </Suspense>
  );
}
