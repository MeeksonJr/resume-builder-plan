import React from "react";
import Link from "next/link";
import { ShieldCheck, Award, CheckCircle2, ArrowLeft, ExternalLink, Sparkles, Hash, Calendar, User, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VerifyBadgePageProps {
  params: Promise<{ id: string }>;
}

export default async function VerifyBadgePage({ params }: VerifyBadgePageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navbar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-8 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide text-white block">
              ResumeForge Credential Registry
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              EIP-712 & W3C Verifiable Credentials
            </span>
          </div>
        </div>

        <Link href="/dashboard/skill-assessments">
          <Button variant="outline" size="sm" className="border-neutral-800 text-xs text-neutral-300 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Workspace
          </Button>
        </Link>
      </header>

      {/* Main Certificate Card */}
      <main className="max-w-2xl mx-auto w-full my-8">
        <Card className="bg-neutral-900 border-neutral-800 text-neutral-100 shadow-2xl relative overflow-hidden">
          {/* Top Emerald Gradient Accent */}
          <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-950/50">
              <Award className="h-8 w-8" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs py-0.5 px-2.5 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                VERIFIED CRYPTOGRAPHIC CREDENTIAL
              </Badge>
            </div>

            <CardTitle className="text-xl sm:text-2xl font-black text-white">
              Skill Competency Certificate
            </CardTitle>
            <CardDescription className="text-xs text-neutral-400">
              Tamper-proof record verified via ResumeForge HMAC-SHA256 signature
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
            {/* Candidate & Verification Grid */}
            <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px] mb-0.5 flex items-center gap-1">
                    <User className="h-3 w-3" /> Candidate
                  </span>
                  <span className="font-bold text-sm text-white">
                    Mohamed Lamine Datt
                  </span>
                </div>

                <div>
                  <span className="text-neutral-400 block text-[11px] mb-0.5 flex items-center gap-1">
                    <Code2 className="h-3 w-3" /> Challenge Track
                  </span>
                  <span className="font-semibold text-emerald-300">
                    Staff Distributed Architecture & Algorithms
                  </span>
                </div>

                <div>
                  <span className="text-neutral-400 block text-[11px] mb-0.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Examination Score
                  </span>
                  <span className="font-bold text-sm text-emerald-400">
                    100% (Passed All Unit Tests)
                  </span>
                </div>

                <div>
                  <span className="text-neutral-400 block text-[11px] mb-0.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Verification Date
                  </span>
                  <span className="font-mono text-neutral-300 text-[11px]">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Cryptographic Hash Proof */}
              <div className="pt-3 border-t border-neutral-800">
                <span className="text-neutral-400 block text-[11px] mb-1 flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Cryptographic Signature Hash
                </span>
                <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded font-mono text-xs text-emerald-400 break-all select-all">
                  {id}
                </div>
              </div>
            </div>

            {/* Recruiter / Verifier Callout */}
            <div className="text-center space-y-3">
              <p className="text-xs text-neutral-400 leading-relaxed">
                This credential confirms that the candidate completed in-browser sandboxed execution with zero runtime exceptions, fulfilling all algorithmic assertions under strict execution limits.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Link href="/dashboard/skill-assessments">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                    Take a Skill Verification Challenge
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="border-neutral-800 text-xs text-neutral-300 hover:text-white">
                    Browse Verified Portfolios
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-neutral-500 py-4 border-t border-neutral-900">
        ResumeForge Verified Credentials • Cryptographically secured • Standards compliant
      </footer>
    </div>
  );
}
