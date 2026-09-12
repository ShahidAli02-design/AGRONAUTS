import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Calculator,
  CheckCircle2,
  Droplets,
  FlaskConical,
  Info,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/RequireAuth";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DemoTag } from "@/components/ui-bits";

export const Route = createFileRoute("/soil-health")({
  head: () => ({
    meta: [
      { title: "Soil Health Card & NPK Calculator | AGRONAUTS" },
      {
        name: "description",
        content:
          "Soil nutrient analysis and precision fertilizer calculation (Urea, DAP, MOP) tailored for Maharashtra soil profiles.",
      },
    ],
  }),
  component: SoilHealthPage,
});

export function SoilHealthPage() {
  const { t, lang } = useI18n();
  const { user } = useSession();

  // Soil parameters
  const [district, setDistrict] = React.useState("Nashik");
  const [crop, setCrop] = React.useState("Tomato");
  const [areaAcres, setAreaAcres] = React.useState("2.5");
  const [ph, setPh] = React.useState(7.2);
  const [organicCarbon, setOrganicCarbon] = React.useState(0.58);
  const [nitrogen, setNitrogen] = React.useState(210); // kg/ha (low < 280)
  const [phosphorus, setPhosphorus] = React.useState(18); // kg/ha (medium 10-25)
  const [potassium, setPotassium] = React.useState(290); // kg/ha (high > 280)

  // Fertilizer computation
  const acres = Number(areaAcres) || 1;
  const nDeficit = Math.max(0, 280 - nitrogen);
  const pDeficit = Math.max(0, 25 - phosphorus);
  const kDeficit = Math.max(0, 200 - potassium);

  // Bag calculations (50kg bags)
  const ureaBags = Math.ceil((nDeficit * 2.17 * acres) / 50) || Math.ceil(2.2 * acres);
  const dapBags = Math.ceil((pDeficit * 2.17 * acres) / 50) || Math.ceil(1.5 * acres);
  const mopBags = Math.ceil((kDeficit * 1.67 * acres) / 50) || Math.ceil(1.0 * acres);

  return (
    <RequireAuth toolName={lang === "mr" ? "माती परीक्षण व खत मात्रा" : "Soil Health & NPK Calculator"}>
      <AppShell signedIn={Boolean(user)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FlaskConical className="size-4" />
            </span>
            {t("soilHealth")}
            <DemoTag />
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "mr"
              ? "माती चाचणी पत्रिका, N-P-K पोषण स्तर आणि अचूक रासायनिक व सेंद्रिय खत शिफारस"
              : "Soil test card, primary nutrient balance (NPK), and precision fertilizer recommendations"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-12">
        {/* Left Column: Soil Test Inputs */}
        <div className="space-y-4 md:col-span-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {lang === "mr" ? "मातीचे नमुना वाचन" : "Soil Test Parameter Input"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cropSelect">{t("crop")}</Label>
                  <select
                    id="cropSelect"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                  >
                    <option value="Tomato">Tomato (टोमॅटो)</option>
                    <option value="Onion">Onion (कांदा)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Cotton">Cotton (कापूस)</option>
                    <option value="Grapes">Grapes (द्राक्षे)</option>
                    <option value="Sugarcane">Sugarcane (ऊस)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="areaInput">Area (Acres / एकर)</Label>
                  <Input
                    id="areaInput"
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(e.target.value)}
                  />
                </div>
              </div>

              {/* pH & Organic Carbon */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex justify-between text-sm">
                  <Label>Soil pH: {ph}</Label>
                  <span className="text-xs font-semibold text-primary">
                    {ph >= 6.5 && ph <= 7.5 ? "Optimal Neutral" : ph > 7.5 ? "Alkaline" : "Acidic"}
                  </span>
                </div>
                <input
                  type="range"
                  min="5.5"
                  max="8.8"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(Number(e.target.value))}
                  className="w-full accent-primary"
                />

                <div className="flex justify-between text-sm pt-2">
                  <Label>Organic Carbon (OC): {organicCarbon}%</Label>
                  <span className="text-xs font-semibold text-amber-600">
                    {organicCarbon < 0.5 ? "Low (<0.5%)" : organicCarbon <= 0.75 ? "Medium" : "High"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.2"
                  step="0.05"
                  value={organicCarbon}
                  onChange={(e) => setOrganicCarbon(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* N-P-K Reading sliders */}
              <div className="space-y-3 pt-2 border-t border-border text-sm">
                <div className="flex justify-between">
                  <span>Nitrogen (N): <strong>{nitrogen} kg/ha</strong></span>
                  <span className="text-xs font-medium text-amber-600">Low (&lt;280)</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="450"
                  value={nitrogen}
                  onChange={(e) => setNitrogen(Number(e.target.value))}
                  className="w-full accent-primary"
                />

                <div className="flex justify-between pt-1">
                  <span>Phosphorus (P): <strong>{phosphorus} kg/ha</strong></span>
                  <span className="text-xs font-medium text-primary">Medium (10-25)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(Number(e.target.value))}
                  className="w-full accent-primary"
                />

                <div className="flex justify-between pt-1">
                  <span>Potassium (K): <strong>{potassium} kg/ha</strong></span>
                  <span className="text-xs font-medium text-primary">Adequate (&gt;250)</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="450"
                  value={potassium}
                  onChange={(e) => setPotassium(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Fertilizer Prescription & Nutrient Health Card */}
        <div className="space-y-4 md:col-span-7">
          {/* Prescription Card */}
          <Card className="border-primary/30">
            <CardHeader className="pb-3 border-b border-border bg-primary/5">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2 text-foreground">
                  <Calculator className="size-4 text-primary" />
                  {lang === "mr" ? `खत शिफारस (${acres} एकरासाठी)` : `Targeted Fertilizer Plan (${acres} Acres)`}
                </span>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                  {crop} Nutrition
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-card p-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Urea (युरिया)</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{ureaBags} <span className="text-sm font-normal text-muted-foreground">bags</span></p>
                  <p className="text-[11px] text-muted-foreground">Nitrogen boost (46% N)</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">DAP (डीएपी)</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{dapBags} <span className="text-sm font-normal text-muted-foreground">bags</span></p>
                  <p className="text-[11px] text-muted-foreground">Phosphorus & basal (18:46)</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">MOP (पोटॅश)</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{mopBags} <span className="text-sm font-normal text-muted-foreground">bags</span></p>
                  <p className="text-[11px] text-muted-foreground">Bulb & fruit weight (60% K)</p>
                </div>
              </div>

              {/* Split Application Timing */}
              <div className="rounded-lg border border-border bg-muted/40 p-3.5 text-xs space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  {lang === "mr" ? "खत देण्याची योग्य वेळ (Split Schedule)" : "Recommended Split Timing"}
                </p>
                <div className="grid gap-1.5 text-muted-foreground">
                  <p>• <strong>Basal Dose (लागवड करताना):</strong> 100% DAP + 50% MOP + 25% Urea thoroughly incorporated in furrow.</p>
                  <p>• <strong>Vegetative Stage (३० दिवसांनी):</strong> 50% Urea with irrigation water.</p>
                  <p>• <strong>Flowering & Fruit Set (५०-६० दिवसांनी):</strong> Remaining 25% Urea + 50% MOP to maximize fruit firmness.</p>
                </div>
              </div>

              {/* Organic Amendments */}
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-foreground">
                  {lang === "mr" ? "सेंद्रिय सुधारक (सेंद्रिय कर्ब वाढवण्यासाठी)" : "Soil Organic Matter Regeneration"}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-md border border-border p-2.5 bg-card">
                    <p className="font-medium text-foreground">Farmyard Manure (शेणखत)</p>
                    <p className="text-muted-foreground mt-0.5">Apply 4 to 5 tonnes/acre well-decomposed FYM 15 days prior to transplanting.</p>
                  </div>
                  <div className="rounded-md border border-border p-2.5 bg-card">
                    <p className="font-medium text-foreground">Bio-fertilizers (जिवाणू खते)</p>
                    <p className="text-muted-foreground mt-0.5">Azotobacter + PSB culture @ 2 kg/acre mixed with vermicompost.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
    </RequireAuth>
  );
}
