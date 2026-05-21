import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/audit")({
  component: AuditPage,
});

function AuditPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
      <p className="text-sm text-muted-foreground">
        All review, approval and publish events across documents.
      </p>
    </div>
  );
}
