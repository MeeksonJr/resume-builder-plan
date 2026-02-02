import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <Card className="w-full max-w-md border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <CardHeader className="space-y-4 pb-8 text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-white tracking-tight">Check your email</CardTitle>
        <CardDescription className="text-slate-400 text-base leading-relaxed">
          We&apos;ve sent a confirmation link to verify your email address.
          Please click it to activate your account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-8 pb-8">
        <div className="rounded-2xl bg-slate-950/50 border border-white/5 p-4 text-sm text-slate-400">
          <p className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <span>
              The email might take a few minutes. Check your spam folder if you can&apos;t find it.
            </span>
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pb-8 px-8">
        <Button asChild className="h-12 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all group">
          <Link href="/auth/login" className="flex items-center justify-center gap-2">
            Go to Sign In
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
        <Button asChild variant="ghost" className="h-11 w-full text-slate-400 hover:text-white hover:bg-white/5 font-medium">
          <Link href="/">Return to Home</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
