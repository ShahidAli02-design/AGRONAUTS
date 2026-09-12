import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Droplets,
  Factory,
  History,
  MapPin,
  Phone,
  Recycle,
  Snowflake,
  Thermometer,
  Trash2,
  Truck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/RequireAuth";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag } from "@/components/ui-bits";

export const Route = createFileRoute("/cold-storage")({
  head: () => ({
    meta: [
      { title: "Cold Storage & Zero-Waste Processing | AGRONAUTS" },
      {
        name: "description",
        content:
          "Maharashtra cold storage directory with live temperature, humidity, available space, and zero-waste food processing unit routing.",
      },
    ],
  }),
  component: ColdStoragePage,
});

interface Facility {
  id: string;
  name: string;
  location: string;
  district: string;
  type: "cold_storage" | "processing_unit";
  capacityMt: number;
  availableMt: number;
  temperatureC: string;
  humidity: string;
  dailyRatePerQtl: number;
  cropsSupported: string[];
  contact: string;
}

const FACILITIES: Facility[] = [
  {
    id: "cs_01",
    name: "Nashik APMC Perishable Cold Hub",
    location: "Dindori Road, Nashik",
    district: "Nashik",
    type: "cold_storage",
    capacityMt: 1200,
    availableMt: 340,
    temperatureC: "2°C - 4°C",
    humidity: "90-95%",
    dailyRatePerQtl: 1.8,
    cropsSupported: ["Tomato", "Grapes", "Pomegranate", "Capsicum"],
    contact: "+91 253 257 8812",
  },
  {
    id: "cs_02",
    name: "Lasalgaon Solar Onion Controlled Shed",
    location: "Vinchur Sub-market, Lasalgaon",
    district: "Nashik",
    type: "cold_storage",
    capacityMt: 3500,
    availableMt: 820,
    temperatureC: "24°C - 28°C",
    humidity: "65-70%",
    dailyRatePerQtl: 0.9,
    cropsSupported: ["Onion", "Garlic"],
    contact: "+91 255 026 6420",
  },
  {
    id: "cs_03",
    name: "Baramati Mega Food Park Cold Chain",
    location: "MIDC Baramati",
    district: "Pune",
    type: "cold_storage",
    capacityMt: 2500,
    availableMt: 680,
    temperatureC: "0°C - 4°C",
    humidity: "88-92%",
    dailyRatePerQtl: 2.1,
    cropsSupported: ["Vegetables", "Fruits", "Dairy"],
    contact: "+91 211 224 3300",
  },
  {
    id: "proc_01",
    name: "Sahyadri Tomato Puree & Ketchup Unit",
    location: "Mohadi, Nashik",
    district: "Nashik",
    type: "processing_unit",
    capacityMt: 500,
    availableMt: 140,
    temperatureC: "Ambient",
    humidity: "Controlled",
    dailyRatePerQtl: 0,
    cropsSupported: ["Tomato Grade B/C", "Chilli"],
    contact: "+91 253 297 0041",
  },
  {
    id: "proc_02",
    name: "Latur Agro Soybean Processing & Oil Mills",
    location: "Old Ausa Road, Latur",
    district: "Latur",
    type: "processing_unit",
    capacityMt: 1800,
    availableMt: 450,
    temperatureC: "Dry Silo",
    humidity: "50%",
    dailyRatePerQtl: 0,
    cropsSupported: ["Soybean", "Pulses"],
    contact: "+91 238 222 1190",
  },
];

interface BookingRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityType: "cold_storage" | "processing_unit";
  district: string;
  createdAt: string;
}

const HISTORY_KEY = "agronauts.storage_booking_history";

function loadHistory(): BookingRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as BookingRecord[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(records: BookingRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
}

export function ColdStoragePage() {
  const { t, lang } = useI18n();
  const { user } = useSession();

  const [filterType, setFilterType] = React.useState<"all" | "cold_storage" | "processing_unit">("all");
  const [districtFilter, setDistrictFilter] = React.useState("all");
  const [reservedFacility, setReservedFacility] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<BookingRecord[]>([]);

  React.useEffect(() => {
    setHistory(loadHistory());
  }, []);

  function recordBooking(fac: Facility) {
    const record: BookingRecord = {
      id: "bk_" + Date.now(),
      facilityId: fac.id,
      facilityName: fac.name,
      facilityType: fac.type,
      district: fac.district,
      createdAt: new Date().toISOString(),
    };
    const next = [record, ...history];
    setHistory(next);
    saveHistory(next);
    setReservedFacility(fac.name);
  }

  function clearHistory() {
    setHistory([]);
    saveHistory([]);
  }

  const filtered = FACILITIES.filter((f) => {
    if (filterType !== "all" && f.type !== filterType) return false;
    if (districtFilter !== "all" && f.district !== districtFilter) return false;
    return true;
  });

  return (
    <RequireAuth toolName={lang === "mr" ? "शीतगृह व प्रक्रिया उद्योग" : "Cold Storage & Processing"}>
      <AppShell signedIn={Boolean(user)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Snowflake className="size-4" />
            </span>
            {t("coldStorage")}
            <DemoTag />
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "mr"
              ? "महाराष्ट्रभरातील शीतगृहे, उपलब्ध क्षमता, तापमान आणि ग्रेड बी/सी मालासाठी प्रक्रिया उद्योग"
              : "Cold storage facilities with live capacity and zero-waste food processing routing"}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
          >
            All Facilities ({FACILITIES.length})
          </Button>
          <Button
            size="sm"
            variant={filterType === "cold_storage" ? "default" : "outline"}
            onClick={() => setFilterType("cold_storage")}
          >
            <Snowflake className="mr-1.5 size-3.5" />
            Cold Storages
          </Button>
          <Button
            size="sm"
            variant={filterType === "processing_unit" ? "default" : "outline"}
            onClick={() => setFilterType("processing_unit")}
          >
            <Recycle className="mr-1.5 size-3.5" />
            Zero-Waste Processing
          </Button>
        </div>

        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
        >
          <option value="all">All Districts (सर्व जिल्हे)</option>
          <option value="Nashik">Nashik</option>
          <option value="Pune">Pune</option>
          <option value="Latur">Latur</option>
        </select>
      </div>

      {reservedFacility ? (
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-5 text-primary" />
            <span>Booking enquiry sent to <strong>{reservedFacility}</strong>. Facility manager will call you for gate-in schedule.</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setReservedFacility(null)}>Dismiss</Button>
        </div>
      ) : null}

      {/* Facilities Grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filtered.map((fac) => (
          <Card key={fac.id} className="transition-all hover:border-primary/40">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold mb-1 ${
                    fac.type === "cold_storage" ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  }`}>
                    {fac.type === "cold_storage" ? "Cold Storage" : "Processing Unit"}
                  </span>
                  <CardTitle className="text-base font-bold">{fac.name}</CardTitle>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="size-3" />
                    {fac.location}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Available Space</span>
                  <p className="text-lg font-bold text-primary">{fac.availableMt} MT</p>
                  <span className="text-[11px] text-muted-foreground">of {fac.capacityMt} MT</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Thermometer className="size-3.5 text-primary" />
                  <span>Temp: <strong className="text-foreground">{fac.temperatureC}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Droplets className="size-3.5 text-cyan-600" />
                  <span>Humidity: <strong className="text-foreground">{fac.humidity}</strong></span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {fac.cropsSupported.map((c) => (
                  <span key={c} className="rounded bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                    {c}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  {fac.dailyRatePerQtl > 0 ? `₹${fac.dailyRatePerQtl}/Qtl/day` : "Buyout on contract"}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-9"
                    onClick={() => recordBooking(fac)}
                  >
                    {fac.type === "cold_storage" ? "Reserve Space" : "Dispatch Batch"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking & Dispatch History */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold tracking-tight">
            <History className="size-4 text-primary" />
            {lang === "mr" ? "आरक्षण व पाठवणी इतिहास" : "Booking & Dispatch History"}
          </h2>
          {history.length > 0 ? (
            <Button size="sm" variant="ghost" onClick={clearHistory} className="text-xs text-muted-foreground">
              <Trash2 className="mr-1.5 size-3.5" />
              {lang === "mr" ? "इतिहास साफ करा" : "Clear history"}
            </Button>
          ) : null}
        </div>

        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {lang === "mr"
              ? "अद्याप कोणतेही आरक्षण नाही. वरील सुविधेवर \"Reserve Space\" किंवा \"Dispatch Batch\" दाबा."
              : 'No bookings yet. Click "Reserve Space" or "Dispatch Batch" on a facility above to get started.'}
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3.5 text-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      h.facilityType === "cold_storage"
                        ? "bg-cyan-500/15 text-cyan-600"
                        : "bg-emerald-500/15 text-emerald-600"
                    }`}
                  >
                    {h.facilityType === "cold_storage" ? <Snowflake className="size-4" /> : <Recycle className="size-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{h.facilityName}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.district} · {h.facilityType === "cold_storage" ? "Reservation" : "Dispatch"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground font-mono">
                  {new Date(h.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
    </RequireAuth>
  );
}
