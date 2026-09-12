# Agronauts — Maintenance Plan, Security Best Practices & Scalability Architecture

## 1. Executive Overview
Agronauts is an end-to-end intelligent agricultural management and produce marketplace application engineered to eliminate post-harvest crop loss, provide multimodal AI computer vision diagnostics, verify supply chain traceability via Universal Batch IDs, and unlock fair direct farmgate trade with zero-waste valorization.

This document establishes operational procedures, maintenance cycles, security baselines, and horizontal scaling strategies for production deployment.

---

## 2. System Architecture & Topology

```
[ Rural Edge / Mobile PWA Client ]
       │ (Camera, Voice, Offline LocalStorage)
       ▼
[ Reverse Proxy / Ingress (Port 3000) ]
       │
       ├──> [ Static Assets / Vite Client Bundle (dist/) ]
       │
       └──> [ Node.js Express REST API (server.ts / dist/server.cjs) ]
                  │
                  ├──> [ Multimodal Gemini 3.8 Flash Engine ]
                  │       (Leaf Disease Diagnostic & Produce Grading)
                  │
                  ├──> [ Zero-Waste Valorization Decision Engine ]
                  │       (Direct Sale vs. Storage vs. Food Processing)
                  │
                  ├──> [ Universal Batch ID & Digital Passport Registry ]
                  │
                  └──> [ Smart Escrow & Order Logistics Pipeline ]
```

---

## 3. Maintenance Cycles & Procedures

### 3.1 Weekly Operational Checks
- **AI Latency & Quota Monitoring**: Review Gemini API token consumption, response latencies, and fallback rate.
- **Log Sanitation**: Check for unhandled exceptions in `/api/ai/*` and `/api/matching/*`.
- **Database Backup Verification**: Verify daily automated snapshots of active harvest batches, crop plans, and escrow settlements.

### 3.2 Monthly Release & Dependency Updates
- **NPM Security Updates**: Run `npm audit` and update non-breaking dependencies via `npm update`.
- **Model Version Review**: Evaluate newly released Gemini model aliases (e.g., updates to `gemini-2.5-flash` or `gemini-3.8-flash`) to benefit from vision accuracy improvements without modifying endpoint contracts.
- **Database Index Optimization**: Analyze slow query times on multi-crop matching and geolocation radius searches.

### 3.3 Quarterly System Hardening
- **Disaster Recovery Simulation**: Test cold-start restoration of the database and production build within 5 minutes.
- **Farmer User Experience & Dialect Calibration**: Update localized agricultural terms in `src/i18n.ts` based on farmer feedback from regional Krishi Vigyan Kendras (KVKs).
- **Penetration Testing**: Execute static code vulnerability analysis and audit RBAC route boundaries.

---

## 4. Security Best Practices Implementation

| Domain | Best Practice | Implementation in Agronauts |
|---|---|---|
| **API Key Protection** | Zero client-side leakage of sensitive credentials | All calls to `@google/genai` are strictly proxy-routed through server-side Express controllers (`/api/ai/disease-detect`, `/api/ai/grade-quality`). No `GEMINI_API_KEY` is ever bundled into client assets. |
| **Authentication & Authorization** | Role-Based Access Control (RBAC) | Strict separation between Farmer, Buyer, Food Processor, and Admin personas with token-based authorization. |
| **Input Validation & Sanitization** | Defensive validation against injection & oversized payloads | Image uploads are limited to 10MB, strictly validated for MIME type (`image/jpeg`, `image/png`, `image/webp`), and base64 sanitized before passing to AI perception models. |
| **CORS & Network Boundaries** | Least privilege origin policy | Configured in `server.ts` to restrict API invocations to approved origins and enforce HTTPS across production ingress. |
| **Data Integrity & Provenance** | Immutable Universal Batch IDs | Every harvest batch receives a cryptographically verifiable identifier (`AGR-YYYY-CROP-SEQ`) permanently binding soil data, disease history, grading scores, and warehouse temperature records. |

---

## 5. Scalability & Performance Optimization Strategy

### 5.1 Horizontal Microservices Scaling
- The Express backend (`server.ts`) is bundled into a single standalone CommonJS binary (`dist/server.cjs`) using `esbuild`, allowing it to boot in < 200ms in container environments (e.g. Cloud Run, Kubernetes pods).
- Under peak harvest seasons (March–May for Mango/Tomato/Onion), backend instances scale automatically based on incoming request concurrency.

### 5.2 Edge Caching & Rural Offline Support
- **PWA Service Worker & Cache**: Static assets, dictionaries (`i18n.ts`), and recent batch registries are cached locally via standard browser storage.
- **Optimistic Task Updates**: When a farmer marks a field task as complete, the UI updates immediately and syncs asynchronously when 4G/5G connectivity resumes.

### 5.3 Modular AI Engine (Cloud + Edge Vision Hybrid)
- Currently powered by `@google/genai` Multimodal Flash for deep contextual symptom analysis.
- Designed with pluggable interfaces so that high-throughput sorting conveyor belts at cold storage facilities can connect to an on-premise lightweight TensorFlow / OpenCV inference server for real-time (< 50ms) sorting without internet dependency.

---

## 6. Incident Response & Disaster Recovery

- **Severity 1 (Service Outage)**: Automatic container restart via health probe (`/api/health`). Zero-downtime traffic rerouting to secondary standby instance.
- **Severity 2 (AI Degradation)**: Automated fallback to rule-based agricultural heuristic database guaranteeing farmers never face a blocking error during harvest registration.
- **Recovery Time Objective (RTO)**: < 10 minutes.
- **Recovery Point Objective (RPO)**: < 15 minutes.
