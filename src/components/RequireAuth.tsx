import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  Lock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Leaf,
  FlaskConical,
  TrendingUp,
  Snowflake,
  Award,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingBlock } from "@/components/ui-bits";

interface RequireAuthProps {
  children: React.ReactNode;
  toolName?: string;
  toolDescription?: string;
}

export function RequireAuth({ children, toolName, toolDescription }: RequireAuthProps) {
  const { t, lang } = useI18n();
  const { user, loading } = useSession();

  if (loading) {
    return (
      <AppShell signedIn={false}>
        <LoadingBlock label={t("loading")} />
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell signedIn={false}>
        <div className="mx-auto max-w-2xl py-8 px-4">
          <Card className="border-border shadow-md overflow-hidden bg-card">
            {/* Header Banner */}
            <div className="bg-primary/10 border-b border-primary/20 p-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Lock className="size-7" />
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="size-3.5" />
                <span>{lang === "mr" ? "गोपनीय व सुरक्षित कृषी कार्यक्षेत्र" : "Private & Secure Agronomic Workspace"}</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {lang === "mr"
                  ? `${toolName ? toolName + " वापरण्यासाठी " : ""}लॉगिन आवश्यक आहे`
                  : `Sign In to Access ${toolName || "Smart Agronomic Tools"}`}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {toolDescription ||
                  (lang === "mr"
                    ? "स्मार्ट कृषी साधने (पीक रोग निदान, माती आरोग्य, उत्पादन अंदाज आणि शीतगृह) वापरण्यासाठी आणि आपला शेती डेटा गोपनीय ठेवण्यासाठी कृपया प्रथम लॉगिन करा."
                    : "AI Crop Diagnostics, Soil Health, Yield Forecasts, and Cold Storage bookings are private agricultural workspaces. Please sign in to protect your farm data and access these tools.")}
              </p>

              {/* Direct Auth Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="h-11 px-6 font-semibold shadow-xs">
                  <Link to="/auth">
                    <span>{t("signIn")}</span>
                    <ArrowRight className="size-4 ml-1.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 px-6 font-medium">
                  <Link to="/auth">
                    <span>{t("signUp")}</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Privacy & Feature Highlights */}
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span>{lang === "mr" ? "खात्यात काय उपलब्ध होते?" : "What you unlock after signing in"}</span>
              </h2>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-xl border border-border/80 bg-muted/30">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                    <Leaf className="size-3.5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {lang === "mr" ? "एआय पीक रोग निदान" : "AI Crop Doctor"}
                    </h3>
                    <p className="text-muted-foreground mt-0.5">
                      {lang === "mr" ? "पानावरील रोगाचे छायाचित्राद्वारे अचूक निदान व सेंद्रिय उपाय" : "Photo leaf pathology and IPM remedies"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl border border-border/80 bg-muted/30">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
                    <FlaskConical className="size-3.5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {lang === "mr" ? "माती परीक्षण व खत मात्रा" : "Soil Health & N-P-K"}
                    </h3>
                    <p className="text-muted-foreground mt-0.5">
                      {lang === "mr" ? "जिल्हावार मातीचे पोषण व युरिया/डीएपी/एमओपी कॅल्क्युलेटर" : "Custom fertilizer dosages for your farm"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl border border-border/80 bg-muted/30">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600">
                    <TrendingUp className="size-3.5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {lang === "mr" ? "उत्पादन व महसूल अंदाज" : "Yield & Revenue Predictor"}
                    </h3>
                    <p className="text-muted-foreground mt-0.5">
                      {lang === "mr" ? "हवामान व क्षेत्रानुसार उत्पादन टन आणि अपेक्षित नफा" : "Tonnage forecasting and market price valuation"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl border border-border/80 bg-muted/30">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-600">
                    <Snowflake className="size-3.5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {lang === "mr" ? "शीतगृह व प्रक्रिया उद्योग" : "Cold Storage & Processing"}
                    </h3>
                    <p className="text-muted-foreground mt-0.5">
                      {lang === "mr" ? "महाराष्ट्र शीतगृह जागा आणि बी/सी ग्रेड प्रक्रिया युनिट्स" : "Reserve storage slots & zero-waste food routing"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>
                  {lang === "mr"
                    ? "आपला सर्व डेटा सुरक्षित असून केवळ आपल्या खात्यातच उपलब्ध राहील."
                    : "Your agricultural telemetry and farm records are encrypted and private."}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return <>{children}</>;
}
