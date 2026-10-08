"use client";

import * as React from "react";
import { AlertTriangle, RotateCcw, Home, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ERROR_BOUNDARY] Caught error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-card rounded-2xl border border-border shadow-xl p-6 sm:p-8 space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground">
                Something went wrong in this view
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                The interface encountered an unexpected state. Your saved data remains safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-muted/40 rounded-xl text-left font-mono text-[11px] text-muted-foreground overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.assign("/dashboard")}
                className="h-9 text-xs font-bold rounded-xl gap-1.5"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Button>
              <Button
                size="sm"
                onClick={this.resetError}
                className="h-9 text-xs font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] rounded-xl gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
