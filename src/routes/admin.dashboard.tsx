import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Sparkles,
  Layers,
  BarChart3,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useI18n } from "@/lib/i18n";
import { useSession, DEFAULT_USERS, setStoredSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingBlock } from "@/components/ui-bits";
import { AdminDashboard } from "@/views/AdminDashboard";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "APMC Admin Control Center & Live Telemetry | AGRONAUTS" },
      {
        name: "description",
        content:
          "Authoritative supervisory dashboard for Maharashtra APMC Mandis: live user roles, active produce traceability batches, escrow settlement ledger, and AI diagnostics.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { lang } = useI18n();
  const { user, profile, role, loading } = useSession();

  // 1. Loading State
  if (loading) {
    return (
      <AppShell signedIn={false}>
        <div className="mx-auto max-w-5xl py-12 px-4">
          <LoadingBlock label="Verifying APMC Administrative Credentials & Encryption Keys..." />
        </div>
      </AppShell>
    );
  }

  // 2. Unauthenticated Security Gate
  if (!user) {
    const handleQuickAdminLogin = () => {
      const adminUser = DEFAULT_USERS.find(u => u.role === "admin") || DEFAULT_USERS[3];
      const mockSupabaseUser: any = {
        id: adminUser.id,
        email: adminUser.email,
        aud: "authenticated",
        role: "authenticated",
        created_at: adminUser.created_at,
        app_metadata: { provider: "email" },
        user_metadata: {
          full_name: adminUser.full_name,
          phone: adminUser.phone,
          village: adminUser.village,
          district: adminUser.district,
          role: adminUser.role,
        },
      };

      setStoredSession({
        user: mockSupabaseUser,
        profile: {
          id: adminUser.id,
          full_name: adminUser.full_name,
          phone: adminUser.phone,
          village: adminUser.village,
          district: adminUser.district,
          language: adminUser.language,
          role: adminUser.role,
          email: adminUser.email,
        },
        role: "admin",
      });
    };

    return (
      <AppShell signedIn={false}>
        <div className="mx-auto max-w-2xl py-10 px-4">
          <Card className="border-border shadow-md overflow-hidden bg-card">
            {/* Header Banner */}
            <div className="bg-primary/10 border-b border-primary/20 p-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Lock className="size-7" />
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="size-3.5" />
                <span>APMC Maharashtra Directorate • Secure Node</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                APMC Admin Operations Portal
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Access to live platform telemetry, producer KYC directories, cryptographic produce traceability seals, and escrow financial ledgers is strictly restricted to authorized APMC Directors and State Agriculture Officers.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={handleQuickAdminLogin}
                  size="lg"
                  className="h-11 px-6 font-semibold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ShieldCheck className="size-4 mr-2" />
                  <span>Authorize as APMC Director (Demo)</span>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 px-6 font-medium">
                  <Link to="/auth">
                    <span>Sign In with Credentials</span>
                    <ArrowRight className="size-4 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Security Capabilities */}
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span>Administrative Privileges & Live Controls</span>
              </h2>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="p-3 rounded-xl border border-border/80 bg-muted/30">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <UserCheck className="size-4 text-emerald-600" />
                    <span>Live Users by Role & KYC</span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    Real-time roster of farmers, wholesale buyers, and food processors with KYC verification approvals.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-muted/30">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Layers className="size-4 text-blue-600" />
                    <span>Active Produce Batches</span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    Live audit logs of harvested lots across 14 Maharashtra Mandis with AI quality scores and QR seals.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-muted/30">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <BarChart3 className="size-4 text-purple-600" />
                    <span>Escrow Transaction Volume</span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    Settlement monitoring of buyer deposits, cold-chain escrow, and zero-commission farmer payouts.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-muted/30">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <ShieldCheck className="size-4 text-amber-600" />
                    <span>Immutable Audit Log</span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    Cryptographic activity trail recording all supervisory actions, status alterations, and price updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  // 3. Authenticated but Non-Admin Role Gate
  if (role !== "admin") {
    const handleElevateToAdmin = () => {
      const adminUser = DEFAULT_USERS.find(u => u.role === "admin") || DEFAULT_USERS[3];
      const mockSupabaseUser: any = {
        id: adminUser.id,
        email: adminUser.email,
        aud: "authenticated",
        role: "authenticated",
        created_at: adminUser.created_at,
        app_metadata: { provider: "email" },
        user_metadata: {
          full_name: adminUser.full_name,
          phone: adminUser.phone,
          village: adminUser.village,
          district: adminUser.district,
          role: adminUser.role,
        },
      };

      setStoredSession({
        user: mockSupabaseUser,
        profile: {
          id: adminUser.id,
          full_name: adminUser.full_name,
          phone: adminUser.phone,
          village: adminUser.village,
          district: adminUser.district,
          language: adminUser.language,
          role: "admin",
          email: adminUser.email,
        },
        role: "admin",
      });
    };

    return (
      <AppShell signedIn={true}>
        <div className="mx-auto max-w-2xl py-12 px-4">
          <Card className="border-border shadow-md overflow-hidden bg-card">
            <div className="bg-amber-500/10 border-b border-amber-500/20 p-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500 text-amber-950 shadow-sm">
                <ShieldAlert className="size-7" />
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <span>Access Clearance Restricted</span>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                APMC Administrator Credentials Required
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                You are currently authenticated as a{" "}
                <span className="font-semibold text-foreground capitalize">{role}</span> (
                <span className="font-medium text-foreground">{profile?.full_name}</span>). The platform control center is reserved for APMC supervisory personnel.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={handleElevateToAdmin}
                  size="lg"
                  className="h-11 px-6 font-semibold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <RefreshCw className="size-4 mr-2" />
                  <span>Switch to APMC Administrator Session</span>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 px-6 font-medium">
                  <Link to="/dashboard">
                    <span>Return to {role.toUpperCase()} Dashboard</span>
                  </Link>
                </Button>
              </div>
            </div>

            <CardContent className="p-6 text-xs text-muted-foreground flex items-center justify-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>
                To evaluate administrative features, use the switch button above to load the APMC Director profile instantly.
              </span>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  // 4. Authorized APMC Admin View
  return (
    <AppShell signedIn={true}>
      <div className="py-6">
        <AdminDashboard lang={lang} />
      </div>
    </AppShell>
  );
}
