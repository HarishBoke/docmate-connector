import { createFileRoute } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/documents")({
  component: DocumentsPage,
});

function DocumentsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground">
            ANOC, SB, EOC, provider directories and errata.
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          New document
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card/30 px-6 py-16 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Documents list coming next</p>
          <p className="text-xs text-muted-foreground">
            The list, create flow, editor, and generation views will connect to
            your FastAPI backend once endpoint shapes are confirmed.
          </p>
        </div>
      </div>
    </div>
  );
}
