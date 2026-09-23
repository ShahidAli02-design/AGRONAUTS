import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';

// Live mandi (APMC) prices for every state, district, market and commodity,
// from the Government of India "Current Daily Price of Various Commodities
// from Various Markets (Mandi)" dataset (Agmarknet) on data.gov.in.
//
// Get a free API key at https://data.gov.in (Sign up -> My Account -> API key)
// and set DATA_GOV_API_KEY. Without it the public sample key is used, which
// data.gov.in limits to 10 rows per request, so only a small slice loads.

export const mandiRouter = Router();

const SAMPLE_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
// Read lazily: env files are loaded after this module is imported.
const apiUrl = () => process.env.MANDI_API_URL || 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const apiKey = () => process.env.DATA_GOV_API_KEY || SAMPLE_KEY;
const usingSampleKey = () => apiKey() === SAMPLE_KEY;
const pageSize = () => (usingSampleKey() ? 10 : 1000);
const maxPages = () => (usingSampleKey() ? 30 : 60);
const TTL_MS = 30 * 60 * 1000;
const SNAPSHOT_FILE = path.join(process.cwd(), 'data', 'mandi-snapshot.json');

export type MandiRecord = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string; // dd/mm/yyyy as published
  min_price: number; // ₹ per quintal
  max_price: number;
  modal_price: number;
  category: string;
};

const CATEGORY_WORDS: [string, string[]][] = [
  ['Spices', ['turmeric', 'cumin', 'jeera', 'coriander seed', 'dhaniya', 'black pepper', 'cardamom', 'clove', 'fennel', 'ajwan', 'methi seeds', 'dry chillies', 'red chilli', 'nutmeg', 'mace', 'cinnamon', 'tamarind']],
  ['Vegetables', ['tomato', 'onion', 'potato', 'brinjal', 'cabbage', 'cauliflower', 'okra', 'bhindi', 'lady finger', 'chilli', 'capsicum', 'carrot', 'radish', 'peas', 'gourd', 'pumpkin', 'cucumber', 'spinach', 'methi', 'coriander', 'beans', 'beetroot', 'drumstick', 'sweet potato', 'colacasia', 'knool khol', 'leafy', 'amaranthus', 'tinda', 'ginger(green)', 'garlic', 'mushroom', 'elephant yam', 'suran', 'tapioca', 'cluster', 'squash', 'snakeguard', 'kundru', 'parval', 'little gourd', 'lemon', 'lime', 'turnip', 'green chilli', 'mint', 'spring onion', 'raddish']],
  ['Fruits', ['apple', 'banana', 'mango', 'grapes', 'orange', 'pomegranate', 'papaya', 'guava', 'pineapple', 'watermelon', 'water melon', 'musk melon', 'muskmelon', 'sapota', 'chikoo', 'custard apple', 'jack fruit', 'litchi', 'mosambi', 'sweet lime', 'pear', 'plum', 'peach', 'kinnow', 'amla', 'ber', 'fig', 'strawberry', 'kiwi', 'coconut', 'dates', 'jamun']],
  ['Grains', ['wheat', 'rice', 'paddy', 'maize', 'jowar', 'bajra', 'ragi', 'barley', 'millet', 'sorghum', 'foxtail', 'kodo', 'kutki']],
  ['Pulses', ['gram', 'arhar', 'tur', 'moong', 'urad', 'masur', 'lentil', 'rajma', 'cowpea', 'lobia', 'peas(dry)', 'kulthi', 'horse gram', 'moth', 'bengal gram', 'green gram', 'black gram', 'kabuli', 'chana', 'pegeon', 'pigeon', 'alasande']],
  ['Oilseeds', ['groundnut', 'soyabean', 'soybean', 'mustard', 'sunflower', 'sesamum', 'sesame', 'til', 'castor', 'linseed', 'safflower', 'niger', 'copra', 'cotton seed']],
];

function categorize(commodity: string): string {
  const c = commodity.toLowerCase();
  for (const [cat, words] of CATEGORY_WORDS) if (words.some((w) => c.includes(w))) return cat;
  return 'Others';
}

const pick = (r: Record<string, any>, ...keys: string[]) => {
  for (const k of keys) if (r[k] !== undefined && r[k] !== null && r[k] !== '') return r[k];
  return '';
};

function normalize(r: Record<string, any>): MandiRecord {
  const commodity = String(pick(r, 'commodity', 'Commodity')).trim();
  return {
    state: String(pick(r, 'state', 'State')).trim(),
    district: String(pick(r, 'district', 'District')).trim(),
    market: String(pick(r, 'market', 'Market')).trim(),
    commodity,
    variety: String(pick(r, 'variety', 'Variety')).trim(),
    grade: String(pick(r, 'grade', 'Grade')).trim(),
    arrival_date: String(pick(r, 'arrival_date', 'Arrival_Date')).trim(),
    min_price: Number(pick(r, 'min_price', 'Min_x0020_Price', 'Min_Price')) || 0,
    max_price: Number(pick(r, 'max_price', 'Max_x0020_Price', 'Max_Price')) || 0,
    modal_price: Number(pick(r, 'modal_price', 'Modal_x0020_Price', 'Modal_Price')) || 0,
    category: categorize(commodity),
  };
}

type Snapshot = { records: MandiRecord[]; fetchedAt: string; total: number };
let cache: Snapshot | null = null;
let cacheTime = 0;
let inflight: Promise<Snapshot> | null = null;
let lastError: string | null = null;

function readSnapshot(): Snapshot | null {
  try {
    return JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
  } catch {
    return null;
  }
}

async function fetchPage(offset: number): Promise<{ records: any[]; total: number }> {
  const url = `${apiUrl()}?api-key=${encodeURIComponent(apiKey())}&format=json&limit=${pageSize()}&offset=${offset}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`data.gov.in responded ${res.status}`);
  const json: any = await res.json();
  if (!Array.isArray(json?.records)) throw new Error(json?.message || 'Unexpected response from data.gov.in');
  return { records: json.records, total: Number(json.total) || json.records.length };
}

async function loadAll(): Promise<Snapshot> {
  const first = await fetchPage(0);
  const all = [...first.records];
  const pages = Math.min(maxPages(), Math.ceil(first.total / pageSize()));
  for (let p = 1; p < pages; p += 4) {
    const batch = await Promise.all(
      [0, 1, 2, 3].filter((i) => p + i < pages).map((i) => fetchPage((p + i) * pageSize()).catch(() => ({ records: [], total: 0 })))
    );
    batch.forEach((b) => all.push(...b.records));
  }
  const snap: Snapshot = { records: all.map(normalize).filter((r) => r.commodity && r.market), fetchedAt: new Date().toISOString(), total: first.total };
  try {
    fs.mkdirSync(path.dirname(SNAPSHOT_FILE), { recursive: true });
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snap));
  } catch {
    // snapshot is best-effort
  }
  return snap;
}

async function getData(): Promise<{ snap: Snapshot | null; stale: boolean }> {
  if (cache && Date.now() - cacheTime < TTL_MS) return { snap: cache, stale: false };
  if (!inflight) {
    inflight = loadAll()
      .then((snap) => {
        cache = snap;
        cacheTime = Date.now();
        lastError = null;
        return snap;
      })
      .finally(() => {
        inflight = null;
      });
  }
  try {
    return { snap: await inflight, stale: false };
  } catch (err: any) {
    lastError = err?.message || 'Could not reach data.gov.in';
    console.warn('Mandi price fetch failed:', lastError);
    const fallback = cache || readSnapshot();
    return { snap: fallback, stale: true };
  }
}

const eq = (a: string, b?: unknown) => !b || a.toLowerCase() === String(b).toLowerCase();
const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort((a, b) => a.localeCompare(b));

// dd/mm/yyyy -> yyyy-mm-dd for sorting
const dateKey = (d: string) => {
  const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : d;
};

mandiRouter.get('/mandi/prices', async (req: Request, res: Response) => {
  const { snap, stale } = await getData();
  if (!snap) {
    return res.status(503).json({
      success: false,
      error: `Live mandi prices are unavailable right now (${lastError ?? 'no connection'}). Check the server's internet access and DATA_GOV_API_KEY.`,
    });
  }
  const { state, district, market, commodity, category, q, sort = 'commodity' } = req.query as Record<string, string>;
  const limit = Math.min(500, Number(req.query.limit) || 100);
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const query = (q || '').trim().toLowerCase();
  let rows = snap.records.filter(
    (r) =>
      eq(r.state, state) &&
      eq(r.district, district) &&
      eq(r.market, market) &&
      eq(r.commodity, commodity) &&
      eq(r.category, category) &&
      (!query || `${r.commodity} ${r.variety} ${r.market} ${r.district} ${r.state}`.toLowerCase().includes(query))
  );
  const sorters: Record<string, (a: MandiRecord, b: MandiRecord) => number> = {
    commodity: (a, b) => a.commodity.localeCompare(b.commodity) || a.market.localeCompare(b.market),
    price_high: (a, b) => b.modal_price - a.modal_price,
    price_low: (a, b) => a.modal_price - b.modal_price,
    market: (a, b) => a.state.localeCompare(b.state) || a.district.localeCompare(b.district) || a.market.localeCompare(b.market),
    latest: (a, b) => dateKey(b.arrival_date).localeCompare(dateKey(a.arrival_date)),
  };
  rows = [...rows].sort(sorters[sort] || sorters.commodity);
  res.json({
    success: true,
    total: rows.length,
    records: rows.slice(offset, offset + limit),
    fetchedAt: snap.fetchedAt,
    stale,
    staleReason: stale ? lastError : null,
    limitedSampleKey: usingSampleKey(),
    source: 'Agmarknet · data.gov.in (Govt. of India)',
  });
});

mandiRouter.get('/mandi/options', async (req: Request, res: Response) => {
  const { snap } = await getData();
  if (!snap) return res.status(503).json({ success: false, error: 'Live mandi prices are unavailable right now.' });
  const { state, district } = req.query as Record<string, string>;
  const inState = snap.records.filter((r) => eq(r.state, state));
  const inDistrict = inState.filter((r) => eq(r.district, district));
  res.json({
    success: true,
    states: uniq(snap.records.map((r) => r.state)),
    districts: state ? uniq(inState.map((r) => r.district)) : [],
    markets: district ? uniq(inDistrict.map((r) => r.market)) : [],
    commodities: uniq(inDistrict.map((r) => r.commodity)),
    categories: uniq(snap.records.map((r) => r.category)),
  });
});
