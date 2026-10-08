"use client";

import * as React from "react";
import { GripVertical, ArrowUp, ArrowDown, Eye, EyeOff, Save, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface ResumeSectionItem {
  id: string;
  name: string;
  enabled: boolean;
}

interface SectionReorderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sections: ResumeSectionItem[];
  onSaveSections: (newSections: ResumeSectionItem[]) => void;
}

export function SectionReorderSheet({
  isOpen,
  onClose,
  sections: initialSections,
  onSaveSections,
}: SectionReorderSheetProps) {
  const [sections, setSections] = React.useState<ResumeSectionItem[]>(initialSections);

  React.useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    const temp = next[idx];
    next[idx] = next[target];
    next[target] = temp;
    setSections(next);
  };

  const toggle = (idx: number) => {
    const next = [...sections];
    next[idx] = { ...next[idx], enabled: !next[idx].enabled };
    setSections(next);
  };

  const handleSave = () => {
    onSaveSections(sections);
    toast.success("Resume section layout updated.");
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="bg-card w-full sm:max-w-md p-6 border-l border-border shadow-2xl flex flex-col justify-between">
        <SheetHeader>
          <SheetTitle className="text-base font-bold text-foreground">
            Reorder Resume Sections
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Adjust the vertical sequence or toggle optional sections (e.g. Projects vs Work Experience).
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-2 py-4 flex-1 overflow-y-auto">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                sec.enabled 
                  ? "bg-card border-border/80 shadow-xs" 
                  : "bg-muted/40 border-dashed border-border/60 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-xs font-bold text-foreground">
                  {sec.name}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  className="h-7 w-7 text-muted-foreground"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={idx === sections.length - 1}
                  onClick={() => move(idx, 1)}
                  className="h-7 w-7 text-muted-foreground"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => toggle(idx)}
                  className="h-7 w-7 text-muted-foreground"
                >
                  {sec.enabled ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="h-9 text-xs font-bold rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="h-9 px-4 text-xs font-bold bg-[#102b2b] text-[#d8f36b] hover:bg-[#164743] rounded-xl gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Order</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
