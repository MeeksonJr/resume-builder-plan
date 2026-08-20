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
    <Card className="relative w-full max-w-md overflow-hidden border-[#102b2b]/15 bg-[#f8f4ec] text-[#102b2b] shadow-[18px_20px_0_rgba(16,43,43,.12)]">
      {/* Decorative top glow */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-[#d8f36b]" />

      <CardHeader className="space-y-4 pb-8 text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <CardTitle className="text-3xl font-semibold tracking-[-.05em]">Check your email</CardTitle>
        <CardDescription className="text-base leading-relaxed text-[#52716a]">
          We&apos;ve sent a confirmation link to verify your email address.
          Please click it to activate your account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-8 pb-8">
        <div className="border border-[#102b2b]/10 bg-white/60 p-4 text-sm text-[#52716a]">
          <p className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0d8274]" />
            <span>
              The email might take a few minutes. Check your spam folder if you can&apos;t find it.
            </span>
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pb-8 px-8">
        <Button asChild className="h-12 w-full rounded-none bg-[#102b2b] font-semibold text-[#f8f4ec] shadow-lg shadow-[#102b2b]/15 transition-all hover:bg-[#164743] group">
          <Link href="/auth/login" className="flex items-center justify-center gap-2">
            Go to Sign In
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
        <Button asChild variant="ghost" className="h-11 w-full font-medium text-[#52716a] hover:bg-[#102b2b]/5 hover:text-[#102b2b]">
          <Link href="/">Return to Home</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
