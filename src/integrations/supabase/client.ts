// Resilient Supabase client adapter for Agronauts
// Connects to live Supabase if VITE_SUPABASE_URL is provided,
// or provides a complete, persistent local client with Maharashtra seed data.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Seed data
const DEFAULT_USER = {
  id: 'usr_balasaheb_01',
  email: 'balasaheb.patil@agronauts.in',
  role: 'authenticated',
  user_metadata: {
    full_name: 'Balasaheb Patil',
    phone: '+91 98220 12345',
    village: 'Dindori',
    district: 'Nashik',
    role: 'farmer',
  },
};

const DEFAULT_PROFILE = {
  id: 'usr_balasaheb_01',
  full_name: 'Balasaheb Patil',
  phone: '+91 98220 12345',
  village: 'Dindori',
  district: 'Nashik',
  language: 'mr',
  created_at: new Date().toISOString(),
};

const DEFAULT_USER_ROLES = [
  { id: 'role_01', user_id: 'usr_balasaheb_01', role: 'farmer', created_at: new Date().toISOString() }
];

const DEFAULT_BATCHES = [
  {
    id: 'batch_01',
    batch_code: 'MH-NSK-2026-TOM-01',
    farmer_id: 'usr_balasaheb_01',
    crop: 'Tomato',
    variety: 'Abhinav Hyb',
    quantity_kg: 2500,
    harvest_date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    district: 'Nashik',
    village: 'Dindori',
    notes: 'Graded immediately after morning harvest. Clean, uniform firmness.',
    status: 'listed',
    grade: 'A',
    grade_score: 94.2,
    grade_reason: 'Provisional AI assessment: uniform color, prime harvest index, zero mechanical bruising.',
    grade_source: 'AI',
    storage_location: 'Nashik APMC Cold Chain Hub - Vault A4',
    utilization: 'Fresh market sale',
    is_demo: true,
    demo_farmer_name: 'Balasaheb Patil',
    farmer_phone: '+919822012345',
    farmer_email: 'balasaheb.patil@agronauts.in',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'batch_02',
    batch_code: 'MH-NSK-2026-ONI-02',
    farmer_id: 'usr_balasaheb_01',
    crop: 'Onion',
    variety: 'Gavran Fursungi',
    quantity_kg: 4800,
    harvest_date: new Date(Date.now() - 86400000 * 4).toISOString().slice(0, 10),
    district: 'Nashik',
    village: 'Lasalgaon',
    notes: 'Well cured under field shade. Good dry neck layers.',
    status: 'stored',
    grade: 'A',
    grade_score: 91.0,
    grade_reason: 'Low sprout dormancy risk, tight neck closure, uniform 55-65mm bulb caliber.',
    grade_source: 'AI',
    storage_location: 'Lasalgaon Farmer Producer Co-op Solar Shed - Bay 12',
    utilization: 'Cold storage and hold',
    is_demo: true,
    demo_farmer_name: 'Balasaheb Patil',
    farmer_phone: '+919822012345',
    farmer_email: 'balasaheb.patil@agronauts.in',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'batch_03',
    batch_code: 'MH-PUN-2026-SOY-03',
    farmer_id: 'usr_suresh_02',
    crop: 'Soybean',
    variety: 'JS-335',
    quantity_kg: 3200,
    harvest_date: new Date(Date.now() - 86400000 * 6).toISOString().slice(0, 10),
    district: 'Pune',
    village: 'Junnar',
    notes: 'Threshed under sunny conditions. Low moisture test.',
    status: 'graded',
    grade: 'B',
    grade_score: 82.5,
    grade_reason: 'Standard moisture 12.4%, low foreign matter. Ideal for crushing & feed.',
    grade_source: 'AI',
    storage_location: null,
    utilization: 'Processing (puree / flakes)',
    is_demo: true,
    demo_farmer_name: 'Suresh More',
    farmer_phone: '+919822098765',
    farmer_email: 'suresh.more@agronauts.in',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  }
];

const DEFAULT_LISTINGS = [
  {
    id: 'list_01',
    batch_id: 'batch_01',
    farmer_id: 'usr_balasaheb_01',
    price_per_kg: 24,
    quantity_kg: 2500,
    status: 'open',
    is_demo: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'list_02',
    batch_id: 'batch_02',
    farmer_id: 'usr_balasaheb_01',
    price_per_kg: 18,
    quantity_kg: 4800,
    status: 'open',
    is_demo: true,
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
  {
    id: 'list_03',
    batch_id: 'batch_03',
    farmer_id: 'usr_suresh_02',
    price_per_kg: 48,
    quantity_kg: 3200,
    status: 'open',
    is_demo: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

const DEFAULT_ORDERS = [
  {
    id: 'ord_01',
    listing_id: 'list_01',
    batch_id: 'batch_01',
    buyer_id: 'buyer_mumbai_01',
    farmer_id: 'usr_balasaheb_01',
    quantity_kg: 1000,
    price_per_kg: 24,
    total_amount: 24000,
    status: 'confirmed',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  }
];

const DEFAULT_EVENTS = [
  {
    id: 'ev_01',
    batch_id: 'batch_01',
    event_type: 'harvest',
    description: 'Harvested 2,500 kg Abhinav Tomato at Dindori, Nashik',
    actor_id: 'usr_balasaheb_01',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    metadata: {},
  },
  {
    id: 'ev_02',
    batch_id: 'batch_01',
    event_type: 'grading',
    description: 'Provisional grade A (94.2) - source: AI',
    actor_id: 'usr_balasaheb_01',
    created_at: new Date(Date.now() - 86400000 * 1.8).toISOString(),
    metadata: {},
  },
  {
    id: 'ev_03',
    batch_id: 'batch_01',
    event_type: 'storage',
    description: 'Stored at Nashik APMC Cold Chain Hub - Vault A4',
    actor_id: 'usr_balasaheb_01',
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    metadata: {},
  },
  {
    id: 'ev_04',
    batch_id: 'batch_01',
    event_type: 'listing',
    description: 'Listed on marketplace at Rs 24.00/kg',
    actor_id: 'usr_balasaheb_01',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    metadata: {},
  },
  {
    id: 'ev_05',
    batch_id: 'batch_01',
    event_type: 'order',
    description: 'Order placed by Mumbai Retailers Co-op for 1,000 kg',
    actor_id: 'buyer_mumbai_01',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    metadata: {},
  }
];

class LocalDb {
  private getStorage<T>(key: string, defaultVal: T): T {
    try {
      const stored = localStorage.getItem(`agronauts_db_${key}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return defaultVal;
  }

  private setStorage<T>(key: string, val: T) {
    try {
      localStorage.setItem(`agronauts_db_${key}`, JSON.stringify(val));
    } catch {
      // ignore
    }
  }

  get batches(): any[] { return this.getStorage('batches', DEFAULT_BATCHES); }
  set batches(val: any[]) { this.setStorage('batches', val); }

  get listings(): any[] { return this.getStorage('listings', DEFAULT_LISTINGS); }
  set listings(val: any[]) { this.setStorage('listings', val); }

  get orders(): any[] { return this.getStorage('orders', DEFAULT_ORDERS); }
  set orders(val: any[]) { this.setStorage('orders', val); }

  get batch_events(): any[] { return this.getStorage('batch_events', DEFAULT_EVENTS); }
  set batch_events(val: any[]) { this.setStorage('batch_events', val); }

  get profiles(): any[] { return this.getStorage('profiles', [DEFAULT_PROFILE]); }
  set profiles(val: any[]) { this.setStorage('profiles', val); }

  get user_roles(): any[] { return this.getStorage('user_roles', DEFAULT_USER_ROLES); }
  set user_roles(val: any[]) { this.setStorage('user_roles', val); }

  get currentUser(): any | null { return this.getStorage('current_user', null); }
  set currentUser(val: any | null) { this.setStorage('current_user', val); }
}

const localDb = new LocalDb();

class MockQueryBuilder {
  private tableName: string;
  private filters: ((item: any) => boolean)[] = [];
  private orderFn?: (a: any, b: any) => number;
  private limitCount?: number;
  private mutationResult?: any;

  constructor(table: string) {
    this.tableName = table;
  }

  select(_columns = '*') {
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push((item) => String(item[col]) === String(val));
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    const asc = options?.ascending ?? true;
    this.orderFn = (a, b) => {
      const va = a[col] ?? '';
      const vb = b[col] ?? '';
      return asc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    };
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  private getData(): any[] {
    let items = (localDb as any)[this.tableName] || [];
    for (const f of this.filters) {
      items = items.filter(f);
    }
    if (this.orderFn) {
      items = [...items].sort(this.orderFn);
    }
    if (this.limitCount !== undefined) {
      items = items.slice(0, this.limitCount);
    }
    // Deep clone to prevent mutation bugs
    return JSON.parse(JSON.stringify(items));
  }

  async then(resolve: (res: { data: any; error: any }) => void) {
    if (this.mutationResult !== undefined) {
      resolve({ data: this.mutationResult, error: null });
      return;
    }
    let data = this.getData();
    // Join simulation for marketplace & orders
    if (this.tableName === 'listings') {
      const allBatches = localDb.batches;
      data = data.map((item) => ({
        ...item,
        batches: allBatches.find((b) => b.id === item.batch_id) || null,
      }));
    } else if (this.tableName === 'orders') {
      const allBatches = localDb.batches;
      data = data.map((item) => ({
        ...item,
        batches: allBatches.find((b) => b.id === item.batch_id) || null,
      }));
    }
    resolve({ data, error: null });
  }

  async maybeSingle() {
    if (this.mutationResult !== undefined) {
      const res = Array.isArray(this.mutationResult) ? this.mutationResult[0] : this.mutationResult;
      return { data: res || null, error: null };
    }
    const data = this.getData();
    return { data: data[0] || null, error: null };
  }

  async single() {
    if (this.mutationResult !== undefined) {
      const res = Array.isArray(this.mutationResult) ? this.mutationResult[0] : this.mutationResult;
      return { data: res || null, error: null };
    }
    const data = this.getData();
    return { data: data[0] || null, error: data[0] ? null : { message: "Row not found" } };
  }

  insert(record: any | any[]) {
    const list = Array.isArray(record) ? record : [record];
    const tableItems = [...((localDb as any)[this.tableName] || [])];
    const created: any[] = [];
    for (const item of list) {
      const id = item.id || `id_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      let batchCode = item.batch_code;
      if (this.tableName === 'batches' && (!batchCode || batchCode.trim() === '')) {
        const distCode = (item.district || 'NSK').slice(0, 3).toUpperCase();
        const cropCode = (item.crop || 'CRP').slice(0, 3).toUpperCase();
        const randomNum = Math.floor(100 + Math.random() * 900);
        batchCode = `MH-${distCode}-2026-${cropCode}-${randomNum}`;
      }
      const newItem = {
        id,
        created_at: item.created_at || new Date().toISOString(),
        ...item,
        ...(batchCode ? { batch_code: batchCode } : {}),
      };
      tableItems.unshift(newItem);
      created.push(newItem);
    }
    (localDb as any)[this.tableName] = tableItems;
    this.mutationResult = Array.isArray(record) ? created : created[0];
    return this;
  }

  update(patch: any) {
    const tableItems = [...((localDb as any)[this.tableName] || [])];
    let updatedCount = 0;
    const updatedItems: any[] = [];
    const next = tableItems.map((item) => {
      let match = true;
      for (const f of this.filters) {
        if (!f(item)) { match = false; break; }
      }
      if (match) {
        updatedCount++;
        const updated = { ...item, ...patch };
        updatedItems.push(updated);
        return updated;
      }
      return item;
    });
    (localDb as any)[this.tableName] = next;
    this.mutationResult = updatedItems[0] || patch;
    return this;
  }

  async delete() {
    const tableItems = [...((localDb as any)[this.tableName] || [])];
    const next = tableItems.filter((item) => {
      for (const f of this.filters) {
        if (!f(item)) return true;
      }
      return false;
    });
    (localDb as any)[this.tableName] = next;
    return { data: null, error: null };
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
    return new MockQueryBuilder(table);
  }
}

export const supabase = (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : (new MockSupabaseClient() as any);
