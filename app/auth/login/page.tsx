"use client";

import React, { useState } from "react";
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
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthTabBar } from "@/components/auth/auth-tab-bar";
import { AuthSuccessCelebration } from "@/components/auth/auth-success-celebration";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        // If email not confirmed, give helpful direction to the Confirm Email tab
        if (
          authError.message.toLowerCase().includes("email not confirmed") ||
          authError.message.toLowerCase().includes("confirm your email")
        ) {
          setError(
            "Your email has not been confirmed yet. Please verify the 6-digit code or link sent to your inbox using the 'Confirm Email' tab."
          );
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleInstantDemo = () => {
    setIsLoading(true);
    setError(null);
    setEmail("demo@resumeforge.ai");
    setPassword("monarch-career-2026");

    setTimeout(() => {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }, 600);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-[#163833] bg-[#081515]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-10">
      
      {/* Decorative Top Accent Glow */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#0d8274] via-[#d8f36b] to-[#0d8274]" />

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <AuthSuccessCelebration
            key="success"
            title="Welcome Back!"
            subtitle="Secure session established. Loading your active resumes and campus portals..."
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
            <AuthTabBar activeTab="login" />

            {/* Title & Subtitle */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8f36b]/30 bg-[#d8f36b]/10 text-[#d8f36b]">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d8f36b]">
                  Workspace Access
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Welcome Back
              </h1>
              <p className="text-sm text-[#7ea89f]">
                Sign in to customize resumes, access your student portal, or conduct AI interview simulations.
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

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-semibold text-[#8bbcb2]">
                  Email address <span className="text-[#d8f36b]">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52716a]" />
                  <Input
                    id="login-email"
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

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-semibold text-[#8bbcb2]">
                    Password <span className="text-[#d8f36b]">*</span>
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-[#7ea89f] transition-colors hover:text-[#d8f36b] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52716a]" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
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

              {/* Remember Me */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#163833] bg-[#050e0e] text-[#d8f36b] focus:ring-[#d8f36b]/30"
                />
                <label htmlFor="remember-me" className="text-xs font-medium text-[#7ea89f] cursor-pointer">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Neon Lime Sign In Button (Inspired by Image 5) */}
              <Button
                type="submit"
                disabled={isLoading}
                className="mt-3 h-12 w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#d8f36b] to-[#c7e955] text-sm font-extrabold text-[#081211] shadow-[0_4px_20px_rgba(216,243,107,0.35)] transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#081211]" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 text-[#081211]" />
                    Sign In to Workspace
                    <ArrowRight className="ml-2 h-4 w-4 text-[#081211]" />
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-[#163833]" />
                <span className="bg-[#081515] px-3 text-[11px] font-bold uppercase tracking-wider text-[#52716a]">
                  Quick Exploration
                </span>
              </div>

              {/* Instant Guest Demo Mode */}
              <button
                type="button"
                onClick={handleInstantDemo}
                disabled={isLoading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#20b2aa]/30 bg-[#0d2a26]/60 text-xs font-bold text-[#8bbcb2] transition-all hover:border-[#d8f36b]/50 hover:bg-[#0d2a26] hover:text-[#d8f36b]"
              >
                <Compass className="h-4 w-4 text-[#d8f36b]" />
                <span>Launch Instant Demo Workspace (Skip Auth)</span>
              </button>

            </form>

            {/* Bottom Redirect */}
            <div className="mt-6 border-t border-[#163833] pt-4 text-center">
              <p className="text-xs text-[#7ea89f]">
                Don&apos;t have an account yet?{" "}
                <Link
                  href="/auth/sign-up"
                  className="font-bold text-[#d8f36b] transition-colors hover:underline"
                >
                  Create your workspace account &rarr;
                </Link>
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
