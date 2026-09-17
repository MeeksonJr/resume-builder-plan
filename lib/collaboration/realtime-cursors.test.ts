import { describe, it, expect } from "vitest";
import {
  getPeerColor,
  sanitizeCursorPosition,
  createPeerCursor,
  filterActiveCursors,
  type PeerUser,
  type PeerCursor,
} from "./realtime-cursors";

describe("Phase 51: Multi-User Realtime Live Cursors Protocol", () => {
  const mockUser: PeerUser = {
    userId: "coach-123",
    name: "Coach Sarah",
    role: "coach",
    color: "#0d8274",
  };

  it("allocates deterministic colors based on userId hash", () => {
    const color1 = getPeerColor("coach-123");
    const color2 = getPeerColor("coach-123");
    const color3 = getPeerColor("candidate-456");

    expect(color1).toBe(color2);
    expect(typeof color1).toBe("string");
    expect(color1.startsWith("#")).toBe(true);
    expect(typeof color3).toBe("string");
  });

  it("clamps and sanitizes cursor coordinates within [0, 100] percent canvas bounds", () => {
    const clampedHigh = sanitizeCursorPosition(150.456, 120.789);
    expect(clampedHigh.xPercent).toBe(100);
    expect(clampedHigh.yPercent).toBe(100);

    const clampedLow = sanitizeCursorPosition(-45.2, -10.9);
    expect(clampedLow.xPercent).toBe(0);
    expect(clampedLow.yPercent).toBe(0);

    const valid = sanitizeCursorPosition(45.6789, 78.1234);
    expect(valid.xPercent).toBe(45.68);
    expect(valid.yPercent).toBe(78.12);
  });

  it("initializes peer cursor with active field and timestamp", () => {
    const cursor = createPeerCursor(mockUser, 30, 40, "experience.0.description");
    expect(cursor.userId).toBe("coach-123");
    expect(cursor.name).toBe("Coach Sarah");
    expect(cursor.role).toBe("coach");
    expect(cursor.xPercent).toBe(30);
    expect(cursor.yPercent).toBe(40);
    expect(cursor.activeField).toBe("experience.0.description");
    expect(cursor.lastActive).toBeGreaterThan(0);
  });

  it("filters out inactive/idle cursors exceeding maxIdleMs threshold", () => {
    const now = Date.now();
    const cursorMap: Record<string, PeerCursor> = {
      active1: {
        ...mockUser,
        xPercent: 10,
        yPercent: 10,
        lastActive: now - 2000, // 2s ago (active)
      },
      idle1: {
        ...mockUser,
        userId: "idle-coach",
        name: "Idle Coach",
        xPercent: 20,
        yPercent: 20,
        lastActive: now - 35000, // 35s ago (idle)
      },
    };

    const activeList = filterActiveCursors(cursorMap, 20000);
    expect(activeList.length).toBe(1);
    expect(activeList[0].userId).toBe("coach-123");
  });
});
