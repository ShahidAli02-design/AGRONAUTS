import * as React from "react";
import { Link } from "@tanstack/react-router";
import type { MandiRow } from "@/routes/mandi";

// Today's real mandi prices near the user (their district, else their state,
// else all of India) for dashboard cards.
export function MandiSnapshot({ district, state = "Maharashtra", limit = 6 }: { district?: string | null; state?: string; limit?: number }) {
  const [rows, setRows] = React.useState<MandiRow[] | null>(null);
  const [where, setWhere] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    const attempts: [string, Record<string, string>][] = [
      ...(district ? [[district, { district }] as [string, Record<string, string>]] : []),
      [state, { state }],
      ["India", {}],
    ];
    (async () => {
      for (const [label, filter] of attempts) {
        try {
          const qs = new URLSearchParams({ ...filter, sort: "latest", limit: String(limit) });
          const res = await fetch(`/api/mandi/prices?${qs}`);
          const j = await res.json();
          if (!res.ok || !j?.success) throw new Error(j?.error || "Mandi prices unavailable");
          if (j.records.length) {
            if (active) {
              setRows(j.records);
              setWhere(label);
            }
            return;
          }
        } catch (err) {
          if (active) setError(err instanceof Error ? err.message : "Mandi prices unavailable");
          return;
        }
      }
      if (active) setRows([]);
    })();
    return () => {
      active = false;
    };
  }, [district, state, limit]);

  if (error) return <p className="text-xs text-muted-foreground">{error}</p>;
  if (!rows) return <p className="text-xs text-muted-foreground">Loading today's prices…</p>;
  return (
    <div className="space-y-1.5 text-sm">
      {where ? <p className="text-[11px] text-muted-foreground">Today · {where}</p> : null}
      {rows.map((p, i) => (
        <div key={`${p.market}-${p.commodity}-${i}`} className="flex items-center justify-between border-b border-border/40 py-1.5 last:border-0">
          <div className="min-w-0">
            <span className="font-medium text-foreground">{p.commodity}</span>
            <span className="ml-1.5 text-xs text-muted-foreground">· {p.market}</span>
          </div>
          <span className="shrink-0 font-bold text-emerald-600">₹{(p.modal_price / 100).toFixed(2)}/kg</span>
        </div>
      ))}
      <Link to="/mandi" className="block pt-1 text-xs font-semibold underline underline-offset-4">
        See all mandi prices →
      </Link>
    </div>
  );
}
