import * as React from "react";
import type { Lang } from "@/lib/i18n";

// Site-wide translation layer.
//
// Only part of the UI goes through `t()`; many pages hard-code English (or
// `lang === "mr" ? … : English`, which leaves Hindi in English) and some
// hard-code Marathi. Rather than letting those stay untranslated, this walks
// the rendered page, translates every visible text node and user-facing
// attribute into the selected language via /api/translate, and keeps doing so
// as React re-renders. Originals are remembered so switching back restores
// them exactly. Mark any element with translate="no" to opt it out.

const TRANSLATED_ATTRS = ["placeholder", "title", "aria-label", "alt"] as const;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE", "CANVAS", "VIDEO", "IFRAME"]);
const MAX_ATTEMPTS = 3;
const DEVANAGARI = /[ऀ-ॿ]/;
const LATIN_WORD = /[A-Za-z]{2,}/;
const SKIP_VALUE = /^(?:[\s\d.,:;%₹+\-–—/*#@()[\]|•·×x°'"!?&]+|\S+@\S+\.\S+|https?:\/\/\S+|[A-Z]{2,}-?\d[\w-]*)$/;
// Identifiers such as "usr-farmer-1", "LOT-2902", "batch_01" must never be translated.
const IDENTIFIER = /^(?=\S*[\d_])[\w.\u0900-\u097F-]+$/;
// "English (मराठी)" / "मराठी (English)" labels, optionally followed by ":" or "*".
const BILINGUAL = /^(.+?)\s*\(([^()]+)\)(\s*[:*.]*\s*)$/;
const hasLatin = (t: string) => /[A-Za-z]/.test(t);

// Splits a bilingual label into its English and Devanagari halves.
function splitBilingual(text: string): { english: string; devanagari: string; suffix: string } | null {
  const m = text.trim().match(BILINGUAL);
  if (!m) return null;
  const [, outer, inner, suffix] = m;
  const isEn = (t: string) => hasLatin(t) && !DEVANAGARI.test(t);
  const isDeva = (t: string) => DEVANAGARI.test(t) && !hasLatin(t);
  if (isEn(outer) && isDeva(inner)) return { english: outer.trim(), devanagari: inner.trim(), suffix: suffix.trim() };
  if (isDeva(outer) && isEn(inner)) return { english: inner.trim(), devanagari: outer.trim(), suffix: suffix.trim() };
  return null;
}
const STORAGE_PREFIX = "agronauts.tx.";
const BATCH_SIZE = 60;

interface Shown {
  original: string;
  shown: string;
}

const textState = new WeakMap<Text, Shown>();
const attrState = new WeakMap<Element, Record<string, Shown>>();
const memory: Partial<Record<Lang, Map<string, string>>> = {};

function cacheFor(lang: Lang): Map<string, string> {
  let m = memory[lang];
  if (!m) {
    m = new Map();
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + lang);
      if (raw) for (const [k, v] of Object.entries(JSON.parse(raw) as Record<string, string>)) m.set(k, v);
    } catch {
      // storage unavailable — translations just won't persist across visits
    }
    memory[lang] = m;
  }
  return m;
}

let persistTimer: number | undefined;
function persist(lang: Lang) {
  window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    try {
      const entries = [...cacheFor(lang).entries()].slice(-4000);
      window.localStorage.setItem(STORAGE_PREFIX + lang, JSON.stringify(Object.fromEntries(entries)));
    } catch {
      // quota exceeded / storage blocked — ignore
    }
  }, 1000);
}

function needsTranslation(text: string, lang: Lang, known: Set<string>): boolean {
  const t = text.trim();
  if (t.length < 2 || SKIP_VALUE.test(t) || IDENTIFIER.test(t) || known.has(t)) return false;
  if (lang === "en") return DEVANAGARI.test(t);
  if (lang === "mr") return LATIN_WORD.test(t);
  // Hindi: English text, and Devanagari text that may be hard-coded Marathi.
  return LATIN_WORD.test(t) || DEVANAGARI.test(t);
}

function isSkipped(el: Element | null): boolean {
  for (let e = el; e; e = e.parentElement) {
    if (SKIP_TAGS.has(e.tagName.toUpperCase())) return true;
    if (e.getAttribute("translate") === "no" || e.classList.contains("notranslate")) return true;
    if ((e as HTMLElement).isContentEditable) return true;
  }
  return false;
}

// Translates only the trimmed core so surrounding whitespace is preserved.
function withTranslation(original: string, translated: string): string {
  const lead = original.match(/^\s*/)![0];
  const trail = original.match(/\s*$/)![0];
  return lead + translated.trim() + trail;
}

export function AutoTranslate({ lang, known }: { lang: Lang; known: Set<string> }) {
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    const cache = cacheFor(lang);
    const pending = new Set<string>();
    // Strings the service couldn't translate yet; retried a few times with a
    // back-off so a temporary rate limit doesn't leave text in the wrong language.
    const failed = new Set<string>();
    const attempts = new Map<string, number>();
    const retryTimers: number[] = [];
    let flushTimer: number | undefined;
    let cancelled = false;

    const resolve = (original: string): string | null => {
      // Bilingual labels: show just the half in the selected language (the
      // Devanagari half is Marathi, so Hindi still translates it).
      const pair = splitBilingual(original);
      if (pair) {
        const suffix = pair.suffix ? pair.suffix : "";
        if (lang === "en") return withTranslation(original, pair.english + suffix);
        if (lang === "mr") return withTranslation(original, pair.devanagari + suffix);
        const inner = resolve(pair.devanagari);
        return inner === null ? null : withTranslation(original, inner.trim() + suffix);
      }
      const key = original.trim();
      if (!needsTranslation(key, lang, known)) return original;
      const hit = cache.get(key);
      if (hit !== undefined) return withTranslation(original, hit);
      if (!failed.has(key)) {
        pending.add(key);
        scheduleFlush();
      }
      return null;
    };

    const applyText = (node: Text) => {
      if (isSkipped(node.parentElement)) return;
      const value = node.nodeValue ?? "";
      const prev = textState.get(node);
      // If the node still shows what we put there, its source is the original;
      // otherwise React (or something else) wrote new content.
      const original = prev && value === prev.shown ? prev.original : value;
      if (!original.trim()) return;
      const next = resolve(original) ?? original;
      textState.set(node, { original, shown: next });
      if (next !== value) node.nodeValue = next;
    };

    const applyAttrs = (el: Element) => {
      if (isSkipped(el)) return;
      for (const attr of TRANSLATED_ATTRS) {
        const value = el.getAttribute(attr);
        if (value === null) continue;
        const states = attrState.get(el) ?? {};
        const prev = states[attr];
        const original = prev && value === prev.shown ? prev.original : value;
        if (!original.trim()) continue;
        const next = resolve(original) ?? original;
        states[attr] = { original, shown: next };
        attrState.set(el, states);
        if (next !== value) el.setAttribute(attr, next);
      }
    };

    const applyTree = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        applyText(root as Text);
        return;
      }
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      applyAttrs(root as Element);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
        acceptNode: (n) =>
          n.nodeType === Node.ELEMENT_NODE && SKIP_TAGS.has((n as Element).tagName.toUpperCase())
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT,
      });
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.nodeType === Node.TEXT_NODE) applyText(n as Text);
        else applyAttrs(n as Element);
      }
    };

    async function flush() {
      const batch = [...pending].slice(0, BATCH_SIZE);
      batch.forEach((t) => pending.delete(t));
      if (!batch.length) return;
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target: lang, texts: batch }),
        });
        const data = await res.json();
        const out: (string | null)[] = Array.isArray(data?.translations) ? data.translations : [];
        const missed: string[] = [];
        batch.forEach((t, i) => {
          const tr = out[i];
          if (typeof tr === "string" && tr.trim()) cache.set(t, tr);
          else missed.push(t);
        });
        persist(lang);
        markFailed(missed);
      } catch (err) {
        console.warn("Translation request failed:", err);
        markFailed(batch);
      }
      if (cancelled) return;
      applyTree(document.body);
      if (pending.size) scheduleFlush();
    }

    function markFailed(texts: string[]) {
      const retry: string[] = [];
      for (const t of texts) {
        failed.add(t);
        const n = (attempts.get(t) ?? 0) + 1;
        attempts.set(t, n);
        if (n < MAX_ATTEMPTS) retry.push(t);
      }
      if (!retry.length) return;
      const delay = 4000 * (attempts.get(retry[0]) ?? 1);
      retryTimers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          retry.forEach((t) => failed.delete(t));
          applyTree(document.body);
        }, delay)
      );
    }

    function scheduleFlush() {
      if (flushTimer !== undefined) return;
      flushTimer = window.setTimeout(() => {
        flushTimer = undefined;
        void flush();
      }, 150);
    }

    applyTree(document.body);

    // Browser tab title.
    const titleEl = document.querySelector("title");
    if (titleEl?.firstChild?.nodeType === Node.TEXT_NODE) applyText(titleEl.firstChild as Text);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData") applyText(m.target as Text);
        else if (m.type === "attributes") applyAttrs(m.target as Element);
        else m.addedNodes.forEach(applyTree);
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATED_ATTRS],
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(flushTimer);
      retryTimers.forEach((t) => window.clearTimeout(t));
    };
  }, [lang, known]);

  return null;
}
