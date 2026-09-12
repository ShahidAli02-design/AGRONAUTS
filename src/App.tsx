import * as React from "react";
import { RouterProvider, type RouteDefinition } from "@/lib/router";
import { I18nProvider } from "@/lib/i18n";

// Core Lovable Produce Traceability Routes
import { Route as WelcomeRoute } from "@/routes/index";
import { Route as HomeRoute } from "@/routes/home";
import { Route as AuthRoute } from "@/routes/auth";
import { Route as MarketplaceRoute } from "@/routes/marketplace";
import { Route as DashboardRoute } from "@/routes/_authenticated/dashboard";
import { Route as NewBatchRoute } from "@/routes/_authenticated/batches.new";
import { Route as BatchDetailRoute } from "@/routes/_authenticated/batches.$id";
import { Route as OrdersRoute } from "@/routes/_authenticated/orders";
import { Route as TraceRoute } from "@/routes/trace.$code";

// Smart Agronomic Feature Routes
import { Route as DiseaseDoctorRoute } from "@/routes/disease-doctor";
import { Route as QualityDetectorRoute } from "@/routes/quality-detector";
import { Route as SoilHealthRoute } from "@/routes/soil-health";
import { Route as YieldPredictorRoute } from "@/routes/yield-predictor";
import { Route as ColdStorageRoute } from "@/routes/cold-storage";
import { Route as SchemesRoute } from "@/routes/schemes";
import { Route as AdminDashboardRoute } from "@/routes/admin.dashboard";

const routes: RouteDefinition[] = [
  { pattern: "/", component: WelcomeRoute.component, head: WelcomeRoute.head },
  { pattern: "/home", component: HomeRoute.component, head: HomeRoute.head },
  { pattern: "/auth", component: AuthRoute.component, head: AuthRoute.head },
  { pattern: "/marketplace", component: MarketplaceRoute.component, head: MarketplaceRoute.head },
  { pattern: "/dashboard", component: DashboardRoute.component, head: DashboardRoute.head },
  { pattern: "/_authenticated/dashboard", component: DashboardRoute.component, head: DashboardRoute.head },
  { pattern: "/admin/dashboard", component: AdminDashboardRoute.component, head: AdminDashboardRoute.head },
  { pattern: "/admin", component: AdminDashboardRoute.component, head: AdminDashboardRoute.head },
  { pattern: "/batches/new", component: NewBatchRoute.component, head: NewBatchRoute.head },
  { pattern: "/_authenticated/batches/new", component: NewBatchRoute.component, head: NewBatchRoute.head },
  { pattern: "/batches/$id", component: BatchDetailRoute.component, head: BatchDetailRoute.head },
  { pattern: "/_authenticated/batches/$id", component: BatchDetailRoute.component, head: BatchDetailRoute.head },
  { pattern: "/orders", component: OrdersRoute.component, head: OrdersRoute.head },
  { pattern: "/_authenticated/orders", component: OrdersRoute.component, head: OrdersRoute.head },
  { pattern: "/trace/$code", component: TraceRoute.component, head: TraceRoute.head },
  { pattern: "/disease-doctor", component: DiseaseDoctorRoute.component, head: DiseaseDoctorRoute.head },
  { pattern: "/quality-detector", component: QualityDetectorRoute.component, head: QualityDetectorRoute.head },
  { pattern: "/quality-grading", component: QualityDetectorRoute.component, head: QualityDetectorRoute.head },
  { pattern: "/soil-health", component: SoilHealthRoute.component, head: SoilHealthRoute.head },
  { pattern: "/yield-predictor", component: YieldPredictorRoute.component, head: YieldPredictorRoute.head },
  { pattern: "/cold-storage", component: ColdStorageRoute.component, head: ColdStorageRoute.head },
  { pattern: "/schemes", component: SchemesRoute.component, head: SchemesRoute.head },
];

export default function App() {
  return (
    <I18nProvider>
      <RouterProvider routes={routes} />
    </I18nProvider>
  );
}
