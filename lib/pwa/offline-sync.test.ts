import { describe, it, expect, beforeEach } from "vitest";
import {
  writeOfflineData,
  readOfflineData,
  queueOfflineMutation,
  getOfflineQueue,
  processOfflineSyncQueue,
  clearOfflineQueue,
  resolveMergeConflict,
  OfflineMutation
} from "./offline-sync";

describe("Phase 58: Offline-First PWA Sync Engine", () => {
  beforeEach(async () => {
    await clearOfflineQueue();
  });

  it("stores and retrieves offline data transparently", async () => {
    const testResume = {
      id: "res-123",
      title: "Senior Fullstack Engineer",
      content: { skills: ["TypeScript", "Next.js", "OPFS"] }
    };

    await writeOfflineData("test_resume", testResume);
    const retrieved = await readOfflineData<typeof testResume>("test_resume");

    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe("Senior Fullstack Engineer");
    expect(retrieved?.content.skills).toContain("OPFS");
  });

  it("queues offline mutations and tracks pending items", async () => {
    const mut1 = await queueOfflineMutation({
      type: "UPDATE_RESUME",
      entityId: "res-1",
      payload: { title: "Staff Architect" }
    });

    const queue = await getOfflineQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].id).toBe(mut1.id);
    expect(queue[0].status).toBe("pending");
    expect(queue[0].payload.title).toBe("Staff Architect");
  });

  it("flushes and synchronizes queue when online dispatcher succeeds", async () => {
    await queueOfflineMutation({
      type: "UPDATE_RESUME",
      entityId: "res-1",
      payload: { title: "Staff Architect" }
    });

    await queueOfflineMutation({
      type: "SAVE_DRAFT",
      entityId: "draft-99",
      payload: { note: "Offline notes while on airplane" }
    });

    const syncResult = await processOfflineSyncQueue(async (mut) => {
      // simulate server write
      return { success: true };
    });

    expect(syncResult.total).toBe(2);
    expect(syncResult.synced).toBe(2);
    expect(syncResult.failed).toBe(0);

    const remaining = await getOfflineQueue();
    expect(remaining.length).toBe(0); // synced items are cleared
  });

  it("handles deterministic 3-way merge conflict resolution between client and server", () => {
    const clientResume = {
      id: "res-42",
      title: "Updated Client Title",
      summary: "Client modified summary",
      updated_at: "2026-09-17T12:00:00Z"
    };

    const serverResume = {
      id: "res-42",
      title: "Old Server Title",
      summary: "Server modified summary",
      updated_at: "2026-09-17T11:00:00Z" // older than client
    };

    const result = resolveMergeConflict(clientResume, serverResume);

    // Client has newer timestamp, client fields win
    expect(result.resolvedPayload.title).toBe("Updated Client Title");
    expect(result.resolvedPayload.summary).toBe("Client modified summary");
    expect(result.strategyUsed).toBe("client-wins");
  });
});
