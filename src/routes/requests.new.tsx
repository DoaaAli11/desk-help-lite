import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/hd/AppShell";
import { GhostButton, PrimaryButton } from "@/components/hd/TicketDrawer";
import { createTicket, getCategories, getPriorities } from "@/lib/data-service";
import { useAuth } from "@/lib/auth";
import type { CategoryName, PriorityName } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/requests/new")({
  head: () => ({
    meta: [
      { title: "Create a request — HelpDesk Lite" },
      {
        name: "description",
        content: "Submit a new internal support request with category, priority and details.",
      },
      { property: "og:title", content: "Create a request — HelpDesk Lite" },
      {
        property: "og:description",
        content: "Submit a new internal support request in under a minute.",
      },
    ],
  }),
  component: NewRequestPage,
});

const priorityHelp: Record<PriorityName, string> = {
  Low: "Minor inconvenience, no deadline impact.",
  Medium: "Slows me down but I can keep working.",
  High: "Blocking important work today.",
  Critical: "Complete work stoppage or customer impact.",
};

function NewRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryName | "">("");
  const [priority, setPriority] = useState<PriorityName>("Medium");
  const [description, setDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      createTicket(
        {
          title,
          category: category as CategoryName,
          priority,
          description,
          additionalInfo,
        },
        user!.id,
      ),
    onSuccess: (t) => {
      void qc.invalidateQueries({ queryKey: ["tickets"] });
      void qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success(`Request ${t.ticket_number} submitted.`);
      void navigate({ to: "/my-requests" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (title.trim().length < 5) next['title'] = "Give your request a title of at least 5 characters.";
    if (!category) next['category'] = "Pick the category that fits best.";
    if (description.trim().length < 20)
      next['description'] = "Please describe the issue in at least 20 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;
    mutation.mutate();
  }

  return (
    <AppShell title="Create Request" breadcrumb="Workspace">
      <div className="mx-auto max-w-3xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Create a request</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us what you need. The more detail you give, the faster we can route it.
          </p>
        </div>

        <form onSubmit={submit} noValidate className="surface-card space-y-5 p-6">
          <Field label="Title" required error={errors['title']}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary, e.g. Laptop won't connect to office Wi-Fi"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>

          <Field label="Category" required error={errors['category']}>
            <div className="grid gap-2 sm:grid-cols-3">
              {getCategories().map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.name as CategoryName)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                    category === c.name
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Priority" required>
            <div className="grid gap-2 sm:grid-cols-2">
              {getPriorities().map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.name as PriorityName)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left transition-colors",
                    priority === p.name
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {priorityHelp[p.name as PriorityName]}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Description" required error={errors['description']}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="What happened, what you expected, and any steps you already tried."
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>

          <Field label="Additional information">
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={3}
              placeholder="Asset tags, error codes, links, affected teammates…"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>

          <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
            <GhostButton type="button" onClick={() => void navigate({ to: "/dashboard" })}>
              Cancel
            </GhostButton>
            <PrimaryButton type="submit" loading={mutation.isPending}>
              Submit request
            </PrimaryButton>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </p>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
