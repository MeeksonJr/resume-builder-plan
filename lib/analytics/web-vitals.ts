/**
 * Core Web Vitals & Frontend Telemetry Reporter
 * Non-blocking performance metric tracker for Next.js App Router applications.
 */

export interface MetricPayload {
  id: string;
  name: "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType?: string;
}

export function reportWebVitalsMetric(metric: MetricPayload): void {
  // Check thresholds
  let rating: MetricPayload["rating"] = "good";
  if (metric.name === "LCP") {
    rating = metric.value <= 2500 ? "good" : metric.value <= 4000 ? "needs-improvement" : "poor";
  } else if (metric.name === "CLS") {
    rating = metric.value <= 0.1 ? "good" : metric.value <= 0.25 ? "needs-improvement" : "poor";
  } else if (metric.name === "INP") {
    rating = metric.value <= 200 ? "good" : metric.value <= 500 ? "needs-improvement" : "poor";
  }

  const enriched = { ...metric, rating };

  // Dispatch via non-blocking Beacon API if supported
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([JSON.stringify(enriched)], { type: "application/json" });
      navigator.sendBeacon("/api/telemetry/vitals", blob);
    } catch {
      // Non-critical fallback
    }
  }
}
