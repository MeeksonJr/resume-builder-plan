/**
 * ResumeForge Multi-User Realtime Live Cursors & Pair-Review Protocol (Phase 51)
 * Powers concurrent peer editing, coach annotations, and presence synchronization.
 */

export type PeerRole = "candidate" | "coach" | "mentor" | "reviewer";

export interface PeerUser {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: PeerRole;
  color: string;
}

export interface PeerCursor extends PeerUser {
  xPercent: number; // 0 to 100 relative to resume canvas
  yPercent: number; // 0 to 100 relative to resume canvas
  activeField?: string; // e.g. "experience.0.description"
  activeSection?: string; // e.g. "experience", "skills", "summary"
  lastActive: number; // timestamp
  lastActiveAt?: number; // alias
}

const PEER_COLORS = [
  "#0d8274", // Teal
  "#2563eb", // Royal Blue
  "#7c3aed", // Violet
  "#ea580c", // Orange
  "#db2777", // Pink
  "#059669", // Emerald
  "#d97706", // Amber
];

/**
 * Generates a deterministic color for a user from their ID.
 */
export function getPeerColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PEER_COLORS.length;
  return PEER_COLORS[index];
}

/**
 * Validates and sanitizes cursor coordinates within [0, 100] canvas bounds.
 */
export function sanitizeCursorPosition(x: number, y: number): { xPercent: number; yPercent: number } {
  return {
    xPercent: Math.max(0, Math.min(100, Number(x.toFixed(2)))),
    yPercent: Math.max(0, Math.min(100, Number(y.toFixed(2)))),
  };
}

/**
 * Creates an initial peer cursor payload.
 */
export function createPeerCursor(user: PeerUser, x = 50, y = 50, activeField?: string): PeerCursor {
  const { xPercent, yPercent } = sanitizeCursorPosition(x, y);
  return {
    ...user,
    xPercent,
    yPercent,
    activeField,
    lastActive: Date.now(),
  };
}

/**
 * Filters out idle peer cursors inactive for longer than maxIdleMs (default 20 seconds).
 */
export function filterActiveCursors(cursors: Record<string, PeerCursor>, maxIdleMs = 20000): PeerCursor[] {
  const now = Date.now();
  return Object.values(cursors).filter((cursor) => now - cursor.lastActive < maxIdleMs);
}

/**
 * Mock Career Coach peers for local preview and instant pair-editing testing.
 */
export const MOCK_COACH_PEERS: PeerUser[] = [
  {
    userId: "coach-elena",
    name: "Elena Rostova",
    role: "coach",
    color: "#0d8274",
  },
  {
    userId: "mentor-marcus",
    name: "Marcus Vance",
    role: "mentor",
    color: "#2563eb",
  },
];
