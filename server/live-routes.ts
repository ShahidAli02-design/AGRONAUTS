import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db';
import * as store from './store';
import type { ProduceBatch, Order, User, ProduceGrade, BatchStatus, MarketplaceListing } from './types';

// Live, shared data API used by the pages (via the supabase-style adapter in
// src/integrations/supabase/client.ts) and by the admin dashboard.
export const liveRouter = Router();

const bad = (res: Response, status: number, error: string) => res.status(status).json({ success: false, error });

// ---------------------------------------------------------------------------
// Generic table access
// ---------------------------------------------------------------------------

liveRouter.get('/db/revision', (_req, res) => {
  res.json({ success: true, revision: store.getRevision() });
});

liveRouter.post('/db/:table', (req: Request, res: Response) => {
  const name = req.params.table;
  // Accounts and order state changes go through the dedicated endpoints below.
  if (!store.isTable(name) || name === 'users') return bad(res, 404, `Unknown table ${name}`);
  const { op = 'select', filters = [], order, limit, record, patch } = req.body || {};
  const f: store.Filter[] = Array.isArray(filters) ? filters.filter((x: unknown) => Array.isArray(x) && x.length === 2) : [];

  try {
    if (op === 'select') {
      return res.json({ success: true, data: store.withRelations(name, store.select(name, f, order, limit)) });
    }
    if (op === 'insert') {
      if (name === 'listings' || name === 'orders' || name === 'order_events') {
        return bad(res, 400, `Use the ${name === 'listings' ? '/market/listings' : '/orders'} endpoint`);
      }
      const rows = Array.isArray(record) ? record : [record];
      return res.json({ success: true, data: store.insert(name, rows.filter(Boolean)) });
    }
    if (op === 'update') {
      if (!f.length) return bad(res, 400, 'Refusing to update without a filter');
      if (name === 'orders') return bad(res, 400, 'Use /orders/:id/status to change an order');
      if (name === 'batches') {
        const err = checkBatchStep(f, patch || {});
        if (err) return bad(res, 409, err);
      }
      return res.json({ success: true, data: store.update(name, f, patch || {}) });
    }
    if (op === 'delete') {
      if (!f.length) return bad(res, 400, 'Refusing to delete without a filter');
      return res.json({ success: true, data: store.remove(name, f) });
    }
    return bad(res, 400, `Unknown op ${op}`);
  } catch (err: any) {
    return bad(res, 500, err?.message || 'Database error');
  }
});

// Harvest batches move strictly forward: graded -> stored -> utilization
// decided -> listed -> sold/delivered. A step can't be done before the
// previous one, even if someone calls the API directly.
function checkBatchStep(filters: store.Filter[], patch: store.Row): string | null {
  const batch = store.select('batches', filters)[0];
  if (!batch) return null;
  if (patch.status === 'not_for_sale' || patch.grade === 'NFS') return null;
  if (batch.status === 'not_for_sale' && (patch.storage_location || patch.utilization || patch.status === 'listed')) {
    return 'This batch was marked NOT FOR SALE by quality grading and cannot continue.';
  }
  if ('storage_location' in patch && !batch.grade) return 'Grade the batch (step 1) before choosing storage.';
  if ('utilization' in patch && !batch.storage_location) return 'Save the storage location (step 2) before choosing utilization.';
  if (['sold', 'delivered'].includes(batch.status) && ('grade' in patch || 'storage_location' in patch || 'utilization' in patch)) {
    return 'This batch is already sold and can no longer be changed.';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

liveRouter.post('/auth/register', (req: Request, res: Response) => {
  const u = req.body || {};
  const email = String(u.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad(res, 400, 'Please enter a valid email address.');
  if (!u.passwordHash || String(u.passwordHash).length < 6) return bad(res, 400, 'Password must be at least 6 characters.');
  if (!String(u.full_name || '').trim()) return bad(res, 400, 'Please enter your full name.');
  if (!['farmer', 'buyer', 'processor', 'admin'].includes(u.role)) return bad(res, 400, 'Please choose a role.');
  if (store.table('users').some((x) => String(x.email).toLowerCase() === email)) {
    return bad(res, 409, 'An account with this email address already exists. Please sign in instead.');
  }
  const [created] = store.insert('users', [
    {
      id: `usr-${Date.now()}`,
      email,
      passwordHash: String(u.passwordHash),
      full_name: String(u.full_name).trim(),
      phone: String(u.phone || ''),
      village: String(u.village || ''),
      district: String(u.district || ''),
      role: u.role,
      language: u.language || 'mr',
      landVerified: u.landVerified,
      status: 'ACTIVE',
    },
  ]);
  store.insert('profiles', [
    { id: created.id, full_name: created.full_name, phone: created.phone, village: created.village, district: created.district, language: created.language },
  ]);
  store.insert('user_roles', [{ user_id: created.id, role: created.role }]);
  db.addAuditLog('system', 'USER_REGISTERED', `${created.full_name} (${created.id})`, `New ${created.role} account registered: ${created.email}`);
  res.json({ success: true, user: store.publicUser(created) });
});

liveRouter.post('/auth/login', (req: Request, res: Response) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = store.table('users').find((x) => String(x.email).toLowerCase() === email && x.passwordHash === password);
  if (!user) return bad(res, 401, 'Invalid email or password. Please verify your credentials or select a verified demo account below.');
  if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
    return bad(res, 403, `This account is ${String(user.status).toLowerCase()} by the administrator. Please contact support.`);
  }
  store.update('users', [['id', user.id]], { lastActive: new Date().toISOString() });
  res.json({ success: true, user: store.publicUser(user) });
});

liveRouter.get('/auth/users/:id', (req: Request, res: Response) => {
  const user = store.select('users', [['id', req.params.id]])[0];
  if (!user) return bad(res, 404, 'User not found');
  res.json({ success: true, user: store.publicUser(user) });
});

// ---------------------------------------------------------------------------
// Marketplace
// ---------------------------------------------------------------------------

liveRouter.post('/market/listings', (req: Request, res: Response) => {
  const { batch_id, farmer_id, price_per_kg, quantity_kg } = req.body || {};
  const batch = store.select('batches', [['id', batch_id]])[0];
  if (!batch) return bad(res, 404, 'Batch not found.');
  if (batch.farmer_id !== farmer_id) return bad(res, 403, 'Only the farmer who owns this batch can list it.');
  if (batch.status === 'not_for_sale') return bad(res, 409, 'This batch was marked NOT FOR SALE and cannot be listed.');
  if (!batch.grade) return bad(res, 409, 'Step 1 first: grade the batch before listing it.');
  if (!batch.storage_location) return bad(res, 409, 'Step 2 first: save where the batch is stored.');
  if (!batch.utilization) return bad(res, 409, 'Step 3 first: choose the utilization decision.');
  if (['sold', 'delivered'].includes(batch.status)) return bad(res, 409, 'This batch is already sold.');
  if (store.select('listings', [['batch_id', batch_id], ['status', 'open']]).length) {
    return bad(res, 409, 'This batch is already on the marketplace.');
  }
  const price = Number(price_per_kg);
  if (!(price > 0)) return bad(res, 400, 'Enter a valid price per kg.');
  const qty = Math.min(Number(quantity_kg) || Number(batch.quantity_kg), Number(batch.quantity_kg));
  const [listing] = store.insert('listings', [
    { batch_id, farmer_id, price_per_kg: price, quantity_kg: qty, original_quantity_kg: qty, status: 'open' },
  ]);
  store.update('batches', [['id', batch_id]], { status: 'listed' });
  store.insert('batch_events', [
    { batch_id, event_type: 'listing', description: `Listed ${qty} kg on marketplace at Rs ${price.toFixed(2)}/kg`, actor_id: farmer_id },
  ]);
  res.json({ success: true, data: listing });
});

liveRouter.patch('/market/listings/:id', (req: Request, res: Response) => {
  const listing = store.select('listings', [['id', req.params.id]])[0];
  if (!listing) return bad(res, 404, 'Listing not found.');
  const actor = store.select('users', [['id', req.body?.actor_id ?? req.body?.farmer_id]])[0];
  if (actor?.role === 'admin' && ['suspended', 'open'].includes(req.body?.status)) {
    if (req.body.status === 'open' && listing.status !== 'suspended') return bad(res, 409, 'Only suspended listings can be re-activated.');
    if (req.body.status === 'suspended' && listing.status !== 'open') return bad(res, 409, 'Only open listings can be suspended.');
    store.update('listings', [['id', listing.id]], { status: req.body.status, moderated_by: actor.id, moderation_reason: req.body.reason || null });
    db.addAuditLog(actor.email, req.body.status === 'suspended' ? 'LISTING_MODERATED' : 'LISTING_REINSTATED', `Listing ${listing.id}`, req.body.reason || 'Admin action');
    return res.json({ success: true });
  }
  if (listing.farmer_id !== req.body?.farmer_id) return bad(res, 403, 'Only the seller can change this listing.');
  if (req.body?.status === 'withdrawn' && listing.status === 'open') {
    store.update('listings', [['id', listing.id]], { status: 'withdrawn' });
    store.update('batches', [['id', listing.batch_id]], { status: 'stored' });
    return res.json({ success: true });
  }
  return bad(res, 400, 'Unsupported change.');
});

// ---------------------------------------------------------------------------
// Orders and tracking
// ---------------------------------------------------------------------------

export const ORDER_FLOW = ['placed', 'confirmed', 'packed', 'in_transit', 'delivered'] as const;

liveRouter.post('/orders', (req: Request, res: Response) => {
  const { listing_id, buyer_id, quantity_kg, delivery_address } = req.body || {};
  const listing = store.select('listings', [['id', listing_id]])[0];
  if (!listing || listing.status !== 'open') return bad(res, 409, 'This listing is no longer available.');
  const buyer = store.select('users', [['id', buyer_id]])[0];
  if (!buyer) return bad(res, 401, 'Please sign in to place an order.');
  if (buyer.role !== 'buyer' && buyer.role !== 'processor') return bad(res, 403, 'Only buyer or processor accounts can place orders.');
  if (listing.farmer_id === buyer_id) return bad(res, 403, 'You cannot buy your own listing.');
  const qty = Number(quantity_kg);
  if (!(qty > 0)) return bad(res, 400, 'Enter the quantity you want to buy.');
  if (qty > Number(listing.quantity_kg)) return bad(res, 409, `Only ${listing.quantity_kg} kg is available.`);

  const total = Math.round(qty * Number(listing.price_per_kg) * 100) / 100;
  const [order] = store.insert('orders', [
    {
      order_number: `ORD-${Date.now().toString().slice(-7)}`,
      listing_id,
      batch_id: listing.batch_id,
      buyer_id,
      buyer_name: buyer.full_name,
      farmer_id: listing.farmer_id,
      quantity_kg: qty,
      price_per_kg: Number(listing.price_per_kg),
      total_amount: total,
      delivery_address: String(delivery_address || `${buyer.village || ''} ${buyer.district || ''}`).trim(),
      status: 'placed',
    },
  ]);
  const remaining = Math.round((Number(listing.quantity_kg) - qty) * 1000) / 1000;
  store.update('listings', [['id', listing.id]], { quantity_kg: remaining, status: remaining > 0 ? 'open' : 'sold' });
  store.update('batches', [['id', listing.batch_id]], { status: remaining > 0 ? 'listed' : 'sold' });
  store.insert('order_events', [{ order_id: order.id, status: 'placed', note: `Order placed for ${qty} kg`, actor_id: buyer_id }]);
  store.insert('batch_events', [
    { batch_id: listing.batch_id, event_type: 'order', description: `Order ${order.order_number} placed for ${qty} kg at Rs ${listing.price_per_kg}/kg`, actor_id: buyer_id },
  ]);
  res.json({ success: true, data: store.withRelations('orders', [order])[0] });
});

// Who may move an order to each status.
function canSet(order: store.Row, actorId: string, next: string): string | null {
  const isSeller = order.farmer_id === actorId;
  const isBuyer = order.buyer_id === actorId;
  const actor = store.select('users', [['id', actorId]])[0];
  const isAdmin = actor?.role === 'admin';
  if (!isSeller && !isBuyer && !isAdmin) return 'You are not part of this order.';
  if (['delivered', 'cancelled'].includes(order.status)) return `This order is already ${order.status}.`;
  if (next === 'cancelled') {
    return ['placed', 'confirmed'].includes(order.status) ? null : 'Orders can only be cancelled before they are packed.';
  }
  const from = ORDER_FLOW.indexOf(order.status);
  const to = ORDER_FLOW.indexOf(next as (typeof ORDER_FLOW)[number]);
  if (to !== from + 1) return `Next step is "${ORDER_FLOW[from + 1]?.replace('_', ' ')}".`;
  if (next === 'delivered') return isBuyer || isAdmin ? null : 'The buyer confirms delivery once the produce arrives.';
  return isSeller || isAdmin ? null : 'Only the seller can update packing and dispatch.';
}

liveRouter.post('/orders/:id/status', (req: Request, res: Response) => {
  const order = store.select('orders', [['id', req.params.id]])[0];
  if (!order) return bad(res, 404, 'Order not found.');
  const { status, actor_id, note, vehicle, eta } = req.body || {};
  const err = canSet(order, actor_id, status);
  if (err) return bad(res, 409, err);

  const patch: store.Row = { status };
  if (vehicle) patch.vehicle = String(vehicle);
  if (eta) patch.eta = String(eta);
  const [updated] = store.update('orders', [['id', order.id]], patch);
  store.insert('order_events', [{ order_id: order.id, status, note: note || null, vehicle: vehicle || null, eta: eta || null, actor_id }]);
  store.insert('batch_events', [
    { batch_id: order.batch_id, event_type: 'delivery', description: `Order ${order.order_number || ''} ${String(status).replace('_', ' ')}`, actor_id },
  ]);

  if (status === 'cancelled') {
    // Put the quantity back on sale.
    const listing = store.select('listings', [['id', order.listing_id]])[0];
    if (listing) {
      store.update('listings', [['id', listing.id]], { quantity_kg: Number(listing.quantity_kg) + Number(order.quantity_kg), status: 'open' });
      store.update('batches', [['id', order.batch_id]], { status: 'listed' });
    }
  }
  if (status === 'delivered') {
    const open = store.select('orders', [['batch_id', order.batch_id]]).some((o) => !['delivered', 'cancelled'].includes(o.status));
    const listing = store.select('listings', [['id', order.listing_id]])[0];
    if (!open && listing?.status === 'sold') store.update('batches', [['id', order.batch_id]], { status: 'delivered' });
  }
  res.json({ success: true, data: store.withRelations('orders', [updated])[0] });
});

liveRouter.get('/orders/:id/track', (req: Request, res: Response) => {
  const key = req.params.id;
  const order = store.select('orders', [['id', key]])[0] || store.select('orders', [['order_number', key]])[0];
  if (!order) return bad(res, 404, 'Order not found. Check the order ID.');
  const events = store.select('order_events', [['order_id', order.id]], { column: 'created_at', ascending: true });
  const seller = store.select('users', [['id', order.farmer_id]])[0];
  const buyer = store.select('users', [['id', order.buyer_id]])[0];
  res.json({
    success: true,
    order: store.withRelations('orders', [order])[0],
    events,
    seller: seller ? { name: seller.full_name, phone: seller.phone, district: seller.district } : null,
    buyer: buyer ? { name: buyer.full_name, district: buyer.district } : null,
  });
});

// ---------------------------------------------------------------------------
// Admin dashboard: mirror the live rows into the admin data model so users,
// produce, orders, transactions and stats reflect real activity.
// ---------------------------------------------------------------------------

const mirrored = { users: new Set<string>(), batches: new Set<string>(), orders: new Set<string>(), listings: new Set<string>() };

const GRADE: Record<string, ProduceGrade> = { A: 'Grade A', B: 'Grade B', C: 'Grade C', D: 'Grade D', E: 'Grade E', F: 'Grade F' };
const BATCH_STATUS: Record<string, BatchStatus> = {
  harvested: 'AVAILABLE', graded: 'AVAILABLE', stored: 'STORED', listed: 'AVAILABLE', sold: 'SOLD', delivered: 'DELIVERED', not_for_sale: 'RESERVED',
};
const ORDER_STATUS: Record<string, Order['status']> = {
  placed: 'ORDER_PLACED', confirmed: 'ORDER_PLACED', packed: 'DISPATCHED', in_transit: 'IN_TRANSIT', delivered: 'DELIVERED', cancelled: 'ORDER_PLACED',
};

export function syncAdminMirror() {
  const users = store.table('users');
  const byId = new Map(users.map((u) => [u.id, u]));

  const liveEmails = new Set(users.map((u) => String(u.email).toLowerCase()));
  db.users = db.users.filter((u) => !mirrored.users.has(u.id) && !liveEmails.has(u.email.toLowerCase()));
  mirrored.users.clear();
  const liveUsers: User[] = users.map((u) => {
    mirrored.users.add(u.id);
    return {
      id: u.id,
      name: u.full_name,
      email: u.email,
      mobile: u.phone ? `+91 ${u.phone}` : '',
      role: String(u.role).toUpperCase() as User['role'],
      status: u.status || 'ACTIVE',
      location: [u.village, u.district].filter(Boolean).join(', '),
      district: u.district,
      state: 'Maharashtra',
      lastActive: u.lastActive || u.created_at,
      createdAt: u.created_at,
    };
  });
  db.users = [...liveUsers.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), ...db.users];

  db.produceBatches = db.produceBatches.filter((b) => !mirrored.batches.has(b.batchId));
  mirrored.batches.clear();
  const liveBatches: ProduceBatch[] = store.table('batches').map((b) => {
    mirrored.batches.add(b.batch_code);
    const farmer = byId.get(b.farmer_id);
    const sold = store
      .select('orders', [['batch_id', b.id]])
      .filter((o) => o.status !== 'cancelled')
      .reduce((s, o) => s + Number(o.quantity_kg), 0);
    return {
      batchId: b.batch_code,
      farmerId: b.farmer_id,
      farmerName: farmer?.full_name || b.demo_farmer_name || 'Farmer',
      farmerLocation: [b.village, b.district].filter(Boolean).join(', '),
      crop: b.crop,
      variety: b.variety || '',
      harvestDate: b.harvest_date,
      totalQuantity: Number(b.quantity_kg),
      remainingQuantity: Math.max(0, Number(b.quantity_kg) - sold),
      soldQuantity: sold,
      storedQuantity: b.storage_location ? Number(b.quantity_kg) - sold : 0,
      processingQuantity: 0,
      unit: 'Kg',
      grade: GRADE[b.grade],
      status: BATCH_STATUS[b.status] || 'AVAILABLE',
      storageLocation: b.storage_location || undefined,
      spoilageRisk: 'LOW',
      expectedShelfLifeDays: 10,
      daysStored: 0,
      basePricePerUnit: 0,
      createdAt: b.created_at,
    };
  });
  db.produceBatches = [...liveBatches, ...db.produceBatches];

  db.orders = db.orders.filter((o) => !mirrored.orders.has(o.id));
  mirrored.orders.clear();
  const liveOrders: Order[] = store.table('orders').map((o) => {
    mirrored.orders.add(o.id);
    const batch = store.select('batches', [['id', o.batch_id]])[0];
    return {
      id: o.id,
      orderNumber: o.order_number || `ORD-${String(o.id).slice(-6).toUpperCase()}`,
      batchId: batch?.batch_code || o.batch_id,
      crop: batch?.crop || 'Produce',
      variety: batch?.variety || '',
      grade: GRADE[batch?.grade] || 'Grade B',
      buyerId: o.buyer_id,
      buyerName: byId.get(o.buyer_id)?.full_name || o.buyer_name || 'Buyer',
      farmerId: o.farmer_id,
      farmerName: byId.get(o.farmer_id)?.full_name || batch?.demo_farmer_name || 'Farmer',
      quantity: Number(o.quantity_kg),
      unit: 'Kg',
      unitPrice: Number(o.price_per_kg),
      totalAmount: Number(o.total_amount),
      orderType: 'FRESH_PURCHASE',
      status: ORDER_STATUS[o.status] || 'ORDER_PLACED',
      destinationAddress: o.delivery_address || '',
      trackingStep: Math.max(1, ORDER_FLOW.indexOf(o.status) + 1),
      estimatedArrival: o.eta || '',
      createdAt: o.created_at,
    };
  });
  db.orders = [...liveOrders, ...db.orders];

  db.marketplaceListings = db.marketplaceListings.filter((l) => !mirrored.listings.has(l.id));
  mirrored.listings.clear();
  const liveListings: MarketplaceListing[] = store
    .table('listings')
    .filter((l) => ['open', 'suspended'].includes(l.status))
    .map((l) => {
      mirrored.listings.add(l.id);
      const batch = store.select('batches', [['id', l.batch_id]])[0];
      const farmer = byId.get(l.farmer_id);
      return {
        id: l.id,
        batchId: batch?.batch_code || l.batch_id,
        farmerId: l.farmer_id,
        farmerName: farmer?.full_name || batch?.demo_farmer_name || 'Farmer',
        farmerLocation: [batch?.village, batch?.district].filter(Boolean).join(', '),
        crop: batch?.crop || 'Produce',
        variety: batch?.variety || '-',
        grade: GRADE[batch?.grade] || 'Grade B',
        availableQuantity: Number(l.quantity_kg),
        unit: 'kg',
        pricePerUnit: Number(l.price_per_kg),
        minOrderQuantity: 1,
        harvestDate: batch?.harvest_date || '',
        qualityScore: Math.round(Number(batch?.grade_score) || 0),
        shelfLifeDays: 10,
        status: l.status === 'open' ? 'ACTIVE' : 'CLOSED',
        createdAt: l.created_at,
      };
    });
  db.marketplaceListings = [...liveListings, ...db.marketplaceListings];
}

// Old marketplace endpoint (admin dashboard) — serve the live listings.
liveRouter.get('/marketplace/listings', (_req, res) => {
  syncAdminMirror();
  res.json({ success: true, listings: db.marketplaceListings });
});

export function applyAdminListingModeration(id: string, action: string) {
  if (!mirrored.listings.has(id)) return;
  store.update('listings', [['id', id]], { status: action === 'SUSPEND' ? 'suspended' : 'open' });
}

export function adminMirrorMiddleware(_req: Request, _res: Response, next: NextFunction) {
  try {
    syncAdminMirror();
  } catch (err) {
    console.warn('Admin mirror sync failed:', err);
  }
  next();
}

// Admin status changes (suspend / block / activate) apply to live accounts too.
export function applyAdminUserStatus(userId: string, status: string) {
  store.update('users', [['id', userId]], { status });
}
