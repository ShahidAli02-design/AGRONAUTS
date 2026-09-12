import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  CheckCircle,
  Clock,
  ExternalLink,
  FileCheck,
  Fuel,
  Info,
  Layers,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  Tractor,
  Wrench,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/RequireAuth";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag } from "@/components/ui-bits";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Govt Schemes & Farm Tool Rentals | AGRONAUTS" },
      {
        name: "description",
        content:
          "Maharashtra agriculture government schemes (PM-KUSUM, Shettale, PMFBY) and custom hiring center (CHC) farm equipment rentals.",
      },
    ],
  }),
  component: SchemesPage,
});

interface Scheme {
  id: string;
  title: string;
  titleMr: string;
  authority: string;
  subsidy: string;
  description: string;
  eligibility: string;
  documents: string[];
  portalUrl: string;
}

const SCHEMES: Scheme[] = [
  {
    id: "kusum",
    title: "PM-KUSUM Component B (Solar Agri Pumps)",
    titleMr: "पंतप्रधान कुसुम सौर कृषी पंप योजना",
    authority: "MahaUrja / MEDA",
    subsidy: "Up to 90% Subsidy (3 HP, 5 HP, 7.5 HP)",
    description: "Off-grid standalone solar photovoltaic water pumping systems for irrigation in remote farmlands.",
    eligibility: "Farmers with source of water (borewell/well) and no electrical grid connection.",
    documents: ["7/12 Extract", "8-A Extract", "Aadhaar Card", "Bank Passbook", "Water source certificate"],
    portalUrl: "https://www.mahaurja.com/meda/",
  },
  {
    id: "shettale",
    title: "Magel Tyala Shettale (Farm Pond Scheme)",
    titleMr: "मागेल त्याला शेततळे योजना",
    authority: "Dept of Agriculture, Maharashtra",
    subsidy: "Up to ₹50,000 Direct Financial Assistance",
    description: "Permanent farm ponds with plastic lining to harvest rainwater and provide emergency protective irrigation.",
    eligibility: "Minimum 0.60 hectare land holding in Maharashtra.",
    documents: ["7/12 Extract", "Consent form for shared land", "Caste certificate (if applicable)"],
    portalUrl: "https://mahadbt.maharashtra.gov.in/",
  },
  {
    id: "pmfby",
    title: "PM Fasal Bima Yojana (One Rupee Premium Scheme)",
    titleMr: "सर्वसमावेशक प्रधानमंत्री पीक विमा योजना (१ रुपयात)",
    authority: "Ministry of Agriculture & Farmers Welfare",
    subsidy: "Farmer premium only ₹1 / acre, rest subsidized by State Govt",
    description: "Comprehensive risk coverage against localized calamities, dry spells, unseasonal rain, and pest attacks.",
    eligibility: "All loanee and non-loanee farmers cultivating notified crops.",
    documents: ["Sowing Certificate (पेरा पत्रक)", "7/12 Extract", "Bank A/c linked to Aadhaar"],
    portalUrl: "https://pmfby.gov.in/",
  },
  {
    id: "smam",
    title: "Krishi Yantrikikaran Mechanization Sub-Mission (SMAM)",
    titleMr: "कृषी यांत्रिकीकरण उप-अभियान (ट्रॅक्टर व अवजारे अनुदान)",
    authority: "MahaDBT Agriculture",
    subsidy: "40% to 50% Subsidy on Tractors, Power Tillers & Implements",
    description: "Promoting farm mechanization with direct financial grant for purchase of machinery.",
    eligibility: "Small & marginal farmers, women farmers, SC/ST categories prioritized.",
    documents: ["7/12 Extract", "8-A Extract", "Tractor quotation from authorized dealer"],
    portalUrl: "https://mahadbt.maharashtra.gov.in/",
  },
];

interface RentalTool {
  id: string;
  name: string;
  category: string;
  rate: string;
  location: string;
  specs: string;
  contact: string;
}

const RENTAL_TOOLS: RentalTool[] = [
  {
    id: "t_01",
    name: "Mahindra 575 DI (45 HP) + Rotavator",
    category: "Tractor & Tillage",
    rate: "₹750 / hour",
    location: "Nashik / Niphad CHC Hub",
    specs: "Includes skilled operator, fuel extra or included",
    contact: "+91 98224 55102",
  },
  {
    id: "t_02",
    name: "Agri-Drone Sprayer (10-Liter Precision Payload)",
    category: "Drone Spraying",
    rate: "₹350 / acre",
    location: "Baramati Krishi Vigyan Kendra",
    specs: "DGCA certified drone pilot. Covers 1 acre in 7 mins with uniform micron droplet size",
    contact: "+91 94220 18833",
  },
  {
    id: "t_03",
    name: "Automatic Multi-Crop Seed-Cum-Fertilizer Drill",
    category: "Sowing & Planting",
    rate: "₹450 / hour",
    location: "Latur Agro Equipment Cooperative",
    specs: "9-tyne precision depth and seed rate adjustment for soybean & gram",
    contact: "+91 99750 33411",
  },
];

export function SchemesPage() {
  const { t, lang } = useI18n();
  const { user } = useSession();

  const [activeTab, setActiveTab] = React.useState<"schemes" | "rentals">("schemes");
  const [rentBookingDone, setRentBookingDone] = React.useState<string | null>(null);
  const [adminSchemes, setAdminSchemes] = React.useState<Scheme[]>([]);
  const [adminRentals, setAdminRentals] = React.useState<RentalTool[]>([]);

  React.useEffect(() => {
    fetch("/api/extras/schemes")
      .then((r) => r.json())
      .then((data) => {
        const items = (data?.schemes || []).map((s: any) => ({
          id: s.id,
          title: s.name,
          titleMr: s.name,
          authority: "Added by AGRONAUTS Admin",
          subsidy: s.subsidy,
          description: s.subsidy,
          eligibility: s.eligibility,
          documents: s.documents || [],
          portalUrl: s.portalUrl,
        }));
        setAdminSchemes(items);
      })
      .catch(() => {});

    fetch("/api/extras/equipment")
      .then((r) => r.json())
      .then((data) => {
        const items = (data?.equipment || []).map((e: any) => ({
          id: e.id,
          name: e.title,
          category: "Equipment Rental",
          rate: `₹${e.dailyRate} / day`,
          location: e.location,
          specs: e.specs,
          contact: e.providerName,
        }));
        setAdminRentals(items);
      })
      .catch(() => {});
  }, []);

  const allSchemes = [...adminSchemes, ...SCHEMES];
  const allRentals = [...adminRentals, ...RENTAL_TOOLS];

  return (
    <RequireAuth toolName={lang === "mr" ? "शासकीय योजना व अवजारे" : "Govt Schemes & CHC Rentals"}>
      <AppShell signedIn={Boolean(user)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Award className="size-4" />
            </span>
            {t("schemes")}
            <DemoTag />
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "mr"
              ? "महाराष्ट्र कृषी योजना, महाडीबीटी अनुदान आणि शेती अवजारे भाडेतत्वावर केंद्र (CHC)"
              : "Subsidized government agriculture schemes & custom hiring equipment rentals"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2 border-b border-border pb-4">
        <Button
          size="sm"
          variant={activeTab === "schemes" ? "default" : "outline"}
          onClick={() => setActiveTab("schemes")}
        >
          <Award className="mr-1.5 size-3.5" />
          Government Schemes ({allSchemes.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === "rentals" ? "default" : "outline"}
          onClick={() => setActiveTab("rentals")}
        >
          <Tractor className="mr-1.5 size-3.5" />
          Equipment Rentals ({allRentals.length})
        </Button>
      </div>

      {rentBookingDone ? (
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-5 text-primary" />
            <span>Rental reservation request sent for <strong>{rentBookingDone}</strong>. CHC manager will confirm time slot via SMS/Call.</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setRentBookingDone(null)}>Dismiss</Button>
        </div>
      ) : null}

      {/* Schemes List */}
      {activeTab === "schemes" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {allSchemes.map((sch) => (
            <Card key={sch.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-primary">{sch.authority}</span>
                <CardTitle className="text-lg font-bold text-foreground">
                  {lang === "mr" ? sch.titleMr : sch.title}
                </CardTitle>
                <div className="rounded-md bg-primary/10 p-2.5 text-xs font-semibold text-primary">
                  {sch.subsidy}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm flex-1 flex flex-col justify-between">
                <p className="text-xs text-muted-foreground">{sch.description}</p>

                <div className="rounded border border-border bg-muted/30 p-2.5 text-xs space-y-1">
                  <p className="font-semibold text-foreground">Eligibility (पात्रता):</p>
                  <p className="text-muted-foreground">{sch.eligibility}</p>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-foreground">Required Documents (कागदपत्रे):</p>
                  <div className="flex flex-wrap gap-1">
                    {sch.documents.map((doc) => (
                      <span key={doc} className="rounded bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <a href={sch.portalUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5">
                      <span>Apply on MahaDBT / Portal</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Machinery & Equipment Rentals */
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {allRentals.map((tool) => (
            <Card key={tool.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-primary">{tool.category}</span>
                <CardTitle className="text-base font-bold">{tool.name}</CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="size-3" />
                  {tool.location}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{tool.rate}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tool.specs}</p>
                </div>
                <div className="pt-3">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setRentBookingDone(tool.name)}
                  >
                    Book for Farm
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
    </RequireAuth>
  );
}
