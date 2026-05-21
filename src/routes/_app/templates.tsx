import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LayoutTemplate } from "lucide-react";
import { docsApi } from "@/lib/documents-api";

export const Route = createFileRoute("/_app/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const q = useQuery({
    queryKey: ["templates"],
    queryFn: () => docsApi.listTemplates(),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground">
          CMS model-material templates available for new documents.
        </p>
      </div>

      {q.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : q.isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {(q.error as Error)?.message ?? "Failed to load templates"}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(q.data ?? []).map((t) => (
            <div key={t.id} className="rounded-lg border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <LayoutTemplate className="h-4 w-4" />
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  CY {t.cms_year} · {t.document_type}
                </div>
              </div>
              <h3 className="text-base font-semibold">{t.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.sections.length} sections
              </p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {t.sections.slice(0, 4).map((s) => (
                  <li key={s.id} className="truncate">
                    {s.number} — {s.title}
                  </li>
                ))}
                {t.sections.length > 4 && (
                  <li className="text-muted-foreground/70">
                    +{t.sections.length - 4} more
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
