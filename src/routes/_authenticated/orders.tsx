import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingBlock, StatusPill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "Orders and deliveries | AGRONAUTS" },
      {
        name: "description",
        content:
          "Follow every AGRONAUTS order from placed to confirmed, in transit and delivered, with the produce batch ID attached.",
      },
      { property: "og:title", content: "AGRONAUTS orders and deliveries" },
      {
        property: "og:description",
        content: "Order status, delivery progress and farmer earnings in one list.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Orders,
});

type Row = {
  id: string;
  quantity_kg: number;
  price_per_kg: number;
  total_amount: number;
  status: string;
  created_at: string;
  buyer_id: string;
  farmer_id: string | null;
  batch_id: string;
  batches: { batch_code: string; crop: string; district: string } | null;
};

type OrderStatus = "placed" | "confirmed" | "in_transit" | "delivered" | "cancelled";

const NEXT: Partial<Record<string, OrderStatus>> = {
  placed: "confirmed",
  confirmed: "in_transit",
  in_transit: "delivered",
};

function Orders() {
  const { t } = useI18n();
  const { user } = useSession();
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const { data, error: err } = await supabase
      .from("orders")
      .select(
        "id, quantity_kg, price_per_kg, total_amount, status, created_at, buyer_id, farmer_id, batch_id, batches(batch_code, crop, district)",
      )
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setRows((data ?? []) as unknown as Row[]);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function advance(row: Row) {
    const next = NEXT[row.status];
    if (!next || !user) return;
    setBusyId(row.id);
    const { error: err } = await supabase
      .from("orders")
      .update({ status: next })
      .eq("id", row.id);
    if (err) {
      setError(err.message);
      setBusyId(null);
      return;
    }
    await supabase.from("batch_events").insert({
      batch_id: row.batch_id,
      event_type: "delivery",
      description: `Order marked ${(next || "").replace(/_/g, " ")}`,
      actor_id: user.id,
    });
    if (next === "delivered") {
      await supabase.from("batches").update({ status: "delivered" }).eq("id", row.batch_id);
    }
    setBusyId(null);
    void load();
  }

  const earnings = (rows ?? [])
    .filter((r) => r.farmer_id === user?.id && r.status === "delivered")
    .reduce((s, r) => s + Number(r.total_amount), 0);

  return (
    <AppShell signedIn>
      <h1 className="text-2xl font-bold tracking-tight">{t("orders")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Delivered sales earnings: <span className="font-semibold">₹{earnings.toFixed(0)}</span>
      </p>

      <div className="mt-6 space-y-3">
        {error ? <ErrorState message={error} /> : null}
        {!rows && !error ? <LoadingBlock label={t("loading")} /> : null}
        {rows && rows.length === 0 ? (
          <EmptyState title={t("noOrders")} hint="Orders you place or receive will appear here." />
        ) : null}
        {(rows ?? []).map((row) => (
          <div key={row.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">
                  {row.batches?.crop ?? "Produce"} · {row.quantity_kg} kg · ₹
                  {Number(row.total_amount).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {row.batches?.district} · {new Date(row.created_at).toLocaleDateString("en-IN")} ·{" "}
                  {row.buyer_id === user?.id ? "You are the buyer" : "You are the seller"}
                </p>
                {row.batches?.batch_code ? (
                  <Link
                    to="/trace/$code"
                    params={{ code: row.batches.batch_code }}
                    className="font-mono text-xs underline underline-offset-4"
                  >
                    {row.batches.batch_code}
                  </Link>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={row.status} />
                {NEXT[row.status] ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === row.id}
                    onClick={() => void advance(row)}
                  >
                    Mark {(NEXT[row.status] || "").replace(/_/g, " ")}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
