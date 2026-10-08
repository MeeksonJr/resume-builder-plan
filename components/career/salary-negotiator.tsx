"use client";

import * as React from "react";
import { DollarSign, Sparkles, Copy, Check, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function SalaryNegotiator() {
  const [initialOffer, setInitialOffer] = React.useState<number>(85000);
  const [targetSalary, setTargetSalary] = React.useState<number>(95000);
  const [companyName, setCompanyName] = React.useState("Dominion Energy");
  const [roleTitle, setRoleTitle] = React.useState("Software Engineer");
  const [copied, setCopied] = React.useState(false);

  const delta = targetSalary - initialOffer;

  const script = `Hi Hiring Team,

Thank you so much for extending the offer to join ${companyName} as a ${roleTitle}! I am genuinely thrilled about the opportunity to contribute to your team's upcoming cloud and software initiatives.

Based on regional compensation benchmarks for Virginia engineers, as well as my specialized coursework and verified campus project contributions, I was hoping we could explore an adjusted base salary of $${targetSalary.toLocaleString()} (a $${delta.toLocaleString()} adjustment).

If meeting this base figure presents budget constraints, I would also be enthusiastic about discussing options such as a one-time signing bonus, accelerated 6-month performance review, or additional professional development stipend.

I am eager to accept the offer and begin working together!

Best regards,
[Your Name]`;

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success("Negotiation script copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-base sm:text-lg font-bold text-foreground">
              Salary Negotiation Script Builder
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Data-backed scripts to tactfully counter-offer early-career employment packages.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Proposed Uplift</span>
          <span className="text-base font-mono font-bold text-emerald-600">+${delta.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-[11px] font-bold text-muted-foreground block mb-1">Company</label>
          <Input 
            value={companyName} 
            onChange={(e) => setCompanyName(e.target.value)} 
            className="h-9 text-xs rounded-xl bg-card border-border"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-muted-foreground block mb-1">Role Title</label>
          <Input 
            value={roleTitle} 
            onChange={(e) => setRoleTitle(e.target.value)} 
            className="h-9 text-xs rounded-xl bg-card border-border"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-muted-foreground block mb-1">Offered Base ($)</label>
          <Input 
            type="number"
            value={initialOffer} 
            onChange={(e) => setInitialOffer(Number(e.target.value))} 
            className="h-9 text-xs rounded-xl bg-card border-border font-mono"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-muted-foreground block mb-1">Target Counter ($)</label>
          <Input 
            type="number"
            value={targetSalary} 
            onChange={(e) => setTargetSalary(Number(e.target.value))} 
            className="h-9 text-xs rounded-xl bg-card border-border font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Generated Negotiation Script</span>
          <Button
            size="sm"
            variant="outline"
            onClick={copyScript}
            className="h-8 text-xs font-bold rounded-xl gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy Script"}</span>
          </Button>
        </div>
        <div className="p-4 bg-muted/40 rounded-xl border border-border/60 text-xs font-mono text-foreground leading-relaxed whitespace-pre-line">
          {script}
        </div>
      </div>
    </Card>
  );
}
