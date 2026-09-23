import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useLiveRefresh } from "@/lib/live";
import { AppShell } from "@/components/app-shell";
import { DemoTag, EmptyState, ErrorState, LoadingBlock } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace | AGRONAUTS graded produce from Maharashtra" },
      {
        name: "description",
        content:
          "Browse graded produce batches from Maharashtra farmers. Every lot carries a batch ID you can trace back to the field before you order.",
      },
      { property: "og:title", content: "AGRONAUTS Marketplace" },
      {
        property: "og:description",
        content: "Graded, traceable produce lots from Nashik, Pune and Latur farmers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Marketplace,
});

type Row = {
  id: string;
  price_per_kg: number;
  quantity_kg: number;
  status: string;
  is_demo: boolean;
  farmer_id: string | null;
  batch_id: string;
  batches: {
    batch_code: string;
    crop: string;
    variety: string | null;
    district: string;
    village: string | null;
    grade: string | null;
    grade_score: number | null;
    demo_farmer_name: string | null;
    farmer_phone: string | null;
    farmer_email: string | null;
  } | null;
};

function Marketplace() {
  const { t, te } = useI18n();
  const { user, profile, role } = useSession();
  const [qty, setQty] = React.useState<Record<string, string>>({});
  const canBuy = role === "buyer" || role === "processor";
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("listings")
      .select(
        "id, price_per_kg, quantity_kg, status, is_demo, farmer_id, batch_id, batches(batch_code, crop, variety, district, village, grade, grade_score, demo_farmer_name, farmer_phone, farmer_email)",
      )
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else {
      // Buyers see open lots; admins also see suspended ones to re-activate them.
      const visible = new Set(role === "admin" ? ["open", "suspended"] : ["open"]);
      setRows(((data ?? []) as unknown as Row[]).filter((r) => visible.has(r.status)));
    }
  }, [role]);

  async function moderate(row: Row, status: "suspended" | "open") {
    if (!user) return;
    setBusyId(row.id);
    const res = await fetch(`/api/market/listings/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actor_id: user.id, status, reason: "Marketplace moderation" }),
    });
    const json = await res.json().catch(() => null);
    setMessage(res.ok ? (status === "suspended" ? "Listing suspended." : "Listing re-activated.") : json?.error || t("errorGeneric"));
    setBusyId(null);
    void load();
  }

  React.useEffect(() => {
    void load();
  }, [load]);
  useLiveRefresh(load);

  async function order(row: Row) {
    if (!user) {
      setMessage("Sign in as a buyer to place an order.");
      return;
    }
    if (!canBuy) {
      setMessage("Only buyer or processor accounts can place orders.");
      return;
    }
    const wanted = Number(qty[row.id] || row.quantity_kg);
    if (!(wanted > 0) || wanted > Number(row.quantity_kg)) {
      setMessage(`Enter a quantity between 1 and ${row.quantity_kg} kg.`);
      return;
    }
    setBusyId(row.id);
    setMessage(null);
    let placed: { id: string; order_number: string; total_amount: number } | null = null;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: row.id,
          buyer_id: user.id,
          quantity_kg: wanted,
          delivery_address: [profile?.village, profile?.district].filter(Boolean).join(", "),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error || t("errorGeneric"));
      placed = json.data;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t("errorGeneric"));
      setBusyId(null);
      void load();
      return;
    }
    const total = Number(placed?.total_amount ?? wanted * Number(row.price_per_kg));

    let notifyMsg = "";
    const farmerPhone = row.batches?.farmer_phone;
    const farmerEmail = row.batches?.farmer_email;
    if (farmerPhone || farmerEmail) {
      try {
        const notifyRes = await fetch("/api/notify/order-placed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            farmerName: row.batches?.demo_farmer_name || "Farmer",
            farmerPhone,
            farmerEmail,
            buyerName: profile?.full_name || user.email || "A buyer",
            crop: row.batches?.crop,
            variety: row.batches?.variety,
            quantityKg: wanted,
            pricePerKg: row.price_per_kg,
            totalAmount: total,
            batchCode: row.batches?.batch_code,
          }),
        });
        if (notifyRes.ok) {
          const notifyJson = await notifyRes.json();
          const r = notifyJson?.result;
          const sentChannels: string[] = [];
          if (r?.sms === "sent") sentChannels.push("SMS");
          if (r?.whatsapp === "sent") sentChannels.push("WhatsApp");
          if (r?.email === "sent") sentChannels.push("Email");
          const simulatedChannels: string[] = [];
          if (r?.sms === "simulated") simulatedChannels.push("SMS");
          if (r?.whatsapp === "simulated") simulatedChannels.push("WhatsApp");
          if (r?.email === "simulated") simulatedChannels.push("Email");

          if (sentChannels.length) {
            notifyMsg = ` Farmer notified via ${sentChannels.join(", ")}.`;
          }
          if (simulatedChannels.length) {
            notifyMsg += ` (${simulatedChannels.join(", ")} not configured yet.)`;
          }
        }
      } catch (err) {
        console.warn("Farmer notification request failed:", err);
      }
    }

    setBusyId(null);
    setMessage(`Order ${placed?.order_number ?? ""} placed for ${wanted} kg (₹${total.toFixed(0)}). Track it under Orders.${notifyMsg}`);
    void load();
  }

  const filtered = (rows ?? []).filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${r.batches?.crop ?? ""} ${r.batches?.district ?? ""} ${r.batches?.batch_code ?? ""}`
      .toLowerCase()
      .includes(q);
  });

  return (
    <AppShell signedIn={Boolean(user)}>
      <h1 className="text-2xl font-bold tracking-tight">{t("marketplace")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every lot keeps its harvest batch ID, so buyers can trace it back to the field.
      </p>

      <div className="mt-4 max-w-sm">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search crop, district or batch ID"
          aria-label="Search listings"
          className="h-11"
        />
      </div>

      {message ? (
        <p role="status" className="mt-4 text-sm font-medium text-foreground">
          {message}
        </p>
      ) : null}

      <div className="mt-6">
        {error ? <ErrorState message={error} /> : null}
        {!rows && !error ? <LoadingBlock label={t("loading")} /> : null}
        {rows && filtered.length === 0 ? (
          <EmptyState title="No open lots match your search" hint="Try another crop or district." />
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((row) => (
            <Card key={row.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  {row.batches?.crop ? te(row.batches.crop) : "Produce"}
                  {row.batches?.variety ? (
                    <span className="text-sm font-normal text-muted-foreground">
                      · {te(row.batches.variety)}
                    </span>
                  ) : null}
                  {row.is_demo ? <DemoTag /> : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  {row.batches?.village ? `${te(row.batches.village)}, ` : ""}
                  {row.batches?.district ? te(row.batches.district) : ""}
                  {row.batches?.demo_farmer_name ? ` · ${row.batches.demo_farmer_name}` : ""}
                </p>
                <p>
                  <span className="text-2xl font-bold">₹{Number(row.price_per_kg).toFixed(2)}</span>
                  <span className="text-muted-foreground"> / kg · {row.quantity_kg} kg available</span>
                </p>
                <p className="text-muted-foreground">
                  {row.batches?.grade ? te(row.batches.grade) : "-"}{" "}
                  {row.batches?.grade_score ? `(${row.batches.grade_score}/100)` : ""} · provisional
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {role === "admin" ? (
                    <>
                      {row.status === "suspended" ? (
                        <span className="rounded-full bg-destructive/15 px-2 py-1 text-xs font-bold text-destructive">Suspended</span>
                      ) : null}
                      <Button
                        className="h-11"
                        variant={row.status === "open" ? "outline" : "default"}
                        disabled={busyId === row.id}
                        onClick={() => void moderate(row, row.status === "open" ? "suspended" : "open")}
                      >
                        {row.status === "open" ? "Suspend listing" : "Re-activate"}
                      </Button>
                    </>
                  ) : row.farmer_id && row.farmer_id === user?.id ? (
                    <span className="rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                      Your listing
                    </span>
                  ) : canBuy ? (
                    <>
                      <Input
                        type="number"
                        min={1}
                        max={row.quantity_kg}
                        inputMode="decimal"
                        aria-label="Quantity in kg"
                        placeholder={`${row.quantity_kg}`}
                        value={qty[row.id] ?? ""}
                        onChange={(e) => setQty((q) => ({ ...q, [row.id]: e.target.value }))}
                        className="h-11 w-28"
                      />
                      <span className="text-xs text-muted-foreground">kg</span>
                      <Button className="h-11" disabled={busyId === row.id} onClick={() => void order(row)}>
                        {busyId === row.id ? t("saving") : t("buyNow")}
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {user ? "Only buyer / processor accounts can order." : "Sign in as a buyer to order."}
                    </span>
                  )}
                  {row.batches?.batch_code ? (
                    <Link
                      to="/trace/$code"
                      params={{ code: row.batches.batch_code }}
                      className="text-sm underline underline-offset-4"
                    >
                      {t("traceability")}
                    </Link>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
