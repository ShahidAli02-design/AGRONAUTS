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

// Route every relative "/api/..." request to the backend, so the many
// fetch("/api/...") calls across the app work on static hosting too.
export function installApiFetch() {
  if (!API_ORIGIN || typeof window === "undefined") return;
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string" && input.startsWith("/api/")) {
      return original(`${API_ORIGIN}${input}`, init);
    }
    return original(input, init);
  };
}
