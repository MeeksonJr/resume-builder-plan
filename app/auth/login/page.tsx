"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, AlertCircle, Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setEmail("demo@resumeforge.ai");
    setPassword("resumeforge");
    
    // Simulate quick instant demo login to dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  return (
    <Card className="relative w-full overflow-hidden border-[#102b2b]/15 bg-[#f8f4ec]/95 shadow-[18px_20px_0_rgba(16,43,43,.12)]">
      <div className="absolute left-0 right-0 top-0 h-1 bg-[#d8f36b]" />

      <CardHeader className="space-y-2 pb-6 pt-9 text-left">
        <div className="mb-2 flex h-11 w-11 items-center justify-center bg-[#d8f36b] text-[#102b2b]">
          <Sparkles className="h-5 w-5" />
        </div>
        <CardTitle className="text-3xl font-semibold tracking-[-.05em] text-[#102b2b] sm:text-4xl">
          Welcome back.
        </CardTitle>
        <CardDescription className="max-w-sm text-sm leading-relaxed text-[#52716a]">
          Pick up where you left off: sharpen a resume, tailor an application, or prepare for the conversation.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-5 px-6 sm:px-8">
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

          {/* Social Auth Options */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 border border-[#102b2b]/15 bg-white/50 text-xs font-semibold text-[#365950] transition-all hover:border-[#0d8274]/50 hover:bg-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleDemoSignIn}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 border border-[#102b2b]/15 bg-white/50 text-xs font-semibold text-[#365950] transition-all hover:border-[#0d8274]/50 hover:bg-white"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.71-.93 2.73 1 .08 2.01-.48 2.63-1.23z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#f8f4ec] px-3 text-[11px] font-medium uppercase tracking-wider text-[#78928a]">
              or continue with email
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-[#365950]">
                Email address
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-[#365950]">
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                    className="text-xs text-[#0d8274] transition-colors hover:text-[#102b2b]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 rounded-none border-[#102b2b]/15 bg-white/60 pl-10 text-sm text-[#102b2b] placeholder:text-[#9bb5aa] focus:border-[#0d8274] focus:ring-[#0d8274]/20"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full cursor-pointer rounded-none bg-[#102b2b] font-semibold text-[#f8f4ec] shadow-lg shadow-[#102b2b]/15 transition-all hover:bg-[#164743]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Open my workspace
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {/* Quick Demo Access Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 border border-[#0d8274]/20 bg-[#0d8274]/10 p-2.5 text-xs font-medium text-[#0d8274] transition-colors hover:bg-[#0d8274]/15"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Explore the demo workspace</span>
            </button>
          </div>
        </CardContent>
      </form>

      <CardFooter className="px-6 sm:px-8 pb-8 pt-0 flex flex-col gap-4 text-center">
        <p className="text-xs text-[#52716a]">
          Don't have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-semibold text-[#0d8274] transition-colors hover:text-[#102b2b]"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
