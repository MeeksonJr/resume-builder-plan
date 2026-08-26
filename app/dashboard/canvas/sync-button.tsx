"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, RefreshCw } from "lucide-react"

export function CanvasSyncButton() {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch("/api/user/canvas/sync", {
        method: "POST"
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Canvas synchronization failed.")
      }

      const result = await response.json()
      toast.success(
        `Sync Complete! Synced ${result.coursesSynced} courses, ${result.assignmentsSynced} assignments, and ${result.gradesSynced} grades.`
      )
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to synchronize Canvas data.")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Button
      onClick={handleSync}
      disabled={syncing}
      className="h-12 rounded-none bg-[#d8f36b] text-[#102b2b] hover:bg-[#e5ff8b] px-5 font-semibold gap-2 shrink-0"
    >
      {syncing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Syncing Coursework...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          Sync Canvas Data
        </>
      )}
    </Button>
  )
}
