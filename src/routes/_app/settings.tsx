import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Account and workspace preferences.
        </p>
      </div>
      <div className="space-y-4 rounded-lg border bg-card p-5">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} readOnly />
        </div>
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={user?.full_name ?? ""} readOnly />
        </div>
        <div className="space-y-1.5">
          <Label>Roles</Label>
          <Input value={(user?.roles ?? []).join(", ")} readOnly />
        </div>
      </div>
    </div>
  );
}
