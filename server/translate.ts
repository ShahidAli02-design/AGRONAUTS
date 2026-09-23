import { GoogleGenAI } from '@google/genai';

export type TranslateTarget = 'en' | 'mr' | 'hi';

const LANGUAGE_NAMES: Record<TranslateTarget, string> = {
  en: 'English',
  mr: 'Marathi',
  hi: 'Hindi',
};

const MAX_TEXTS = 100;
const MAX_TEXT_LENGTH = 1000;
const MAX_CACHE_ENTRIES = 20000;

// Translations of the site's UI strings are stable, so keep them in memory and
// share them across all visitors.
const cache = new Map<string, string>();
const cacheKey = (target: TranslateTarget, text: string) => `${target}\u0000${text}`;

function remember(target: TranslateTarget, text: string, translated: string) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(cacheKey(target, text), translated);
}

let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!genAI && key && key !== 'MY_GEMINI_API_KEY') {
    try {
      genAI = new GoogleGenAI({ apiKey: key });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client for translation:', e);
    }
  }
  return genAI;
}

async function translateWithGemini(texts: string[], target: TranslateTarget): Promise<string[] | null> {
  const ai = getGenAI();
  if (!ai) return null;
  const prompt = `Translate every string in this JSON array into ${LANGUAGE_NAMES[target]}.
They are user-interface texts of AGRONAUTS, an Indian agriculture app used by farmers, traders and food processors.
Rules:
- Use simple, everyday ${LANGUAGE_NAMES[target]} that a farmer understands; keep common English tech words (AI, QR, OTP, APMC, NPK) if there is no everyday word.
- Keep numbers, ₹ amounts, units (kg, %, °C), dates, emails, URLs, emoji, codes like LOT-1234 / Grade A, and the name AGRONAUTS unchanged.
- Keep leading/trailing punctuation and symbols such as "*", ":", "•" as they are.
- If a string is already in ${LANGUAGE_NAMES[target]}, return it unchanged.
Return ONLY a JSON array of translated strings, same length and order as the input.

${JSON.stringify(texts)}`;
  const models = [process.env.GEMINI_MODEL || 'gemini-2.5-flash', process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash-lite'];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json', temperature: 0 },
      });
      const parsed = JSON.parse(response.text || 'null');
      if (Array.isArray(parsed) && parsed.length === texts.length) {
        return parsed.map((t, i) => (typeof t === 'string' && t.trim() ? t : texts[i]));
      }
    } catch (err) {
      console.warn(`Gemini translation with ${model} failed:`, err instanceof Error ? err.message : err);
    }
  }
  return null;
}

async function googleTranslate(text: string, target: TranslateTarget, source = 'auto'): Promise<string | null> {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&dt=t` +
    `&tl=${target}&q=${encodeURIComponent(text)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }
      if (!res.ok) return null;
      const data = await res.json();
      if (!Array.isArray(data?.[0])) return null;
      const out = data[0].map((seg: unknown[]) => (typeof seg?.[0] === 'string' ? seg[0] : '')).join('');
      return out || null;
    } catch {
      // network error — retry
    }
  }
  return null;
}

// Sends many strings per request (one per line) so a page's worth of text
// needs a handful of calls instead of hundreds, which would be rate-limited.
async function translateWithGoogle(texts: string[], target: TranslateTarget): Promise<(string | null)[]> {
  const results: (string | null)[] = new Array(texts.length).fill(null);
  const lines = texts.map((t) => t.replace(/\s*\n\s*/g, ' '));
  // Google detects ONE source language per request, so a batch mixing
  // English and Marathi lines comes back with the English lines untouched.
  // Batch English-only strings separately with the source pinned to English.
  const chunks: { source: string; idx: number[] }[] = [];
  // For Marathi, mixed English+Devanagari strings are also sent as English:
  // their English words get translated and the Marathi words pass through.
  const isEnglish = (t: string) =>
    target === 'mr' ? /[A-Za-z]{2,}/.test(t) : !/[\u0900-\u097F]/.test(t);
  for (const english of [true, false]) {
    let current: number[] = [];
    let size = 0;
    const source = english ? 'en' : 'auto';
    lines.forEach((line, i) => {
      if (isEnglish(line) !== english) return;
      if (current.length && size + line.length > 1500) {
        chunks.push({ source, idx: current });
        current = [];
        size = 0;
      }
      current.push(i);
      size += line.length + 1;
    });
    if (current.length) chunks.push({ source, idx: current });
  }

  let next = 0;
  const workers = Array.from({ length: Math.min(3, chunks.length) }, async () => {
    while (next < chunks.length) {
      const { source, idx } = chunks[next++];
      const src = target === 'en' && source === 'en' ? 'auto' : source;
      const out = await googleTranslate(idx.map((i) => lines[i]).join('\n'), target, src);
      const parts = out?.split('\n');
      if (parts && parts.length === idx.length) {
        idx.forEach((i, k) => (results[i] = parts[k].trim() || null));
      } else {
        for (const i of idx) results[i] = await googleTranslate(lines[i], target, src);
      }
    }
  });
  await Promise.all(workers);
  return results;
}

export function isTranslateTarget(v: unknown): v is TranslateTarget {
  return v === 'en' || v === 'mr' || v === 'hi';
}

// Returns one entry per input: the translation, or null when no translation
// service could translate it (the client then keeps the original text).
export async function translateTexts(rawTexts: unknown[], target: TranslateTarget): Promise<(string | null)[]> {
  const texts = rawTexts
    .slice(0, MAX_TEXTS)
    .map((t) => (typeof t === 'string' ? t.slice(0, MAX_TEXT_LENGTH) : ''));
  const results: (string | null)[] = texts.map((t) => (t ? cache.get(cacheKey(target, t)) ?? null : ''));

  const missing = [...new Set(texts.filter((t, i) => t && results[i] === null))];
  if (missing.length) {
    const translated = new Map<string, string>();
    const fromGemini = await translateWithGemini(missing, target);
    if (fromGemini) {
      missing.forEach((t, i) => translated.set(t, fromGemini[i]));
    } else {
      const fromGoogle = await translateWithGoogle(missing, target);
      missing.forEach((t, i) => {
        if (fromGoogle[i]) translated.set(t, fromGoogle[i]!);
      });
    }
    translated.forEach((v, k) => remember(target, k, v));
    texts.forEach((t, i) => {
      if (results[i] === null && translated.has(t)) results[i] = translated.get(t)!;
    });
  }
  return results;
}

const VOICE_TABS = [
  'dashboard', 'marketplace', 'harvest', 'orders', 'diseaseDetection', 'qualityGrading',
  'soilHealth', 'yieldPrediction', 'coldStorage', 'schemes',
] as const;

// Free-form farmer questions for the voice assistant. Returns null when the
// AI model is unavailable so the client uses its built-in answers.
export async function answerVoiceQuery(
  query: string,
  lang: TranslateTarget
): Promise<{ response: string; targetTab: string } | null> {
  const ai = getGenAI();
  if (!ai) return null;
  const prompt = `You are the voice assistant of AGRONAUTS, a farming app for Indian (mainly Maharashtra) farmers.
The farmer said: ${JSON.stringify(query.slice(0, 500))}
Reply in ${LANGUAGE_NAMES[lang]} only, in 1-3 short spoken sentences a farmer understands (it will be read aloud).
Give practical, correct agronomy / market advice. Never invent specific live prices, batch IDs or grades; give typical ranges and point to the right app section instead.
Pick the most relevant app section for a follow-up button, one of: ${VOICE_TABS.join(', ')}
(harvest = register a new harvest batch; diseaseDetection = AI crop doctor from a leaf photo; qualityGrading = grade produce from a photo).
Return ONLY JSON: {"response": "...", "targetTab": "..."}`;
  const models = [process.env.GEMINI_MODEL || 'gemini-2.5-flash', process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash-lite'];
  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json', temperature: 0.3 },
      });
      const parsed = JSON.parse(res.text || 'null');
      if (parsed && typeof parsed.response === 'string' && parsed.response.trim()) {
        const targetTab = (VOICE_TABS as readonly string[]).includes(parsed.targetTab) ? parsed.targetTab : 'dashboard';
        return { response: parsed.response.trim(), targetTab };
      }
    } catch (err) {
      console.warn(`Gemini voice answer with ${model} failed:`, err instanceof Error ? err.message : err);
    }
  }
  return null;
}
