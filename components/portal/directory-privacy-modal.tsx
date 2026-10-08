"use client";

import * as React from "react";
import { ShieldCheck, Lock, Eye, EyeOff, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface StudentPrivacySettings {
  isPublicInDirectory: boolean;
  maskGpa: boolean;
  hideContactEmail: boolean;
  allowRecruiterOutreach: boolean;
  cohortOnlyVisibility: boolean;
}

interface DirectoryPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings?: Partial<StudentPrivacySettings>;
  onSave?: (settings: StudentPrivacySettings) => void;
}

export function DirectoryPrivacyModal({
  isOpen,
  onClose,
  initialSettings,
  onSave,
}: DirectoryPrivacyModalProps) {
  const [settings, setSettings] = React.useState<StudentPrivacySettings>({
    isPublicInDirectory: initialSettings?.isPublicInDirectory ?? true,
    maskGpa: initialSettings?.maskGpa ?? false,
    hideContactEmail: initialSettings?.hideContactEmail ?? false,
    allowRecruiterOutreach: initialSettings?.allowRecruiterOutreach ?? true,
    cohortOnlyVisibility: initialSettings?.cohortOnlyVisibility ?? false,
  });

  const [saving, setSaving] = React.useState(false);

  const toggle = (key: keyof StudentPrivacySettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    toast.success("FERPA privacy settings updated successfully.");
    onSave?.(settings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                FERPA &amp; Directory Privacy
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Manage your institutional directory exposure and recruiter discovery rights.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
            <div>
              <p className="font-bold text-foreground">Campus Directory Listing</p>
              <p className="text-muted-foreground mt-0.5">Show your portfolio card in your school&apos;s verified directory.</p>
            </div>
            <button
              type="button"
              onClick={() => toggle("isPublicInDirectory")}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.isPublicInDirectory ? "bg-primary" : "bg-muted"
              }`}
            >
              <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                settings.isPublicInDirectory ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
            <div>
              <p className="font-bold text-foreground">Mask GPA &amp; Academic Honors</p>
              <p className="text-muted-foreground mt-0.5">Hide cumulative GPA from public viewing while keeping skills visible.</p>
            </div>
            <button
              type="button"
              onClick={() => toggle("maskGpa")}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.maskGpa ? "bg-primary" : "bg-muted"
              }`}
            >
              <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                settings.maskGpa ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
            <div>
              <p className="font-bold text-foreground">Direct Recruiter Outreach</p>
              <p className="text-muted-foreground mt-0.5">Allow verified corporate sponsors to send direct interview invitations.</p>
            </div>
            <button
              type="button"
              onClick={() => toggle("allowRecruiterOutreach")}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.allowRecruiterOutreach ? "bg-primary" : "bg-muted"
              }`}
            >
              <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                settings.allowRecruiterOutreach ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
            <div>
              <p className="font-bold text-foreground">Cohort-Only Isolation</p>
              <p className="text-muted-foreground mt-0.5">Restrict profile visibility strictly to verified students from your major.</p>
            </div>
            <button
              type="button"
              onClick={() => toggle("cohortOnlyVisibility")}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.cohortOnlyVisibility ? "bg-primary" : "bg-muted"
              }`}
            >
              <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                settings.cohortOnlyVisibility ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button variant="outline" onClick={onClose} className="h-9 text-xs rounded-xl font-bold">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="h-9 px-4 text-xs font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] rounded-xl gap-2"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? "Saving..." : "Save Preferences"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
