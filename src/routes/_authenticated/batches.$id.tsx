import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { gradeBatch } from "@/lib/agri.functions";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingBlock, StatusPill } from "@/components/ui-bits";
import { ProduceCameraCapture } from "@/components/ProduceCameraCapture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";

const GRADE_TIERS = ["A", "B", "C", "D", "E", "F"];

type HealthInfo = {
  possibleDisease: string;
  severity: string;
  confidenceScore: number;
  recommendedAction: string;
  isSimulated?: boolean;
};

export const Route = createFileRoute("/_authenticated/batches/$id")({
  head: () => ({
    meta: [
      { title: "Batch workspace | AGRONAUTS" },
      {
        name: "description",
        content:
          "Grade, store, decide utilization and list a produce batch for sale — all against one permanent batch ID.",
      },
      { property: "og:title", content: "AGRONAUTS batch workspace" },
      {
        property: "og:description",
        content: "Quality grading, storage, utilization and marketplace listing for one batch.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BatchDetail,
});

type Batch = {
  id: string;
  batch_code: string;
  farmer_id: string | null;
  crop: string;
  variety: string | null;
  quantity_kg: number;
  harvest_date: string;
  district: string;
  village: string | null;
  notes: string | null;
  status: string;
  grade: string | null;
  grade_score: number | null;
  grade_reason: string | null;
  grade_source: string | null;
  storage_location: string | null;
  utilization: string | null;
};

const UTILIZATIONS = [
  "Fresh market sale",
  "Processing (puree / flakes)",
  "Cold storage and hold",
  "Seed / self use",
];

function BatchDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { user } = useSession();
  const runGrading = useServerFn(gradeBatch);

  const [batch, setBatch] = React.useState<Batch | null | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [storage, setStorage] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [listed, setListed] = React.useState(false);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [healthInfo, setHealthInfo] = React.useState<HealthInfo | null>(null);

  const load = React.useCallback(async () => {
    const { data, error: err } = await supabase
      .from("batches")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (err) {
      setError(err.message);
      setBatch(null);
      return;
    }
    const b = (data as Batch | null) ?? null;
    setBatch(b);
    if (b?.storage_location) setStorage(b.storage_location);
    const { data: l } = await supabase.from("listings").select("id").eq("batch_id", id).limit(1);
    setListed((l ?? []).length > 0);
  }, [id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function doGrade() {
    if (!batch) return;
    setBusy("grade");
    setError(null);
    try {
      await runGrading({
        data: {
          batchId: batch.id,
          crop: batch.crop,
          variety: batch.variety,
          quantityKg: Number(batch.quantity_kg),
          harvestDate: batch.harvest_date,
          district: batch.district,
          notes: batch.notes,
        },
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setBusy(null);
    }
  }

  async function runPhotoGrading() {
    if (!batch || !capturedImage) return;
    setBusy("grade");
    setError(null);
    try {
      const quantityTons = Math.max(0.01, Number(batch.quantity_kg) / 1000);
      const [qualityRes, diseaseRes] = await Promise.all([
        fetch("/api/ai/quality-grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batchId: batch.id,
            image: capturedImage,
            crop: batch.crop,
            quantity: quantityTons,
          }),
        }),
        fetch("/api/ai/disease-detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: capturedImage, cropHint: batch.crop }),
        }),
      ]);

      const qualityJson = qualityRes.ok ? await qualityRes.json() : null;
      const diseaseJson = diseaseRes.ok ? await diseaseRes.json() : null;
      const qualityReport = qualityJson?.qualityReport;
      const diseaseResult: HealthInfo | undefined = diseaseJson?.result;

      if (!qualityReport) {
        throw new Error("Photo grading failed. Please retake the photo and try again.");
      }

      const letter = String(qualityReport.assignedGrade || "Grade A").replace("Grade ", "").trim();
      let tierIndex = Math.max(0, GRADE_TIERS.indexOf(letter));
      const healthIsReal = diseaseResult && diseaseResult.isSimulated === false;
      let healthNote = "";

      if (diseaseResult) {
        if (healthIsReal) {
          const isHealthy = diseaseResult.severity === "None" || diseaseResult.severity === "Mild";
          if (diseaseResult.severity === "Severe") tierIndex = Math.min(5, tierIndex + 2);
          else if (diseaseResult.severity === "Moderate") tierIndex = Math.min(5, tierIndex + 1);
          healthNote = isHealthy
            ? ` Crop health scan found no significant issues (${diseaseResult.possibleDisease}, ${diseaseResult.severity} severity, ${diseaseResult.confidenceScore}% confidence) — grade unaffected.`
            : ` Crop health scan detected ${diseaseResult.possibleDisease} (${diseaseResult.severity} severity, ${diseaseResult.confidenceScore}% confidence) — grade lowered for plant health.`;
        } else {
          healthNote = ` Crop-health scan is running in demo mode (no GEMINI_API_KEY configured) — the sample diagnosis shown did not affect this grade.`;
        }
      }

      const finalLetter = GRADE_TIERS[tierIndex];
      const combinedReason = `${qualityReport.aiExplanation || ""}${healthNote}`.trim();
      const source = healthIsReal ? "AI Vision + Crop Health" : "AI Vision (Demo)";

      setHealthInfo(diseaseResult ?? null);

      const { error: err } = await supabase
        .from("batches")
        .update({
          grade: finalLetter,
          grade_score: qualityReport.overallScore,
          grade_reason: combinedReason,
          grade_source: source,
          status: "graded",
        })
        .eq("id", batch.id);
      if (err) throw new Error(err.message);

      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("batch_events").insert({
        batch_id: batch.id,
        event_type: "grading",
        description: `Photo-based grade ${finalLetter} (${qualityReport.overallScore}) - source: ${source}`,
        actor_id: userData?.user?.id ?? user?.id ?? "usr_balasaheb_01",
      });

      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setBusy(null);
    }
  }

  async function saveStorage() {
    if (!batch || !user) return;
    if (!storage.trim()) return setError(`${t("required")}: ${t("storage")}`);
    setBusy("storage");
    setError(null);
    const { error: err } = await supabase
      .from("batches")
      .update({ storage_location: storage.trim(), status: "stored" })
      .eq("id", batch.id);
    if (err) setError(err.message);
    else {
      await supabase.from("batch_events").insert({
        batch_id: batch.id,
        event_type: "storage",
        description: `Stored at ${storage.trim()}`,
        actor_id: user.id,
      });
      await load();
    }
    setBusy(null);
  }

  async function setUtilization(choice: string) {
    if (!batch || !user) return;
    setBusy("util");
    const { error: err } = await supabase
      .from("batches")
      .update({ utilization: choice })
      .eq("id", batch.id);
    if (err) setError(err.message);
    else {
      await supabase.from("batch_events").insert({
        batch_id: batch.id,
        event_type: "utilization",
        description: `Utilization decision: ${choice}`,
        actor_id: user.id,
      });
      await load();
    }
    setBusy(null);
  }

  async function createListing() {
    if (!batch || !user) return;
    const p = Number(price);
    if (!p || p <= 0) return setError(`${t("required")}: ${t("pricePerKg")}`);
    setBusy("list");
    setError(null);
    const { error: err } = await supabase.from("listings").insert({
      batch_id: batch.id,
      farmer_id: user.id,
      price_per_kg: p,
      quantity_kg: batch.quantity_kg,
      status: "open",
    });
    if (err) {
      setError(err.message);
      setBusy(null);
      return;
    }
    await supabase.from("batches").update({ status: "listed" }).eq("id", batch.id);
    await supabase.from("batch_events").insert({
      batch_id: batch.id,
      event_type: "listing",
      description: `Listed on marketplace at Rs ${p.toFixed(2)}/kg`,
      actor_id: user.id,
    });
    setBusy(null);
    await load();
  }

  if (batch === undefined) {
    return (
      <AppShell signedIn>
        <LoadingBlock label={t("loading")} />
      </AppShell>
    );
  }

  if (!batch) {
    return (
      <AppShell signedIn>
        <EmptyState title="Batch not found" hint="It may have been removed." />
      </AppShell>
    );
  }

  const isOwner = batch.farmer_id === user?.id;

  return (
    <AppShell signedIn>
      <p className="font-mono text-sm text-muted-foreground">{batch.batch_code}</p>
      <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight">
        {batch.crop} {batch.variety ? `· ${batch.variety}` : ""}
        <StatusPill status={batch.status} />
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {batch.quantity_kg} kg · harvested {batch.harvest_date} ·{" "}
        {batch.village ? `${batch.village}, ` : ""}
        {batch.district}
      </p>

      {error ? (
        <div className="mt-4">
          <ErrorState message={error} />
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">1. {t("grade")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {batch.grade ? (
              <>
                <p className="text-3xl font-bold">{batch.grade}</p>
                <p className="text-muted-foreground">
                  Score {batch.grade_score} · source {batch.grade_source}
                </p>
                <p className="text-muted-foreground">{batch.grade_reason}</p>
              </>
            ) : (
              <p className="text-muted-foreground">
                Provisional grade only, based on the details you entered. A physical check at the
                mandi still applies.
              </p>
            )}
            {healthInfo ? (
              <div
                className={`rounded-lg border p-3 text-xs space-y-1 ${
                  healthInfo.isSimulated === false
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-amber-500/30 bg-amber-500/10"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Leaf className="size-3.5 text-emerald-600" />
                  <span>
                    {lang === "mr" ? "पीक आरोग्य तपासणी" : "Crop Health Scan"}
                    {healthInfo.isSimulated !== false ? (lang === "mr" ? " (डेमो)" : " (Demo)") : ""}
                  </span>
                </div>
                <p className="text-foreground">
                  {healthInfo.possibleDisease} · {healthInfo.severity} severity · {healthInfo.confidenceScore}% confidence
                </p>
                <p className="text-muted-foreground">{healthInfo.recommendedAction}</p>
              </div>
            ) : null}

            {isOwner ? (
              <div className="space-y-3 pt-2 border-t border-border/60">
                <p className="text-xs font-semibold text-foreground">
                  {lang === "mr"
                    ? "पिकाचा फोटो घ्या — आरोग्यावर आधारित ग्रेड मिळेल"
                    : "Scan a photo to grade by crop health"}
                </p>
                <ProduceCameraCapture
                  capturedImage={capturedImage}
                  onCapture={setCapturedImage}
                  onClear={() => setCapturedImage(null)}
                  lang={lang}
                />
                <Button
                  className="h-11"
                  onClick={() => void runPhotoGrading()}
                  disabled={busy === "grade" || !capturedImage}
                >
                  {busy === "grade" ? t("loading") : lang === "mr" ? "फोटोवरून ग्रेड करा" : "Grade from Photo"}
                </Button>
                <button
                  type="button"
                  onClick={() => void doGrade()}
                  disabled={busy === "grade"}
                  className="block text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-4 disabled:opacity-50"
                >
                  {lang === "mr"
                    ? "फोटोशिवाय द्रुत अंदाज वापरा"
                    : "Skip photo — use a quick text-based estimate instead"}
                </button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">2. {t("storage")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="storage">Where is this batch kept?</Label>
            <Input
              id="storage"
              className="h-11"
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              placeholder="Lasalgaon cold storage - Bay 3"
              disabled={!isOwner}
            />
            {isOwner ? (
              <Button
                variant="outline"
                className="h-11"
                onClick={() => void saveStorage()}
                disabled={busy === "storage"}
              >
                {busy === "storage" ? t("saving") : t("save")}
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">3. {t("utilization")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Current: {batch.utilization ?? "not decided"}
            </p>
            <div className="flex flex-wrap gap-2">
              {UTILIZATIONS.map((u) => (
                <Button
                  key={u}
                  size="sm"
                  variant={batch.utilization === u ? "default" : "outline"}
                  disabled={!isOwner || busy === "util"}
                  onClick={() => void setUtilization(u)}
                >
                  {u}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">4. {t("listForSale")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {listed ? (
              <p className="text-sm text-muted-foreground">
                This batch is already on the marketplace.
              </p>
            ) : (
              <>
                <Label htmlFor="price">{t("pricePerKg")}</Label>
                <Input
                  id="price"
                  className="h-11"
                  type="number"
                  min="1"
                  step="0.5"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={!isOwner}
                />
                {isOwner ? (
                  <Button
                    className="h-11"
                    onClick={() => void createListing()}
                    disabled={busy === "list"}
                  >
                    {busy === "list" ? t("saving") : t("listForSale")}
                  </Button>
                ) : null}
              </>
            )}
            <Link
              to="/trace/$code"
              params={{ code: batch.batch_code }}
              className="block text-sm underline underline-offset-4"
            >
              {t("traceability")}
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
