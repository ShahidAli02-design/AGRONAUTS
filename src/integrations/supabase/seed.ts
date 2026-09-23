// Demo seed rows for the shared AGRONAUTS database (server/store.ts).

export interface RegisteredUser {
  id: string;
  email: string;
  passwordHash: string; // Plain/hashed for demo store
  full_name: string;
  phone: string;
  village: string;
  district: string;
  role: "farmer" | "buyer" | "processor" | "admin";
  language: string;
  created_at: string;
  landVerified?: boolean;
}

// Pre-seeded verified accounts for each of the 4 roles
export const DEFAULT_USERS: RegisteredUser[] = [
  {
    id: "usr-farmer-1",
    email: "farmer@agronauts.in",
    passwordHash: "farmer123",
    full_name: "रामदास जाधव (Ramdas Jadhav)",
    phone: "9822012345",
    village: "पिंपळगाव बसवंत (Pimpalgaon)",
    district: "Nashik",
    role: "farmer",
    language: "mr",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "usr-buyer-1",
    email: "buyer@agronauts.in",
    passwordHash: "buyer123",
    full_name: "सुरेश पटेल (Suresh Patel - Reliance Fresh)",
    phone: "9820098765",
    village: "वाशी एपीएमसी (Vashi APMC)",
    district: "Mumbai",
    role: "buyer",
    language: "en",
    created_at: "2026-01-15T12:00:00Z",
  },
  {
    id: "usr-processor-1",
    email: "processor@agronauts.in",
    passwordHash: "processor123",
    full_name: "सह्याद्री अ‍ॅग्रो फूड्स (Sahyadri Agro Processing)",
    phone: "9850112233",
    village: "मोहोळ (Mohol)",
    district: "Pune",
    role: "processor",
    language: "mr",
    created_at: "2026-02-01T08:30:00Z",
  },
  {
    id: "usr-admin-1",
    email: "admin@agronauts.in",
    passwordHash: "admin123",
    full_name: "डॉ. विजय गायकवाड (Dr. Vijay Gaikwad - APMC Director)",
    phone: "9823055443",
    village: "शिवाजीनगर",
    district: "Pune",
    role: "admin",
    language: "mr",
    created_at: "2026-01-01T09:00:00Z",
  },
];

export const DEFAULT_USER = {
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

export const DEFAULT_PROFILE = {
  id: 'usr_balasaheb_01',
  full_name: 'Balasaheb Patil',
  phone: '+91 98220 12345',
  village: 'Dindori',
  district: 'Nashik',
  language: 'mr',
  created_at: new Date().toISOString(),
};

export const DEFAULT_USER_ROLES = [
  { id: 'role_01', user_id: 'usr_balasaheb_01', role: 'farmer', created_at: new Date().toISOString() }
];

export const DEFAULT_BATCHES = [
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

export const DEFAULT_LISTINGS = [
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

export const DEFAULT_ORDERS = [
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

export const DEFAULT_EVENTS = [
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

