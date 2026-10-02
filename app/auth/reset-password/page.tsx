"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  Lock,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthSuccessCelebration } from "@/components/auth/auth-success-celebration";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError("Invalid or expired password reset link. Please request a new one.");
      }
      setIsVerifying(false);
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);

    setTimeout(() => {
      router.push("/auth/login");
    }, 2000);
  };

  if (isVerifying) {
    return (
      <div className="flex min-h-[360px] w-full flex-col items-center justify-center rounded-3xl border border-[#163833] bg-[#081515]/95 p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#d8f36b]" />
        <p className="font-semibold text-white">Verifying your secure reset link...</p>
        <p className="mt-1 text-xs text-[#7ea89f]">Validating security signature with Supabase</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-[#163833] bg-[#081515]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-10">
      
      {/* Decorative Top Accent Glow */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#0d8274] via-[#d8f36b] to-[#0d8274]" />

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <AuthSuccessCelebration
            key="success"
            title="Password Updated! 🔒"
            subtitle="Your password has been successfully reset. Redirecting you to sign in..."
            destinationLabel="Returning to Sign In"
          />
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {/* Title & Subtitle */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8f36b]/30 bg-[#d8f36b]/10 text-[#d8f36b]">
                  <KeyRound className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d8f36b]">
                  Choose New Password
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Reset Account Password
              </h1>
              <p className="text-sm text-[#7ea89f]">
                Choose a strong password to protect your resumes and career applications.
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
                {error.includes("Invalid or expired") && (
                  <div className="mt-3 text-center">
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-bold text-[#d8f36b] hover:underline"
                    >
                      Request a new password reset link &rarr;
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
              
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs font-semibold text-[#8bbcb2]">
                  New password <span className="text-[#d8f36b]">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52716a]" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading || Boolean(error?.includes("Invalid or expired"))}
                    className="h-12 rounded-xl border-[#163833] bg-[#050e0e]/80 pl-10 pr-10 text-sm text-white placeholder:text-[#425d57] focus:border-[#d8f36b] focus:ring-2 focus:ring-[#d8f36b]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#52716a] hover:text-[#8bbcb2] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-new-password" className="text-xs font-semibold text-[#8bbcb2]">
                  Confirm new password <span className="text-[#d8f36b]">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52716a]" />
                  <Input
                    id="confirm-new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading || Boolean(error?.includes("Invalid or expired"))}
                    className="h-12 rounded-xl border-[#163833] bg-[#050e0e]/80 pl-10 pr-10 text-sm text-white placeholder:text-[#425d57] focus:border-[#d8f36b] focus:ring-2 focus:ring-[#d8f36b]/20"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || Boolean(error?.includes("Invalid or expired"))}
                className="mt-3 h-12 w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#d8f36b] to-[#c7e955] text-sm font-extrabold text-[#081211] shadow-[0_4px_20px_rgba(216,243,107,0.35)] transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#081211]" />
                    Saving password...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 text-[#081211]" />
                    Save New Password &amp; Continue
                    <ArrowRight className="ml-2 h-4 w-4 text-[#081211]" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-[#163833] pt-4 text-center">
              <p className="text-xs text-[#7ea89f]">
                Back to{" "}
                <Link
                  href="/auth/login"
                  className="font-bold text-[#d8f36b] transition-colors hover:underline"
                >
                  Sign In &rarr;
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
