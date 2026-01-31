import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus, Upload } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center glass-card border-dashed border-primary/20 bg-primary/5 rounded-[3rem] animate-in fade-in zoom-in duration-700">
      <div className="relative mb-10 group">
        <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-2xl group-hover:bg-primary/30 transition-colors" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-2xl shadow-primary/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
          <FileText className="h-14 w-14 text-primary" />
        </div>
        <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg animate-bounce">
          <Plus className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>

      <h3 className="text-4xl font-heading font-black text-foreground tracking-tighter">
        Your success starts here
      </h3>
      <p className="mt-4 max-w-sm text-lg text-muted-foreground font-medium leading-relaxed">
        Building a professional, recruiter-ready resume has never been easier. Choose your path to get started.
      </p>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row">
        <Button asChild className="min-h-[64px] px-10 gap-3 bg-primary text-primary-foreground shadow-2xl shadow-primary/30 rounded-[2rem] font-black text-lg transition-all hover:scale-105 active:scale-95 group">
          <Link href="/dashboard/resume/new">
            <Plus className="h-6 w-6 transition-transform group-hover:rotate-90" />
            CREATE NEW RESUME
          </Link>
        </Button>
        <Button asChild variant="outline" className="min-h-[64px] px-10 gap-3 glass border-primary/20 hover:bg-primary/5 rounded-[2rem] font-black text-lg transition-all hover:scale-105 active:scale-95 text-primary">
          <Link href="/dashboard/upload">
            <Upload className="h-6 w-6" />
            UPLOAD PDF
          </Link>
        </Button>
      </div>
    </div>
  );
}
