"use client";

import React, { useState, useEffect } from "react";
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
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  GraduationCap,
  KeyRound,
  CheckCircle2,
  Compass,
  ChevronLeft,
  RefreshCw,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthSuccessCelebration } from "./auth-success-celebration";
import { LiquidWaveBackground } from "./liquid-wave";

interface LiquidAuthCardProps {
  initialMode?: "login" | "signup" | "confirm";
}

export function LiquidAuthCard({ initialMode = "login" }: LiquidAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode state: 'login' | 'signup' | 'confirm'
  const [mode, setMode] = useState<"login" | "signup" | "confirm">(
    initialMode || (searchParams?.get("mode") as any) || "login"
  );
  
  // Direction for liquid wave slide animation: 1 = to signup/confirm (right), -1 = to login (left)
  const [direction, setDirection] = useState<number>(mode === "signup" ? 1 : -1);

  // Common Form Fields
  const [email, setEmail] = useState(searchParams?.get("email") || "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [campusName, setCampusName] = useState("Old Dominion University");
  const [token, setToken] = useState(searchParams?.get("code") || "");
  
  // UX State
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", subtitle: "", label: "" });

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Tab change handler with liquid wave direction
  const handleSwitchTab = (newMode: "login" | "signup") => {
    if (newMode === mode) return;
    setError(null);
    setResendStatus(null);
    setDirection(newMode === "signup" ? 1 : -1);
    setMode(newMode);
  };

  // Login Submit
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
        if (
          authError.message.toLowerCase().includes("email not confirmed") ||
          authError.message.toLowerCase().includes("confirm your email")
        ) {
          setError("Your email has not been confirmed yet. We have opened the verification screen for you.");
          setDirection(1);
          setMode("confirm");
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      setSuccessMessage({
        title: "Welcome Back Scholar! 🚀",
        subtitle: "Session verified. Synchronizing your student resume and campus career portfolio...",
        label: "Entering Dashboard",
      });
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

  // Sign Up Submit
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName.trim(),
            campus_affiliation: campusName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      // If user session returned immediately (auto-confirm enabled)
      if (data?.session) {
        setSuccessMessage({
          title: "Account Created! 🎉",
          subtitle: "Workspace provisioned. Loading your personalized career portal...",
          label: "Entering Workspace",
        });
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1200);
      } else {
        // Flow directly with liquid transition into the Confirm Email view!
        setIsLoading(false);
        setResendStatus(`Verification email dispatched to ${email.trim()}.`);
        setDirection(1);
        setMode("confirm");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  // Confirm OTP Token Submit
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: "signup",
      });

      if (verifyError) {
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

      setSuccessMessage({
        title: "Email Verified Successfully! 🎓",
        subtitle: "Your student status is confirmed. Launching your campus career portal...",
        label: "Entering Dashboard",
      });
      setIsSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please check the code and try again.");
      setIsLoading(false);
    }
  };

  // Resend Confirmation
  const handleResend = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email above before requesting a new code.");
      return;
    }

    setError(null);
    setIsResending(true);

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
        setResendStatus(`New verification code sent to ${cleanEmail}`);
        setCooldown(60);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to resend confirmation email.");
    } finally {
      setIsResending(false);
    }
  };

  // Instant Guest Demo Mode — signs in as demo user and stamps 24h trial
  const handleInstantDemo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: "demo@resumeforge.ai",
        password: "monarch-career-2026",
      });

      if (authError || !data.session) {
        setError("Demo workspace is temporarily unavailable. Please create a free account instead.");
        setIsLoading(false);
        return;
      }

      // Stamp the 24-hour trial start in the database
      await fetch("/api/demo/activate", { method: "POST" });

      setSuccessMessage({
        title: "Launching Demo Workspace 🚀",
        subtitle: "24-hour trial activated. Provisioning guest portfolio and career tools...",
        label: "Entering Workspace",
      });
      setIsSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError("Failed to launch demo. Please try creating a free account.");
      setIsLoading(false);
    }
  };

  // Liquid motion variants for tab transitions
  const liquidSlideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.96,
      filter: "blur(4px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        x: { type: "spring" as const, stiffness: 320, damping: 26 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
        filter: { duration: 0.2 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.96,
      filter: "blur(4px)",
      transition: {
        x: { type: "spring" as const, stiffness: 320, damping: 26 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-emerald-600/25 dark:border-emerald-500/30 bg-gradient-to-b from-white/95 via-[#f8fcfa]/95 to-[#f0f7f5]/95 dark:from-[#092420]/95 dark:via-[#061816]/95 dark:to-[#030e0c]/95 p-6 shadow-[0_24px_64px_rgba(5,20,18,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.2)] backdrop-blur-2xl sm:p-10 transition-colors duration-300">
      
      {/* Background Liquid Waves Effect */}
      <LiquidWaveBackground opacity={0.3} />

      {/* Decorative Top Liquid Neon Border */}
      <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#d8f36b] to-teal-400 shadow-[0_0_15px_rgba(216,243,107,0.6)]" />

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <AuthSuccessCelebration
            key="success"
            title={successMessage.title}
            subtitle={successMessage.subtitle}
            destinationLabel={successMessage.label}
          />
        ) : (
          <div className="relative z-10">
            
            {/* Top Navigation: 2 Liquid Tabs (or Breadcrumb if in Confirm Email view) */}
            {mode === "confirm" ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-600/30 dark:border-teal-400/40 bg-emerald-50/90 dark:bg-[#092a24]/90 p-2 shadow-inner transition-colors duration-300"
              >
                <button
                  type="button"
                  onClick={() => handleSwitchTab("login")}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black text-emerald-950 dark:text-white transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:text-emerald-700 dark:hover:text-[#d8f36b]"
                >
                  <ChevronLeft className="h-4 w-4 text-[#0d8274] dark:text-[#d8f36b]" />
                  <span>Back to Sign In</span>
                </button>
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-600/40 dark:border-[#d8f36b]/50 bg-emerald-100/90 dark:bg-[#d8f36b]/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-[#d8f36b] transition-colors duration-300">
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Email Verification</span>
                </div>
              </motion.div>
            ) : (
              <div className="relative mb-6 flex w-full items-center rounded-2xl border border-emerald-600/30 dark:border-emerald-500/40 bg-emerald-100/80 dark:bg-[#041210]/90 p-1.5 shadow-[inset_0_2px_6px_rgba(5,20,18,0.08)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] transition-colors duration-300">
                {/* Sign In Tab */}
                <button
                  type="button"
                  onClick={() => handleSwitchTab("login")}
                  className={`relative z-10 flex flex-1 items-center justify-center gap-2 py-3 text-sm font-black transition-colors duration-200 ${
                    mode === "login" ? "text-[#051412]" : "text-emerald-900 dark:text-emerald-100 hover:text-emerald-950 dark:hover:text-white"
                  }`}
                >
                  {mode === "login" && (
                    <motion.div
                      layoutId="liquidAuthTabPill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#d8f36b] to-[#bfe843] shadow-[0_2px_18px_rgba(216,243,107,0.5)]"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                  <span className="relative z-20 flex items-center gap-1.5">
                    <Zap className="h-4 w-4" />
                    Sign In
                  </span>
                </button>

                {/* Create Account Tab */}
                <button
                  type="button"
                  onClick={() => handleSwitchTab("signup")}
                  className={`relative z-10 flex flex-1 items-center justify-center gap-2 py-3 text-sm font-black transition-colors duration-200 ${
                    mode === "signup" ? "text-[#051412]" : "text-emerald-900 dark:text-emerald-100 hover:text-emerald-950 dark:hover:text-white"
                  }`}
                >
                  {mode === "signup" && (
                    <motion.div
                      layoutId="liquidAuthTabPill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#d8f36b] to-[#bfe843] shadow-[0_2px_18px_rgba(216,243,107,0.5)]"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                  <span className="relative z-20 flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    Create Account
                  </span>
                </button>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5"
              >
                <Alert
                  variant="destructive"
                  className="rounded-2xl border border-rose-500/50 bg-rose-950/70 p-4 text-white shadow-lg"
                >
                  <AlertCircle className="h-4 w-4 text-rose-300" />
                  <AlertDescription className="text-xs font-bold leading-relaxed text-white">
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
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/70 p-3.5 text-xs font-bold text-emerald-900 dark:text-emerald-100 shadow-md">
                  <CheckCircle2 className="h-4 w-4 text-[#0d8274] dark:text-[#d8f36b] shrink-0" />
                  <span>{resendStatus}</span>
                </div>
              </motion.div>
            )}

            {/* Liquid Form View Animated Switching */}
            <AnimatePresence mode="wait" custom={direction}>
              
              {/* ========================================================= */}
              {/* VIEW 1: SIGN IN                                          */}
              {/* ========================================================= */}
              {mode === "login" && (
                <motion.div
                  key="login-view"
                  custom={direction}
                  variants={liquidSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-4"
                >
                  {/* Title & High-Contrast Subtitle */}
                  <div className="mb-5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-emerald-600/40 dark:border-[#d8f36b]/40 bg-emerald-100 dark:bg-[#d8f36b]/15 text-[#0d8274] dark:text-[#d8f36b]">
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-[#0d8274] dark:text-[#d8f36b]">
                        Workspace Access
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-950 dark:text-white drop-shadow-sm transition-colors duration-300">
                      Welcome Back
                    </h2>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-100 transition-colors duration-300">
                      Sign in to customize resumes, review mock interview feedback, and access your campus portal.
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-2">
                      <Label htmlFor="auth-login-email" className="text-xs font-black text-emerald-950 dark:text-white">
                        Email address <span className="text-[#0d8274] dark:text-[#d8f36b]">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                        <Input
                          id="auth-login-email"
                          type="email"
                          placeholder="name@university.edu or you@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-12 rounded-2xl border border-emerald-600/30 dark:border-emerald-500/40 bg-white dark:bg-[#041412] pl-11 text-sm font-bold text-emerald-950 dark:text-white placeholder:text-emerald-700/50 dark:placeholder:text-teal-300/60 focus:border-[#0d8274] dark:focus:border-[#d8f36b] focus:ring-4 focus:ring-[#0d8274]/20 dark:focus:ring-[#d8f36b]/30 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auth-login-pass" className="text-xs font-black text-emerald-950 dark:text-white">
                          Password <span className="text-[#0d8274] dark:text-[#d8f36b]">*</span>
                        </Label>
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs font-black text-[#0d8274] dark:text-[#d8f36b] transition-colors hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                        <Input
                          id="auth-login-pass"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-12 rounded-2xl border border-emerald-600/30 dark:border-emerald-500/40 bg-white dark:bg-[#041412] pl-11 pr-11 text-sm font-bold text-emerald-950 dark:text-white placeholder:text-emerald-700/50 dark:placeholder:text-teal-300/60 focus:border-[#0d8274] dark:focus:border-[#d8f36b] focus:ring-4 focus:ring-[#0d8274]/20 dark:focus:ring-[#d8f36b]/30 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-[#d8f36b] transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Device */}
                    <div className="flex items-center space-x-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="auth-remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-emerald-600/40 dark:border-emerald-500/40 bg-white dark:bg-[#041412] text-[#0d8274] dark:text-[#d8f36b] focus:ring-[#0d8274]/30 dark:focus:ring-[#d8f36b]/40 cursor-pointer"
                      />
                      <label htmlFor="auth-remember" className="text-xs font-bold text-emerald-800 dark:text-emerald-100 cursor-pointer">
                        Remember this device for 30 days
                      </label>
                    </div>

                    {/* Vibrant Neon Lime Sign In Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="mt-3 h-12 w-full cursor-pointer rounded-2xl bg-gradient-to-r from-[#d8f36b] via-[#cce850] to-[#bfe843] text-sm font-black text-[#051412] shadow-[0_6px_25px_rgba(216,243,107,0.45)] transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#051412]" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 text-[#051412]" />
                          Sign In to Workspace
                          <ArrowRight className="ml-2 h-4 w-4 text-[#051412]" />
                        </>
                      )}
                    </Button>

                  </form>

                  {/* Bottom Prompt */}
                  <div className="mt-5 border-t border-emerald-200 dark:border-emerald-800/40 pt-4 text-center">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-100">
                      Have a 6-digit confirmation code?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setDirection(1);
                          setMode("confirm");
                        }}
                        className="font-black text-[#0d8274] dark:text-[#d8f36b] hover:underline"
                      >
                        Enter code here &rarr;
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* VIEW 2: CREATE ACCOUNT                                    */}
              {/* ========================================================= */}
              {mode === "signup" && (
                <motion.div
                  key="signup-view"
                  custom={direction}
                  variants={liquidSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-4"
                >
                  {/* Title & High-Contrast Subtitle */}
                  <div className="mb-5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-emerald-600/40 dark:border-[#d8f36b]/40 bg-emerald-100 dark:bg-[#d8f36b]/15 text-[#0d8274] dark:text-[#d8f36b]">
                        <GraduationCap className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-[#0d8274] dark:text-[#d8f36b]">
                        Student &amp; Career Network
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-950 dark:text-white drop-shadow-sm transition-colors duration-300">
                      Create Workspace Account
                    </h2>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-100 transition-colors duration-300">
                      Join 4,200+ students and recruiters crafting verified ATS resumes and AI pitch decks.
                    </p>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Full Name & Campus */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="auth-signup-name" className="text-xs font-black text-emerald-950 dark:text-white">
                          Full name <span className="text-[#0d8274] dark:text-[#d8f36b]">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                          <Input
                            id="auth-signup-name"
                            type="text"
                            placeholder="e.g. Alex Smith"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-12 rounded-2xl border border-emerald-600/30 dark:border-emerald-500/40 bg-white dark:bg-[#041412] pl-11 text-sm font-bold text-emerald-950 dark:text-white placeholder:text-emerald-700/50 dark:placeholder:text-teal-300/60 focus:border-[#0d8274] dark:focus:border-[#d8f36b] focus:ring-4 focus:ring-[#0d8274]/20 dark:focus:ring-[#d8f36b]/30 shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="auth-signup-campus" className="text-xs font-black text-emerald-950 dark:text-white">
                          Campus affiliation
                        </Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                          <Input
                            id="auth-signup-campus"
                            type="text"
                            placeholder="e.g. Old Dominion University"
                            value={campusName}
                            onChange={(e) => setCampusName(e.target.value)}
                            disabled={isLoading}
                            className="h-12 rounded-2xl border border-emerald-600/30 dark:border-emerald-500/40 bg-white dark:bg-[#041412] pl-11 text-sm font-bold text-emerald-950 dark:text-white placeholder:text-emerald-700/50 dark:placeholder:text-teal-300/60 focus:border-[#0d8274] dark:focus:border-[#d8f36b] focus:ring-4 focus:ring-[#0d8274]/20 dark:focus:ring-[#d8f36b]/30 shadow-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="auth-signup-email" className="text-xs font-black text-emerald-950 dark:text-white">
                        Email address <span className="text-[#0d8274] dark:text-[#d8f36b]">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                        <Input
                          id="auth-signup-email"
                          type="email"
                          placeholder="name@university.edu or personal email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-12 rounded-2xl border border-emerald-600/30 dark:border-emerald-500/40 bg-white dark:bg-[#041412] pl-11 text-sm font-bold text-emerald-950 dark:text-white placeholder:text-emerald-700/50 dark:placeholder:text-teal-300/60 focus:border-[#0d8274] dark:focus:border-[#d8f36b] focus:ring-4 focus:ring-[#0d8274]/20 dark:focus:ring-[#d8f36b]/30 shadow-sm"
                        />
                      </div>
                      <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-200">
                        🎓 Tip: Academic (.edu) emails automatically unlock your school&apos;s campus cohort directory.
                      </p>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="auth-signup-pass" className="text-xs font-black text-emerald-950 dark:text-white">
                        Create password <span className="text-[#0d8274] dark:text-[#d8f36b]">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                        <Input
                          id="auth-signup-pass"
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-12 rounded-2xl border border-emerald-600/30 dark:border-emerald-500/40 bg-white dark:bg-[#041412] pl-11 pr-11 text-sm font-bold text-emerald-950 dark:text-white placeholder:text-emerald-700/50 dark:placeholder:text-teal-300/60 focus:border-[#0d8274] dark:focus:border-[#d8f36b] focus:ring-4 focus:ring-[#0d8274]/20 dark:focus:ring-[#d8f36b]/30 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-[#d8f36b] transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start space-x-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="auth-signup-terms"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        required
                        className="mt-0.5 h-4 w-4 rounded border-emerald-600/40 dark:border-emerald-500/40 bg-white dark:bg-[#041412] text-[#0d8274] dark:text-[#d8f36b] focus:ring-[#0d8274]/30 dark:focus:ring-[#d8f36b]/40 cursor-pointer"
                      />
                      <label htmlFor="auth-signup-terms" className="text-xs font-bold leading-relaxed text-emerald-800 dark:text-emerald-100 cursor-pointer">
                        I agree to FERPA privacy terms. Your resume content is strictly protected.
                      </label>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading || !agreeTerms}
                      className="mt-3 h-12 w-full cursor-pointer rounded-2xl bg-gradient-to-r from-[#d8f36b] via-[#cce850] to-[#bfe843] text-sm font-black text-[#051412] shadow-[0_6px_25px_rgba(216,243,107,0.45)] transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#051412]" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 text-[#051412]" />
                          Create Free Workspace Account
                          <ArrowRight className="ml-2 h-4 w-4 text-[#051412]" />
                        </>
                      )}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-4 flex items-center justify-center">
                      <div className="w-full border-t border-emerald-300 dark:border-emerald-800/40" />
                      <span className="bg-[#f0f7f5] dark:bg-[#061816] px-3 text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-200 transition-colors duration-300">
                        Quick Exploration
                      </span>
                    </div>

                    {/* Instant Guest Demo — Signup tab only, gives 24h trial */}
                    <button
                      type="button"
                      onClick={handleInstantDemo}
                      disabled={isLoading}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-600/30 dark:border-emerald-500/50 bg-emerald-50/90 dark:bg-emerald-950/80 text-xs font-black text-emerald-950 dark:text-white transition-all hover:border-[#0d8274] hover:bg-emerald-100 dark:hover:border-[#d8f36b] dark:hover:bg-[#0d3b34] hover:text-[#0d8274] dark:hover:text-[#d8f36b] shadow-sm"
                    >
                      <Compass className="h-4 w-4 text-[#0d8274] dark:text-[#d8f36b]" />
                      <span>Launch Instant Demo Workspace (24-hour trial)</span>
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* VIEW 3: CONFIRM EMAIL (FLOWS AFTER SIGNUP)                */}
              {/* ========================================================= */}
              {mode === "confirm" && (
                <motion.div
                  key="confirm-view"
                  custom={direction}
                  variants={liquidSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-4"
                >
                  <div className="mb-5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-emerald-600/40 dark:border-[#d8f36b]/40 bg-emerald-100 dark:bg-[#d8f36b]/15 text-[#0d8274] dark:text-[#d8f36b]">
                        <KeyRound className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-[#0d8274] dark:text-[#d8f36b]">
                        Activation Token
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-950 dark:text-white drop-shadow-sm transition-colors duration-300">
                      Confirm Your Email
                    </h2>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-100 transition-colors duration-300">
                      Enter the 6-digit confirmation code sent to <span className="font-black text-[#0d8274] dark:text-[#d8f36b] underline">{email || "your email"}</span>.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {/* Account Email (Editable if needed) */}
                    <div className="space-y-1.5">
                      <Label htmlFor="auth-confirm-email" className="text-xs font-black text-emerald-950 dark:text-white">
                        Account email address <span className="text-[#0d8274] dark:text-[#d8f36b]">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                        <Input
                          id="auth-confirm-email"
                          type="email"
                          placeholder="name@university.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-12 rounded-2xl border border-emerald-600/30 dark:border-emerald-500/40 bg-white dark:bg-[#041412] pl-11 text-sm font-bold text-emerald-950 dark:text-white placeholder:text-emerald-700/50 dark:placeholder:text-teal-300/60 focus:border-[#0d8274] dark:focus:border-[#d8f36b] focus:ring-4 focus:ring-[#0d8274]/20 dark:focus:ring-[#d8f36b]/30 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* 6-Digit Code */}
                    <div className="space-y-1.5">
                      <Label htmlFor="auth-confirm-code" className="text-xs font-black text-emerald-950 dark:text-white">
                        6-Digit Verification Code <span className="text-[#0d8274] dark:text-[#d8f36b]">*</span>
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                        <Input
                          id="auth-confirm-code"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={10}
                          placeholder="e.g. 948215"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-14 tracking-[0.4em] font-mono text-center text-xl font-black rounded-2xl border border-emerald-600/40 dark:border-emerald-500/40 bg-white dark:bg-[#041412] text-[#0d8274] dark:text-[#d8f36b] placeholder:text-emerald-600/40 dark:placeholder:text-teal-400/50 placeholder:tracking-normal focus:border-[#0d8274] dark:focus:border-[#d8f36b] focus:ring-4 focus:ring-[#0d8274]/20 dark:focus:ring-[#d8f36b]/30 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Verify Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="mt-3 h-12 w-full cursor-pointer rounded-2xl bg-gradient-to-r from-[#d8f36b] via-[#cce850] to-[#bfe843] text-sm font-black text-[#051412] shadow-[0_6px_25px_rgba(216,243,107,0.45)] transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#051412]" />
                          Validating token...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 text-[#051412]" />
                          Verify Code &amp; Activate Workspace
                          <ArrowRight className="ml-2 h-4 w-4 text-[#051412]" />
                        </>
                      )}
                    </Button>

                    {/* Resend Link */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-100">Didn&apos;t receive code?</span>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResending || cooldown > 0}
                        className="flex items-center gap-1.5 text-xs font-black text-[#0d8274] dark:text-[#d8f36b] hover:underline disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
                        <span>
                          {cooldown > 0
                            ? `Resend available in ${cooldown}s`
                            : "Resend Code"}
                        </span>
                      </button>
                    </div>

                    {/* Outlook / Microsoft 365 Deliverability Helper */}
                    <div className="mt-4 rounded-2xl border border-emerald-600/30 dark:border-teal-400/30 bg-emerald-50/90 dark:bg-[#092c26]/90 p-4 transition-colors duration-300">
                      <p className="text-xs font-black text-emerald-950 dark:text-white mb-1">
                        📬 Using University Outlook or Microsoft 365?
                      </p>
                      <p className="text-[11px] font-medium leading-relaxed text-emerald-800 dark:text-emerald-100">
                        University filters often place activation emails into the <strong>Other</strong> inbox tab or <strong>Junk Email</strong> folder. You can also click the direct confirmation button inside the email.
                      </p>
                    </div>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
