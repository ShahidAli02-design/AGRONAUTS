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

// Strips everything but letters and drops vowels, leaving a "consonant
// skeleton" — the part of a word that stays stable across transliteration
// schemes (English "Ramdas" and romanized Devanagari "raamdaas" both reduce
// to "rmds"), while vowel realization varies a lot between them.
function consonantSkeleton(word: string): string {
  return word
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/[aeiou]/g, "");
}

function skeletonsClose(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen < 2) return false;
  return levenshtein(a, b) / maxLen <= 0.45;
}

// Checks that the name the farmer typed at sign-up actually appears on the
// scanned document (as the "Bhogwatdar"/landholder name), so a random valid
// 7/12 belonging to someone else can't be used to register.
//
// Farmers often type their name in English while the 7/12 is entirely in
// Marathi/Devanagari (or vice versa), so this romanizes the OCR'd document
// text first and compares consonant skeletons rather than raw substrings —
// that survives both the script change and everyday OCR/transliteration
// noise. Land records also order name parts differently (surname first,
// father's name in the middle, etc.), so each name word is checked
// independently instead of the full phrase, and only a majority needs to hit.
export function doesNameMatchDocument(fullName: string, rawText: string): boolean {
  const text = normalize(rawText);
  if (!text) return false;

  const nameTokens = fullName
    .trim()
    .split(/\s+/)
    .filter((t) => t.length >= 2);
  if (nameTokens.length === 0) return true;

  // Fast path: direct (possibly same-script) substring match.
  const compact = text.replace(/\s+/g, "");
  const directHits = nameTokens.filter((tok) => {
    const t = tok.toLowerCase();
    return text.includes(t) || compact.includes(t);
  }).length;

  const required = Math.max(1, Math.ceil(nameTokens.length / 2));
  if (directHits >= required) return true;

  // Cross-script path: romanize the document text and compare consonant
  // skeletons so an English name can match a Devanagari document (or vice versa).
  const romanizedDoc = transliterate(rawText);
  const docWords = romanizedDoc
    .split(/[^a-zA-Z]+/)
    .filter((w) => w.length >= 2)
    .map(consonantSkeleton);

  const nameSkeletons = nameTokens.map(consonantSkeleton);
  const fuzzyHits = nameSkeletons.filter((skel) => docWords.some((w) => skeletonsClose(skel, w))).length;

  return fuzzyHits >= required;
}

export interface OcrProgress {
  status: string;
  progress: number;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = URL.createObjectURL(file);
  });
}

// Upscales small document photos/screenshots and boosts contrast — real-world
// scans are usually far lower resolution (relative to text size) than Tesseract
// wants, and this measurably improves recognition on dense government forms.
async function preprocessForOcr(file: File): Promise<HTMLCanvasElement> {
  const img = await loadImage(file);
  const targetMinWidth = 1800;
  const scale = img.width < targetMinWidth ? targetMinWidth / img.width : 1;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(img.src);

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

export async function runDocumentOcr(
  file: File,
  onProgress?: (p: OcrProgress) => void
): Promise<string> {
  const source = await preprocessForOcr(file).catch(() => file);
  const { data } = await Tesseract.recognize(source, "eng+mar", {
    logger: (m) => {
      if (onProgress && typeof m.progress === "number") {
        onProgress({ status: m.status, progress: m.progress });
      }
    },
  });
  return data.text || "";
}
