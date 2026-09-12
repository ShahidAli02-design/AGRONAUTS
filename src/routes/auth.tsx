import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import {
  getRegisteredUsers,
  saveRegisteredUser,
  setStoredSession,
  DEFAULT_USERS,
  type AppRole,
  type RegisteredUser,
} from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { ErrorState } from "@/components/ui-bits";
import { LandRecordVerification, type LandVerificationStatus } from "@/components/LandRecordVerification";
import { GlareHover } from "@/components/GlareHover";
import { INDIA_STATE_DISTRICTS } from "@/lib/india-districts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCheck, ShieldCheck, Phone, Mail, Lock, User, MapPin, Building2, Sparkles, CheckCircle2 } from "lucide-react";
import onboarding from "@/assets/onboarding-farmer.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to AGRONAUTS | Farmer produce traceability" },
      {
        name: "description",
        content:
          "Sign in or create an AGRONAUTS account as a farmer, buyer, processor or admin to track produce batches from harvest to sale.",
      },
      { property: "og:title", content: "Sign in to AGRONAUTS" },
      {
        property: "og:description",
        content: "Farmer, buyer, processor and admin accounts for the AGRONAUTS produce network.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const ROLES: { id: AppRole; title: string; subtitle: string; icon: string }[] = [
  { id: "farmer", title: "Farmer", subtitle: "शेतकरी (Harvest & Batches)", icon: "🌱" },
  { id: "buyer", title: "Buyer", subtitle: "व्यापारी / FMCG (Procurement)", icon: "🛒" },
  { id: "processor", title: "Processor", subtitle: "अन्न प्रक्रियादार (Pulp / Value-Add)", icon: "🏭" },
  { id: "admin", title: "Admin", subtitle: "APMC अधिकारी (District Audit)", icon: "🏛️" },
];

function AuthPage() {
  const { t, te, lang } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<"in" | "up">("in");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [village, setVillage] = React.useState("");
  const [district, setDistrict] = React.useState("Nashik");
  const [role, setRole] = React.useState<AppRole>("farmer");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [landStatus, setLandStatus] = React.useState<LandVerificationStatus>("idle");

  // Quick 1-click credentials filler for the 4 verified roles
  const handleSelectDemoUser = (targetRole: AppRole) => {
    const demo = DEFAULT_USERS.find((u) => u.role === targetRole) || DEFAULT_USERS[0];
    setEmail(demo.email);
    setPassword(demo.passwordHash);
    setRole(demo.role);
    setMode("in");
    setError(null);
    setInfo(`Loaded verified ${targetRole.toUpperCase()} credentials: ${demo.email}`);
  };

  const handleDirectLoginAsDemoUser = (targetRole: AppRole) => {
    const userMatch = DEFAULT_USERS.find((u) => u.role === targetRole) || DEFAULT_USERS[0];
    const dummyUser = {
      id: userMatch.id,
      email: userMatch.email,
      aud: "authenticated",
      role: "authenticated",
      app_metadata: {},
      user_metadata: { full_name: userMatch.full_name, role: userMatch.role },
      created_at: userMatch.created_at,
    } as any;

    const profile = {
      id: userMatch.id,
      full_name: userMatch.full_name,
      phone: userMatch.phone,
      village: userMatch.village,
      district: userMatch.district,
      language: userMatch.language,
      role: userMatch.role,
      email: userMatch.email,
    };

    setStoredSession({ user: dummyUser, profile, role: userMatch.role });
    void navigate({ to: "/dashboard" });
  };

  // Strict 10-digit phone handler
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e?.target?.value ?? "";
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 10);
    setPhone(digitsOnly);
    if (error && digitsOnly.length === 10) {
      setError(null);
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Strict email check
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address (उदा. farmer@agronauts.in).");
      return;
    }

    // Strict password check
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long (पासवर्ड किमान ६ अक्षरांचा हवा).");
      return;
    }

    // Sign up specific validations
    if (mode === "up") {
      if (!fullName.trim()) {
        setError("Please enter your full name (पूर्ण नाव टाका).");
        return;
      }
      // Strict 10-digit phone enforcement
      if (phone.length !== 10) {
        setError("Please enter a valid 10-digit Indian mobile number (१० अंकी मोबाईल नंबर आवश्यक आहे).");
        return;
      }
      if (!/^[6-9]\d{9}$/.test(phone)) {
        setError("Mobile number must start with 6, 7, 8, or 9 (मोबाईल नंबर ६, ७, ८, किंवा ९ ने सुरू व्हावा).");
        return;
      }
      // Farmers must pass OCR verification of a 7/12 land extract before an account is created.
      if (role === "farmer" && landStatus !== "verified") {
        setError(
          "Please upload and verify your 7/12 (सात-बारा) land extract before registering as a Farmer."
        );
        return;
      }
    }

    setBusy(true);

    try {
      const registeredUsers = getRegisteredUsers();

      if (mode === "in") {
        // Find in local registered users database
        const userMatch = registeredUsers.find(
          (u) => u.email.toLowerCase() === cleanEmail && u.passwordHash === password
        );

        if (userMatch) {
          // Valid authenticated session
          const dummyUser = {
            id: userMatch.id,
            email: userMatch.email,
            aud: "authenticated",
            role: "authenticated",
            app_metadata: {},
            user_metadata: { full_name: userMatch.full_name, role: userMatch.role },
            created_at: userMatch.created_at,
          } as any;

          const profile = {
            id: userMatch.id,
            full_name: userMatch.full_name,
            phone: userMatch.phone,
            village: userMatch.village,
            district: userMatch.district,
            language: userMatch.language,
            role: userMatch.role,
            email: userMatch.email,
          };

          setStoredSession({ user: dummyUser, profile, role: userMatch.role });
          void navigate({ to: "/dashboard" });
          return;
        }

        // Also try Supabase authentication
        const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (supaErr) {
          throw new Error("Invalid email or password. Please verify your credentials or select a verified demo account below.");
        }

        if (supaData.user) {
          const profile = {
            id: supaData.user.id,
            full_name: supaData.user.user_metadata?.full_name ?? "User",
            phone: supaData.user.user_metadata?.phone ?? null,
            village: supaData.user.user_metadata?.village ?? null,
            district: supaData.user.user_metadata?.district ?? "Nashik",
            language: "mr",
            role: (supaData.user.user_metadata?.role as AppRole) ?? "farmer",
            email: supaData.user.email,
          };
          setStoredSession({
            user: supaData.user,
            profile,
            role: (profile.role as AppRole) ?? "farmer",
          });
          void navigate({ to: "/dashboard" });
          return;
        }

        throw new Error("Invalid email or password.");
      } else {
        // Sign Up Mode: Check if already registered
        const alreadyExists = registeredUsers.some(
          (u) => u.email.toLowerCase() === cleanEmail
        );
        if (alreadyExists) {
          throw new Error("An account with this email address already exists. Please sign in instead.");
        }

        const newUser: RegisteredUser = {
          id: `usr-${Date.now()}`,
          email: cleanEmail,
          passwordHash: password,
          full_name: fullName.trim(),
          phone,
          village: village.trim() || "Pimpalgaon",
          district: district.trim() || "Nashik",
          role,
          language: "mr",
          created_at: new Date().toISOString(),
          landVerified: role === "farmer" ? landStatus === "verified" : undefined,
        };

        saveRegisteredUser(newUser);

        // Attempt Supabase sign up in background
        try {
          await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                phone,
                village: village.trim(),
                district: district.trim(),
                role,
              },
            },
          });
        } catch {
          // local store is primary
        }

        const dummyUser = {
          id: newUser.id,
          email: newUser.email,
          aud: "authenticated",
          role: "authenticated",
          app_metadata: {},
          user_metadata: { full_name: newUser.full_name, role: newUser.role },
          created_at: newUser.created_at,
        } as any;

        const profile = {
          id: newUser.id,
          full_name: newUser.full_name,
          phone: newUser.phone,
          village: newUser.village,
          district: newUser.district,
          language: newUser.language,
          role: newUser.role,
          email: newUser.email,
        };

        setStoredSession({ user: dummyUser, profile, role: newUser.role });
        void navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell signedIn={false}>
      <div className="mx-auto max-w-xl py-6 px-2 sm:px-4">
        <GlareHover
          className="rounded-xl"
          glareColor="#ffffff"
          glareOpacity={0.3}
          glareAngle={-30}
          glareSize={300}
          transitionDuration={800}
          playOnce={false}
        >
        <Card className="border-border shadow-sm bg-card overflow-hidden">
          {/* Top Switcher Tabs */}
          <div className="grid grid-cols-2 border-b border-border bg-muted/40 text-center font-medium text-sm">
            <button
              type="button"
              onClick={() => {
                setMode("in");
                setError(null);
                setInfo(null);
              }}
              className={`py-3 transition-colors flex items-center justify-center gap-2 ${
                mode === "in"
                  ? "bg-card text-foreground font-semibold border-b-2 border-primary -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="size-4 text-primary" />
              <span>{t("signIn")}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("up");
                setError(null);
                setInfo(null);
              }}
              className={`py-3 transition-colors flex items-center justify-center gap-2 ${
                mode === "up"
                  ? "bg-card text-foreground font-semibold border-b-2 border-primary -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="size-4 text-primary" />
              <span>{t("signUp")}</span>
            </button>
          </div>

          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                  {mode === "in"
                    ? (lang === "mr" ? "खात्यात लॉगिन करा" : "Sign in to AGRONAUTS")
                    : (lang === "mr" ? "नवीन शेती खाते नोंदणी" : "Register Agricultural Account")}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1 leading-relaxed">
                  {mode === "in"
                    ? (lang === "mr"
                      ? "आपला ईमेल व पासवर्ड टाकून वैयक्तिक कृषी डॅशबोर्डमध्ये प्रवेश करा."
                      : "Enter your verified email and password to access your role dashboard.")
                    : (lang === "mr"
                      ? "आपली भूमिका निवडून खाते तयार करा. आपला डेटा संपूर्ण सुरक्षित राहील."
                      : "Create your verified role account with strict data privacy isolation.")}
                </CardDescription>
              </div>
              <div className="size-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {mode === "in" ? <UserCheck className="size-5" /> : <User className="size-5" />}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "up" ? (
                <>
                  {/* Role Selector Tabs */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("role")} (भूमिका निवडा) *
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ROLES.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setRole(r.id);
                            if (r.id !== "farmer") setLandStatus("idle");
                          }}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            role === r.id
                              ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                              : "border-border bg-card text-foreground hover:bg-accent"
                          }`}
                        >
                          <div className="text-lg">{r.icon}</div>
                          <div className="text-xs font-medium mt-1">{t(r.id)}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="flex items-center gap-1.5 text-xs font-medium">
                      <User className="size-3.5 text-muted-foreground" />
                      <span>{t("fullName")} *</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="उदा. रामदास विठ्ठल जाधव"
                      autoComplete="name"
                      required
                      className="h-11"
                    />
                  </div>

                  {/* Strict 10-Digit Mobile Number */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs font-medium">
                        <Phone className="size-3.5 text-muted-foreground" />
                        <span>{t("phone")} * (10 Digits Only)</span>
                      </Label>
                      <span
                        className={`text-xs font-mono font-medium ${
                          phone.length === 10
                            ? "text-emerald-600 font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {phone.length === 10
                          ? "✓ 10/10 Digits"
                          : `${phone.length}/10 digits`}
                      </span>
                    </div>
                    <div className="flex rounded-md shadow-2xs">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm font-semibold">
                        🇮🇳 +91
                      </span>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="9822012345"
                        required
                        className="rounded-l-none h-11 tracking-wider font-mono text-base"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      फक्त १० अंकी भारतीय मोबाईल क्रमांक टाका
                    </p>
                  </div>

                  {/* Village & District */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="village" className="flex items-center gap-1.5 text-xs font-medium">
                        <Building2 className="size-3.5 text-muted-foreground" />
                        <span>{t("village")}</span>
                      </Label>
                      <Input
                        id="village"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        placeholder="उदा. पिंपळगाव बसवंत"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="district" className="flex items-center gap-1.5 text-xs font-medium">
                        <MapPin className="size-3.5 text-muted-foreground" />
                        <span>{t("district")}</span>
                      </Label>
                      <select
                        id="district"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

                  {/* Farmer-only: 7/12 land record OCR verification gate */}
                  {role === "farmer" ? (
                    <LandRecordVerification lang={lang} fullName={fullName} status={landStatus} onStatusChange={setLandStatus} />
                  ) : null}
                </>
              ) : null}

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-medium">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span>{t("email")} *</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@agronauts.in"
                  autoComplete="email"
                  required
                  className="h-11"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-1.5 text-xs font-medium">
                    <Lock className="size-3.5 text-muted-foreground" />
                    <span>{t("password")} *</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground">किमान ६ अक्षरे (Min 6)</span>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "in" ? "current-password" : "new-password"}
                  required
                  className="h-11"
                />
              </div>

              {error ? <ErrorState message={error} /> : null}

              {info ? (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-800">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>{info}</span>
                </div>
              ) : null}

              <Button type="submit" className="h-12 w-full text-base font-semibold shadow-xs" disabled={busy}>
                {busy ? t("loading") : mode === "in" ? t("signIn") : (lang === "mr" ? "खाते नोंदवा व डॅशबोर्ड उघडा" : "Register & Open Dashboard")}
              </Button>
            </form>

            {/* Quick Demo Fill Helper Chips - compact and tidy */}
            {mode === "in" ? (
              <div className="mt-5 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Sparkles className="size-3 text-primary" />
                    <span>{lang === "mr" ? "त्वरित भूमिका लॉगिन (Direct Role Login):" : "Direct Role Login / Quick Test:"}</span>
                  </p>
                  <span className="text-[10px] text-muted-foreground">१-क्लिक लॉगिन उपलब्ध</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                  {DEFAULT_USERS.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleDirectLoginAsDemoUser(u.role)}
                      className={`px-2 py-1.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 shadow-2xs hover:border-primary hover:bg-primary/5 ${
                        email === u.email
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border/80 bg-muted/40 text-foreground"
                      }`}
                      title={`Directly sign in to ${u.role.toUpperCase()} dashboard`}
                    >
                      <div className="flex items-center gap-1 font-semibold">
                        <span>
                          {u.role === "farmer"
                            ? "🌱"
                            : u.role === "buyer"
                            ? "🛒"
                            : u.role === "processor"
                            ? "🏭"
                            : "🏛️"}
                        </span>
                        <span className="capitalize">{t(u.role)}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {u.role === "farmer" ? "Farmer" : u.role === "buyer" ? "Buyer" : u.role === "processor" ? "Processor" : "Admin"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Mode Toggle */}
            <div className="mt-5 text-center text-xs sm:text-sm">
              <span className="text-muted-foreground">
                {mode === "in"
                  ? (lang === "mr" ? "नवीन खाते तयार करायचे आहे का?" : "Don't have an account yet?")
                  : (lang === "mr" ? "आधीच खाते आहे का?" : "Already have an account?")}{" "}
              </span>
              <button
                type="button"
                className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                onClick={() => {
                  setMode(mode === "in" ? "up" : "in");
                  setError(null);
                  setInfo(null);
                }}
              >
                {mode === "in" ? t("signUp") : t("signIn")}
              </button>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="mt-4 pt-3 border-t border-border/60 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span>
                {lang === "mr"
                  ? "१००% डेटा गोपनीयता: शेतकरी, खरेदीदार आणि प्रक्रियादार यांचा डेटा स्वतंत्र राहतो."
                  : "100% Data Privacy: Farmer harvests, buyer orders, and processing lots are strictly role-isolated."}
              </span>
            </div>
          </CardContent>
        </Card>
        </GlareHover>
      </div>
    </AppShell>
  );
}
