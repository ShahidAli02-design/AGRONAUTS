// Resilient Supabase client adapter for Agronauts
// Connects to live Supabase if VITE_SUPABASE_URL is provided,
// or provides a complete, persistent local client with Maharashtra seed data.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const CURRENT_USER_KEY = 'agronauts_db_current_user';
const localDb = {
  get currentUser(): any | null {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  set currentUser(val: any | null) {
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(val));
    } catch {
      // ignore
    }
  },
  profiles: [] as any[],
  user_roles: [] as any[],
};

type DbResult = { data: any; error: { message: string } | null };

// Supabase-style query builder backed by the shared server database
// (server/store.ts via /api/db), so every user and the admin dashboard see the
// same live data instead of a private copy in each browser.
class ServerQueryBuilder {
  private filters: [string, unknown][] = [];
  private orderBy?: { column: string; ascending?: boolean };
  private limitCount?: number;
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private payload: any;

  constructor(private tableName: string) {}

  select(_columns = '*') {
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push([col, val]);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  insert(record: any | any[]) {
    this.op = 'insert';
    this.payload = record;
    return this;
  }

  update(patch: any) {
    this.op = 'update';
    this.payload = patch;
    return this;
  }

  delete() {
    this.op = 'delete';
    return this;
  }

  private async run(): Promise<DbResult> {
    try {
      const res = await fetch(`/api/db/${this.tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          op: this.op,
          filters: this.filters,
          order: this.orderBy,
          limit: this.limitCount,
          record: this.op === 'insert' ? this.payload : undefined,
          patch: this.op === 'update' ? this.payload : undefined,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) return { data: null, error: { message: json?.error || `Request failed (${res.status})` } };
      const data = this.op === 'insert' && !Array.isArray(this.payload) ? json.data?.[0] ?? null : json.data;
      return { data, error: null };
    } catch {
      return { data: null, error: { message: 'Cannot reach the server. Check your internet connection.' } };
    }
  }

  then<T>(resolve: (res: DbResult) => T, reject?: (err: unknown) => T) {
    return this.run().then(resolve, reject);
  }

  async maybeSingle(): Promise<DbResult> {
    const r = await this.run();
    if (r.error) return r;
    return { data: Array.isArray(r.data) ? r.data[0] ?? null : r.data, error: null };
  }

  async single(): Promise<DbResult> {
    const r = await this.maybeSingle();
    if (r.error) return r;
    return r.data ? r : { data: null, error: { message: 'Row not found' } };
  }
}

class MockSupabaseClient {
  auth = {
    async getUser() {
      return { data: { user: localDb.currentUser }, error: null };
    },
    async getSession() {
      return {
        data: {
          session: localDb.currentUser
            ? { user: localDb.currentUser, access_token: 'mock_token' }
            : null,
        },
        error: null,
      };
    },
    async signInWithPassword({ email, password }: { email: string; password?: string }) {
      const user = {
        id: 'usr_balasaheb_01',
        email,
        role: 'authenticated',
        user_metadata: {
          full_name: email.includes('buyer') ? 'Sahyadri Agro Buyer' : 'Balasaheb Patil',
          role: email.includes('buyer') ? 'buyer' : 'farmer',
          district: 'Nashik',
          village: 'Dindori',
          phone: '+91 98220 12345',
        },
      };
      localDb.currentUser = user;
      this.notify('SIGNED_IN', user);
      return { data: { user, session: { user, access_token: 'mock_token' } }, error: null };
    },
    async signUp({ email, password, options }: any) {
      const user = {
        id: `usr_${Date.now()}`,
        email,
        role: 'authenticated',
        user_metadata: options?.data || {},
      };
      localDb.currentUser = user;
      if (options?.data) {
        const p = {
          id: user.id,
          full_name: options.data.full_name || 'Agri User',
          phone: options.data.phone || null,
          village: options.data.village || null,
          district: options.data.district || 'Nashik',
          language: 'mr',
          created_at: new Date().toISOString(),
        };
        localDb.profiles = [p, ...localDb.profiles];
        localDb.user_roles = [
          { id: `role_${Date.now()}`, user_id: user.id, role: options.data.role || 'farmer', created_at: new Date().toISOString() },
          ...localDb.user_roles,
        ];
      }
      this.notify('SIGNED_IN', user);
      return { data: { user, session: { user, access_token: 'mock_token' } }, error: null };
    },
    async signOut() {
      localDb.currentUser = null;
      this.notify('SIGNED_OUT', null);
      return { error: null };
    },
    async setSession(tokens: any) {
      return { error: null };
    },
    listeners: new Set<(event: string, session: any) => void>(),
    onAuthStateChange(callback: (event: string, session: any) => void) {
      this.listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              this.listeners.delete(callback);
            },
          },
        },
      };
    },
    notify(event: string, user: any) {
      const session = user ? { user, access_token: 'mock_token' } : null;
      this.listeners.forEach((cb) => cb(event, session));
    },
  };

  from(table: string) {
    return new ServerQueryBuilder(table);
  }
}

export const supabase = (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : (new MockSupabaseClient() as any);
