"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

function VerifyPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code");
  const email = searchParams.get("email");
  const slug = searchParams.get("slug");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [verifiedSlug, setVerifiedSlug] = useState<string>(slug || "old-dominion-university");

  useEffect(() => {
    async function verify() {
      if (!code || !email) {
        setStatus("error");
        setErrorMessage("Missing verification code or email in link parameters.");
        return;
      }

      try {
        const res = await fetch("/api/university/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schoolEmail: email,
            code,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to verify school email");
        }

        setStatus("success");
        const targetSlug = data.university_slug || slug || "old-dominion-university";
        setVerifiedSlug(targetSlug);
        toast.success(`Institutional status verified for ${data.university_name || "your university"}!`);

        // Automatically forward to the campus portal after 2 seconds
        setTimeout(() => {
          router.push(`/dashboard/portal/${targetSlug}`);
        }, 2200);
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Invalid or expired verification link.");
      }
    }

    verify();
  }, [code, email, slug, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border border-border shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-[#102b2b] p-6 text-center text-white border-b-4 border-[#0d8274]">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#d8f36b] text-[#102b2b] mb-3 shadow-inner">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-black tracking-tight">University Portal Verification</h2>
          <p className="text-xs text-white/70 mt-1">FERPA-Compliant Academic Credentialing</p>
        </div>

        <CardContent className="p-6 text-center space-y-4">
          {status === "loading" && (
            <div className="py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#0d8274]" />
              <p className="text-sm font-bold text-foreground">Validating 1-Click Academic Credential...</p>
              <p className="text-xs text-muted-foreground">Checking security token for {email}</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-6 space-y-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Student Status Verified!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Your campus portal, career fair matcher, and student cohort listing are now fully activated.
                </p>
              </div>
              <Button asChild className="w-full bg-[#102b2b] text-[#d8f36b] hover:bg-[#0d8274] font-bold">
                <Link href={`/dashboard/portal/${verifiedSlug}`} className="flex items-center justify-center gap-2">
                  <span>Enter Campus Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="py-6 space-y-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-500/15 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Verification Failed</h3>
                <p className="text-xs text-red-600 font-medium mt-1">{errorMessage}</p>
              </div>
              <Button asChild variant="outline" className="w-full font-bold">
                <Link href="/dashboard/settings">Return to Settings &amp; Request New Code</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0d8274]" />
        </div>
      }
    >
      <VerifyPortalContent />
    </Suspense>
  );
}
