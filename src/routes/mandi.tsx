import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, RefreshCw, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/ui-bits";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/mandi")({
  head: () => ({
    meta: [
      { title: "Live Mandi Prices | AGRONAUTS" },
      {
        name: "description",
        content: "Today's APMC mandi prices for every state, district, market and commodity — vegetables, fruits, grains, pulses, oilseeds and spices (Agmarknet).",
      },
    ],
  }),
  component: MandiPage,
});

export type MandiRow = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  category: string;
};

type Options = { states: string[]; districts: string[]; markets: string[]; commodities: string[]; categories: string[] };

const CATEGORY_LABEL: Record<string, { en: string; mr: string; hi: string; icon: string }> = {
  Vegetables: { en: "Vegetables", mr: "भाजीपाला", hi: "सब्ज़ियाँ", icon: "🥬" },
  Fruits: { en: "Fruits", mr: "फळे", hi: "फल", icon: "🍎" },
  Grains: { en: "Grains", mr: "धान्य", hi: "अनाज", icon: "🌾" },
  Pulses: { en: "Pulses", mr: "कडधान्य", hi: "दालें", icon: "🫘" },
  Oilseeds: { en: "Oilseeds", mr: "तेलबिया", hi: "तिलहन", icon: "🌻" },
  Spices: { en: "Spices", mr: "मसाले", hi: "मसाले", icon: "🌶️" },
  Others: { en: "Others", mr: "इतर", hi: "अन्य", icon: "📦" },
};

const PAGE = 100;

function MandiPage() {
  const { lang } = useI18n();
  const { user, profile } = useSession();
  const L = (en: string, mr: string, hi: string) => (lang === "mr" ? mr : lang === "hi" ? hi : en);

  const [state, setState] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [market, setMarket] = React.useState("");
  const [commodity, setCommodity] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState("commodity");
  const [offset, setOffset] = React.useState(0);
  const [options, setOptions] = React.useState<Options | null>(null);
  const [rows, setRows] = React.useState<MandiRow[] | null>(null);
  const [meta, setMeta] = React.useState<{ total: number; fetchedAt: string; stale: boolean; staleReason?: string; limitedSampleKey?: boolean; source: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Default to the user's own state if the data has it.
  const didDefault = React.useRef(false);
  React.useEffect(() => {
    const qs = new URLSearchParams({ state, district });
    fetch(`/api/mandi/options?${qs}`)
      .then((r) => r.json())
      .then((j) => {
        if (!j?.success) return;
        setOptions(j);
        if (!didDefault.current) {
          didDefault.current = true;
          if (!state && j.states.includes("Maharashtra") && profile?.district) setState("Maharashtra");
        }
      })
      .catch(() => undefined);
  }, [state, district, profile?.district]);

  const load = React.useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ state, district, market, commodity, category, q: query, sort, limit: String(PAGE), offset: String(offset) });
    try {
      const res = await fetch(`/api/mandi/prices?${qs}`);
      const j = await res.json();
      if (!res.ok || !j?.success) throw new Error(j?.error || "Could not load mandi prices.");
      setRows(j.records);
      setMeta(j);
      setError(null);
    } catch (err) {
      setRows(null);
      setError(err instanceof Error ? err.message : "Could not load mandi prices.");
    } finally {
      setLoading(false);
    }
  }, [state, district, market, commodity, category, query, sort, offset]);

  React.useEffect(() => {
    const t = window.setTimeout(() => void load(), query ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [load, query]);

  const resetBelow = (level: "state" | "district" | "market") => {
    if (level === "state") setDistrict("");
    if (level !== "market") setMarket("");
    setCommodity("");
    setOffset(0);
  };

  const select = "h-10 rounded-md border border-input bg-background px-3 text-sm";

  return (
    <AppShell signedIn={Boolean(user)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <BarChart3 className="size-6 text-primary" />
            {L("Live Mandi Prices", "थेट बाजारभाव (मंडी)", "लाइव मंडी भाव")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {L(
              "Today's APMC prices for every state, district, market and commodity. Prices are per quintal (100 kg).",
              "प्रत्येक राज्य, जिल्हा, बाजार समिती व शेतमालाचे आजचे भाव. दर प्रति क्विंटल (१०० किलो).",
              "हर राज्य, ज़िला, मंडी और फसल के आज के भाव। दाम प्रति क्विंटल (100 किलो)।"
            )}
          </p>
        </div>
        <Button variant="outline" className="h-10 gap-1.5" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          {L("Refresh", "रिफ्रेश", "रिफ्रेश")}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["", ...(options?.categories ?? Object.keys(CATEGORY_LABEL))].map((c) => {
          const lbl = c ? CATEGORY_LABEL[c] ?? { en: c, mr: c, hi: c, icon: "•" } : { en: "All", mr: "सर्व", hi: "सभी", icon: "📋" };
          return (
            <button
              key={c || "all"}
              onClick={() => {
                setCategory(c);
                setOffset(0);
              }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${category === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"}`}
            >
              {lbl.icon} {L(lbl.en, lbl.mr, lbl.hi)}
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <select aria-label="State" className={select} value={state} onChange={(e) => { setState(e.target.value); resetBelow("state"); }}>
          <option value="">{L("All states", "सर्व राज्ये", "सभी राज्य")}</option>
          {options?.states.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select aria-label="District" className={select} value={district} disabled={!state} onChange={(e) => { setDistrict(e.target.value); resetBelow("district"); }}>
          <option value="">{L("All districts", "सर्व जिल्हे", "सभी ज़िले")}</option>
          {options?.districts.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select aria-label="Market" className={select} value={market} disabled={!district} onChange={(e) => { setMarket(e.target.value); resetBelow("market"); }}>
          <option value="">{L("All markets", "सर्व बाजार", "सभी मंडियाँ")}</option>
          {options?.markets.map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOffset(0); }}
            placeholder={L("Search crop (e.g. Onion)", "पीक शोधा (उदा. कांदा)", "फसल खोजें (जैसे प्याज)")}
            className="h-10 pl-9"
          />
        </div>
        <select aria-label="Sort" className={select} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="commodity">{L("Sort: Crop A-Z", "क्रम: पीक", "क्रम: फसल")}</option>
          <option value="price_high">{L("Price: high to low", "भाव: जास्त ते कमी", "भाव: ज़्यादा से कम")}</option>
          <option value="price_low">{L("Price: low to high", "भाव: कमी ते जास्त", "भाव: कम से ज़्यादा")}</option>
          <option value="market">{L("Sort: Market", "क्रम: बाजार", "क्रम: मंडी")}</option>
          <option value="latest">{L("Latest arrivals", "नवीन आवक", "नई आवक")}</option>
        </select>
      </div>

      {meta ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {meta.total.toLocaleString("en-IN")} {L("prices", "भाव", "भाव")} · {meta.source} · {L("updated", "अद्यतन", "अपडेट")}{" "}
          {new Date(meta.fetchedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          {meta.stale ? (
            <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-700 dark:text-amber-300">
              {L("showing last saved prices — live source unreachable", "शेवटचे जतन केलेले भाव — थेट स्रोत उपलब्ध नाही", "आख़िरी सेव भाव — लाइव स्रोत उपलब्ध नहीं")}
            </span>
          ) : null}
          {meta.limitedSampleKey ? (
            <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-700 dark:text-amber-300">
              {L("Demo key: only a few markets load. Add DATA_GOV_API_KEY for all of India.", "डेमो की: काही बाजारच दिसतील. संपूर्ण भारतासाठी DATA_GOV_API_KEY जोडा.", "डेमो की: कुछ ही मंडियाँ दिखेंगी। पूरे भारत के लिए DATA_GOV_API_KEY जोड़ें।")}
            </span>
          ) : null}
        </p>
      ) : null}

      <div className="mt-4">
        {error ? (
          <ErrorState message={error} />
        ) : rows === null ? (
          <LoadingBlock label={L("Loading today's mandi prices...", "आजचे बाजारभाव लोड होत आहेत...", "आज के मंडी भाव लोड हो रहे हैं...")} />
        ) : rows.length === 0 ? (
          <EmptyState title={L("No prices match", "जुळणारे भाव नाहीत", "कोई भाव नहीं मिला")} hint={L("Try another crop, state or market.", "दुसरे पीक, राज्य किंवा बाजार निवडा.", "दूसरी फसल, राज्य या मंडी चुनें।")} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5">{L("Crop", "पीक", "फसल")}</th>
                  <th className="px-3 py-2.5">{L("Market", "बाजार", "मंडी")}</th>
                  <th className="px-3 py-2.5 text-right">{L("Min ₹/q", "किमान ₹/क्विं", "न्यूनतम ₹/क्विं")}</th>
                  <th className="px-3 py-2.5 text-right">{L("Max ₹/q", "कमाल ₹/क्विं", "अधिकतम ₹/क्विं")}</th>
                  <th className="px-3 py-2.5 text-right">{L("Modal ₹/q", "सरासरी ₹/क्विं", "मॉडल ₹/क्विं")}</th>
                  <th className="px-3 py-2.5 text-right">₹/kg</th>
                  <th className="px-3 py-2.5">{L("Date", "दिनांक", "तारीख")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((r, i) => (
                  <tr key={`${r.market}-${r.commodity}-${r.variety}-${i}`} className="hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <p className="font-semibold">{r.commodity}</p>
                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_LABEL[r.category]?.icon} {r.variety}
                        {r.grade && r.grade !== "FAQ" ? ` · ${r.grade}` : ""}
                      </p>
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{r.market}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.district}, {r.state}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{r.min_price.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.max_price.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-primary">{r.modal_price.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-right font-mono">{(r.modal_price / 100).toFixed(2)}</td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{r.arrival_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta && meta.total > PAGE ? (
          <div className="mt-3 flex items-center justify-between text-sm">
            <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE))}>
              ← {L("Previous", "मागे", "पिछला")}
            </Button>
            <span className="text-muted-foreground">
              {offset + 1}–{Math.min(offset + PAGE, meta.total)} / {meta.total.toLocaleString("en-IN")}
            </span>
            <Button variant="outline" size="sm" disabled={offset + PAGE >= meta.total} onClick={() => setOffset(offset + PAGE)}>
              {L("Next", "पुढे", "अगला")} →
            </Button>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
