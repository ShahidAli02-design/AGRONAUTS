import fs from 'fs';
import path from 'path';
import pg from 'pg';
import {
  DEFAULT_USERS,
  DEFAULT_PROFILE,
  DEFAULT_USER_ROLES,
  DEFAULT_BATCHES,
  DEFAULT_LISTINGS,
  DEFAULT_ORDERS,
  DEFAULT_EVENTS,
} from '../src/integrations/supabase/seed';

// The shared AGRONAUTS database. Every browser (farmer, buyer, processor,
// admin) reads and writes the same rows through /api/db and /api/auth, so a
// listing created on one phone shows up on everyone's marketplace, orders
// reach the seller, and new sign-ups appear in the admin dashboard.
// Rows are persisted to a JSON file, and — when DATABASE_URL points at a
// Postgres database (Neon, Supabase, Render Postgres…) — to Postgres too.
// Free hosts such as Render wipe local files on every restart/redeploy and
// when an idle free instance sleeps, so Postgres is what keeps accounts,
// batches and orders permanently.

export type Row = Record<string, any>;

export const TABLES = [
  'users',
  'profiles',
  'user_roles',
  'batches',
  'listings',
  'orders',
  'order_events',
  'batch_events',
  'tool_history',
] as const;
export type TableName = (typeof TABLES)[number];

const DATA_FILE = process.env.AGRONAUTS_DB_FILE || path.join(process.cwd(), 'data', 'agronauts-db.json');

function seed(): Record<TableName, Row[]> {
  return {
    users: DEFAULT_USERS.map((u) => ({ ...u, status: 'ACTIVE' })),
    profiles: [DEFAULT_PROFILE],
    user_roles: DEFAULT_USER_ROLES,
    batches: DEFAULT_BATCHES,
    listings: DEFAULT_LISTINGS,
    orders: DEFAULT_ORDERS,
    order_events: DEFAULT_ORDERS.map((o) => ({
      id: `oev_${o.id}_placed`,
      order_id: o.id,
      status: 'placed',
      note: 'Order placed',
      actor_id: o.buyer_id,
      created_at: o.created_at,
    })),
    batch_events: DEFAULT_EVENTS,
    tool_history: [],
  };
}

function load(): Record<TableName, Row[]> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      const base = seed();
      for (const t of TABLES) if (Array.isArray(parsed[t])) base[t] = parsed[t];
      return base;
    }
  } catch (err) {
    console.warn('Could not read database file, starting from seed data:', err);
  }
  return seed();
}

const data = load();
let saveTimer: NodeJS.Timeout | undefined;
let revision = 0;

function persist() {
  revision++;
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = undefined;
    try {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE + '.tmp', JSON.stringify(data, null, 1));
      fs.renameSync(DATA_FILE + '.tmp', DATA_FILE);
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }, 200);
}

// ---------------------------------------------------------------------------
// Postgres persistence (optional, enabled by DATABASE_URL)
// ---------------------------------------------------------------------------

let pool: pg.Pool | null = null;
type PendingWrite = { kind: 'upsert'; table: string; rows: Row[] } | { kind: 'delete'; table: string; ids: string[] };
const writeQueue: PendingWrite[] = [];
let flushing = false;

function sslFor(url: string) {
  if (/sslmode=disable/.test(url) || /@(localhost|127\.0\.0\.1)[:/]/.test(url)) return undefined;
  return { rejectUnauthorized: false };
}

export function usingPostgres() {
  return pool !== null;
}

async function upsertRows(client: pg.Pool, table: string, rows: Row[]) {
  for (const row of rows) {
    await client.query(
      `INSERT INTO agronauts_rows (tbl, id, data, updated_at) VALUES ($1, $2, $3, now())
       ON CONFLICT (tbl, id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [table, String(row.id), JSON.stringify(row)]
    );
  }
}

async function flushWrites() {
  if (flushing || !pool) return;
  flushing = true;
  try {
    while (writeQueue.length) {
      const job = writeQueue[0];
      try {
        if (job.kind === 'upsert') await upsertRows(pool, job.table, job.rows);
        else await pool.query('DELETE FROM agronauts_rows WHERE tbl = $1 AND id = ANY($2)', [job.table, job.ids]);
        writeQueue.shift();
      } catch (err) {
        console.error('Postgres write failed, retrying in 5s:', err instanceof Error ? err.message : err);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  } finally {
    flushing = false;
  }
}

function queueWrite(job: PendingWrite) {
  if (!pool) return;
  writeQueue.push(job);
  void flushWrites();
}

// Small key/value values (e.g. the last mandi price snapshot) in the same table.
export async function kvGet<T>(key: string): Promise<T | null> {
  if (!pool) return null;
  try {
    const r = await pool.query("SELECT data FROM agronauts_rows WHERE tbl = '_kv' AND id = $1", [key]);
    return (r.rows[0]?.data?.value as T) ?? null;
  } catch {
    return null;
  }
}

export function kvSet(key: string, value: unknown) {
  queueWrite({ kind: 'upsert', table: '_kv', rows: [{ id: key, value }] });
}

// Call once before the server starts listening.
export async function initStore() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('Database: local file (set DATABASE_URL to a Postgres database to keep data across restarts).');
    return;
  }
  pool = new pg.Pool({ connectionString: url, ssl: sslFor(url), max: 4 });
  await pool.query(`CREATE TABLE IF NOT EXISTS agronauts_rows (
    tbl text NOT NULL,
    id text NOT NULL,
    data jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (tbl, id)
  )`);
  const { rows } = await pool.query("SELECT tbl, data FROM agronauts_rows WHERE tbl <> '_kv'");
  if (rows.length) {
    for (const t of TABLES) data[t] = [];
    for (const r of rows) if (isTable(r.tbl)) data[r.tbl].push(r.data);
    for (const t of TABLES) data[t].sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')));
    console.log(`Database: Postgres (${rows.length} rows loaded).`);
  } else {
    // First run on a fresh database: copy the current data (file or seed) in.
    for (const t of TABLES) if (data[t].length) await upsertRows(pool, t, data[t]);
    console.log('Database: Postgres (initialised with starting data).');
  }
}

export function getRevision() {
  return revision;
}

export function isTable(t: unknown): t is TableName {
  return typeof t === 'string' && (TABLES as readonly string[]).includes(t);
}

export function table(name: TableName): Row[] {
  return data[name];
}

export type Filter = [column: string, value: unknown];

const matches = (row: Row, filters: Filter[]) => filters.every(([c, v]) => String(row[c]) === String(v));
const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function batchCode(item: Row): string {
  const dist = String(item.district || 'NSK').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'NSK';
  const crop = String(item.crop || 'CRP').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'CRP';
  const year = new Date().getFullYear();
  for (;;) {
    const code = `MH-${dist}-${year}-${crop}-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!data.batches.some((b) => b.batch_code === code)) return code;
  }
}

export function select(name: TableName, filters: Filter[] = [], order?: { column: string; ascending?: boolean }, limit?: number): Row[] {
  let rows = data[name].filter((r) => matches(r, filters));
  if (order) {
    const asc = order.ascending ?? true;
    rows = [...rows].sort((a, b) => {
      const va = a[order.column] ?? '';
      const vb = b[order.column] ?? '';
      return va === vb ? 0 : (va > vb ? 1 : -1) * (asc ? 1 : -1);
    });
  }
  if (limit !== undefined) rows = rows.slice(0, limit);
  return rows;
}

export function insert(name: TableName, records: Row[]): Row[] {
  const created = records.map((item) => {
    const row: Row = { id: newId(name.slice(0, 3)), created_at: new Date().toISOString(), ...item };
    if (name === 'batches' && !String(row.batch_code || '').trim()) row.batch_code = batchCode(row);
    if (name === 'batches' && !row.status) row.status = 'harvested';
    return row;
  });
  data[name].unshift(...created);
  persist();
  queueWrite({ kind: 'upsert', table: name, rows: created });
  return created;
}

export function update(name: TableName, filters: Filter[], patch: Row): Row[] {
  const updated: Row[] = [];
  data[name] = data[name].map((row) => {
    if (!matches(row, filters)) return row;
    const next = { ...row, ...patch, id: row.id, updated_at: new Date().toISOString() };
    updated.push(next);
    return next;
  });
  if (updated.length) {
    persist();
    queueWrite({ kind: 'upsert', table: name, rows: updated });
  }
  return updated;
}

export function remove(name: TableName, filters: Filter[]): Row[] {
  const removed = data[name].filter((r) => matches(r, filters));
  data[name] = data[name].filter((r) => !matches(r, filters));
  if (removed.length) {
    persist();
    queueWrite({ kind: 'delete', table: name, ids: removed.map((r) => String(r.id)) });
  }
  return removed;
}

// Adds rows from related tables the way the pages' select strings expect
// (e.g. listings(...batches(...)) and orders(...batches(...))).
export function withRelations(name: TableName, rows: Row[]): Row[] {
  if (name === 'listings' || name === 'orders') {
    return rows.map((r) => ({ ...r, batches: data.batches.find((b) => b.id === r.batch_id) ?? null }));
  }
  if (name === 'tool_history') {
    return rows.map((r) => {
      const u = data.users.find((x) => x.id === r.user_id);
      return { ...r, user_name: u?.full_name ?? null, user_role: u?.role ?? null };
    });
  }
  return rows;
}

export function publicUser(u: Row) {
  const { passwordHash: _omit, ...rest } = u;
  return rest;
}
