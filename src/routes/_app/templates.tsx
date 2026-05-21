import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
      <p className="text-sm text-muted-foreground">
        CMS model-material templates will be listed here.
      </p>
    </div>
  );
}
