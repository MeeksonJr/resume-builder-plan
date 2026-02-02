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
import { Loader2, AlertCircle, User, Mail, Lock, UserPlus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        },
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/auth/sign-up-success");
  };

  return (
    <Card className="w-full max-w-md border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <CardHeader className="space-y-2 pb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <UserPlus className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-center text-white tracking-tight">Create Account</CardTitle>
        <CardDescription className="text-center text-slate-400 text-base">
          Join thousands of professionals building their future
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSignUp}>
        <CardContent className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-300 font-medium ml-1">Full Name</Label>
              <div className="relative group/input">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within/input:text-purple-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Mohamed L. Datt"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-11 h-12 bg-slate-950/50 border-white/5 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-medium ml-1">Email Address</Label>
              <div className="relative group/input">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within/input:text-purple-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-11 h-12 bg-slate-950/50 border-white/5 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 font-medium ml-1">Password</Label>
              <div className="relative group/input">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within/input:text-purple-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-11 h-12 bg-slate-950/50 border-white/5 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all rounded-xl"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-6 pt-2 pb-8">
          <Button
            type="submit"
            className="h-12 w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] group"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-slate-500 font-medium">Already a Member?</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-purple-400 hover:text-purple-300 transition-colors underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
