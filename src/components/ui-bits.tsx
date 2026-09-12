import * as React from "react";
import { Loader2, Inbox, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingBlock({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground"
    >
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-8 text-center">
      <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground"
    >
      <AlertTriangle className="mt-0.5 size-4 text-destructive" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-chart-4/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground",
        className,
      )}
    >
      Demo data
    </span>
  );
}

export function StatusPill({ status }: { status?: string | null }) {
  const tone: Record<string, string> = {
    harvested: "bg-secondary text-secondary-foreground",
    graded: "bg-chart-2/20 text-foreground",
    stored: "bg-chart-3/20 text-foreground",
    listed: "bg-primary/15 text-foreground",
    sold: "bg-chart-1/20 text-foreground",
    delivered: "bg-chart-5/25 text-foreground",
    placed: "bg-secondary text-secondary-foreground",
    confirmed: "bg-chart-2/20 text-foreground",
    in_transit: "bg-chart-4/25 text-foreground",
    cancelled: "bg-destructive/15 text-foreground",
  };
  const safeStatus = typeof status === "string" && status.trim().length > 0 ? status : "pending";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        tone[safeStatus] ?? "bg-secondary text-secondary-foreground",
      )}
    >
      {safeStatus.replace(/_/g, " ")}
    </span>
  );
}
