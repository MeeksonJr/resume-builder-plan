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
      <Card className="w-full border-slate-800/80 bg-slate-900/70 backdrop-blur-2xl shadow-2xl shadow-indigo-950/40 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <CardHeader className="space-y-3 pb-6 pt-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">Check your email</CardTitle>
          <CardDescription className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
            We&apos;ve sent a password reset link to <span className="text-white font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4 pb-8 px-6 sm:px-8">
          <Button variant="outline" className="w-full h-11 rounded-xl border-slate-700 bg-slate-950/50 text-white hover:bg-slate-800 cursor-pointer" asChild>
            <Link href="/auth/login">Return to login</Link>
          </Button>
          <p className="text-[11px] text-center text-slate-500">
            Didn&apos;t receive the email? Check your spam or promotions folder.
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full border-slate-800/80 bg-slate-900/70 backdrop-blur-2xl shadow-2xl shadow-indigo-950/40 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-300" />

      <CardHeader className="space-y-2 pb-6 pt-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
          <KeyRound className="w-6 h-6 text-amber-300" />
        </div>
        <CardTitle className="text-2xl font-bold text-white tracking-tight">Reset Password</CardTitle>
        <CardDescription className="text-slate-400 text-xs sm:text-sm max-w-xs mx-auto">
          Enter your student email address and we'll send you a recovery link.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleResetRequest}>
        <CardContent className="space-y-4 px-6 sm:px-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-300 rounded-2xl py-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-slate-300">
              Account Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="email"
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 h-11 bg-slate-950/80 border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl text-white text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending link...
              </>
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>

        <CardFooter className="px-6 sm:px-8 pb-8 pt-2 flex flex-col gap-4 text-center">
          <p className="text-xs text-slate-400">
            Remembered your password?{" "}
            <Link
              href="/auth/login"
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
            >
              Back to sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
