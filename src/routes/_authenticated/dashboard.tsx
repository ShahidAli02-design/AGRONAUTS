import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Plus,
  Award,
  Camera,
  FlaskConical,
  Leaf,
  Snowflake,
  TrendingUp,
  ShieldCheck,
  Building2,
  ShoppingCart,
  Factory,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Search,
  Truck,
  Layers,
  Sparkles,
  BarChart3,
  UserCheck,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Lock,
  KeyRound,
  User as UserIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, DEFAULT_USERS, type AppRole } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { getAdvisory, type AdvisoryResult } from "@/lib/agri.functions";
import { AppShell } from "@/components/app-shell";
import { DemoTag, EmptyState, ErrorState, LoadingBlock, StatusPill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminDashboard } from "@/views/AdminDashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | AGRONAUTS" },
      {
        name: "description",
        content:
          "Your AGRONAUTS role dashboard: specialized workflows for farmers, buyers, processors and admins.",
      },
      { property: "og:title", content: "AGRONAUTS Specialized Dashboard" },
      {
        property: "og:description",
        content: "Track batches, grades, orders and earnings tailored to your role.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type BatchRow = {
  id: string;
  batch_code: string;
  crop: string;
  quantity_kg: number;
  status: string;
  grade: string | null;
  grade_score?: number | null;
  district: string;
  harvest_date: string;
  farmer_name?: string;
  farmer_id?: string | null;
};

type OrderRow = {
  id: string;
  total_amount: number;
  quantity_kg: number;
  status: string;
  created_at: string;
  buyer_id: string;
  farmer_id: string | null;
  crop?: string;
  batch_code?: string;
};

function Dashboard() {
  const { t, te, lang } = useI18n();
  const { user, profile, role, loading, switchRole, signOut } = useSession();
  const [batches, setBatches] = React.useState<BatchRow[] | null>(null);
  const [orders, setOrders] = React.useState<OrderRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [advisory, setAdvisory] = React.useState<AdvisoryResult | null>(null);
  const fetchAdvisory = useServerFn(getAdvisory);

  const activeRole: AppRole = role || "farmer";

  React.useEffect(() => {
    if (!user) return;
    let active = true;
    void (async () => {
      const batchQuery = supabase
        .from("batches")
        .select("id, batch_code, crop, quantity_kg, status, grade, grade_score, district, harvest_date, farmer_id")
        .order("created_at", { ascending: false })
        .limit(50);

      const orderQuery = supabase
        .from("orders")
        .select("id, total_amount, quantity_kg, status, created_at, buyer_id, farmer_id")
        .order("created_at", { ascending: false })
        .limit(50);

      const [{ data: b, error: be }, { data: o, error: oe }] = await Promise.all([
        batchQuery,
        orderQuery,
      ]);

      if (!active) return;
      if (be || oe) setError((be ?? oe)?.message ?? t("errorGeneric"));

      // Fallback sample batches for rich multi-role showcase if DB has few rows
      const initialBatches: BatchRow[] = (b && b.length > 0)
        ? (b as BatchRow[])
        : [
            {
              id: "b-1",
              batch_code: "PROD-2026-NASH-001",
              crop: "Red Onion",
              quantity_kg: 2400,
              status: "listed",
              grade: "Grade A",
              grade_score: 94,
              district: "Nashik",
              harvest_date: "2026-03-02",
              farmer_name: "रामदास जाधव",
              farmer_id: "demo-farmer-showcase",
            },
            {
              id: "b-2",
              batch_code: "PROD-2026-PUNE-014",
              crop: "Tomato",
              quantity_kg: 1800,
              status: "graded",
              grade: "Grade B",
              grade_score: 82,
              district: "Pune",
              harvest_date: "2026-03-03",
              farmer_name: "तुकाराम भोसले",
              farmer_id: "demo-farmer-showcase",
            },
            {
              id: "b-3",
              batch_code: "PROD-2026-LATU-009",
              crop: "Soybean",
              quantity_kg: 3500,
              status: "stored",
              grade: "Grade A",
              grade_score: 91,
              district: "Latur",
              harvest_date: "2026-02-28",
              farmer_name: "शिवाजी माने",
              farmer_id: "demo-farmer-showcase",
            },
            {
              id: "b-4",
              batch_code: "PROD-2026-SOLA-022",
              crop: "Pomegranate",
              quantity_kg: 1200,
              status: "listed",
              grade: "Grade A",
              grade_score: 96,
              district: "Solapur",
              harvest_date: "2026-03-04",
              farmer_name: "बाळासाहेब शिंदे",
              farmer_id: "demo-farmer-showcase",
            },
            {
              id: "b-5",
              batch_code: "PROD-2026-NASH-077",
              crop: "Grapes",
              quantity_kg: 2100,
              status: "graded",
              grade: "Grade B",
              grade_score: 79,
              district: "Nashik",
              harvest_date: "2026-03-01",
              farmer_name: "दत्तात्रय पाटील",
              farmer_id: "demo-farmer-showcase",
            },
          ];

      const initialOrders: OrderRow[] = (o && o.length > 0)
        ? (o as OrderRow[])
        : [
            {
              id: "ord-101",
              total_amount: 57600,
              quantity_kg: 2400,
              status: "completed",
              created_at: "2026-03-02T14:20:00Z",
              buyer_id: "usr-buyer-1",
              farmer_id: "usr-farmer-1",
              crop: "Red Onion",
              batch_code: "PROD-2026-NASH-001",
            },
            {
              id: "ord-102",
              total_amount: 32400,
              quantity_kg: 1800,
              status: "shipped",
              created_at: "2026-03-03T16:00:00Z",
              buyer_id: "usr-processor-1",
              farmer_id: "usr-farmer-1",
              crop: "Tomato",
              batch_code: "PROD-2026-PUNE-014",
            },
          ];

      setBatches(initialBatches);
      setOrders(initialOrders);
    })();
    return () => {
      active = false;
    };
  }, [user, role, t]);

  React.useEffect(() => {
    void fetchAdvisory({ data: { district: profile?.district ?? "Nashik" } })
      .then(setAdvisory)
      .catch(() => setAdvisory(null));
  }, [fetchAdvisory, profile?.district]);

  if (loading) {
    return (
      <AppShell signedIn>
        <LoadingBlock label={t("loading")} />
      </AppShell>
    );
  }

  // Strict Login Gate: Users require specific dashboard access by login
  if (!user) {
    return (
      <AppShell signedIn={false}>
        <div className="mx-auto max-w-4xl py-8 px-4">
          <Card className="border-border shadow-md bg-card overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border pb-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Lock className="size-6" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                    {lang === "mr" ? "विशिष्ट डॅशबोर्ड प्रवेशासाठी लॉगिन आवश्यक" : "Specific Dashboard Access by Verified Login"}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    {lang === "mr"
                      ? "प्रत्येक भूमिकेसाठी (शेतकरी, खरेदीदार, प्रक्रियादार, प्रशासक) स्वतंत्र डॅशबोर्ड व खाजगी डेटा आहे. कृपया खात्यात लॉगिन करा."
                      : "Each user role (Farmer, Buyer, Food Processor, Admin) has a dedicated isolated dashboard. Sign in with your verified credentials to access your specific workspace."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-primary" />
                  <span>{lang === "mr" ? "भूमिका निवडून थेट लॉगिन करा (Select Role to Sign In):" : "Select Role to Sign In Directly:"}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {DEFAULT_USERS.map((u) => {
                    const roleBadge =
                      u.role === "farmer"
                        ? "🌱 Farmer (शेतकरी)"
                        : u.role === "buyer"
                        ? "🛒 Wholesale Buyer (खरेदीदार)"
                        : u.role === "processor"
                        ? "🏭 Food Processor (प्रक्रिया उद्योग)"
                        : "🏛️ APMC Admin (प्रशासक)";
                    const roleDesc =
                      u.role === "farmer"
                        ? "Harvest batches, optical grading, disease doctor & mandis"
                        : u.role === "buyer"
                        ? "Bulk procurement, escrow bidding & order tracking"
                        : u.role === "processor"
                        ? "Cold storage telemetry & processing raw intake"
                        : "Ecosystem operations, KYC audit & ledger supervision";
                    return (
                      <div
                        key={u.id}
                        className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-all flex flex-col justify-between space-y-3 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-foreground">{roleBadge}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {u.district}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-foreground mt-1">{u.full_name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{roleDesc}</p>
                          <div className="mt-2 text-[11px] font-mono text-muted-foreground bg-muted/50 rounded px-2 py-1 flex items-center justify-between">
                            <span>{u.email}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">Verified</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => switchRole(u.role)}
                          className="w-full h-9 text-xs font-semibold shadow-xs"
                        >
                          <UserCheck className="size-3.5 mr-1.5" />
                          <span>Login as {u.role.toUpperCase()}</span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">
                  {lang === "mr" ? "नवीन खाते तयार करायचे आहे किंवा पासवर्डने लॉगिन करायचे आहे?" : "Have custom credentials or need to register a new account?"}
                </span>
                <Button asChild variant="outline" className="h-9 text-xs font-semibold">
                  <Link to="/auth">
                    <UserIcon className="size-3.5 mr-1.5" />
                    <span>Go to Login / Registration Page</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell signedIn>
      {/* Logged-in User Credentials & Identity Panel (Replaces messy role workspace) */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
              activeRole === "farmer"
                ? "bg-emerald-600 text-white"
                : activeRole === "buyer"
                ? "bg-blue-600 text-white"
                : activeRole === "processor"
                ? "bg-purple-600 text-white"
                : "bg-amber-600 text-white"
            }`}>
              {activeRole === "farmer" && <Leaf className="size-6" />}
              {activeRole === "buyer" && <ShoppingCart className="size-6" />}
              {activeRole === "processor" && <Building2 className="size-6" />}
              {activeRole === "admin" && <ShieldCheck className="size-6" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  {profile?.full_name || user?.email}
                </h1>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                  activeRole === "farmer"
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    : activeRole === "buyer"
                    ? "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300"
                    : activeRole === "processor"
                    ? "bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-300"
                    : "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300"
                }`}>
                  <span className="size-1.5 rounded-full bg-current animate-pulse" />
                  {activeRole === "farmer" && "🌱 Producer / शेतकरी"}
                  {activeRole === "buyer" && "🛒 Wholesale Buyer / खरेदीदार"}
                  {activeRole === "processor" && "🏭 Agro-Processor / प्रक्रियादार"}
                  {activeRole === "admin" && "🏛️ APMC Administrator / प्रशासक"}
                </span>
                <span className="rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                  UID: {profile?.id || user?.id || "verified-session"}
                </span>
              </div>

              {/* Login Credentials & Contact Strip */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-mono">
                  <Mail className="size-3 text-muted-foreground" />
                  <span className="text-foreground font-medium">{user?.email || "farmer@agronauts.in"}</span>
                </span>
                {profile?.phone && (
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Phone className="size-3 text-muted-foreground" />
                    <span>+91 {profile.phone}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3 text-muted-foreground" />
                  <span>
                    {profile?.village ? `${te(profile.village)}, ` : ""}
                    {profile?.district ? te(profile.district) : te("Nashik")}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-3" />
                  <span>Verified Active Session</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action & Sign Out Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {activeRole === "farmer" && (
              <Button asChild className="h-10 px-4 text-xs font-semibold shadow-xs">
                <Link to="/batches/new">
                  <Plus className="size-4 mr-1.5" aria-hidden="true" />
                  {t("newBatch")}
                </Link>
              </Button>
            )}
            {activeRole === "buyer" && (
              <Button asChild className="h-10 px-4 text-xs font-semibold shadow-xs">
                <Link to="/marketplace">
                  <ShoppingCart className="size-4 mr-1.5" aria-hidden="true" />
                  {t("marketplace")}
                </Link>
              </Button>
            )}
            {activeRole === "processor" && (
              <Button asChild className="h-10 px-4 text-xs font-semibold shadow-xs">
                <Link to="/cold-storage">
                  <Snowflake className="size-4 mr-1.5" aria-hidden="true" />
                  {t("coldStorage")}
                </Link>
              </Button>
            )}
            {activeRole === "admin" && (
              <Button asChild className="h-10 px-4 text-xs font-semibold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link to="/admin/dashboard">
                  <ShieldCheck className="size-4 mr-1.5" aria-hidden="true" />
                  <span>Open Admin Control Center</span>
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void signOut()}
              className="h-10 px-3.5 gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Sign out of this role account"
            >
              <LogOut className="size-3.5" />
              <span>{t("signOut")} / Switch</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Launch Smart Tools Strip */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider shrink-0">
          Smart Agronomic Tools:
        </span>
        <Link
          to="/disease-doctor"
          className="inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground hover:border-primary hover:bg-accent transition-colors"
        >
          <Leaf className="size-3.5 text-emerald-600" />
          <span>{t("cropDoctor")}</span>
        </Link>
        <Link
          to="/soil-health"
          className="inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground hover:border-primary hover:bg-accent transition-colors"
        >
          <FlaskConical className="size-3.5 text-amber-500" />
          <span>{t("soilHealth")}</span>
        </Link>
        <Link
          to="/yield-predictor"
          className="inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground hover:border-primary hover:bg-accent transition-colors"
        >
          <TrendingUp className="size-3.5 text-blue-500" />
          <span>{t("yieldPredictor")}</span>
        </Link>
        <Link
          to="/cold-storage"
          className="inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground hover:border-primary hover:bg-accent transition-colors"
        >
          <Snowflake className="size-3.5 text-cyan-500" />
          <span>{t("coldStorage")}</span>
        </Link>
        <Link
          to="/schemes"
          className="inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground hover:border-primary hover:bg-accent transition-colors"
        >
          <Award className="size-3.5 text-purple-500" />
          <span>{t("schemes")}</span>
        </Link>
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} />
        </div>
      ) : null}

      {/* RENDER SPECIFIC DASHBOARD VIEW FOR THE SELECTED ROLE */}
      {activeRole === "farmer" && (
        <FarmerDashboardView
          batches={batches}
          orders={orders}
          advisory={advisory}
          farmerId={user?.id ?? ""}
          t={t}
          te={te}
        />
      )}

      {activeRole === "buyer" && (
        <BuyerDashboardView
          batches={batches}
          orders={orders}
          advisory={advisory}
          buyerId={user?.id ?? ""}
          t={t}
          te={te}
        />
      )}

      {activeRole === "processor" && (
        <ProcessorDashboardView
          batches={batches}
          orders={orders}
          advisory={advisory}
          processorId={user?.id ?? ""}
          t={t}
          te={te}
        />
      )}

      {activeRole === "admin" && (
        <AdminDashboardView
          batches={batches}
          orders={orders}
          advisory={advisory}
          t={t}
          te={te}
        />
      )}
    </AppShell>
  );
}

// -------------------------------------------------------------
// 1. FARMER DASHBOARD (कापणी, बॅच ट्रैसेबिलिटी, शेताचे उत्पन्न)
// -------------------------------------------------------------
function FarmerDashboardView({
  batches,
  orders,
  advisory,
  farmerId,
  t,
  te,
}: {
  batches: BatchRow[] | null;
  orders: OrderRow[] | null;
  advisory: AdvisoryResult | null;
  farmerId: string;
  t: (k: string) => string;
  te: (v: string | null | undefined) => string;
}) {
  // Every account shares the same demo database, so "my batches/orders" must
  // be scoped to this farmer's own id — otherwise a brand-new account would
  // show every other farmer's (and every demo seed) batch as its own.
  const myBatches = (batches ?? []).filter((b) => b.farmer_id === farmerId);
  const myOrders = (orders ?? []).filter((o) => o.farmer_id === farmerId);

  const totalWeightKg = myBatches.reduce((acc, b) => acc + Number(b.quantity_kg), 0);
  const aGradeBatches = myBatches.filter((b) => b.grade === "Grade A" || b.grade === "A").length;
  const earnings = myOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="space-y-8 mt-6">
      {/* 4 Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Layers className="size-4 text-emerald-600" />}
          label={t("batches")}
          value={`${myBatches.length}`}
          sub="Logged with unique QR codes"
        />
        <StatCard
          icon={<ScaleIcon className="size-4 text-primary" />}
          label="Total Harvested"
          value={`${(totalWeightKg / 1000).toFixed(1)} Tons`}
          sub="Across all plots"
        />
        <StatCard
          icon={<Award className="size-4 text-amber-500" />}
          label="Grade A Premium Lots"
          value={`${aGradeBatches} Lots`}
          sub="Eligible for top Mandi prices"
          good
        />
        <StatCard
          icon={<TrendingUp className="size-4 text-blue-500" />}
          label={t("earnings")}
          value={`₹${earnings.toLocaleString("en-IN")}`}
          sub="From verified orders"
        />
      </div>

      {/* Farmer Smart Tools Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <Link
          to="/batches/new"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-primary hover:bg-accent/40 transition-all text-center gap-1.5 shadow-2xs"
        >
          <span className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Plus className="size-4" />
          </span>
          <span className="text-xs font-bold text-foreground">{t("newBatch")}</span>
          <span className="text-[10px] text-muted-foreground">कापणी नोंदवा</span>
        </Link>

        <Link
          to="/quality-detector"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-emerald-500 hover:bg-accent/40 transition-all text-center gap-1.5 shadow-2xs"
        >
          <span className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Camera className="size-4" />
          </span>
          <span className="text-xs font-bold text-foreground">{t("qualityDetector")}</span>
          <span className="text-[10px] text-muted-foreground">कॅमेरा प्रतवारी तपासणी</span>
        </Link>

        <Link
          to="/disease-doctor"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-primary hover:bg-accent/40 transition-all text-center gap-1.5 shadow-2xs"
        >
          <span className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="size-4" />
          </span>
          <span className="text-xs font-bold text-foreground">{t("cropDoctor")}</span>
          <span className="text-[10px] text-muted-foreground">रोग निदान स्कॅन</span>
        </Link>

        <Link
          to="/soil-health"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-primary hover:bg-accent/40 transition-all text-center gap-1.5 shadow-2xs"
        >
          <span className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
            <FlaskConical className="size-4" />
          </span>
          <span className="text-xs font-bold text-foreground">{t("soilHealth")}</span>
          <span className="text-[10px] text-muted-foreground">माती परीक्षण</span>
        </Link>

        <Link
          to="/yield-predictor"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-primary hover:bg-accent/40 transition-all text-center gap-1.5 shadow-2xs"
        >
          <span className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
            <TrendingUp className="size-4" />
          </span>
          <span className="text-xs font-bold text-foreground">{t("yieldPredictor")}</span>
          <span className="text-[10px] text-muted-foreground">उत्पादन अंदाज</span>
        </Link>

        <Link
          to="/cold-storage"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-primary hover:bg-accent/40 transition-all text-center gap-1.5 shadow-2xs"
        >
          <span className="size-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600">
            <Snowflake className="size-4" />
          </span>
          <span className="text-xs font-bold text-foreground">{t("coldStorage")}</span>
          <span className="text-[10px] text-muted-foreground">कांदा चाळ व गोदाम</span>
        </Link>

        <Link
          to="/schemes"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-primary hover:bg-accent/40 transition-all text-center gap-1.5 shadow-2xs"
        >
          <span className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
            <Award className="size-4" />
          </span>
          <span className="text-xs font-bold text-foreground">{t("schemes")}</span>
          <span className="text-[10px] text-muted-foreground">महाडीबीटी व यंत्रे</span>
        </Link>
      </div>

      {/* Main Grid: Batches on Left, Weather & Mandi on Right */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <span>{t("batches")}</span>
            </h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/batches/new">{t("newBatch")}</Link>
            </Button>
          </div>

          {!batches ? <LoadingBlock label={t("loading")} /> : null}
          {batches && myBatches.length === 0 ? (
            <EmptyState
              title={t("noBatches")}
              hint="Tap the New harvest batch button above to get your first batch ID."
            />
          ) : null}

          <div className="space-y-3">
            {myBatches.map((b) => (
              <Link
                key={b.id}
                to="/batches/$id"
                params={{ id: b.id }}
                className="block rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground flex items-center gap-2 text-base">
                      <span>{te(b.crop)}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        · {b.quantity_kg.toLocaleString("en-IN")} kg
                      </span>
                    </p>
                    <p className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                      <span>ID: {b.batch_code}</span>
                      <span>·</span>
                      <span>{te(b.district)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.grade ? (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        {te(b.grade)} {b.grade_score ? `(${b.grade_score} pts)` : ""}
                      </span>
                    ) : null}
                    <StatusPill status={b.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar: Live Mandi & Weather */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <span>{t("weather")}</span>
                <DemoTag />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {advisory ? (
                <>
                  <p className="text-3xl font-bold text-foreground">
                    {advisory.weather.tempC}°C
                  </p>
                  <p className="font-medium text-muted-foreground">
                    {advisory.weather.summary}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rain probability: {advisory.weather.rainChance}% · District: {te(advisory.weather.district)}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">{t("loading")}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <span>{t("marketPrices")}</span>
                <DemoTag />
              </CardTitle>
              <CardDescription className="text-xs">
                Live modal prices across Maharashtra APMC mandis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm pt-2">
              {(advisory?.prices ?? []).map((p) => (
                <div
                  key={p.crop}
                  className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0"
                >
                  <div>
                    <span className="font-medium text-foreground">{te(p.crop)}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">
                      · {te(p.mandi)}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-600">₹{p.modalRs}/kg</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. BUYER DASHBOARD (व्यापारी, FMCG, घाऊक खरेदी व पडताळणी)
// -------------------------------------------------------------
function BuyerDashboardView({
  batches,
  orders,
  advisory,
  buyerId,
  t,
  te,
}: {
  batches: BatchRow[] | null;
  orders: OrderRow[] | null;
  advisory: AdvisoryResult | null;
  buyerId: string;
  t: (k: string) => string;
  te: (v: string | null | undefined) => string;
}) {
  // The marketplace listing (availableLots) is intentionally global — every
  // buyer should browse all sellable lots. Orders/spend, however, must be
  // scoped to this buyer's own purchases, not every buyer sharing the demo DB.
  const availableLots = (batches ?? []).filter((b) => b.status === "listed" || b.status === "graded");
  const myOrders = (orders ?? []).filter((o) => o.buyer_id === buyerId);
  const totalProcuredSpend = myOrders.reduce((acc, o) => acc + Number(o.total_amount), 0);

  return (
    <div className="space-y-8 mt-6">
      {/* 4 Metrics for Buyer */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ShoppingCart className="size-4 text-emerald-600" />}
          label="Available Graded Lots"
          value={`${availableLots.length} Lots`}
          sub="Direct from Nashik & Pune"
          good
        />
        <StatCard
          icon={<Truck className="size-4 text-blue-500" />}
          label="Active Procurements"
          value={`${myOrders.length} Orders`}
          sub="Tracked from farm to hub"
        />
        <StatCard
          icon={<ShieldCheck className="size-4 text-emerald-600" />}
          label="Traceability Rate"
          value="100%"
          sub="Every lot has QR proof"
          good
        />
        <StatCard
          icon={<TrendingUp className="size-4 text-primary" />}
          label="Total Procurement"
          value={`₹${totalProcuredSpend.toLocaleString("en-IN")}`}
          sub="Zero middleman margin"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Curated Graded Produce for Buyer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <Award className="size-4 text-primary" />
                <span>Curated Verified Lots (Grade A & B)</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Inspected by computer vision with origin farm GPS coordinates
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/marketplace">View Marketplace</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {availableLots.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-2xs hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-base">{te(b.crop)}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{b.batch_code}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    {te(b.grade || "Grade A")}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>Farmer: <span className="text-foreground font-medium">{b.farmer_name || "रामदास जाधव"}</span></p>
                  <p>Location: <span className="text-foreground font-medium">{te(b.district)}, Maharashtra</span></p>
                  <p>Lot Size: <span className="text-foreground font-semibold text-sm">{b.quantity_kg} kg</span></p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <Button asChild size="sm" className="w-full h-9">
                    <Link to="/marketplace">{t("buyNow")}</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-9">
                    <Link to="/trace/$code" params={{ code: b.batch_code }}>
                      {t("traceability")}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Orders Tracker for Buyer */}
          <div className="mt-8 space-y-3">
            <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
              <Truck className="size-4 text-blue-500" />
              <span>Active Orders & Shipments</span>
            </h3>
            {myOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No orders placed yet.
              </div>
            ) : (
              <div className="space-y-2">
                {myOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-card p-3.5 text-sm"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">
                        Order #{o.id} · {o.crop ? te(o.crop) : te("Red Onion")}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        Lot {o.batch_code || "PROD-2026-NASH-001"} · {o.quantity_kg} kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">₹{Number(o.total_amount).toLocaleString("en-IN")}</p>
                      <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 capitalize">
                        {te(o.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Mandi Price Benchmark for Procurement */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                <span>APMC Benchmark Pricing</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Compare direct farm gate offers against APMC wholesale mandi rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {(advisory?.prices ?? []).map((p) => (
                <div
                  key={p.crop}
                  className="rounded-lg border border-border/70 p-2.5 bg-accent/20"
                >
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>{te(p.crop)}</span>
                    <span className="text-emerald-600">₹{p.modalRs}/kg</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                    <span>Mandi: {te(p.mandi)}</span>
                    <span>Direct Farm Margin: ~12% savings</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>Quality Verification Guarantee</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground">
              <p className="flex items-center gap-1.5 text-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Digital moisture & size uniformity audit per lot.</span>
              </p>
              <p className="flex items-center gap-1.5 text-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Escrow payment release upon physical warehouse delivery.</span>
              </p>
              <p className="flex items-center gap-1.5 text-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Instant batch QR certificate for retail customer packaging.</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. PROCESSOR DASHBOARD (फळप्रक्रिया, पल्प, डिहायड्रेशन, शीतगृह)
// -------------------------------------------------------------
function ProcessorDashboardView({
  batches,
  orders,
  advisory,
  processorId,
  t,
  te,
}: {
  batches: BatchRow[] | null;
  orders: OrderRow[] | null;
  advisory: AdvisoryResult | null;
  processorId: string;
  t: (k: string) => string;
  te: (v: string | null | undefined) => string;
}) {
  const gradeBLots = (batches ?? []).filter((b) => b.grade === "Grade B" || b.grade === "B" || b.grade === "Grade C");
  const myOrders = (orders ?? []).filter((o) => o.buyer_id === processorId);

  return (
    <div className="space-y-8 mt-6">
      {/* Processor Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Factory className="size-4 text-purple-600" />}
          label="Processing Lots Sourced"
          value="48.5 Tons"
          sub="Grade B/C Tomato, Onion, Pomegranate"
        />
        <StatCard
          icon={<Snowflake className="size-4 text-cyan-600" />}
          label="Cold Storage Booked"
          value="1,200 Crates"
          sub="Baramati & Lasalgaon Chambers"
          good
        />
        <StatCard
          icon={<TrendingUp className="size-4 text-emerald-600" />}
          label="Raw Material Discount"
          value="32% Lower"
          sub="Compared to fresh retail auction"
          good
        />
        <StatCard
          icon={<Award className="size-4 text-amber-500" />}
          label="Zero-Waste Conversion"
          value="98.2%"
          sub="Converted to puree & powder"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Secondary Produce Exchange */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <Factory className="size-4 text-purple-600" />
                <span>Available Secondary Lots for Value Addition</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Grade B & C lots suitable for puree, pulp, dehydration and food processing
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/cold-storage">Manage Storage</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {gradeBLots.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      {te(b.crop)} · {b.quantity_kg.toLocaleString("en-IN")} kg
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      Batch: {b.batch_code} · {te(b.district)}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    {te(b.grade || "Grade B")} (Processing Grade)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended Industry Process:{" "}
                  <span className="font-semibold text-foreground">
                    {(b.crop || "").toLowerCase().includes("onion")
                      ? "Dehydration to Flakes & Onion Powder"
                      : (b.crop || "").toLowerCase().includes("tomato")
                      ? "Aseptic Tomato Paste & Puree (28-30° Brix)"
                      : "Cold Pressed Fruit Pulp & Concentrate"}
                  </span>
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <Button asChild size="sm" className="h-9">
                    <Link to="/marketplace">Contract Lot at ₹18/kg</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-9">
                    <Link to="/cold-storage">Reserve Chamber Slot</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cold Storage & Processing Schedule */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Snowflake className="size-4 text-cyan-600" />
                <span>Cold Chamber Telemetry</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-accent/30 space-y-1">
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Chamber #2 (Lasalgaon)</span>
                  <span className="text-emerald-600 font-bold">2.4°C · 68% RH</span>
                </div>
                <p className="text-muted-foreground">Holding: 600 Crates Red Onion</p>
                <p className="text-emerald-700 font-medium">Shelf life preserved: +60 days</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-accent/30 space-y-1">
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Chamber #5 (Baramati)</span>
                  <span className="text-emerald-600 font-bold">4.0°C · 85% RH</span>
                </div>
                <p className="text-muted-foreground">Holding: 450 Crates Processing Tomatoes</p>
                <p className="text-emerald-700 font-medium">Pre-cooling in progress</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <span>FPO Direct Procurement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground">
              <p>
                Contract directly with Farmer Producer Organizations (FPOs) in Nashik and Pune to guarantee steady factory raw material supply.
              </p>
              <Button asChild variant="outline" size="sm" className="w-full mt-2">
                <Link to="/schemes">View Food Processing Subsidies</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Processing Order History */}
      <div className="space-y-3">
        <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
          <Truck className="size-4 text-purple-600" />
          <span>Processing Order History</span>
        </h3>
        {myOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No processing orders placed yet. Contract a lot above to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {myOrders.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-card p-3.5 text-sm"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">
                    Order #{o.id} · {o.crop ? te(o.crop) : te("Red Onion")}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Lot {o.batch_code || "PROD-2026-NASH-001"} · {o.quantity_kg} kg
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">₹{Number(o.total_amount).toLocaleString("en-IN")}</p>
                  <span className="inline-flex rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-700 capitalize">
                    {te(o.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. ADMIN DASHBOARD (APMC प्रशासक, कृषी पर्यवेक्षक व ऑडिट)
// -------------------------------------------------------------
function AdminDashboardView({
  batches,
  orders,
  advisory,
  t,
  te,
}: {
  batches: BatchRow[] | null;
  orders: OrderRow[] | null;
  advisory: AdvisoryResult | null;
  t: (k: string) => string;
  te: (v: string | null | undefined) => string;
}) {
  return <AdminDashboard batches={batches ?? []} orders={orders ?? []} />;
}

// Reusable Stat Card
function StatCard({
  icon,
  label,
  value,
  sub,
  good,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  good?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-1">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase font-semibold tracking-wide">{label}</span>
        {icon}
      </div>
      <p className={`text-2xl font-bold tracking-tight ${good ? "text-emerald-600" : "text-foreground"}`}>
        {value}
      </p>
      {sub ? <p className="text-[11px] text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function ScaleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}
