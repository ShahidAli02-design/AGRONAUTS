// Where the AGRONAUTS Node server (API, shared database, OCR engine, photo
// check models) runs.
//
// - Same server serves the site (npm run dev, Render, Cloud Run): leave empty.
// - Static hosting such as GitHub Pages cannot run the server, so the site
//   must call the deployed backend instead. Set VITE_API_BASE at build time,
//   e.g. VITE_API_BASE=https://agronauts.onrender.com
const DEFAULT_STATIC_HOST_BACKEND = "https://agronauts.onrender.com";

function resolveApiOrigin(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE as string | undefined)?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location.hostname.endsWith("github.io")) {
    return DEFAULT_STATIC_HOST_BACKEND;
  }
  return "";
}

export const API_ORIGIN = resolveApiOrigin();

// Absolute URL of a server path such as "/api/health" or "/ocr/core".
export function serverUrl(path: string): string {
  return `${API_ORIGIN || (typeof window !== "undefined" ? window.location.origin : "")}${path}`;
}

// Render's free plan puts the backend to sleep when idle; the first request
// then fails or gets a 502/503 from Render's proxy for up to about a minute
// while it wakes. Retry those so sign-up, login and data loads just take a
// bit longer instead of failing.
const WAKE_WINDOW_MS = 90_000;

function isWakingResponse(res: Response): boolean {
  // Render's own "service waking up" answers are not JSON from our server.
  if (res.status !== 502 && res.status !== 503 && res.status !== 504) return false;
  return !(res.headers.get("content-type") || "").includes("application/json");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

let wakeListeners: ((waking: boolean) => void)[] = [];
export function onServerWaking(fn: (waking: boolean) => void) {
  wakeListeners.push(fn);
  return () => {
    wakeListeners = wakeListeners.filter((f) => f !== fn);
  };
}
let wakingCount = 0;
function setWaking(delta: number) {
  const before = wakingCount > 0;
  wakingCount = Math.max(0, wakingCount + delta);
  if (before !== wakingCount > 0) wakeListeners.forEach((f) => f(wakingCount > 0));
}

async function fetchWithWake(original: typeof fetch, url: string, init?: RequestInit): Promise<Response> {
  const started = Date.now();
  let delay = 2000;
  let waking = false;
  try {
    for (;;) {
      try {
        const res = await original(url, init);
        if (!isWakingResponse(res) || Date.now() - started > WAKE_WINDOW_MS) return res;
      } catch (err) {
        if (init?.signal?.aborted || Date.now() - started > WAKE_WINDOW_MS) throw err;
      }
      if (!waking) {
        waking = true;
        setWaking(1);
      }
      await sleep(delay);
      delay = Math.min(delay * 1.5, 8000);
    }
  } finally {
    if (waking) setWaking(-1);
  }
}

// Route every relative "/api/..." request to the backend, so the many
// fetch("/api/...") calls across the app work on static hosting too.
export function installApiFetch() {
  if (!API_ORIGIN || typeof window === "undefined") return;
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string" && input.startsWith("/api/")) {
      return fetchWithWake(original, `${API_ORIGIN}${input}`, init);
    }
    return original(input, init);
  };
  // Start waking the backend as soon as the site opens.
  void original(`${API_ORIGIN}/api/health`).catch(() => {});
}
