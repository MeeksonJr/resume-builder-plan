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
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <Card className="w-full max-w-md border-[#102b2b]/15 bg-[#f8f4ec] text-[#102b2b] text-center shadow-[18px_20px_0_rgba(16,43,43,.12)]">
      <CardHeader className="space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle className="text-2xl font-bold">
          We couldn&apos;t complete that sign-in.
        </CardTitle>
        <CardDescription>
          The link may have expired, the details may need another look, or the service may need a moment. Start again and we&apos;ll get you back on track.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border border-[#102b2b]/10 bg-white/60 p-4 text-sm text-[#52716a]">
          <p>
            <strong className="text-[#102b2b]">Try this:</strong>
          </p>
          <ul className="mt-2 list-inside list-disc text-left">
            <li>Request a fresh confirmation link</li>
            <li>Check that the email matches your account</li>
            <li>Return to sign in and try once more</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button asChild className="min-h-[44px] w-full gap-2 rounded-none bg-[#102b2b] text-[#f8f4ec] hover:bg-[#164743]">
          <Link href="/auth/login">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </Button>
        <Button asChild variant="ghost" className="min-h-[44px] w-full text-[#52716a] hover:text-[#102b2b]">
          <Link href="/auth/sign-up">Create New Account</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
