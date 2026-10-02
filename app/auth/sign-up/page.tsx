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
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthTabBar } from "@/components/auth/auth-tab-bar";
import { AuthSuccessCelebration } from "@/components/auth/auth-success-celebration";

function ReferralBadge() {
  const searchParams = useSearchParams();
  const refCode = searchParams?.get("ref");

  useEffect(() => {
    if (refCode && typeof window !== "undefined") {
      localStorage.setItem("resumeforge_referral_code", refCode);
    }
  }, [refCode]);

  if (!refCode) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#d8f36b]/40 bg-[#d8f36b]/10 p-3 text-xs font-semibold text-[#d8f36b]">
      <Sparkles className="h-4 w-4 shrink-0 text-[#d8f36b]" />
      <span>Referral reward active: +50 AI ATS optimization credits unlocked upon sign-up!</span>
    </div>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [campusName, setCampusName] = useState("Old Dominion University");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

      setIsSuccess(true);

      // If user session is returned immediately (email confirmation disabled)
      if (data?.session) {
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1200);
      } else {
        // If email confirmation is required, route to confirm-email tab with the email prefilled!
        setTimeout(() => {
          router.push(`/auth/confirm-email?email=${encodeURIComponent(email.trim())}`);
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please try again.");
      setIsLoading(false);
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
            title="Account Created!"
            subtitle="Verification email dispatched. Preparing your campus onboarding hub..."
            destinationLabel="Advancing to Verification"
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
            <AuthTabBar activeTab="signup" />

            <Suspense fallback={null}>
              <ReferralBadge />
            </Suspense>

            {/* Title & Subtitle */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8f36b]/30 bg-[#d8f36b]/10 text-[#d8f36b]">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d8f36b]">
                  Student & Career Network
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Create Workspace Account
              </h1>
              <p className="text-sm text-[#7ea89f]">
                Join 4,200+ students and professionals tailoring AI resumes and preparing for interviews.
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

            {/* Sign Up Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              
              {/* Full Name & Campus Split Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-xs font-semibold text-[#8bbcb2]">
                    Full name <span className="text-[#d8f36b]">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52716a]" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="e.g. Alex Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl border-[#163833] bg-[#050e0e]/80 pl-10 text-sm text-white placeholder:text-[#425d57] focus:border-[#d8f36b] focus:ring-2 focus:ring-[#d8f36b]/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-campus" className="text-xs font-semibold text-[#8bbcb2]">
                    Campus affiliation
                  </Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52716a]" />
                    <Input
                      id="signup-campus"
                      type="text"
                      placeholder="Old Dominion University, UVA..."
                      value={campusName}
                      onChange={(e) => setCampusName(e.target.value)}
                      disabled={isLoading}
                      className="h-12 rounded-xl border-[#163833] bg-[#050e0e]/80 pl-10 text-sm text-white placeholder:text-[#425d57] focus:border-[#d8f36b] focus:ring-2 focus:ring-[#d8f36b]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-xs font-semibold text-[#8bbcb2]">
                  Email address <span className="text-[#d8f36b]">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52716a]" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@university.edu or personal email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 rounded-xl border-[#163833] bg-[#050e0e]/80 pl-10 text-sm text-white placeholder:text-[#425d57] focus:border-[#d8f36b] focus:ring-2 focus:ring-[#d8f36b]/20"
                  />
                </div>
                <p className="text-[11px] text-[#52716a]">
                  Tip: Using your institutional .edu email will automatically link you to your school&apos;s portal cohort.
                </p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-xs font-semibold text-[#8bbcb2]">
                  Create secure password <span className="text-[#d8f36b]">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52716a]" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
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

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2.5 pt-1">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                  className="mt-0.5 h-4 w-4 rounded border-[#163833] bg-[#050e0e] text-[#d8f36b] focus:ring-[#d8f36b]/30"
                />
                <label htmlFor="agree-terms" className="text-xs leading-relaxed text-[#7ea89f] cursor-pointer">
                  I agree to the <Link href="/privacy" className="text-[#d8f36b] hover:underline">Privacy Policy</Link> and FERPA data compliance terms. Your resumes remain strictly private to you.
                </label>
              </div>

              {/* Neon Lime Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !agreeTerms}
                className="mt-3 h-12 w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#d8f36b] to-[#c7e955] text-sm font-extrabold text-[#081211] shadow-[0_4px_20px_rgba(216,243,107,0.35)] transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#081211]" />
                    Creating your workspace...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 text-[#081211]" />
                    Create Free Workspace Account
                    <ArrowRight className="ml-2 h-4 w-4 text-[#081211]" />
                  </>
                )}
              </Button>

            </form>

            {/* Bottom Redirect */}
            <div className="mt-6 border-t border-[#163833] pt-4 text-center">
              <p className="text-xs text-[#7ea89f]">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-bold text-[#d8f36b] transition-colors hover:underline"
                >
                  Sign in to your account &rarr;
                </Link>
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
