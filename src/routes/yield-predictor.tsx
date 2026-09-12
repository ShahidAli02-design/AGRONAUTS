import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar,
  CloudRain,
  Gauge,
  HelpCircle,
  IndianRupee,
  MapPin,
  PieChart,
  Scale,
  Sparkles,
  TrendingUp,
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
import { INDIA_CROPS } from "@/lib/india-crops";
import { INDIA_STATE_DISTRICTS } from "@/lib/india-districts";

const CROP_CATEGORIES = Array.from(new Set(INDIA_CROPS.map((c) => c.category)));

export const Route = createFileRoute("/yield-predictor")({
  head: () => ({
    meta: [
      { title: "Crop Yield Predictor & Production Telemetry | AGRONAUTS" },
      {
        name: "description",
        content:
          "Predict agricultural yield tonnage, estimated harvest dates, and projected farm revenue based on weather telemetry and field inputs.",
      },
    ],
  }),
  component: YieldPredictorPage,
});

export function YieldPredictorPage() {
  const { t, lang } = useI18n();
  const { user } = useSession();

  const [crop, setCrop] = React.useState("Tomato");
  const [district, setDistrict] = React.useState("Nashik");
  const [village, setVillage] = React.useState("");
  const [acres, setAcres] = React.useState("2");
  const [sowingDate, setSowingDate] = React.useState(
    new Date(Date.now() - 86400000 * 45).toISOString().slice(0, 10)
  );
  const [irrigation, setIrrigation] = React.useState("drip");
  const [soilHealthRating, setSoilHealthRating] = React.useState("good");

  // Calculations
  const acresNum = Number(acres) || 1;
  const cropData = INDIA_CROPS.find((c) => c.id === crop);

  const irrigationFactor = irrigation === "drip" ? 1.15 : irrigation === "sprinkler" ? 1.05 : 0.9;
  const soilFactor = soilHealthRating === "excellent" ? 1.1 : soilHealthRating === "good" ? 1.0 : 0.85;

  const base = cropData?.avgYieldQuintalsPerAcre || 100;
  const predictedQuintals = Math.round(base * acresNum * irrigationFactor * soilFactor);
  const predictedTons = (predictedQuintals / 10).toFixed(1);
  const price = cropData ? Math.round(cropData.pricePerKg * 100) : 2000;
  const estimatedGrossRevenue = Math.round(predictedQuintals * price);

  // Harvest date calculation
  const days = cropData?.maturityDays || 90;
  const harvestEstimate = new Date(new Date(sowingDate).getTime() + days * 86400000)
    .toISOString()
    .slice(0, 10);

  return (
    <RequireAuth toolName={lang === "mr" ? "उत्पादन व महसूल अंदाज" : "Yield & Revenue Predictor"}>
      <AppShell signedIn={Boolean(user)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <TrendingUp className="size-4" />
            </span>
            {t("yieldPredictor")}
            <DemoTag />
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "mr"
              ? "हवामान डेटा, पेरणीची तारीख व सिंचन पद्धतीवरून अपेक्षित उत्पादन आणि संभाव्य उत्पन्नाचा अंदाज"
              : "Project harvest yield tonnage, picking calendar, and gross farm realization"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-12">
        {/* Left: Telemetry & Crop Parameters */}
        <div className="space-y-4 md:col-span-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {lang === "mr" ? "शेताची माहिती व पेरणी" : "Crop Parameters"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("crop")}</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                  >
                    {CROP_CATEGORIES.map((cat) => (
                      <optgroup key={cat} label={cat}>
                        {INDIA_CROPS.filter((c) => c.category === cat).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("district")}</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    {INDIA_STATE_DISTRICTS.map((s) => (
                      <optgroup key={s.state} label={s.state}>
                        {s.districts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Village (गाव)</Label>
                <Input
                  type="text"
                  placeholder="e.g. Pimpalgaon Basvant"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Area (Acres / एकर)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={acres}
                    onChange={(e) => setAcres(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Sowing Date (पेरणी तारीख)</Label>
                  <Input
                    type="date"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Irrigation Method (सिंचन प्रकार)</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={irrigation}
                  onChange={(e) => setIrrigation(e.target.value)}
                >
                  <option value="drip">Drip Irrigation (ठिबक सिंचन - +15% yield)</option>
                  <option value="sprinkler">Sprinkler (तुषार सिंचन)</option>
                  <option value="flood">Flood / Furrow (पाट पाणी)</option>
                </select>
              </div>

              {/* Weather Telemetry Snapshot */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <CloudRain className="size-3.5 text-primary" />
                    Telemetry for {village ? `${village}, ` : ""}{district}
                  </span>
                  <span className="text-[11px] text-muted-foreground">IMD Station Data</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="rounded border border-border bg-card p-1.5">
                    <p className="text-[10px] text-muted-foreground">Rainfall</p>
                    <p className="font-bold">48 mm</p>
                  </div>
                  <div className="rounded border border-border bg-card p-1.5">
                    <p className="text-[10px] text-muted-foreground">Soil Moisture</p>
                    <p className="font-bold text-primary">68%</p>
                  </div>
                  <div className="rounded border border-border bg-card p-1.5">
                    <p className="text-[10px] text-muted-foreground">GDD Index</p>
                    <p className="font-bold">1,240</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Yield Projection Results */}
        <div className="space-y-4 md:col-span-7">
          <Card className="border-primary/20">
            <CardHeader className="pb-3 border-b border-border bg-primary/5">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="text-foreground">
                  {lang === "mr" ? "उत्पादन अंदाज अहवाल" : "Yield Forecast Summary"}
                </span>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {crop} · {acres} Acres
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {lang === "mr" ? "अपेक्षित उत्पादन" : "Predicted Total Output"}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-foreground">
                    {predictedQuintals} <span className="text-sm font-normal text-muted-foreground">Quintals ({predictedTons} Tons)</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ~{(predictedQuintals / acresNum).toFixed(1)} Quintals/Acre average
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {lang === "mr" ? "अंदाजित बाजार मूल्य" : "Projected Gross Revenue"}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-primary">
                    ₹{estimatedGrossRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Based on prevailing APMC rate ₹{price}/Qtl
                  </p>
                </div>
              </div>

              {/* Harvest Timeline */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="size-4 text-primary" />
                    {lang === "mr" ? "अपेक्षित कापणी कालावधी" : "Estimated Harvest Window"}
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-mono font-medium">
                    {harvestEstimate}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Crop growth cycle is {days} days from sowing. Optimal picking interval occurs across 2-3 pickings for maximum quality grade.
                </p>
              </div>

              {/* Yield Boost Factors */}
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-foreground">
                  {lang === "mr" ? "उत्पादन वाढीसाठी महत्त्वाचे घटक" : "Yield Optimization Factors"}
                </p>
                <div className="space-y-1.5 text-muted-foreground">
                  <p>• <strong>Irrigation efficiency:</strong> Drip fertigation maintains constant moisture tension and avoids blossom-end rot.</p>
                  <p>• <strong>Micro-nutrient spray:</strong> Foliar Boron 20% @ 1g/L during flower bloom prevents drop and boosts fruit caliber.</p>
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
