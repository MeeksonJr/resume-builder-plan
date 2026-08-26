"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2, RefreshCw, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"

interface CanvasSettingsProps {
  profile: any
}

export function CanvasSettings({ profile }: CanvasSettingsProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [syncing, setSyncing] = React.useState(false)
  const [canvasUrl, setCanvasUrl] = React.useState(profile?.canvas_instance_url ?? "")
  const [canvasToken, setCanvasToken] = React.useState(
    profile?.canvas_access_token ? "••••••••••••••••••••••••••••••••" : ""
  )
  const [isTokenChanged, setIsTokenChanged] = React.useState(false)

  const defaultSyncSettings = { sync_courses: true, sync_assignments: true, sync_grades: true }
  const currentSyncSettings = profile?.canvas_sync_settings ?? defaultSyncSettings
  
  const [syncCourses, setSyncCourses] = React.useState(currentSyncSettings.sync_courses ?? true)
  const [syncAssignments, setSyncAssignments] = React.useState(currentSyncSettings.sync_assignments ?? true)
  const [syncGrades, setSyncGrades] = React.useState(currentSyncSettings.sync_grades ?? true)

  const handleSaveConfig = async () => {
    if (!canvasUrl) {
      toast.error("Please provide a valid Canvas URL.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/user/canvas/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvasUrl,
          // Only send token if the user actually edited/changed the field
          canvasToken: isTokenChanged ? canvasToken : undefined,
          syncSettings: {
            sync_courses: syncCourses,
            sync_assignments: syncAssignments,
            sync_grades: syncGrades
          }
        })
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      toast.success("Canvas settings saved successfully!")
      setIsTokenChanged(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to save Canvas configurations.")
    } finally {
      setLoading(false)
    }
  }

  const handleSyncNow = async () => {
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
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Canvas Instance URL Input */}
        <div className="space-y-2">
          <Label htmlFor="canvas-url" className="text-sm font-bold">
            Canvas School URL
          </Label>
          <Input
            id="canvas-url"
            type="url"
            placeholder="e.g. https://canvas.instructure.com or https://canvas.harvard.edu"
            value={canvasUrl}
            onChange={(e) => setCanvasUrl(e.target.value)}
            className="h-11 rounded-none border-input bg-background"
          />
          <p className="text-xs text-muted-foreground">
            Enter the domain address of your school's Canvas LMS platform.
          </p>
        </div>

        {/* Canvas Access Token Input */}
        <div className="space-y-2">
          <Label htmlFor="canvas-token" className="text-sm font-bold">
            Canvas Developer Access Token
          </Label>
          <Input
            id="canvas-token"
            type="password"
            placeholder="Enter your Canvas access token"
            value={canvasToken}
            onChange={(e) => {
              setCanvasToken(e.target.value)
              setIsTokenChanged(true)
            }}
            className="h-11 rounded-none border-input bg-background"
          />
          <p className="text-xs text-muted-foreground">
            To generate a token: Log in to Canvas, go to **Account** &rarr; **Settings** &rarr; scroll to **Approved Integrations** &rarr; click **+ New Access Token**.
          </p>
        </div>

        {/* Sync Toggles */}
        <div className="border border-border bg-muted/20 p-4 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0d8274] flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            Synchronization Preferences
          </h4>

          {/* Sync Courses */}
          <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3">
            <div className="space-y-0.5">
              <Label htmlFor="sync-courses" className="font-bold text-sm">
                Sync Course Enrollments
              </Label>
              <p className="text-xs text-muted-foreground">
                Fetch and store details of current classes you are taking.
              </p>
            </div>
            <Switch
              id="sync-courses"
              checked={syncCourses}
              onCheckedChange={setSyncCourses}
            />
          </div>

          {/* Sync Assignments */}
          <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3">
            <div className="space-y-0.5">
              <Label htmlFor="sync-assignments" className="font-bold text-sm">
                Sync Assignments & Homework
              </Label>
              <p className="text-xs text-muted-foreground">
                Track upcoming homework assignments and due dates.
              </p>
            </div>
            <Switch
              id="sync-assignments"
              checked={syncAssignments}
              onCheckedChange={setSyncAssignments}
            />
          </div>

          {/* Sync Grades */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="sync-grades" className="font-bold text-sm">
                Sync Letter Grades & GPA
              </Label>
              <p className="text-xs text-muted-foreground">
                Pull course scores to tailor matched aid academic profiles.
              </p>
            </div>
            <Switch
              id="sync-grades"
              checked={syncGrades}
              onCheckedChange={setSyncGrades}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          onClick={handleSaveConfig}
          disabled={loading}
          className="h-11 rounded-none bg-[#0d8274] hover:bg-[#102b2b] text-white px-6 font-bold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Configuration...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>

        {profile?.canvas_instance_url && profile?.canvas_access_token && (
          <Button
            onClick={handleSyncNow}
            disabled={syncing}
            variant="outline"
            className="h-11 rounded-none border-[#102b2b]/15 text-[#102b2b] hover:bg-muted font-bold gap-2"
          >
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Synchronizing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Sync Data Now
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
