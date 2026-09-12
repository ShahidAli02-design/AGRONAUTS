import * as React from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ShapeGrid } from "./ShapeGrid";
import {
  Award,
  FlaskConical,
  Leaf,
  LogOut,
  Mic,
  PieChart,
  Recycle,
  Snowflake,
  Sparkles,
  Store,
  TrendingUp,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, langLabels, type Lang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VoiceModal } from "./VoiceModal";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language">
      {(Object.keys(langLabels) as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            lang === l
              ? "bg-primary text-primary-foreground font-semibold shadow-xs"
              : "bg-secondary text-secondary-foreground hover:bg-accent",
          )}
        >
          {langLabels[l]}
        </button>
      ))}
    </div>
  );
}

export function AppShell({
  children,
  signedIn,
}: {
  children: React.ReactNode;
  signedIn?: boolean;
}) {
  const { t, lang } = useI18n();
  const { user, profile, role, signOut } = useSession();
  const navigate = useNavigate();
  const [isVoiceOpen, setIsVoiceOpen] = React.useState(false);

  const isUserSignedIn = signedIn !== undefined ? signedIn : Boolean(user);

  async function handleSignOut() {
    await signOut();
    void navigate({ to: "/", replace: true });
  }

  const handleVoiceTabNavigate = (tab: string) => {
    setIsVoiceOpen(false);
    if (tab === "diseaseDetection" || tab === "doctor") {
      void navigate({ to: "/disease-doctor" });
    } else if (tab === "qualityGrading" || tab === "quality" || tab === "qualityDetector" || tab === "grading") {
      void navigate({ to: "/quality-detector" });
    } else if (tab === "soilHealth" || tab === "soil") {
      void navigate({ to: "/soil-health" });
    } else if (tab === "yieldPrediction" || tab === "yield") {
      void navigate({ to: "/yield-predictor" });
    } else if (tab === "storage" || tab === "inventory" || tab === "coldStorage") {
      void navigate({ to: "/cold-storage" });
    } else if (tab === "schemes" || tab === "rentals") {
      void navigate({ to: "/schemes" });
    } else if (tab === "marketplace") {
      void navigate({ to: "/marketplace" });
    } else if (tab === "dashboard") {
      void navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      {/* Ambient shape-grid background, sits behind everything on every non-video page */}
      <ShapeGrid
        className="pointer-events-none fixed inset-0 -z-10"
        speed={0.25}
        squareSize={40}
        direction="diagonal"
        shape="triangle"
        size={28}
        hoverTrailAmount={5}
      />

      {/* Primary Top Header */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-card/95 backdrop-blur shadow-xs">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm ring-1 ring-primary/20">
              <Leaf className="size-4" aria-hidden="true" />
            </span>
            <span className="text-lg tracking-tight font-black font-[family-name:var(--font-display)]">{t("appName")}</span>
          </Link>

          <nav className="flex items-center gap-1.5 text-sm">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVoiceOpen(true)}
              className="h-8 gap-1.5 border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary font-medium"
              title="Voice Assistant (मराठी / हिन्दी / English)"
            >
              <Mic className="size-3.5 animate-pulse text-primary" />
              <span>{t("voiceAssistant")}</span>
            </Button>

            <Link
              to="/marketplace"
              className="rounded-md px-2.5 py-1 text-muted-foreground hover:bg-accent hover:text-foreground font-medium"
            >
              {t("marketplace")}
            </Link>

            {isUserSignedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  <span>
                    {role === "farmer"
                      ? "🌱"
                      : role === "buyer"
                      ? "🛒"
                      : role === "processor"
                      ? "🏭"
                      : "🏛️"}
                  </span>
                  <span className="hidden sm:inline font-medium">
                    {profile?.full_name?.split(" ")[0] || t(role || "farmer")}
                  </span>
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-md px-2.5 py-1 text-muted-foreground hover:bg-accent hover:text-foreground font-medium"
                >
                  {t("dashboard")}
                </Link>
                {role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                  >
                    <ShieldCheck className="size-3.5" />
                    <span>Admin Portal</span>
                  </Link>
                )}
                <Link
                  to="/orders"
                  className="rounded-md px-2.5 py-1 text-muted-foreground hover:bg-accent hover:text-foreground font-medium"
                >
                  {t("orders")}
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label={t("signOut")} className="h-8">
                  <LogOut className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t("signOut")}</span>
                </Button>
              </>
            ) : (
              <Link
                to="/auth"
                className="rounded-md bg-primary px-3.5 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90 text-xs shadow-xs"
              >
                {t("signIn")}
              </Link>
            )}

            <div className="pl-1 border-l border-border ml-1">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>

        {/* Secondary Sub-nav for smart agricultural tools */}
        <div className="border-t border-border/60 bg-muted/40 px-4 py-1.5">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider shrink-0 pr-1">
              {lang === "mr" ? "कृषी साधने" : "Smart Tools"}:
            </span>
            <Link
              to="/disease-doctor"
              className="inline-flex items-center gap-1 shrink-0 rounded-full px-2.5 py-0.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
            >
              <Leaf className="size-3 text-primary" />
              <span>{t("cropDoctor")}</span>
              {!isUserSignedIn && <Lock className="size-2.5 text-muted-foreground/60" />}
            </Link>
            <Link
              to="/quality-detector"
              className="inline-flex items-center gap-1 shrink-0 rounded-full px-2.5 py-0.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
            >
              <Award className="size-3 text-emerald-500" />
              <span>{t("qualityDetector")}</span>
              {!isUserSignedIn && <Lock className="size-2.5 text-muted-foreground/60" />}
            </Link>
            <Link
              to="/soil-health"
              className="inline-flex items-center gap-1 shrink-0 rounded-full px-2.5 py-0.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
            >
              <FlaskConical className="size-3 text-amber-500" />
              <span>{t("soilHealth")}</span>
              {!isUserSignedIn && <Lock className="size-2.5 text-muted-foreground/60" />}
            </Link>
            <Link
              to="/yield-predictor"
              className="inline-flex items-center gap-1 shrink-0 rounded-full px-2.5 py-0.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
            >
              <TrendingUp className="size-3 text-blue-500" />
              <span>{t("yieldPredictor")}</span>
              {!isUserSignedIn && <Lock className="size-2.5 text-muted-foreground/60" />}
            </Link>
            <Link
              to="/cold-storage"
              className="inline-flex items-center gap-1 shrink-0 rounded-full px-2.5 py-0.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
            >
              <Snowflake className="size-3 text-cyan-500" />
              <span>{t("coldStorage")}</span>
              {!isUserSignedIn && <Lock className="size-2.5 text-muted-foreground/60" />}
            </Link>
            <Link
              to="/schemes"
              className="inline-flex items-center gap-1 shrink-0 rounded-full px-2.5 py-0.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
            >
              <Award className="size-3 text-purple-500" />
              <span>{t("schemes")}</span>
              {!isUserSignedIn && <Lock className="size-2.5 text-muted-foreground/60" />}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <motion.div
          key={typeof window !== "undefined" ? window.location.pathname : "static"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      {/* Voice Assistant Modal */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        lang={lang}
        onNavigateTab={handleVoiceTabNavigate}
      />

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground bg-card/50">
        AGRONAUTS · Maharashtra Agriculture Ecosystem · AI Crop Doctor · Soil Health Card · Batch Traceability · Cold Chain
      </footer>
    </div>
  );
}
