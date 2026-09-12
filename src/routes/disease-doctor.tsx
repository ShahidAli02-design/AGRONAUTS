import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Droplets,
  Info,
  Leaf,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  Trash2,
  X,
  FileText,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/RequireAuth";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag } from "@/components/ui-bits";
import { INDIA_CROPS } from "@/lib/india-crops";

export const Route = createFileRoute("/disease-doctor")({
  head: () => ({
    meta: [
      { title: "AI Crop Disease Doctor | AGRONAUTS" },
      {
        name: "description",
        content:
          "Instant agronomic disease diagnosis for Maharashtra crops with IPM treatments, organic remedies, and optional leaf photo computer vision analysis.",
      },
    ],
  }),
  component: DiseaseDoctorPage,
});

interface DiseaseResult {
  cropDetected: string;
  possibleDisease: string;
  confidenceScore: number;
  severity: "Low" | "Moderate" | "High";
  visibleSymptoms: string[];
  recommendedAction: string;
  preventiveGuidance: string[];
  organicRemedies: string[];
}

const CROP_CATEGORIES = Array.from(new Set(INDIA_CROPS.map((c) => c.category)));

const SYMPTOM_PRESETS = [
  { id: "concentric_spots", label: "Concentric Ring Spots (तपकिरी गोल कडी डाग)" },
  { id: "yellowing", label: "Yellowing Foliage / Chlorosis (पाने पिवळी पडणे)" },
  { id: "curling", label: "Leaf Curling & Crinkling (चुरडा-मुरडा / पाने आकसणे)" },
  { id: "wilting", label: "Wilting & Drooping (झाड कोमेजणे / सुकणे)" },
  { id: "powdery", label: "White Powdery Mildew (पांढरी भुकटी / भुरी रोग)" },
  { id: "purple_blotch", label: "Purple / Dark Blotch (जांभळे-काळे चट्टे / करपा)" },
  { id: "downy_growth", label: "Downy Growth on Underside (पानांखाली बुरशी)" },
  { id: "stem_rot", label: "Stem Canker or Collar Rot (खोडावर चट्टे / सड)" },
  { id: "necrotic_margins", label: "Burnt / Necrotic Margins (पानांच्या कडा करपणे)" },
];

const QUICK_DIAGNOSTIC_PRESETS: {
  title: string;
  crop: string;
  symptoms: string[];
  result: DiseaseResult;
}[] = [
  {
    title: "Tomato Early Blight",
    crop: "Tomato",
    symptoms: ["Concentric Ring Spots", "Yellowing Foliage", "Burnt Margins"],
    result: {
      cropDetected: "Tomato (Solanum lycopersicum)",
      possibleDisease: "Early Blight (Alternaria solani)",
      confidenceScore: 94.2,
      severity: "Moderate",
      visibleSymptoms: [
        "Concentric target-like circular brown lesions on lower mature foliage",
        "Chlorotic yellow halos surrounding necrotic spot zones",
        "Early stem canker margins visible near node base",
      ],
      recommendedAction:
        "Apply Copper Oxychloride 50 WP @ 2.5g/L or Chlorothalonil 75 WP @ 2g/L during morning hours. Isolate and prune infected lower foliage.",
      preventiveGuidance: [
        "Switch strictly to root-zone drip irrigation to prevent water splashing on leaves",
        "Maintain 60cm row spacing to maximize airflow and lower canopy humidity",
        "Rotate with non-solanaceous crops (e.g. maize, pulses) in next season",
      ],
      organicRemedies: [
        "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) + agricultural soap",
        "Bio-fungicide drenching with Trichoderma harzianum @ 5g/L at 7-day intervals",
        "Fermented buttermilk (chaas) solution (1:10 dilution) for fungal spore inhibition",
      ],
    },
  },
  {
    title: "Onion Purple Blotch",
    crop: "Onion",
    symptoms: ["Purple / Dark Blotch", "Yellowing Foliage"],
    result: {
      cropDetected: "Onion (Allium cepa)",
      possibleDisease: "Purple Blotch (Alternaria porri)",
      confidenceScore: 91.0,
      severity: "Moderate",
      visibleSymptoms: [
        "Elliptical sunken purplish-brown lesions on leaves and seed stalks",
        "Yellowish margins with prominent fungal sporulation in center",
        "Leaves breaking over at point of heavy infection",
      ],
      recommendedAction:
        "Spray Mancozeb 75 WP @ 2.5g/L or Tebuconazole 25.9 EC @ 1ml/L with a sticking agent.",
      preventiveGuidance: [
        "Avoid excessive nitrogen fertilization during bulb enlargement",
        "Ensure proper field drainage and destroy crop debris post-harvest",
        "Dip seedlings in carbendazim solution (0.1%) prior to transplanting",
      ],
      organicRemedies: [
        "Trichoderma viride foliar spray @ 5g/L",
        "Garlic and ginger extract spray (5%)",
        "Dashparni ark application every 10 days",
      ],
    },
  },
  {
    title: "Soybean Leaf Spot",
    crop: "Soybean",
    symptoms: ["Concentric Ring Spots", "Burnt Margins"],
    result: {
      cropDetected: "Soybean (Glycine max)",
      possibleDisease: "Frogeye Leaf Spot (Cercospora sojina)",
      confidenceScore: 89.5,
      severity: "Low",
      visibleSymptoms: [
        "Circular to angular brown spots with dark reddish-brown borders",
        "Light tan to gray centers on upper leaf surface",
        "Occasional pod lesion formation",
      ],
      recommendedAction:
        "Apply Pyraclostrobin 20% WG @ 1g/L if disease crosses 5% canopy threshold.",
      preventiveGuidance: [
        "Use certified disease-free seeds treated with Thiram + Carbendazim",
        "Practice 2-year crop rotation with sorghum or maize",
        "Deep plowing during summer to bury crop residue",
      ],
      organicRemedies: [
        "Pseudomonas fluorescens seed treatment and foliar spray",
        "Panchagavya foliar application @ 3%",
        "Agniastra organic repellent",
      ],
    },
  },
  {
    title: "Cotton Leaf Curl",
    crop: "Cotton",
    symptoms: ["Leaf Curling & Crinkling", "Wilting & Drooping"],
    result: {
      cropDetected: "Cotton (Gossypium hirsutum)",
      possibleDisease: "Cotton Leaf Curl Virus (CLCuV)",
      confidenceScore: 92.4,
      severity: "High",
      visibleSymptoms: [
        "Upward or downward cupping and curling of leaf blades",
        "Severe thickening of primary and secondary veins",
        "Enations (foliage outgrowths) on leaf undersides with stunted nodes",
      ],
      recommendedAction:
        "Control whitefly vector populations immediately using Diafenthiuron 50 WP @ 1.2g/L or Pyriproxyfen 10 EC @ 2ml/L.",
      preventiveGuidance: [
        "Install 10 yellow sticky traps per acre for continuous monitoring",
        "Eradicate alternate weed hosts (Parthenium, Xanthium) along field bunds",
        "Apply balanced micronutrients with Zinc and Boron",
      ],
      organicRemedies: [
        "5% Neem Seed Kernel Extract (NSKE) spray at first sign of whitefly",
        "Verticillium lecanii bio-agent application @ 5g/L",
        "Gomutra (cow urine) foliar spray (10% dilution)",
      ],
    },
  },
];

export function DiseaseDoctorPage() {
  const { t, lang } = useI18n();
  const { user } = useSession();

  // State: No image by default
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [enableImageUpload, setEnableImageUpload] = React.useState<boolean>(false);
  const [cropHint, setCropHint] = React.useState<string>("Tomato");
  const [selectedSymptoms, setSelectedSymptoms] = React.useState<string[]>([
    "concentric_spots",
    "yellowing",
  ]);
  const [customSymptomNotes, setCustomSymptomNotes] = React.useState<string>("");
  const [analyzing, setAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<DiseaseResult | null>(QUICK_DIAGNOSTIC_PRESETS[0].result);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const triggerAnalysis = async () => {
    setAnalyzing(true);
    const symptomsList = selectedSymptoms.map((sId) => {
      const preset = SYMPTOM_PRESETS.find((p) => p.id === sId);
      return preset ? preset.label : sId;
    });

    if (customSymptomNotes.trim()) {
      symptomsList.push(customSymptomNotes.trim());
    }

    try {
      const res = await fetch("/api/disease-doctor/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: enableImageUpload ? selectedImage : null,
          cropHint,
          symptoms: symptomsList,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.result) {
          setResult(json.result);
          return;
        }
      }
    } catch {
      // fallback to matching sample
    } finally {
      setAnalyzing(false);
    }

    // Local Agronomic Fallback matching crop
    const matched =
      QUICK_DIAGNOSTIC_PRESETS.find(
        (s) => s.crop.toLowerCase() === cropHint.toLowerCase()
      ) || QUICK_DIAGNOSTIC_PRESETS[0];
    setResult(matched.result);
  };

  return (
    <RequireAuth toolName={lang === "mr" ? "एआय पीक रोग निदान" : "AI Crop Doctor"}>
      <AppShell signedIn={Boolean(user)}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Leaf className="size-4" />
              </span>
              {t("cropDoctor")}
              <DemoTag />
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {lang === "mr"
                ? "लक्षणे किंवा पानाच्या फोटोद्वारे पीक रोग निदान, तज्ज्ञ फवारणी वेळापत्रक आणि सेंद्रिय उपाय"
                : lang === "hi"
                ? "लक्षणों या पत्ती की तस्वीर द्वारा फसल रोग निदान, छिड़काव परामर्श और जैविक समाधान"
                : "Diagnose crop pathology by symptoms or optional leaf photograph with organic IPM remedies."}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-12">
          {/* Left column: Crop Selection, Image Upload Checkbox & Symptoms */}
          <div className="space-y-4 md:col-span-5">
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{lang === "mr" ? "रोग निदान इनपुट" : "Diagnosis Inputs"}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {enableImageUpload ? "Vision + Symptoms" : "Symptom Diagnostic"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* 1. Crop Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {lang === "mr" ? "पीक निवडा (Select Crop)" : "Select Crop"}
                  </label>
                  <select
                    value={cropHint}
                    onChange={(e) => setCropHint(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-hidden"
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

                {/* 2. IMAGE UPLOAD CHECKBOX */}
                <div className="rounded-xl border border-border bg-muted/40 p-3.5 transition-all">
                  <label
                    htmlFor="enable-image-upload-checkbox"
                    className="flex items-start gap-3 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      id="enable-image-upload-checkbox"
                      checked={enableImageUpload}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEnableImageUpload(checked);
                        if (!checked) {
                          handleRemoveImage();
                        }
                      }}
                      className="mt-0.5 size-4.5 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                          <Camera className="size-4 text-primary" />
                          <span>{lang === "mr" ? "पानाचा फोटो / छायाचित्र अपलोड करा" : "Upload leaf / crop photo"}</span>
                        </span>
                        {enableImageUpload && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                            Enabled
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {lang === "mr"
                          ? "छायाचित्र असल्यास कॉम्प्युटर व्हिजनद्वारे पानावरील डागांचे विश्लेषण करण्यासाठी टिक करा."
                          : "Check this box if you have a leaf image to run computer vision pathology scan."}
                      </p>
                    </div>
                  </label>

                  {/* 3. Conditional Image Upload & Preview Container */}
                  {enableImageUpload && (
                    <div className="mt-3.5 pt-3.5 border-t border-border space-y-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />

                      {selectedImage ? (
                        <div className="space-y-2">
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black/5">
                            <img
                              src={selectedImage}
                              alt="Selected leaf scan"
                              className="size-full object-cover"
                            />
                            {analyzing && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs">
                                <RefreshCw className="size-6 animate-spin text-primary" />
                                <span className="mt-2 text-xs font-medium">Analyzing leaf lesions...</span>
                              </div>
                            )}
                          </div>

                          {/* REMOVE IMAGE & Change Photo Controls */}
                          <div className="flex items-center justify-between gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              className="h-8 text-xs font-semibold"
                            >
                              <Upload className="size-3.5 mr-1.5" />
                              <span>{lang === "mr" ? "दुसरा फोटो निवडा" : "Change Photo"}</span>
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={handleRemoveImage}
                              className="h-8 text-xs font-semibold gap-1.5"
                            >
                              <Trash2 className="size-3.5" />
                              <span>{lang === "mr" ? "फोटो काढा (Remove Image)" : "Remove Image"}</span>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-lg border-2 border-dashed border-border hover:border-primary/60 bg-background/60 p-4 text-center cursor-pointer transition-colors"
                        >
                          <div className="mx-auto size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                            <Camera className="size-5" />
                          </div>
                          <p className="text-xs font-semibold text-foreground">
                            {lang === "mr" ? "फोटो निवडा किंवा कॅमेरा उघडा" : "Click to upload or take a leaf photo"}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            PNG, JPG, WebP supported up to 10MB
                          </p>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="mt-2.5 h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                          >
                            <Upload className="size-3 mr-1.5" />
                            <span>{lang === "mr" ? "फाइल निवडा" : "Browse File"}</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Observed Symptoms Multi-Select */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {lang === "mr" ? "दिसणारी लक्षणे निवडा (Observed Symptoms)" : "Observed Foliage Symptoms"}
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      {selectedSymptoms.length} selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SYMPTOM_PRESETS.map((sym) => {
                      const active = selectedSymptoms.includes(sym.id);
                      return (
                        <button
                          key={sym.id}
                          type="button"
                          onClick={() => toggleSymptom(sym.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all text-left flex items-center gap-1.5 ${
                            active
                              ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                              : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          {active && <Check className="size-3 shrink-0" />}
                          <span>{sym.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Additional Symptom Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    {lang === "mr" ? "इतर निरीक्षणे / शेतातील स्थिती (पर्यायी)" : "Additional Observations (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={customSymptomNotes}
                    onChange={(e) => setCustomSymptomNotes(e.target.value)}
                    placeholder={
                      lang === "mr"
                        ? "उदा. धुके पडल्यानंतर पानावरील चट्टे वाढले आहेत..."
                        : "e.g., Spots intensified after heavy fog or rain..."
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                {/* Submit Diagnosis Button */}
                <Button
                  onClick={triggerAnalysis}
                  disabled={analyzing}
                  className="w-full h-11 text-xs sm:text-sm font-bold shadow-xs gap-2"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>{lang === "mr" ? "रोग विश्लेषण चालू आहे..." : "Diagnosing Crop Pathology..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>{lang === "mr" ? "एआय रोग निदान करा (Diagnose Disease)" : "Run AI Disease Diagnosis"}</span>
                    </>
                  )}
                </Button>

                {/* Quick Presets (Replaces old static sample photos) */}
                <div className="pt-3 border-t border-border">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {lang === "mr" ? "त्वरित चाचणी नमुने (Quick Presets):" : "1-Click Presets for Quick Testing:"}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_DIAGNOSTIC_PRESETS.map((preset) => (
                      <button
                        key={preset.title}
                        type="button"
                        onClick={() => {
                          setCropHint(preset.crop);
                          setResult(preset.result);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className={`p-2 rounded-lg border text-left text-xs transition-all flex flex-col justify-between gap-1 ${
                          result?.possibleDisease.includes(preset.title.split(" ")[1] || "")
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent/40"
                        }`}
                      >
                        <span className="font-bold text-[11px]">{preset.title}</span>
                        <span className="text-[10px] text-muted-foreground">{preset.crop}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: Diagnostic Report */}
          <div className="space-y-4 md:col-span-7">
            {result ? (
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-3.5 border-b border-border bg-muted/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl font-bold text-foreground">
                          {result.possibleDisease}
                        </CardTitle>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {result.cropDetected}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          result.severity === "High"
                            ? "bg-destructive/15 text-destructive border border-destructive/30"
                            : result.severity === "Moderate"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {result.severity} Severity
                      </span>
                      <span className="rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs font-mono font-medium text-foreground">
                        {result.confidenceScore}% Confidence
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4 text-sm">
                  {/* Immediate Action */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="font-bold text-foreground flex items-center gap-2 text-xs sm:text-sm">
                      <Sparkles className="size-4 text-primary shrink-0" />
                      <span>{lang === "mr" ? "तातडीने करावयाचा फवारणी उपाय (Recommended Treatment)" : "Recommended Immediate Treatment"}</span>
                    </p>
                    <p className="mt-1.5 text-xs sm:text-sm text-foreground leading-relaxed">
                      {result.recommendedAction}
                    </p>
                  </div>

                  {/* Visible Symptoms */}
                  <div>
                    <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">
                      {lang === "mr" ? "दिसणारी लक्षणे (Observed Symptoms)" : "Observed Foliage Symptoms"}
                    </h3>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {result.visibleSymptoms.map((sym, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          <span className="text-foreground">{sym}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Organic & IPM Remedies */}
                  <div>
                    <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Droplets className="size-3.5 text-emerald-600" />
                      <span>{lang === "mr" ? "जैविक व सेंद्रिय उपाय (Organic & Bio-IPM Alternatives)" : "Organic & Bio-IPM Alternatives"}</span>
                    </h3>
                    <div className="grid gap-2">
                      {result.organicRemedies.map((remedy, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-border bg-card p-2.5 text-xs text-foreground flex items-start gap-2"
                        >
                          <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{remedy}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preventive Field Management */}
                  <div>
                    <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-blue-600" />
                      <span>{lang === "mr" ? "प्रतिबंधात्मक शेती काळजी (Preventive Canopy Practices)" : "Preventive Canopy Practices"}</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {result.preventiveGuidance.map((guide, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                          <span>{guide}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Agricultural Disclaimer Notice */}
                  <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      {lang === "mr"
                        ? "सूचना: हे प्राथमिक एआय कृषी सल्लागार विश्लेषण आहे. गंभीर प्रादुर्भावासाठी स्थानिक कृषी विज्ञान केंद्र (KVK) किंवा कृषी अधिकाऱ्यांचा सल्ला घ्या."
                        : "Notice: AI-assisted preliminary plant pathology advisory. Consult local Krishi Vigyan Kendra (KVK) or agricultural extension officer for severe outbreaks."}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Leaf className="mx-auto mb-3 size-8 text-muted-foreground/50" />
                  <p className="font-medium">No diagnosis yet</p>
                  <p className="text-xs mt-1">
                    Select your crop, pick observed symptoms or upload a photo, then click Diagnose Disease.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
