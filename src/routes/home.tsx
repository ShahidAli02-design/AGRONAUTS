import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  FlaskConical,
  Leaf,
  ScanLine,
  Snowflake,
  Sparkles,
  Sprout,
  Store,
  TrendingUp,
  Truck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { SplitText } from "@/components/SplitText";
import onboarding from "@/assets/onboarding-farmer.jpg";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "AGRONAUTS | Traceable produce from Maharashtra farms to buyers" },
      {
        name: "description",
        content:
          "AGRONAUTS gives every harvest a batch ID that follows it through quality grading, storage, marketplace sale, delivery and farmer earnings. English, Marathi and Hindi.",
      },
      { property: "og:title", content: "AGRONAUTS — one batch ID from harvest to sale" },
      {
        property: "og:description",
        content:
          "A farmer-friendly Indian agriculture network: grading, storage, marketplace, orders, delivery and full traceability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, lang } = useI18n();
  const { user } = useSession();

  const steps = [
    { icon: Sprout, title: "Record harvest", body: "One batch ID is created for the lot." },
    { icon: ScanLine, title: "Quality check", body: "Provisional grade with a clear reason." },
    { icon: Store, title: "Store and sell", body: "Decide use, then list on the marketplace." },
    { icon: Truck, title: "Deliver and earn", body: "Track delivery and see your earnings." },
  ];

  const smartTools = [
    {
      title: t("cropDoctor"),
      desc: lang === "mr" ? "पानावरील रोगाचे एआय निदान आणि सेंद्रिय औषधोपचार" : "Multimodal leaf pathology diagnosis and IPM remedies",
      link: "/disease-doctor",
      icon: Leaf,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: t("soilHealth"),
      desc: lang === "mr" ? "मातीतील N-P-K पोषण आणि अचूक खत कॅल्क्युलेटर" : "Soil test card, N-P-K balance and Urea/DAP/MOP dosage",
      link: "/soil-health",
      icon: FlaskConical,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
    },
    {
      title: t("yieldPredictor"),
      desc: lang === "mr" ? "हवामान व सिंचनानुसार उत्पादन टन आणि महसूल अंदाज" : "Crop production tonnage and gross revenue projection",
      link: "/yield-predictor",
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: t("coldStorage"),
      desc: lang === "mr" ? "शीतगृह साठवणूक आणि प्रक्रिया उद्योगांशी जोडणी" : "Cold storage directory and zero-waste processor routing",
      link: "/cold-storage",
      icon: Snowflake,
      color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40",
    },
    {
      title: t("schemes"),
      desc: lang === "mr" ? "महाडीबीटी कृषी योजना व अवजारे भाडे केंद्र (CHC)" : "MahaDBT subsidy schemes and custom hiring machinery",
      link: "/schemes",
      icon: Award,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40",
    },
  ];

  return (
    <AppShell signedIn={Boolean(user)}>
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Maharashtra · India
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight tracking-tight">{t("tagline")}</h1>
          <p className="mt-4 text-base text-muted-foreground">{t("heroBody")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="h-12 px-6 text-base">
              <Link to={user ? "/dashboard" : "/auth"}>
                <SplitText
                  text={t("getStarted")}
                  delay={60}
                  duration={0.6}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 20 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-50px"
                  textAlign="center"
                />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-6 text-base">
              <Link to="/marketplace">{t("marketplace")}</Link>
            </Button>
          </div>
        </div>
        <img
          src={onboarding}
          alt="A Maharashtra farmer holding a crate of freshly harvested tomatoes and onions"
          width={1280}
          height={960}
          className="rounded-2xl border border-border"
        />
      </section>

      {/* How one batch travels - Core lifecycle */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold">How one batch travels</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.title} className="rounded-xl border border-border bg-card p-5">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <s.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Agronomic Tools Section */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              {lang === "mr" ? "स्मार्ट कृषी साधने" : "Smart Agronomic Tools"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "mr"
                ? "कापणीपूर्वी आणि कापणीनंतर शेतकऱ्यांसाठी अत्याधुनिक एआय तंत्रज्ञान"
                : "AI-driven diagnostics, precision agronomy, and zero-waste storage"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {smartTools.map((tool) => (
            <Link
              key={tool.link}
              to={tool.link}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className={`flex size-10 items-center justify-center rounded-lg ${tool.color}`}>
                  <tool.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold">Explore Tool &rarr;</span>
                </div>
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                {tool.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
