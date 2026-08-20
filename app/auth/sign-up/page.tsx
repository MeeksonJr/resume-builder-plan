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
import { Loader2, AlertCircle, User, Mail, Lock, Sparkles, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [educationLevel, setEducationLevel] = useState("Undergraduate");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            education_level: educationLevel,
          },
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  return (
    <Card className="relative w-full overflow-hidden border-[#102b2b]/15 bg-[#f8f4ec]/95 shadow-[18px_20px_0_rgba(16,43,43,.12)]">
      {/* Decorative top soft accent */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-[#d8f36b]" />

      <CardHeader className="space-y-2 pb-6 pt-9 text-left">
        <div className="mb-2 flex h-11 w-11 items-center justify-center bg-[#d8f36b] text-[#102b2b]">
          <GraduationCap className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Build your workspace.
        </CardTitle>
        <CardDescription className="text-slate-400 text-sm max-w-xs mx-auto">
          Bring your experience in once. Then turn it into stronger resumes, applications, and conversations.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSignUp}>
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

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-medium text-[#365950]">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 rounded-none border-[#102b2b]/15 bg-white/60 pl-10 text-sm text-[#102b2b] placeholder:text-[#9bb5aa] focus:border-[#0d8274] focus:ring-[#0d8274]/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-[#365950]">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 rounded-none border-[#102b2b]/15 bg-white/60 pl-10 text-sm text-[#102b2b] placeholder:text-[#9bb5aa] focus:border-[#0d8274] focus:ring-[#0d8274]/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="education" className="text-xs font-medium text-[#365950]">
                Current Education Level
              </Label>
              <select
                id="education"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="h-11 w-full rounded-none border border-[#102b2b]/15 bg-white/60 px-3 text-sm text-[#102b2b] focus:outline-none focus:ring-2 focus:ring-[#0d8274]/30"
              >
                <option value="High School Senior">High School Senior</option>
                <option value="Undergraduate">College Undergraduate (Freshman-Senior)</option>
                <option value="Graduate">Graduate / Master's Student</option>
                <option value="Transfer">Transfer Student</option>
                <option value="PhD">Doctoral / PhD Candidate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-[#365950]">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 rounded-none border-[#102b2b]/15 bg-white/60 pl-10 text-sm text-[#102b2b] placeholder:text-[#9bb5aa] focus:border-[#0d8274] focus:ring-[#0d8274]/20"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full cursor-pointer rounded-none bg-[#102b2b] font-semibold text-[#f8f4ec] shadow-lg shadow-[#102b2b]/15 transition-all hover:bg-[#164743]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating profile...
                </>
              ) : (
                <>
                  Create my workspace
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Quick Demo Access */}
          <button
            type="button"
            onClick={handleQuickDemo}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 border border-[#0d8274]/20 bg-[#0d8274]/10 p-2.5 text-xs font-medium text-[#0d8274] transition-colors hover:bg-[#0d8274]/15"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Explore the demo workspace</span>
          </button>
        </CardContent>
      </form>

      <CardFooter className="px-6 sm:px-8 pb-8 pt-0 flex flex-col gap-3 text-center">
        <p className="text-xs text-[#52716a]">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-[#0d8274] transition-colors hover:text-[#102b2b]"
          >
            Sign in instead
          </Link>
        </p>

        <p className="text-[11px] leading-tight text-[#78928a]">
          By creating an account, you agree to ResumeForge&apos;s Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
