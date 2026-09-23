import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { useLiveRefresh } from "@/lib/live";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingBlock, StatusPill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Truck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "Orders and deliveries | AGRONAUTS" },
      {
        name: "description",
        content:
          "Follow every AGRONAUTS order from placed to confirmed, packed, in transit and delivered, with the produce batch ID attached.",
      },
    ],
  }),
  component: Orders,
});

export type OrderRow = {
  id: string;
  order_number?: string;
  quantity_kg: number;
  price_per_kg: number;
  total_amount: number;
  status: string;
  created_at: string;
  buyer_id: string;
  buyer_name?: string;
  farmer_id: string | null;
  batch_id: string;
  vehicle?: string;
  eta?: string;
  delivery_address?: string;
  batches: { batch_code: string; crop: string; district: string; demo_farmer_name?: string | null } | null;
};

export async function changeOrderStatus(orderId: string, actorId: string, status: string, extra: Record<string, string> = {}) {
  const res = await fetch(`/api/orders/${orderId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, actor_id: actorId, ...extra }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new Error(json?.error || "Could not update the order.");
}

function Orders() {
  const { t, lang } = useI18n();
  const { user, role } = useSession();
  const [rows, setRows] = React.useState<OrderRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<"buying" | "selling">(role === "farmer" ? "selling" : "buying");
  const [dispatch, setDispatch] = React.useState<Record<string, { vehicle: string; eta: string }>>({});
  const L = (en: string, mr: string, hi: string) => (lang === "mr" ? mr : lang === "hi" ? hi : en);

  React.useEffect(() => {
    if (role) setTab(role === "farmer" ? "selling" : "buying");
  }, [role]);

  const load = React.useCallback(async () => {
    if (!user) return;
    const [asBuyer, asSeller] = await Promise.all([
      supabase.from("orders").select("*").eq("buyer_id", user.id).order("created_at", { ascending: false }),
      supabase.from("orders").select("*").eq("farmer_id", user.id).order("created_at", { ascending: false }),
    ]);
    const err = asBuyer.error || asSeller.error;
    if (err) {
      setError(err.message);
      return;
    }
    setError(null);
    const all = [...(asBuyer.data ?? []), ...(asSeller.data ?? [])] as OrderRow[];
    const unique = Array.from(new Map(all.map((o) => [o.id, o])).values());
    setRows(unique.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)));
  }, [user]);

  React.useEffect(() => {
    void load();
  }, [load]);
  useLiveRefresh(load);

  async function act(row: OrderRow, status: string, extra: Record<string, string> = {}) {
    if (!user) return;
    setBusyId(row.id);
    setError(null);
    try {
      await changeOrderStatus(row.id, user.id, status, extra);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setBusyId(null);
    }
  }

  const buying = (rows ?? []).filter((r) => r.buyer_id === user?.id);
  const selling = (rows ?? []).filter((r) => r.farmer_id === user?.id);
  const shown = tab === "buying" ? buying : selling;
  const earnings = selling.filter((r) => r.status === "delivered").reduce((s, r) => s + Number(r.total_amount), 0);
  const pendingValue = selling
    .filter((r) => !["delivered", "cancelled"].includes(r.status))
    .reduce((s, r) => s + Number(r.total_amount), 0);

  return (
    <AppShell signedIn>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("orders")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {L("Delivered sales earnings", "पोहोचलेल्या विक्रीचे उत्पन्न", "डिलीवर हुई बिक्री की कमाई")}:{" "}
            <span className="font-semibold text-foreground">₹{earnings.toFixed(0)}</span> ·{" "}
            {L("pending", "प्रलंबित", "बाकी")}: <span className="font-semibold text-foreground">₹{pendingValue.toFixed(0)}</span>
          </p>
        </div>
        <Button asChild variant="outline" className="h-10 gap-1.5">
          <Link to="/track">
            <Truck className="size-4" />
            {L("Track an order", "ऑर्डर ट्रॅक करा", "ऑर्डर ट्रैक करें")}
          </Link>
        </Button>
      </div>

      <div className="mt-5 inline-flex rounded-lg border border-border bg-muted/40 p-1 text-sm font-semibold" role="tablist">
        {(
          [
            ["buying", L("My purchases", "माझी खरेदी", "मेरी खरीद"), buying.length],
            ["selling", L("My sales", "माझी विक्री", "मेरी बिक्री"), selling.length],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-md px-4 py-1.5 transition-colors ${tab === key ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {error ? <ErrorState message={error} /> : null}
        {!rows && !error ? <LoadingBlock label={t("loading")} /> : null}
        {rows && shown.length === 0 ? (
          <EmptyState
            title={t("noOrders")}
            hint={
              tab === "buying"
                ? L("Orders you place on the marketplace appear here.", "बाजारपेठेत केलेल्या ऑर्डर्स येथे दिसतील.", "बाज़ार में किए गए ऑर्डर यहाँ दिखेंगे।")
                : L("Orders buyers place for your listed batches appear here.", "तुमच्या बॅचसाठी खरेदीदारांच्या ऑर्डर्स येथे दिसतील.", "आपके बैच के लिए खरीदारों के ऑर्डर यहाँ दिखेंगे।")
            }
          />
        ) : null}

        {shown.map((row) => {
          const isSeller = row.farmer_id === user?.id;
          const isBuyer = row.buyer_id === user?.id;
          const busy = busyId === row.id;
          const d = dispatch[row.id] ?? { vehicle: "", eta: "" };
          return (
            <div key={row.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">{row.order_number ?? row.id}</p>
                  <p className="font-semibold">
                    {row.batches?.crop ?? "Produce"} · {row.quantity_kg} kg · ₹{Number(row.total_amount).toFixed(0)}
                    <span className="font-normal text-muted-foreground"> (₹{Number(row.price_per_kg).toFixed(2)}/kg)</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                    {isBuyer
                      ? `${L("Seller", "विक्रेता", "विक्रेता")}: ${row.batches?.demo_farmer_name ?? "Farmer"}`
                      : `${L("Buyer", "खरेदीदार", "खरीदार")}: ${row.buyer_name ?? "Buyer"}`}
                  </p>
                  {row.delivery_address ? (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" /> {row.delivery_address}
                    </p>
                  ) : null}
                  {row.vehicle || row.eta ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      🚚 {row.vehicle ?? ""} {row.eta ? `· ETA ${row.eta}` : ""}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusPill status={row.status} />
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <Link to="/track/$id" params={{ id: row.id }}>
                      <Truck className="size-3.5" /> {L("Track", "ट्रॅक करा", "ट्रैक करें")}
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                {isSeller && row.status === "placed" ? (
                  <Button size="sm" disabled={busy} onClick={() => void act(row, "confirmed", { note: "Seller accepted the order" })}>
                    {L("Accept order", "ऑर्डर स्वीकारा", "ऑर्डर स्वीकार करें")}
                  </Button>
                ) : null}
                {isSeller && row.status === "confirmed" ? (
                  <Button size="sm" disabled={busy} onClick={() => void act(row, "packed", { note: "Produce packed and ready" })}>
                    {L("Mark packed", "पॅक झाले", "पैक हो गया")}
                  </Button>
                ) : null}
                {isSeller && row.status === "packed" ? (
                  <>
                    <Input
                      className="h-9 w-40"
                      placeholder={L("Vehicle no. (MH15 AB 1234)", "वाहन क्रमांक", "वाहन नंबर")}
                      value={d.vehicle}
                      onChange={(e) => setDispatch((m) => ({ ...m, [row.id]: { ...d, vehicle: e.target.value } }))}
                    />
                    <Input
                      className="h-9 w-36"
                      type="date"
                      aria-label="Expected delivery date"
                      value={d.eta}
                      onChange={(e) => setDispatch((m) => ({ ...m, [row.id]: { ...d, eta: e.target.value } }))}
                    />
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => void act(row, "in_transit", { note: "Dispatched", vehicle: d.vehicle, eta: d.eta })}
                    >
                      {L("Dispatch", "रवाना करा", "रवाना करें")}
                    </Button>
                  </>
                ) : null}
                {isSeller && row.status === "in_transit" ? (
                  <span className="text-xs text-muted-foreground">
                    {L("Waiting for the buyer to confirm delivery.", "खरेदीदाराच्या पोहोच पुष्टीची प्रतीक्षा.", "खरीदार की डिलीवरी पुष्टि का इंतज़ार।")}
                  </span>
                ) : null}
                {isBuyer && row.status === "in_transit" ? (
                  <Button size="sm" disabled={busy} onClick={() => void act(row, "delivered", { note: "Buyer confirmed delivery" })}>
                    {L("Confirm delivery received", "माल मिळाल्याची पुष्टी करा", "माल मिलने की पुष्टि करें")}
                  </Button>
                ) : null}
                {isBuyer && ["placed", "confirmed", "packed"].includes(row.status) ? (
                  <span className="text-xs text-muted-foreground">
                    {L("The seller is preparing your order.", "विक्रेता तुमची ऑर्डर तयार करत आहे.", "विक्रेता आपका ऑर्डर तैयार कर रहा है।")}
                  </span>
                ) : null}
                {["placed", "confirmed"].includes(row.status) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    className="text-destructive"
                    onClick={() => void act(row, "cancelled", { note: isSeller ? "Cancelled by seller" : "Cancelled by buyer" })}
                  >
                    {L("Cancel", "रद्द करा", "रद्द करें")}
                  </Button>
                ) : null}
                {row.batches?.batch_code ? (
                  <Link
                    to="/trace/$code"
                    params={{ code: row.batches.batch_code }}
                    className="ml-auto font-mono text-xs underline underline-offset-4"
                  >
                    {row.batches.batch_code}
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
        {role === "admin" ? (
          <p className="text-xs text-muted-foreground">
            {L("All platform orders are in the Admin dashboard.", "सर्व ऑर्डर्स प्रशासक डॅशबोर्डमध्ये आहेत.", "सभी ऑर्डर एडमिन डैशबोर्ड में हैं।")}
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
