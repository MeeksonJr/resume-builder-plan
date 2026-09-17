"use client";

import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  HardDriveDownload,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  getOfflineQueue, 
  processOfflineSyncQueue, 
  OfflineMutation, 
  clearOfflineQueue 
} from "@/lib/pwa/offline-sync";
import { Button } from "@/components/ui/button";

export function OfflineIndicatorBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [queue, setQueue] = useState<OfflineMutation[]>([]);

  const refreshQueueStatus = async () => {
    try {
      const q = await getOfflineQueue();
      setQueue(q);
      setPendingCount(q.filter(m => m.status === "pending" || m.status === "failed").length);
    } catch {
      // Storage unavailable
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);
    refreshQueueStatus();

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-trigger sync when reconnecting
      handleManualSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshQueueStatus();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(refreshQueueStatus, 8000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setLastSyncResult(null);

    try {
      const result = await processOfflineSyncQueue(async (mut) => {
        // Dispatch to appropriate API route based on mutation
        if (mut.type === "UPDATE_RESUME") {
          const res = await fetch(`/api/resumes/${mut.entityId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mut.payload),
          });
          return { success: res.ok };
        }
        return { success: true };
      });

      if (result.synced > 0) {
        setLastSyncResult(`Successfully synced ${result.synced} change(s)`);
      } else if (result.failed > 0) {
        setLastSyncResult(`Warning: ${result.failed} items failed to sync`);
      } else {
        setLastSyncResult("Local cache is up to date");
      }
    } catch (err: any) {
      setLastSyncResult(`Sync error: ${err.message || "Network issue"}`);
    } finally {
      setIsSyncing(false);
      refreshQueueStatus();
    }
  };

  // Only render if offline, or if there are pending unsynced changes, or recently synced
  if (isOnline && pendingCount === 0 && !lastSyncResult && !isSyncing) {
    return null;
  }

  return (
    <aside 
      aria-label="Offline status and synchronization"
      className="fixed bottom-4 right-4 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto"
    >
      <div className={`p-3.5 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 ${
        !isOnline 
          ? "bg-amber-950/90 border-amber-500/50 text-amber-200" 
          : pendingCount > 0 
          ? "bg-blue-950/90 border-blue-500/50 text-blue-200"
          : "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {!isOnline ? (
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 animate-pulse">
                <WifiOff className="w-4 h-4" />
              </div>
            ) : pendingCount > 0 ? (
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <HardDriveDownload className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}

            <div>
              <p className="text-xs font-semibold tracking-tight text-white flex items-center gap-2">
                {!isOnline ? "Offline Mode (OPFS Active)" : pendingCount > 0 ? "Local Changes Queued" : "Sync Complete"}
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/30 text-blue-300 rounded-full font-mono">
                    {pendingCount}
                  </span>
                )}
              </p>
              <p className="text-[11px] opacity-80 leading-tight">
                {!isOnline 
                  ? "Edits cached securely in OPFS/IndexedDB."
                  : lastSyncResult || `${pendingCount} mutation(s) ready to push to cloud.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isOnline && pendingCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                disabled={isSyncing}
                onClick={handleManualSync}
                className="h-7 text-xs bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync"}
              </Button>
            )}

            {queue.length > 0 && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-white/10 rounded transition"
                title="Toggle details"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Expanded Mutation Queue Drawer */}
        {isExpanded && queue.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5 max-h-48 overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-[10px] font-mono opacity-70 mb-1">
              <span>QUEUED MUTATIONS</span>
              <button 
                onClick={async () => { await clearOfflineQueue(); refreshQueueStatus(); }}
                className="hover:text-red-400 underline"
              >
                Clear all
              </button>
            </div>
            {queue.map((item) => (
              <div key={item.id} className="p-1.5 rounded bg-black/40 text-[11px] flex items-center justify-between">
                <span className="font-mono text-[10px] opacity-80">{item.type}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                  item.status === "synced" ? "bg-emerald-500/20 text-emerald-300" :
                  item.status === "failed" ? "bg-red-500/20 text-red-300" :
                  "bg-amber-500/20 text-amber-300"
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
