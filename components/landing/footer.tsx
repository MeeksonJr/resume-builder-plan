import Link from "next/link";
import { FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">ResumeForge</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How It Works
            </Link>
            <Link
              href="/auth/login"
              className="transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="transition-colors hover:text-foreground"
            >
              Get Started
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} ResumeForge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
