import React from "react"
import Link from "next/link";
import { FileText } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-background px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">ResumeForge</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-4 py-4 text-center text-sm text-muted-foreground">
        {new Date().getFullYear()} ResumeForge. All rights reserved.
      </footer>
    </div>
  );
}
