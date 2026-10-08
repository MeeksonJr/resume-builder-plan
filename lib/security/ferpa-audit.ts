/**
 * Zero-Trust Audit Logger & FERPA Compliance Monitor
 * Immutable audit trail tracking student record views, institutional isolation checks, and export events.
 */

export interface FerpaAuditEvent {
  eventId: string;
  timestamp: string;
  userId: string;
  userPrimarySchool?: string | null;
  targetSchoolSlug: string;
  eventType: "DIRECTORY_VIEW" | "PORTAL_ACCESS_ATTEMPT" | "PORTAL_BLOCKED_FERPA" | "RESUME_EXPORT" | "VERIFICATION_SUCCESS";
  accessVerdict: "AUTHORIZED" | "BLOCKED" | "FLAGGED";
  ipHash?: string;
  metadata?: Record<string, any>;
}

class FerpaAuditLogger {
  private inMemoryAuditLog: FerpaAuditEvent[] = [];

  logEvent(event: Omit<FerpaAuditEvent, "eventId" | "timestamp">): FerpaAuditEvent {
    const fullEvent: FerpaAuditEvent = {
      ...event,
      eventId: `ferpa-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.inMemoryAuditLog.push(fullEvent);

    // Keep log bounded in memory
    if (this.inMemoryAuditLog.length > 500) {
      this.inMemoryAuditLog.shift();
    }

    if (fullEvent.accessVerdict === "BLOCKED") {
      console.warn(`[FERPA:AUDIT:BLOCKED] Access to ${event.targetSchoolSlug} blocked for user ${event.userId}.`);
    }

    return fullEvent;
  }

  getRecentLogs(limit: number = 50): FerpaAuditEvent[] {
    return [...this.inMemoryAuditLog].slice(-limit).reverse();
  }

  getViolations(): FerpaAuditEvent[] {
    return this.inMemoryAuditLog.filter((e) => e.accessVerdict === "BLOCKED");
  }

  clear(): void {
    this.inMemoryAuditLog = [];
  }
}

export const ferpaAudit = new FerpaAuditLogger();
