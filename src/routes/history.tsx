import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { History as HistoryIcon, Search } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/app-shell";
import { EmptyState, LoadingBlock } from "@/components/ui-bits";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { TOOL_LABELS, formatWhen, useHistory, type ToolKey } from "@/lib/history";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "My history | AGRONAUTS" },
      { name: "description", content: "Every AI grading, crop doctor, soil, yield, cold storage, scheme and rental activity in one place." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { lang } = useI18n();
  const { user, role } = useSession();
  const isAdmin = role === "admin";
  const [tool, setTool] = React.useState<ToolKey | "all">("all");
  const [scope, setScope] = React.useState<"mine" | "everyone">("mine");
  const [query, setQuery] = React.useState("");
  const rows = useHistory(tool === "all" ? undefined : tool, isAdmin && scope === "everyone");
  const L = (en: string, mr: string, hi: string) => (lang === "mr" ? mr : lang === "hi" ? hi : en);

  const q = query.trim().toLowerCase();
  const shown = (rows ?? []).filter((r) => !q || `${r.title} ${r.summary} ${r.user_name ?? ""}`.toLowerCase().includes(q));

  return (
    <RequireAuth toolName="__allow_processor">
      <AppShell signedIn={Boolean(user)}>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <HistoryIcon className="size-6 text-primary" />
          {L("History", "इतिहास", "इतिहास")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {L(
            "Every grading, diagnosis, soil and yield report, booking, rental and scheme application is saved here.",
            "प्रत्येक प्रतवारी, रोग निदान, माती व उत्पादन अहवाल, आरक्षण, भाडे व योजना अर्ज येथे जतन होतो.",
            "हर ग्रेडिंग, रोग निदान, मिट्टी व उपज रिपोर्ट, बुकिंग, किराया और योजना आवेदन यहाँ सेव होता है।"
          )}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(["all", ...Object.keys(TOOL_LABELS)] as (ToolKey | "all")[]).map((key) => {
            const label = key === "all" ? { en: "All", mr: "सर्व", hi: "सभी", icon: "📋" } : TOOL_LABELS[key];
            return (
              <button
                key={key}
                onClick={() => setTool(key)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  tool === key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-accent"
                }`}
              >
                {label.icon} {L(label.en, label.mr, label.hi)}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={L("Search history", "इतिहास शोधा", "इतिहास खोजें")} className="h-10 pl-9" />
          </div>
          {isAdmin ? (
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1 text-xs font-semibold">
              {(["mine", "everyone"] as const).map((s) => (
                <button key={s} onClick={() => setScope(s)} className={`rounded-md px-3 py-1 ${scope === s ? "bg-card shadow-xs" : "text-muted-foreground"}`}>
                  {s === "mine" ? L("Mine", "माझे", "मेरा") : L("All users", "सर्व वापरकर्ते", "सभी उपयोगकर्ता")}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-5">
          {rows === null ? (
            <LoadingBlock label={L("Loading...", "लोड होत आहे...", "लोड हो रहा है...")} />
          ) : shown.length === 0 ? (
            <EmptyState
              title={L("No history yet", "अद्याप इतिहास नाही", "अभी कोई इतिहास नहीं")}
              hint={L("Use any smart tool and its result will appear here.", "कोणतेही साधन वापरा, त्याचा निकाल येथे दिसेल.", "कोई भी टूल इस्तेमाल करें, उसका नतीजा यहाँ दिखेगा।")}
            />
          ) : (
            <ul className="space-y-2">
              {shown.map((h) => {
                const label = TOOL_LABELS[h.tool] ?? { en: h.tool, mr: h.tool, hi: h.tool, icon: "•" };
                return (
                  <li key={h.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {label.icon} {L(label.en, label.mr, label.hi)}
                          {scope === "everyone" && h.user_name ? ` · ${h.user_name} (${h.user_role})` : ""}
                        </p>
                        <p className="mt-0.5 font-semibold text-foreground">{h.title}</p>
                        <p className="text-sm text-muted-foreground">{h.summary}</p>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatWhen(h.created_at)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
