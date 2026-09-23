import * as React from "react";

// Re-runs `reload` whenever the shared server database changes (another user
// placed an order, a farmer listed a lot, the admin changed something), so
// pages stay live without a manual refresh.
export function useLiveRefresh(reload: () => void | Promise<void>, intervalMs = 4000) {
  const reloadRef = React.useRef(reload);
  reloadRef.current = reload;

  React.useEffect(() => {
    let last: number | null = null;
    let stopped = false;
    const tick = async () => {
      try {
        const res = await fetch("/api/db/revision");
        const json = await res.json();
        if (stopped || typeof json?.revision !== "number") return;
        if (last !== null && json.revision !== last) void reloadRef.current();
        last = json.revision;
      } catch {
        // offline — try again next tick
      }
    };
    void tick();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void tick();
    }, intervalMs);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [intervalMs]);
}
