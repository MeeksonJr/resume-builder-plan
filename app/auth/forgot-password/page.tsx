"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Mail, ArrowRight, CheckCircle2, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
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

  if (isSuccess) {
    return (
      <Card className="relative w-full overflow-hidden border-[#102b2b]/15 bg-[#f8f4ec]/95 shadow-[18px_20px_0_rgba(16,43,43,.12)]">
        <div className="absolute left-0 right-0 top-0 h-1 bg-[#d8f36b]" />
        <CardHeader className="space-y-3 pb-6 pt-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-semibold tracking-[-.05em] text-[#102b2b]">Check your email</CardTitle>
          <CardDescription className="mx-auto max-w-xs text-xs leading-relaxed text-[#52716a] sm:text-sm">
            We&apos;ve sent a password reset link to <span className="text-white font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4 pb-8 px-6 sm:px-8">
          <Button variant="outline" className="h-12 w-full cursor-pointer rounded-none border-[#102b2b]/20 bg-transparent text-[#102b2b] hover:bg-[#102b2b]/5" asChild>
            <Link href="/auth/login">Return to login</Link>
          </Button>
            <p className="text-center text-[11px] text-[#78928a]">
            Didn&apos;t receive the email? Check your spam or promotions folder.
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="relative w-full overflow-hidden border-[#102b2b]/15 bg-[#f8f4ec]/95 shadow-[18px_20px_0_rgba(16,43,43,.12)]">
      <div className="absolute left-0 right-0 top-0 h-1 bg-[#d8f36b]" />

      <CardHeader className="space-y-2 pb-6 pt-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
          <KeyRound className="w-6 h-6 text-amber-300" />
        </div>
        <CardTitle className="text-3xl font-semibold tracking-[-.05em] text-[#102b2b]">Reset your password</CardTitle>
        <CardDescription className="text-slate-400 text-xs sm:text-sm max-w-xs mx-auto">
          Enter your account email and we&apos;ll send a secure recovery link.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleResetRequest}>
        <CardContent className="space-y-4 px-6 sm:px-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="destructive" className="rounded-none border-red-700/20 bg-red-50 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-[#365950]">
              Account email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 rounded-none border-[#102b2b]/15 bg-white/60 pl-10 text-sm text-[#102b2b] placeholder:text-[#9bb5aa] focus:border-[#0d8274] focus:ring-[#0d8274]/20"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-12 w-full cursor-pointer rounded-none bg-[#102b2b] font-semibold text-[#f8f4ec] shadow-lg shadow-[#102b2b]/15 transition-all hover:bg-[#164743]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending link...
              </>
            ) : (
              <>
                Email me a reset link
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>

        <CardFooter className="px-6 sm:px-8 pb-8 pt-2 flex flex-col gap-4 text-center">
          <p className="text-xs text-[#52716a]">
            Remembered your password?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-[#0d8274] transition-colors hover:text-[#102b2b]"
            >
              Back to sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
