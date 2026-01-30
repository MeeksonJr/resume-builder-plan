import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus, Upload } from "lucide-react";

export function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No resumes yet</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Get started by creating a new resume from scratch or upload an
          existing one to extract your data.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="min-h-[44px] gap-2">
            <Link href="/dashboard/resume/new">
              <Plus className="h-4 w-4" />
              Create New Resume
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-[44px] gap-2 bg-transparent">
            <Link href="/dashboard/upload">
              <Upload className="h-4 w-4" />
              Upload Existing
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
