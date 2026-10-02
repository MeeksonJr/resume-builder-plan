"use client";

import React, { useState } from "react";
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
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthTabBar } from "@/components/auth/auth-tab-bar";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
    } catch (err: any) {
      setError(err?.message || "Failed to send reset link.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-[#163833] bg-[#081515]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-10">
      
      {/* Decorative Top Accent Glow */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#0d8274] via-[#d8f36b] to-[#0d8274]" />

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center py-6"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-950/60 text-[#d8f36b] shadow-[0_4px_20px_rgba(13,130,116,0.3)]">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-white">
                Check Your Email
              </h2>
              <p className="mx-auto max-w-sm text-sm text-[#7ea89f]">
                We dispatched a secure password recovery link to{" "}
                <span className="font-bold text-[#d8f36b]">{email}</span>.
              </p>
            </div>

            <div className="rounded-xl border border-[#163833] bg-[#050e0e]/80 p-4 text-xs text-[#7ea89f]">
              <p>
                Link valid for 24 hours. University students: please remember to check your Outlook <strong>Other</strong> or <strong>Junk Email</strong> folder if not visible immediately.
              </p>
            </div>

            <Button
              asChild
              className="h-12 w-full rounded-xl bg-gradient-to-r from-[#d8f36b] to-[#c7e955] text-sm font-extrabold text-[#081211] shadow-[0_4px_20px_rgba(216,243,107,0.3)] transition-all hover:brightness-105"
            >
              <Link href="/auth/login" className="flex items-center justify-center gap-2">
                Return to Sign In
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header Tabs */}
            <AuthTabBar activeTab="login" />

            {/* Title & Subtitle */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8f36b]/30 bg-[#d8f36b]/10 text-[#d8f36b]">
                  <KeyRound className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d8f36b]">
                  Password Recovery
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Reset Your Password
              </h1>
              <p className="text-sm text-[#7ea89f]">
                Enter the email address tied to your account and we&apos;ll send you a recovery link.
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

            <form onSubmit={handleResetRequest} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-xs font-semibold text-[#8bbcb2]">
                  Account email address <span className="text-[#d8f36b]">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52716a]" />
                  <Input
                    id="forgot-email"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-3 h-12 w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#d8f36b] to-[#c7e955] text-sm font-extrabold text-[#081211] shadow-[0_4px_20px_rgba(216,243,107,0.35)] transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#081211]" />
                    Sending link...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 text-[#081211]" />
                    Email Me Reset Link
                    <ArrowRight className="ml-2 h-4 w-4 text-[#081211]" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-[#163833] pt-4 text-center">
              <p className="text-xs text-[#7ea89f]">
                Remembered your password?{" "}
                <Link
                  href="/auth/login"
                  className="font-bold text-[#d8f36b] transition-colors hover:underline"
                >
                  Back to Sign In &rarr;
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
