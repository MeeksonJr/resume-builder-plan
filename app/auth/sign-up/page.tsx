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
    <Card className="w-full border-slate-800/80 bg-slate-900/70 backdrop-blur-2xl shadow-2xl shadow-indigo-950/40 rounded-3xl relative overflow-hidden">
      {/* Decorative top soft accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-emerald-400 to-amber-300" />

      <CardHeader className="space-y-2 pb-6 pt-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
          <GraduationCap className="w-6 h-6 text-indigo-300" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Student Profile
        </CardTitle>
        <CardDescription className="text-slate-400 text-sm max-w-xs mx-auto">
          Start matching with thousands of vetted scholarships and grants for college.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSignUp}>
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

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-medium text-slate-300">
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
                  className="pl-10 h-11 bg-slate-950/80 border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl text-white text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-slate-300">
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
                  className="pl-10 h-11 bg-slate-950/80 border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl text-white text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="education" className="text-xs font-medium text-slate-300">
                Current Education Level
              </Label>
              <select
                id="education"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="High School Senior">High School Senior</option>
                <option value="Undergraduate">College Undergraduate (Freshman-Senior)</option>
                <option value="Graduate">Graduate / Master's Student</option>
                <option value="Transfer">Transfer Student</option>
                <option value="PhD">Doctoral / PhD Candidate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-slate-300">
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
                  className="pl-10 h-11 bg-slate-950/80 border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating profile...
                </>
              ) : (
                <>
                  Get Matched Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Quick Demo Access */}
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full p-2.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-950/70 border border-indigo-500/30 text-indigo-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Instant Demo Account (Skip Signup)</span>
          </button>
        </CardContent>
      </form>

      <CardFooter className="px-6 sm:px-8 pb-8 pt-0 flex flex-col gap-3 text-center">
        <p className="text-xs text-slate-400">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
          >
            Sign in here
          </Link>
        </p>

        <p className="text-[11px] text-slate-500 leading-tight">
          By signing up, you agree to Premio's Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
