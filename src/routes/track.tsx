import * as React from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle2, CircleDot, MapPin, PackageCheck, Search, ShoppingBag, Truck, XCircle, Handshake } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingBlock, StatusPill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useLiveRefresh } from "@/lib/live";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track order | AGRONAUTS" },
      { name: "description", content: "Track an AGRONAUTS produce order from placed to delivered." },
    ],
  }),
  component: TrackOrderPage,
});

type TrackEvent = { id: string; status: string; note?: string | null; vehicle?: string | null; eta?: string | null; created_at: string };
type TrackData = {
  order: {
    id: string;
    order_number?: string;
    status: string;
    quantity_kg: number;
    price_per_kg: number;
    total_amount: number;
    created_at: string;
    delivery_address?: string;
    vehicle?: string;
    eta?: string;
    batches: { batch_code: string; crop: string; variety?: string | null; district: string; village?: string | null } | null;
  };
  events: TrackEvent[];
  seller: { name: string; phone?: string; district?: string } | null;
  buyer: { name: string; district?: string } | null;
};

const STEPS = [
  { key: "placed", icon: ShoppingBag, en: "Order placed", mr: "ऑर्डर दिली", hi: "ऑर्डर दिया गया" },
  { key: "confirmed", icon: Handshake, en: "Accepted by seller", mr: "विक्रेत्याने स्वीकारली", hi: "विक्रेता ने स्वीकारा" },
  { key: "packed", icon: PackageCheck, en: "Packed", mr: "पॅक झाले", hi: "पैक हुआ" },
  { key: "in_transit", icon: Truck, en: "On the way", mr: "रस्त्यात आहे", hi: "रास्ते में है" },
  { key: "delivered", icon: CheckCircle2, en: "Delivered", mr: "पोहोचले", hi: "डिलीवर हुआ" },
] as const;

export function TrackOrderPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { user } = useSession();
  const L = (en: string, mr: string, hi: string) => (lang === "mr" ? mr : lang === "hi" ? hi : en);
  const orderId = params.id;
  const [query, setQuery] = React.useState(orderId ?? "");
  const [data, setData] = React.useState<TrackData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!orderId) return;
    setLoading((l) => l || !data);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/track`);
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error || "Order not found.");
      setData(json);
      setError(null);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Order not found.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  React.useEffect(() => {
    void load();
  }, [load]);
  useLiveRefresh(load);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = query.trim();
    if (id) void navigate({ to: "/track/$id", params: { id } });
  };

  const order = data?.order;
  const cancelled = order?.status === "cancelled";
  const reached = order ? STEPS.findIndex((s) => s.key === order.status) : -1;
  const eventFor = (key: string) => data?.events.filter((e) => e.status === key).pop();
  const cancelEvent = eventFor("cancelled");

  return (
    <AppShell signedIn={Boolean(user)}>
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <Truck className="size-6 text-primary" />
        {L("Track order", "ऑर्डर ट्रॅक करा", "ऑर्डर ट्रैक करें")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {L(
          "Enter the order number (e.g. ORD-1234567) to see where your produce is.",
          "तुमचा माल कुठे आहे ते पाहण्यासाठी ऑर्डर क्रमांक टाका (उदा. ORD-1234567).",
          "आपकी उपज कहाँ है यह देखने के लिए ऑर्डर नंबर डालें (जैसे ORD-1234567)।"
        )}
      </p>

      <form onSubmit={submit} className="mt-4 flex max-w-md gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ORD-1234567"
          aria-label="Order number"
          className="h-11 font-mono"
        />
        <Button type="submit" className="h-11 gap-1.5">
          <Search className="size-4" />
          {L("Track", "ट्रॅक करा", "ट्रैक करें")}
        </Button>
      </form>

      <div className="mt-6">
        {!orderId ? (
          <EmptyState
            title={L("No order selected", "ऑर्डर निवडलेली नाही", "कोई ऑर्डर नहीं चुना")}
            hint={L("Open Orders and press Track, or type an order number above.", "ऑर्डर्स उघडून 'ट्रॅक करा' दाबा किंवा वर क्रमांक टाका.", "ऑर्डर खोलकर 'ट्रैक करें' दबाएँ या ऊपर नंबर डालें।")}
          />
        ) : loading ? (
          <LoadingBlock label={L("Loading...", "लोड होत आहे...", "लोड हो रहा है...")} />
        ) : error ? (
          <ErrorState message={error} />
        ) : order ? (
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="md:col-span-3">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="font-mono text-base">{order.order_number ?? order.id}</CardTitle>
                  <StatusPill status={order.status} />
                </div>
              </CardHeader>
              <CardContent>
                {cancelled ? (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
                    <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div>
                      <p className="font-semibold text-destructive">{L("Order cancelled", "ऑर्डर रद्द झाली", "ऑर्डर रद्द हुआ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {cancelEvent?.note ?? ""} · {cancelEvent ? new Date(cancelEvent.created_at).toLocaleString("en-IN") : ""}
                      </p>
                    </div>
                  </div>
                ) : null}
                <ol className="relative space-y-5 border-l-2 border-border pl-6">
                  {STEPS.map((step, i) => {
                    const ev = eventFor(step.key);
                    const done = !cancelled && i <= reached;
                    const current = !cancelled && i === reached + 1;
                    const Icon = step.icon;
                    return (
                      <li key={step.key} className="relative">
                        <span
                          className={`absolute -left-[35px] flex size-7 items-center justify-center rounded-full border-2 ${
                            done
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : current
                              ? "border-primary bg-card text-primary"
                              : "border-border bg-card text-muted-foreground"
                          }`}
                        >
                          {done ? <Icon className="size-3.5" /> : <CircleDot className="size-3.5" />}
                        </span>
                        <p className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>
                          {L(step.en, step.mr, step.hi)}
                          {current ? (
                            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                              {L("NEXT", "पुढे", "अगला")}
                            </span>
                          ) : null}
                        </p>
                        {ev ? (
                          <p className="text-xs text-muted-foreground">
                            {new Date(ev.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                            {ev.note ? ` · ${ev.note}` : ""}
                            {ev.vehicle ? ` · 🚚 ${ev.vehicle}` : ""}
                            {ev.eta ? ` · ETA ${ev.eta}` : ""}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{L("Order details", "ऑर्डर तपशील", "ऑर्डर विवरण")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-semibold">
                  {order.batches?.crop ?? "Produce"} {order.batches?.variety ? `· ${order.batches.variety}` : ""}
                </p>
                <p>
                  {order.quantity_kg} kg × ₹{Number(order.price_per_kg).toFixed(2)} ={" "}
                  <span className="font-bold">₹{Number(order.total_amount).toFixed(0)}</span>
                </p>
                <p className="text-muted-foreground">
                  {L("Ordered", "ऑर्डर दिनांक", "ऑर्डर तिथि")}: {new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
                {data?.seller ? (
                  <p className="text-muted-foreground">
                    {L("Seller", "विक्रेता", "विक्रेता")}: <span className="text-foreground">{data.seller.name}</span>
                    {data.seller.district ? ` · ${data.seller.district}` : ""}
                  </p>
                ) : null}
                {data?.buyer ? (
                  <p className="text-muted-foreground">
                    {L("Buyer", "खरेदीदार", "खरीदार")}: <span className="text-foreground">{data.buyer.name}</span>
                  </p>
                ) : null}
                {order.delivery_address ? (
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="size-3.5" /> {order.delivery_address}
                  </p>
                ) : null}
                {order.vehicle || order.eta ? (
                  <p className="text-muted-foreground">
                    🚚 {order.vehicle ?? ""} {order.eta ? `· ETA ${order.eta}` : ""}
                  </p>
                ) : null}
                {order.batches?.batch_code ? (
                  <Link to="/trace/$code" params={{ code: order.batches.batch_code }} className="block pt-2 font-mono text-xs underline underline-offset-4">
                    {L("Trace batch", "बॅच माग", "बैच ट्रेस")} {order.batches.batch_code}
                  </Link>
                ) : null}
                {user ? (
                  <Link to="/orders" className="block text-xs underline underline-offset-4">
                    {L("Back to my orders", "माझ्या ऑर्डर्सकडे परत", "मेरे ऑर्डर पर वापस")}
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
