import Tesseract from "tesseract.js";
import { transliterate } from "transliteration";

// Strong markers: any single match is enough to confirm a 7/12 (सात-बारा) extract.
const STRONG_MARKERS = [
  "7/12",
  "७/१२",
  "satbara",
  "सातबारा",
  "सात-बारा",
  "gaon namuna",
  "गाव नमुना",
  "gav namuna",
  "नमुना सात",
  "pu-id",
  "puid",
];

// Weak markers: need at least two distinct hits to confirm (tolerates OCR noise).
const WEAK_MARKERS = [
  "bhogwatdar",
  "bhogwatadar",
  "भोगवटादार",
  "भोगवटदार",
  "gat number",
  "gat kramank",
  "गट क्रमांक",
  "गट क्र",
  "talathi",
  "तलाठी",
  "maharashtra land revenue code",
  "जमीन महसूल अधिकार",
  "अधिकार अभिलेख",
  "उपविभाग",
  "village form",
  "khata",
  "खाते",
  "survey number",
  "सर्वे नंबर",
  "तालुका",
  "भुधारणा",
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function isValidSatbaraDocument(rawText: string): boolean {
  const text = normalize(rawText);
  if (!text) return false;
  // OCR noise often drops/adds spaces inside Devanagari phrases, so also check
  // a whitespace-collapsed version of both the text and each marker.
  const compact = text.replace(/\s+/g, "");

  const matches = (marker: string) => {
    const m = marker.toLowerCase();
    return text.includes(m) || compact.includes(m.replace(/\s+/g, ""));
  };

  const strongHit = STRONG_MARKERS.some(matches);
  if (strongHit) return true;

  const weakHits = WEAK_MARKERS.filter(matches).length;
  return weakHits >= 2;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

const DEVANAGARI = /[\u0900-\u097F]/;

// Reduces a word to a "phonetic key" that stays stable across scripts and
// spelling habits: English "Vitthal Jadhav" and the romanized Devanagari
// "vitthtthl jaadhv" both become "vtl jdv". Vowels, aspiration (h) and doubled
// letters vary a lot between transliterations, consonants mostly don't.
function phoneticKey(word: string): string {
  const roman = DEVANAGARI.test(word) ? transliterate(word) : word;
  return roman
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/x/g, "ks")
    .replace(/q/g, "k")
    .replace(/w/g, "v")
    .replace(/f/g, "p")
    .replace(/z/g, "j")
    .replace(/c/g, "k")
    .replace(/[aeiouh]/g, "")
    .replace(/(.)\1+/g, "$1");
}

// Devanagari digits/letters plus Latin letters; everything else separates words.
function splitWords(text: string): string[] {
  return text
    .normalize("NFC")
    .split(/[^a-zA-Z\u0900-\u0963\u0971-\u097F]+/)
    .filter((w) => w.length > 0);
}

function wordMatches(nameWord: string, nameKey: string, docWord: string, docKey: string): boolean {
  const a = nameWord.toLowerCase();
  const b = docWord.toLowerCase();
  if (a === b) return true;
  // Same script: allow a little OCR noise (a dropped matra / misread letter).
  if (DEVANAGARI.test(a) === DEVANAGARI.test(b) && a.length >= 4) {
    if (levenshtein(a, b) <= Math.floor(a.length / 4)) return true;
  }
  if (nameKey.length < 2 || !docKey) return false;
  if (nameKey === docKey) return true;
  // Longer keys tolerate a single consonant slip; short keys must be exact,
  // otherwise almost any 2-3 letter name would match some word on the form.
  return nameKey.length >= 4 && levenshtein(nameKey, docKey) <= 1;
}

export interface NameMatchResult {
  matched: boolean;
  matchedTokens: string[];
  missingTokens: string[];
}

// Checks that the name the farmer typed at sign-up actually appears on the
// scanned 7/12 (as the "Bhogwatdar"/landholder name), so a 7/12 belonging to
// someone else can't be used to register.
//
// Each name word must match a whole word on the document (not a substring —
// "Ram" should not match "Ramesh" or "Gram"), compared phonetically so an
// English name matches a Devanagari record and vice versa. At least two name
// words (first name + surname) must match, and they must appear close
// together on the document, since land records print the holder's full name
// as one group (often surname first).
export function matchNameOnDocument(fullName: string, rawText: string): NameMatchResult {
  const nameWords = splitWords(fullName).filter((w) => w.length >= 2);
  const docWords = splitWords(rawText);
  if (nameWords.length === 0 || docWords.length === 0) {
    return { matched: false, matchedTokens: [], missingTokens: nameWords };
  }
  const docKeys = docWords.map(phoneticKey);

  const positions = nameWords.map((w) => {
    const key = phoneticKey(w);
    const hits: number[] = [];
    docWords.forEach((dw, i) => {
      if (wordMatches(w, key, dw, docKeys[i])) hits.push(i);
    });
    return hits;
  });

  const matchedTokens = nameWords.filter((_, i) => positions[i].length > 0);
  const missingTokens = nameWords.filter((_, i) => positions[i].length === 0);
  const required = Math.min(nameWords.length, 2);

  // Look for a window of the document where enough distinct name words occur.
  const WINDOW = 8;
  let matched = false;
  for (let start = 0; start < docWords.length && !matched; start++) {
    const inWindow = positions.filter((hits) => hits.some((p) => p >= start && p < start + WINDOW)).length;
    if (inWindow >= required) matched = true;
  }

  if (!matched) {
    console.warn("[OCR name match] failed", { fullName, matchedTokens, missingTokens, extractedText: rawText });
  }
  return { matched, matchedTokens, missingTokens };
}

export function doesNameMatchDocument(fullName: string, rawText: string): boolean {
  return matchNameOnDocument(fullName, rawText).matched;
}

export interface OcrProgress {
  status: string;
  progress: number;
}

export class OcrInputError extends Error {}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new OcrInputError("Could not read this image file"));
    img.src = src;
  });
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

// 7/12 extracts downloaded from Mahabhumi are PDFs, so render page 1 to a canvas.
async function renderPdfFirstPage(file: File): Promise<HTMLCanvasElement> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const page = await pdf.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: Math.max(1, 2200 / base.width) });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
  return canvas;
}

async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  if (isPdf(file)) return renderPdfFirstPage(file);
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d")!.drawImage(img, 0, 0);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Upscales small document photos/screenshots and converts to high-contrast
// grayscale — real-world scans are usually far lower resolution (relative to
// text size) than Tesseract wants, and this measurably improves recognition on
// dense government forms.
function preprocessForOcr(source: HTMLCanvasElement): HTMLCanvasElement {
  const targetMinWidth = 1800;
  const maxWidth = 3000;
  let scale = source.width < targetMinWidth ? targetMinWidth / source.width : 1;
  if (source.width * scale > maxWidth) scale = maxWidth / source.width;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const contrast = 1.25;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const v = Math.max(0, Math.min(255, (gray - 128) * contrast + 128));
    data[i] = data[i + 1] = data[i + 2] = v;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

let progressListener: ((p: OcrProgress) => void) | undefined;
let workerPromise: Promise<Tesseract.Worker> | null = null;

// The OCR engine + Marathi/English models are served by our own server
// (see server.ts) so scanning doesn't depend on a third-party CDN being
// reachable; if that fails we still fall back to the public CDN.
async function getWorker(): Promise<Tesseract.Worker> {
  if (!workerPromise) {
    const logger = (m: Tesseract.LoggerMessage) => {
      if (progressListener && typeof m.progress === "number") {
        progressListener({ status: m.status, progress: m.progress });
      }
    };
    const origin = window.location.origin;
    workerPromise = Tesseract.createWorker(["eng", "mar"], Tesseract.OEM.LSTM_ONLY, {
      workerPath: `${origin}/ocr/worker.min.js`,
      corePath: `${origin}/ocr/core`,
      langPath: `${origin}/ocr/lang`,
      logger,
    })
      .catch((err) => {
        console.warn("Self-hosted OCR engine failed to load, trying CDN:", err);
        return Tesseract.createWorker(["eng", "mar"], Tesseract.OEM.LSTM_ONLY, { logger });
      })
      .catch((err) => {
        workerPromise = null;
        throw err;
      });
  }
  return workerPromise;
}

export async function runDocumentOcr(
  file: File,
  onProgress?: (p: OcrProgress) => void
): Promise<string> {
  const canvas = preprocessForOcr(await fileToCanvas(file));
  progressListener = onProgress;
  try {
    const worker = await getWorker();
    const { data } = await worker.recognize(canvas);
    return data.text || "";
  } finally {
    progressListener = undefined;
  }
}
