"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  GraduationCap,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  School,
  Building2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { VIRGINIA_INSTITUTIONS, VirginiaInstitution } from "@/lib/university/virginia-institutions";
import { VerifiedSchoolRecord } from "@/lib/university/access-control";

interface InstitutionalAccessGateProps {
  targetSlug: string;
  targetSchoolName: string;
  targetInstitution?: VirginiaInstitution | null;
  userPrimarySlug?: string | null;
  userPrimaryName?: string | null;
  verifiedSchools: VerifiedSchoolRecord[];
}

export function InstitutionalAccessGate({
  targetSlug,
  targetSchoolName,
  targetInstitution,
  userPrimarySlug,
  userPrimaryName,
  verifiedSchools,
}: InstitutionalAccessGateProps) {
  const router = useRouter();

  // Verification state
  const [verificationMethod, setVerificationMethod] = useState<"email" | "canvas">("email");
  const [emailInput, setEmailInput] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  // Canvas state
  const [canvasUrl, setCanvasUrl] = useState(
    targetInstitution?.canvasUrl || "https://canvas.instructure.com"
  );
  const [canvasToken, setCanvasToken] = useState("");
  const [verifyingCanvas, setVerifyingCanvas] = useState(false);

  const institution =
    targetInstitution ||
    VIRGINIA_INSTITUTIONS.find(
      (v) =>
        v.slug.toLowerCase() === targetSlug.toLowerCase() ||
        v.name.toLowerCase().includes(targetSchoolName.toLowerCase())
    ) ||
    null;

  const sampleEmail = institution?.sampleEmail || `student@${institution?.domain || "school.edu"}`;

  const handleSendCode = async () => {
    if (!emailInput || !emailInput.includes("@")) {
      toast.error("Please enter a valid academic institutional email (.edu)");
      return;
    }

    setSendingCode(true);
    try {
      const res = await fetch("/api/university/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolEmail: emailInput.trim(),
          universityName: targetSchoolName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setCodeSent(true);
      toast.success(
        `Verification code dispatched to ${emailInput}! Check your campus inbox & spam folder.`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to send verification code");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.trim().length < 4) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setVerifyingCode(true);
    try {
      const res = await fetch("/api/university/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolEmail: emailInput.trim(),
          code: verificationCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      toast.success(`Access unlocked for ${data.university_name || targetSchoolName}! 🎓`);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("rf-profile-updated"));
      }

      // Refresh page so server component verifies authorization and renders the portal
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired verification code");
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleVerifyCanvas = async () => {
    if (!canvasUrl || !canvasToken) {
      toast.error("Please provide both Canvas URL and Access Token");
      return;
    }

    setVerifyingCanvas(true);
    try {
      const res = await fetch("/api/university/verify-canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvasInstanceUrl: canvasUrl,
          canvasAccessToken: canvasToken,
          schoolName: targetSchoolName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Canvas verification failed");
      }

      toast.success(`Verified via Canvas! Welcome ${data.studentName || ""}`);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("rf-profile-updated"));
      }

      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Canvas token verification failed");
    } finally {
      setVerifyingCanvas(false);
    }
  };

  const otherVerifiedSchools = verifiedSchools.filter(
    (v) => v.slug !== targetSlug
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
        <Link
          href="/dashboard/portal?browse=true"
          className="inline-flex items-center gap-1.5 text-primary hover:underline font-bold"
        >
          &larr; Back to Virginia Campus Directory
        </Link>
        <span className="font-mono text-[11px]">Access Control &bull; Institutional Isolation</span>
      </div>

      {/* Main Gate Card */}
      <Card className="border border-border/80 shadow-2xl rounded-2xl overflow-hidden bg-card">
        {/* Banner */}
        <div className="bg-[#102b2b] text-[#fbf8f1] p-6 sm:p-8 border-b-4 border-amber-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-xl border border-amber-500/30">
                <Lock className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    <ShieldAlert className="h-3 w-3" /> Institutional Gate
                  </span>
                  <span className="text-xs text-white/70 font-mono">FERPA Protected Workspace</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black mt-1 text-white">
                  {targetSchoolName} Portal
                </h1>
                <p className="text-xs text-white/80 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{institution?.location || "Commonwealth of Virginia"} &bull; {institution?.category === "vccs_community_college" ? "VCCS Community College" : "Collegiate Research Institution"}</span>
                </p>
              </div>
            </div>

            <Link href="/dashboard/portal?browse=true">
              <Button variant="outline" size="sm" className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs font-bold rounded-xl">
                Browse Other Campuses
              </Button>
            </Link>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Institutional Isolation Notice */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
            <p className="font-bold text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Campus Portal Restricted to Verified Students &amp; Faculty
            </p>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              To protect student records, cohort directories, and confidential recruiter pipelines, 
              each university portal requires verified enrollment for that specific institution.
              {otherVerifiedSchools.length > 0 && (
                <> You are currently verified for <strong className="text-foreground">{otherVerifiedSchools.map((s) => s.name).join(", ")}</strong>. To access {targetSchoolName}, add and verify your institutional credentials below.</>
              )}
            </p>
          </div>

          {/* Verification Form Card */}
          <div className="border border-border rounded-xl p-5 sm:p-6 bg-muted/30 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Verify Enrollment for {targetSchoolName}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Accepted email format: <span className="font-mono text-primary font-bold">{institution?.emailFormat || `@${institution?.domain || "school.edu"}`}</span>
                </p>
              </div>

              {/* Method Switcher */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setVerificationMethod("email")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    verificationMethod === "email"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Campus Email (.edu)
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMethod("canvas")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    verificationMethod === "canvas"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Canvas LMS
                </button>
              </div>
            </div>

            {/* METHOD A: Email Verification */}
            {verificationMethod === "email" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">
                    Official Student / Faculty Email Address
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder={`e.g. ${sampleEmail}`}
                      className="rounded-none border-border h-11 text-xs font-mono"
                    />
                    <Button
                      onClick={handleSendCode}
                      disabled={sendingCode || !emailInput.includes("@")}
                      className="bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] font-bold rounded-none shrink-0 px-5 h-11 text-xs cursor-pointer"
                    >
                      {sendingCode ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-1.5" />
                          Send Code
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    A secure 6-digit verification code will be sent to confirm your institutional affiliation.
                  </p>
                </div>

                {codeSent && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs rounded-none text-muted-foreground">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Code sent to {emailInput}
                      </p>
                      <p className="text-[11px] mt-0.5">
                        Check your campus inbox, Junk, or Quarantine folder. Enter the 6-digit code below to unlock the portal.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground">
                        Enter 6-Digit Verification Code
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="e.g. 582914"
                          maxLength={6}
                          className="rounded-none font-mono text-center tracking-widest text-lg border-border h-11 max-w-[200px]"
                        />
                        <Button
                          onClick={handleVerifyCode}
                          disabled={verifyingCode || verificationCode.length < 4}
                          className="bg-[#0d8274] text-white hover:bg-[#095e54] font-bold rounded-none px-6 h-11 text-xs cursor-pointer"
                        >
                          {verifyingCode ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <KeyRound className="h-4 w-4 mr-1.5" />
                              Unlock Portal
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* METHOD B: Canvas LMS Verification */}
            {verificationMethod === "canvas" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Canvas Instance URL</label>
                  <Input
                    value={canvasUrl}
                    onChange={(e) => setCanvasUrl(e.target.value)}
                    placeholder={institution?.canvasUrl || "https://canvas.instructure.com"}
                    className="rounded-none border-border h-11 text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Canvas Access Token</label>
                  <Input
                    type="password"
                    value={canvasToken}
                    onChange={(e) => setCanvasToken(e.target.value)}
                    placeholder="Paste Canvas personal access token..."
                    className="rounded-none border-border h-11 font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Generate this in your Canvas account &rarr; Settings &rarr; Approved Integrations &rarr; + New Access Token.
                  </p>
                </div>

                <Button
                  onClick={handleVerifyCanvas}
                  disabled={verifyingCanvas || !canvasToken}
                  className="w-full bg-[#0d8274] text-white hover:bg-[#095e54] font-bold rounded-none h-11 text-xs cursor-pointer"
                >
                  {verifyingCanvas ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Verifying with Canvas...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      Link &amp; Unlock via Canvas
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
            <Link href="/dashboard/portal?browse=true" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto text-xs font-bold rounded-xl">
                &larr; Return to Campus Directory
              </Button>
            </Link>

            {otherVerifiedSchools.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {otherVerifiedSchools.map((s) => (
                  <Link key={s.slug} href={`/dashboard/portal/${s.slug}`} className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] text-xs font-bold rounded-xl gap-1.5">
                      <span>Open My {s.name} Portal</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
