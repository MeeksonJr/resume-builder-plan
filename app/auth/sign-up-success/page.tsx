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
import { Mail, ArrowRight } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader className="space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
        <CardDescription>
          We&apos;ve sent you a confirmation link to verify your email address.
          Please check your inbox and click the link to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> The email might take a few minutes to arrive.
            Don&apos;t forget to check your spam folder if you can&apos;t find
            it.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button asChild className="min-h-[44px] w-full gap-2">
          <Link href="/auth/login">
            Go to Sign In
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost" className="min-h-[44px] w-full">
          <Link href="/">Return to Home</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
