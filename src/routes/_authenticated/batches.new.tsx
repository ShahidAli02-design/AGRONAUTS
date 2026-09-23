import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { AppShell } from "@/components/app-shell";
import { ErrorState } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/batches/new")({
  head: () => ({
    meta: [
      { title: "Record a harvest batch | AGRONAUTS" },
      {
        name: "description",
        content:
          "Record a new harvest batch and get a permanent produce batch ID that follows the lot through grading, storage, sale and delivery.",
      },
      { property: "og:title", content: "Record a harvest batch" },
      {
        property: "og:description",
        content: "Create a traceable produce batch ID in a few taps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewBatch,
});

const DRAFT_KEY = "agronauts.batchDraft";

type Draft = {
  crop: string;
  variety: string;
  quantity: string;
  harvestDate: string;
  district: string;
  village: string;
  notes: string;
};

const emptyDraft: Draft = {
  crop: "",
  variety: "",
  quantity: "",
  harvestDate: new Date().toISOString().slice(0, 10),
  district: "",
  village: "",
  notes: "",
};

function NewBatch() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, profile } = useSession();
  const [draft, setDraft] = React.useState<Draft>(emptyDraft);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedOffline, setSavedOffline] = React.useState(false);

  React.useEffect(() => {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        setDraft({ ...emptyDraft, ...(JSON.parse(raw) as Partial<Draft>) });
        setSavedOffline(true);
      } catch {
        /* ignore malformed draft */
      }
    }
  }, []);

  React.useEffect(() => {
    if (!profile?.district) return;
    setDraft((d) => (d.district ? d : { ...d, district: profile.district ?? "" }));
  }, [profile?.district]);

  function update(key: keyof Draft, value: string) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    setSavedOffline(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) return;
    const quantity = Number(draft.quantity);
    if (!draft.crop.trim()) return setError(`${t("required")}: ${t("crop")}`);
    if (!quantity || quantity <= 0) return setError(`${t("required")}: ${t("quantity")}`);
    if (!draft.district.trim()) return setError(`${t("required")}: ${t("district")}`);
    if (!navigator.onLine) {
      setError("You are offline. Your draft is saved on this phone and can be sent later.");
      return;
    }

    setBusy(true);
    const { data, error: err } = await supabase
      .from("batches")
      .insert({
        batch_code: "", // filled server-side by the batch code sequence
        farmer_id: user.id,
        crop: draft.crop.trim(),
        variety: draft.variety.trim() || null,
        quantity_kg: quantity,
        harvest_date: draft.harvestDate,
        district: draft.district.trim(),
        village: draft.village.trim() || null,
        notes: draft.notes.trim() || null,
        demo_farmer_name: profile?.full_name || null,
        farmer_phone: profile?.phone || null,
        farmer_email: profile?.email || user?.email || null,
      })
      .select("id, batch_code, quantity_kg, district")
      .single();

    if (err || !data) {
      setError(err?.message ?? t("errorGeneric"));
      setBusy(false);
      return;
    }

    await supabase.from("batch_events").insert({
      batch_id: data.id,
      event_type: "harvest",
      description: `Harvested ${data.quantity_kg} kg in ${data.district}`,
      actor_id: user.id,
    });

    window.localStorage.removeItem(DRAFT_KEY);
    setBusy(false);
    void navigate({ to: "/batches/$id", params: { id: data.id } });
  }

  return (
    <AppShell signedIn>
      <h1 className="text-2xl font-bold tracking-tight">{t("newBatch")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A permanent batch ID is created automatically and follows this produce all the way to the
        buyer.
      </p>

      <Card className="mt-6 max-w-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Harvest details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="crop" label={t("crop")}>
                <Input
                  id="crop"
                  className="h-11"
                  value={draft.crop}
                  onChange={(e) => update("crop", e.target.value)}
                  placeholder="Onion"
                  required
                />
              </Field>
              <Field id="variety" label={t("variety")}>
                <Input
                  id="variety"
                  className="h-11"
                  value={draft.variety}
                  onChange={(e) => update("variety", e.target.value)}
                  placeholder="Nashik Red"
                />
              </Field>
              <Field id="quantity" label={t("quantity")}>
                <Input
                  id="quantity"
                  className="h-11"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={draft.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                  required
                />
              </Field>
              <Field id="harvestDate" label={t("harvestDate")}>
                <Input
                  id="harvestDate"
                  className="h-11"
                  type="date"
                  value={draft.harvestDate}
                  onChange={(e) => update("harvestDate", e.target.value)}
                  required
                />
              </Field>
              <Field id="district" label={t("district")}>
                <Input
                  id="district"
                  className="h-11"
                  value={draft.district}
                  onChange={(e) => update("district", e.target.value)}
                  placeholder="Nashik"
                  required
                />
              </Field>
              <Field id="village" label={t("village")}>
                <Input
                  id="village"
                  className="h-11"
                  value={draft.village}
                  onChange={(e) => update("village", e.target.value)}
                  placeholder="Lasalgaon"
                />
              </Field>
            </div>
            <Field id="notes" label={t("notes")}>
              <Textarea
                id="notes"
                value={draft.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Sorted and cleaned, no visible damage"
                rows={3}
              />
            </Field>
            {error ? <ErrorState message={error} /> : null}
            {savedOffline ? (
              <p className="text-xs text-muted-foreground">
                Draft saved on this device — safe to lose signal.
              </p>
            ) : null}
            <Button type="submit" className="h-12 w-full text-base" disabled={busy}>
              {busy ? t("saving") : t("save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
