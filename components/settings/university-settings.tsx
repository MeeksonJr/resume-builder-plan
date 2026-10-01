"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  KeyRound,
  Loader2,
  CheckCircle2,
  ExternalLink,
  School,
  AlertCircle,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface UniversitySettingsProps {
  profile: any;
}

const POPULAR_SCHOOLS = [
  "Stanford University",
  "Massachusetts Institute of Technology",
  "University of California, Berkeley",
  "Harvard University",
  "Carnegie Mellon University",
  "New York University",
  "University of Michigan",
  "Georgia Institute of Technology",
  "University of Washington",
  "Columbia University",
];

export function UniversitySettings({ profile }: UniversitySettingsProps) {
  const router = useRouter();

  const [isStudent, setIsStudent] = useState<boolean>(profile?.is_student || false);
  const [universityName, setUniversityName] = useState<string>(profile?.university_name || "");
  const [schoolEmail, setSchoolEmail] = useState<string>(profile?.school_email || "");
  const [isVerified, setIsVerified] = useState<boolean>(profile?.school_verified || false);
  const [universitySlug, setUniversitySlug] = useState<string>(profile?.university_slug || "");

  // Verification state
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  // Canvas Quick Verification
  const [canvasUrl, setCanvasUrl] = useState(profile?.canvas_instance_url || "");
  const [canvasToken, setCanvasToken] = useState("");
  const [verifyingCanvas, setVerifyingCanvas] = useState(false);

  const handleSendCode = async () => {
    if (!schoolEmail || !schoolEmail.includes("@")) {
      toast.error("Please enter a valid university email address (.edu)");
      return;
    }

    setSendingCode(true);
    try {
      const res = await fetch("/api/university/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolEmail,
          universityName: universityName || "University Student",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");

      setCodeSent(true);
      const quickCode = data.devCode || data.code;
      if (quickCode) {
        setDevCode(quickCode);
        setCode(quickCode);
        toast.success(`Verification code generated! (Sandbox code: ${quickCode})`, {
          duration: 10000,
        });
      } else {
        toast.success(data.message || "Code sent to your university email!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send code");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length < 4) {
      toast.error("Please enter the verification code");
      return;
    }

    setVerifyingCode(true);
    try {
      const res = await fetch("/api/university/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolEmail,
          code,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setIsVerified(true);
      setIsStudent(true);
      setUniversitySlug(data.university_slug);
      toast.success("School verified! University portal link added to your sidebar.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired code");
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleVerifyCanvas = async () => {
    if (!canvasUrl || !canvasToken) {
      toast.error("Please enter Canvas URL and Access Token");
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
          schoolName: universityName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Canvas verification failed");

      setIsVerified(true);
      setIsStudent(true);
      setUniversitySlug(data.university_slug);
      setUniversityName(data.university_name);
      toast.success("Verified via Canvas! University portal link unlocked on sidebar.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to verify Canvas token");
    } finally {
      setVerifyingCanvas(false);
    }
  };

  const handleRemoveVerification = async () => {
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isStudent: false,
          universityName: null,
          universitySlug: null,
          schoolVerified: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to reset university status");

      setIsVerified(false);
      setIsStudent(false);
      setUniversityName("");
      setSchoolEmail("");
      setUniversitySlug("");
      toast.info("University status unlinked.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Error updating settings");
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card className="rounded-none border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-[#102b2b] text-[#d8f36b] flex items-center justify-center font-bold">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-foreground">
                  University Student Portal &amp; Verification
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Verify your university enrollment to unlock cohort career portals, alumni networks, and verified student badges.
                </CardDescription>
              </div>
            </div>
            {isVerified ? (
              <Badge className="bg-emerald-600 text-white rounded-none font-bold uppercase tracking-wider text-[10px] px-3 py-1 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Verified Student
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-none text-[10px] uppercase tracking-wider font-bold">
                Unverified / Not Enrolled
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isVerified ? (
            /* Verified state */
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {universityName || "University"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Verified with email: <span className="font-mono text-foreground">{schoolEmail || "Canvas Account"}</span>
                  </p>
                </div>
                {universitySlug && (
                  <Button asChild size="sm" className="bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] font-bold rounded-none">
                    <Link href={`/dashboard/portal/${universitySlug}`}>
                      View Campus Portal
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Link>
                  </Button>
                )}
              </div>
              <div className="pt-2 border-t border-emerald-500/20 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveVerification}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-7"
                >
                  Unlink University
                </Button>
              </div>
            </div>
          ) : (
            /* Unverified - Configure School */
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Select or Enter University Name
                </Label>
                <Input
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  placeholder="e.g. Stanford University, MIT, UC Berkeley, NYU..."
                  className="rounded-none border-border"
                />

                {/* Popular School Suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {POPULAR_SCHOOLS.slice(0, 5).map((sch) => (
                    <button
                      key={sch}
                      type="button"
                      onClick={() => setUniversityName(sch)}
                      className="text-[11px] font-medium px-2.5 py-1 border border-border bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-all"
                    >
                      {sch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Method 1: Email Code */}
              <div className="p-5 border border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#0d8274]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Method 1: Verify with Official Student Email (.edu)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      type="email"
                      value={schoolEmail}
                      onChange={(e) => setSchoolEmail(e.target.value)}
                      placeholder="student@school.edu"
                      className="rounded-none border-border"
                    />
                  </div>
                  <Button
                    onClick={handleSendCode}
                    disabled={sendingCode || !schoolEmail}
                    className="bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] font-bold rounded-none"
                  >
                    {sendingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Code"}
                  </Button>
                </div>

                {codeSent && (
                  <div className="space-y-3 pt-3 border-t border-border">
                    {devCode && (
                      <div className="p-3 bg-[#0d8274]/10 border border-[#0d8274]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-[#0d8274]">
                            Sandbox Mode: Instant Verification Code
                          </p>
                          <p className="text-sm font-mono font-black text-foreground tracking-widest mt-0.5">
                            {devCode}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          type="button"
                          onClick={() => setCode(devCode)}
                          className="bg-[#0d8274] text-white hover:bg-[#095e54] text-xs font-bold rounded-none h-7 px-3"
                        >
                          Auto-Fill Code
                        </Button>
                      </div>
                    )}

                    <div className="p-2.5 bg-muted/60 border border-border text-[11px] text-muted-foreground">
                      <strong className="text-foreground">📬 Note on Outlook / School Email:</strong> If your university blocks incoming automated developer emails from Resend, check your Outlook <em>Other</em> tab or <em>Junk Email</em> folder, or use the pre-filled instant code above.
                    </div>

                    <div className="flex gap-3">
                      <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="rounded-none font-mono text-center tracking-widest text-sm max-w-xs border-border"
                      />
                      <Button
                        onClick={handleVerifyCode}
                        disabled={verifyingCode || code.length < 4}
                        className="bg-[#0d8274] text-white hover:bg-[#095e54] font-bold rounded-none"
                      >
                        {verifyingCode ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ShieldCheck className="h-4 w-4 mr-1" />}
                        Verify Code
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Method 2: Canvas LMS Access Token */}
              <div className="p-5 border border-border bg-card space-y-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-violet-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Method 2: Instant Verification via Canvas LMS Token
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generate an access token in Canvas under Account &gt; Settings &gt; New Access Token.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    value={canvasUrl}
                    onChange={(e) => setCanvasUrl(e.target.value)}
                    placeholder="Canvas URL (e.g. https://canvas.stanford.edu)"
                    className="rounded-none border-border"
                  />
                  <Input
                    type="password"
                    value={canvasToken}
                    onChange={(e) => setCanvasToken(e.target.value)}
                    placeholder="Canvas Access Token..."
                    className="rounded-none border-border"
                  />
                </div>
                <Button
                  onClick={handleVerifyCanvas}
                  disabled={verifyingCanvas || !canvasToken}
                  className="bg-violet-700 text-white hover:bg-violet-800 font-bold rounded-none"
                >
                  {verifyingCanvas ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Testing Canvas Access...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Verify Student Status with Canvas
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
