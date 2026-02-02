"use client";

import React, { useState, useEffect } from "react";
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
import { Loader2, AlertCircle, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        // Check if we have a session (the link from email should have set one)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setError("Invalid or expired reset link. Please request a new one.");
            }
            setIsVerifying(false);
        });
    }, []);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        const supabase = createClient();

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        setIsSuccess(true);
        setIsLoading(false);

        // Redirect after 3 seconds
        setTimeout(() => {
            router.push("/auth/login");
        }, 3000);
    };

    if (isVerifying) {
        return (
            <Card className="w-full max-w-md border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Verifying reset link...</p>
            </Card>
        );
    }

    if (isSuccess) {
        return (
            <Card className="w-full max-w-md border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
                <CardHeader className="space-y-4 pb-8 text-center">
                    <div className="flex justify-center">
                        <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-white tracking-tight">Password Updated</CardTitle>
                    <CardDescription className="text-slate-400 text-base leading-relaxed">
                        Your password has been successfully reset. Redirecting you to login...
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center pb-8 text-slate-500 text-xs">
                    Automatic redirection in 3 seconds...
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            <CardHeader className="space-y-2 pb-8">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <Lock className="w-6 h-6 text-blue-400" />
                    </div>
                </div>
                <CardTitle className="text-3xl font-bold text-center text-white tracking-tight">New Password</CardTitle>
                <CardDescription className="text-center text-slate-400 text-base">
                    Set a secure new password for your account
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleReset}>
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
                            {error.includes("Invalid or expired reset link") && (
                                <div className="mt-4 text-center">
                                    <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto" asChild>
                                        <Link href="/auth/forgot-password">Request a new link</Link>
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300 font-medium ml-1">New Password</Label>
                            <div className="relative group/input">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within/input:text-blue-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="pl-11 h-12 bg-slate-950/50 border-white/5 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-slate-300 font-medium ml-1">Confirm New Password</Label>
                            <div className="relative group/input">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within/input:text-blue-400" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="pl-11 h-12 bg-slate-950/50 border-white/5 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-6 pt-2 pb-8">
                    <Button
                        type="submit"
                        className="h-12 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] group"
                        disabled={isLoading || error?.includes("Invalid or expired reset link")}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                Update Password
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>

                    <p className="text-center text-sm text-slate-400">
                        Back to{" "}
                        <Link
                            href="/auth/login"
                            className="font-bold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
