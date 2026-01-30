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
    <Card className="w-full max-w-md text-center">
      <CardHeader className="space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle className="text-2xl font-bold">
          Authentication Error
        </CardTitle>
        <CardDescription>
          Something went wrong during authentication. This could be due to an
          expired link, invalid credentials, or a temporary issue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p>
            <strong>Common issues:</strong>
          </p>
          <ul className="mt-2 list-inside list-disc text-left">
            <li>Confirmation link has expired</li>
            <li>Link was already used</li>
            <li>Invalid or mistyped credentials</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button asChild className="min-h-[44px] w-full gap-2">
          <Link href="/auth/login">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </Button>
        <Button asChild variant="ghost" className="min-h-[44px] w-full">
          <Link href="/auth/sign-up">Create New Account</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
