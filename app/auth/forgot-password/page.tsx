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
import { Loader2, AlertCircle, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
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
    };

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
                    <CardTitle className="text-3xl font-bold text-white tracking-tight">Check your email</CardTitle>
                    <CardDescription className="text-slate-400 text-base leading-relaxed">
                        We&apos;ve sent a password reset link to <span className="text-white font-medium">{email}</span>
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col gap-4 pb-8">
                    <Button variant="outline" className="w-full border-white/5 bg-white/5 hover:bg-white/10 text-white" asChild>
                        <Link href="/auth/login">Return to login</Link>
                    </Button>
                    <p className="text-xs text-center text-slate-500">
                        Didn&apos;t receive the email? Check your spam folder.
                    </p>
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
                        <Mail className="w-6 h-6 text-blue-400" />
                    </div>
                </div>
                <CardTitle className="text-3xl font-bold text-center text-white tracking-tight">Reset Password</CardTitle>
                <CardDescription className="text-center text-slate-400 text-base">
                    Enter your email to receive a password reset link
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleResetRequest}>
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

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300 font-medium ml-1">Email Address</Label>
                        <div className="relative group/input">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within/input:text-blue-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="pl-11 h-12 bg-slate-950/50 border-white/5 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                            />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-6 pt-2 pb-8">
                    <Button
                        type="submit"
                        className="h-12 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] group"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                Send Reset Link
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>

                    <p className="text-center text-sm text-slate-400">
                        Remember your password?{" "}
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
