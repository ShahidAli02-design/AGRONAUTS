import * as React from "react";
import { Link } from "@tanstack/react-router";
import { History as HistoryIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getStoredSession, useSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { useLiveRefresh } from "@/lib/live";

// Activity history for every smart tool, stored in the shared server
// database so it follows the user across devices and admins can review it.

export type ToolKey =
  | "quality_grading"
  | "crop_doctor"
  | "soil_health"
  | "yield_prediction"
  | "cold_storage"
  | "scheme"
  | "rental";

export const TOOL_LABELS: Record<ToolKey, { en: string; mr: string; hi: string; icon: string }> = {
  quality_grading: { en: "AI Quality Grading", mr: "एआय गुणवत्ता प्रतवारी", hi: "एआई गुणवत्ता ग्रेडिंग", icon: "🏅" },
  crop_doctor: { en: "AI Crop Doctor", mr: "एआय पीक डॉक्टर", hi: "एआई फसल डॉक्टर", icon: "🌿" },
  soil_health: { en: "Soil Health & NPK", mr: "माती आरोग्य व खत", hi: "मृदा स्वास्थ्य व खाद", icon: "🧪" },
  yield_prediction: { en: "Yield Prediction", mr: "उत्पादन अंदाज", hi: "उपज अनुमान", icon: "📈" },
  cold_storage: { en: "Cold Storage", mr: "शीतगृह", hi: "कोल्ड स्टोरेज", icon: "❄️" },
  scheme: { en: "Government Schemes", mr: "सरकारी योजना", hi: "सरकारी योजनाएँ", icon: "🏛️" },
  rental: { en: "Equipment Rental", mr: "अवजारे भाडे", hi: "उपकरण किराया", icon: "🚜" },
};

export type HistoryEntry = {
  id: string;
  user_id: string;
  user_name?: string | null;
  user_role?: string | null;
  tool: ToolKey;
  title: string;
  summary: string;
  details?: Record<string, unknown> | null;
  created_at: string;
};

export async function recordHistory(tool: ToolKey, title: string, summary: string, details?: Record<string, unknown>) {
  const session = getStoredSession();
  if (!session?.user?.id) return;
  try {
    await supabase.from("tool_history").insert({ user_id: session.user.id, tool, title, summary, details: details ?? null });
  } catch (err) {
    console.warn("Could not save history:", err);
  }
}

export function useHistory(tool?: ToolKey, allUsers = false) {
  const { user } = useSession();
  const [rows, setRows] = React.useState<HistoryEntry[] | null>(null);
  const load = React.useCallback(async () => {
    if (!user) return;
    let q = supabase.from("tool_history").select("*");
    if (!allUsers) q = q.eq("user_id", user.id);
    if (tool) q = q.eq("tool", tool);
    const { data } = await q.order("created_at", { ascending: false }).limit(200);
    setRows((data ?? []) as HistoryEntry[]);
  }, [user, tool, allUsers]);
  React.useEffect(() => {
    void load();
  }, [load]);
  useLiveRefresh(load);
  return rows;
}

export function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Compact "recent history" panel shown at the bottom of each tool page.
export function ToolHistory({ tool, limit = 5 }: { tool: ToolKey; limit?: number }) {
  const { lang } = useI18n();
  const rows = useHistory(tool);
  const label = TOOL_LABELS[tool];
  const L = (en: string, mr: string, hi: string) => (lang === "mr" ? mr : lang === "hi" ? hi : en);
  return (
    <section className="mt-8 space-y-3" aria-label="History">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold tracking-tight">
          <HistoryIcon className="size-4 text-primary" />
          {L("My history", "माझा इतिहास", "मेरा इतिहास")} · {L(label.en, label.mr, label.hi)}
        </h2>
        <Link to="/history" className="text-xs font-semibold underline underline-offset-4">
          {L("View all history", "सर्व इतिहास पहा", "पूरा इतिहास देखें")}
        </Link>
      </div>
      {rows === null ? null : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
          {L("Nothing yet — your results will be saved here automatically.", "अद्याप काही नाही — तुमचे निकाल येथे आपोआप जतन होतील.", "अभी कुछ नहीं — आपके नतीजे यहाँ अपने-आप सेव होंगे।")}
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.slice(0, limit).map((h) => (
            <li key={h.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3 text-sm">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{h.title}</p>
                <p className="text-xs text-muted-foreground">{h.summary}</p>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{formatWhen(h.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// "Save this report" button for calculators that update live (soil, yield).
export function SaveToHistory({ onSave, lang }: { onSave: () => Promise<void>; lang: string }) {
  const [state, setState] = React.useState<"idle" | "saving" | "saved">("idle");
  const L = (en: string, mr: string, hi: string) => (lang === "mr" ? mr : lang === "hi" ? hi : en);
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
      <button
        type="button"
        disabled={state === "saving"}
        onClick={async () => {
          setState("saving");
          await onSave();
          setState("saved");
          window.setTimeout(() => setState("idle"), 2500);
        }}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        <HistoryIcon className="size-4" />
        {L("Save this report to history", "हा अहवाल इतिहासात जतन करा", "यह रिपोर्ट इतिहास में सेव करें")}
      </button>
      {state === "saved" ? (
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          ✓ {L("Saved", "जतन झाले", "सेव हो गया")}
        </span>
      ) : null}
    </div>
  );
}
