import {
  User,
  FarmerProfile,
  CropPlan,
  ProduceBatch,
  MarketplaceListing,
  BuyerMatch,
  Order,
  StorageRecord,
  TraceabilityStep,
  AuditLog,
  ServiceHealth,
  AdminAlert,
  CropMasterData,
  SystemSettings,
  SchemeRecord,
  EquipmentRecord
} from './types';

// In-Memory Ecosystem Database with instant state updates
class AgronautsDatabase {
  public users: User[] = [
    {
      id: 'usr_farmer_01',
      name: 'Ramesh Patil',
      email: 'farmer@agronauts.in',
      mobile: '+91 98220 12345',
      role: 'FARMER',
      token: 'jwt_token_farmer_ramesh',
      status: 'ACTIVE',
      location: 'Ozar, Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      lastActive: '2026-03-08T10:15:00Z',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T08:00:00Z'
    },
    {
      id: 'usr_farmer_02',
      name: 'Santosh Shinde',
      email: 'santosh.shinde@agronauts.in',
      mobile: '+91 98221 44556',
      role: 'FARMER',
      token: 'jwt_token_farmer_santosh',
      status: 'ACTIVE',
      location: 'Pimpalgaon Baswant',
      district: 'Nashik',
      state: 'Maharashtra',
      lastActive: '2026-03-08T09:30:00Z',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-20T11:00:00Z'
    },
    {
      id: 'usr_farmer_03',
      name: 'Balasaheb Jagtap',
      email: 'balasaheb.j@agronauts.in',
      mobile: '+91 98222 77889',
      role: 'FARMER',
      token: 'jwt_token_farmer_bala',
      status: 'PENDING',
      location: 'Baramati',
      district: 'Pune',
      state: 'Maharashtra',
      lastActive: '2026-03-07T16:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-14T09:15:00Z'
    },
    {
      id: 'usr_buyer_01',
      name: 'Anita Deshmukh (FreshMart Wholesalers)',
      email: 'buyer@agronauts.in',
      mobile: '+91 98220 54321',
      role: 'BUYER',
      token: 'jwt_token_buyer_anita',
      status: 'ACTIVE',
      location: 'Vashi APMC Market, Navi Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      lastActive: '2026-03-08T11:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-15T09:30:00Z'
    },
    {
      id: 'usr_buyer_02',
      name: 'Rajesh Agrotech Traders',
      email: 'rajesh.traders@agronauts.in',
      mobile: '+91 98223 33445',
      role: 'BUYER',
      token: 'jwt_token_buyer_rajesh',
      status: 'ACTIVE',
      location: 'Gultekdi Market Yard, Pune',
      district: 'Pune',
      state: 'Maharashtra',
      lastActive: '2026-03-08T08:45:00Z',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-25T14:20:00Z'
    },
    {
      id: 'usr_processor_01',
      name: 'Vikram Jadhav (Sahyadri Agro-Processing)',
      email: 'processor@agronauts.in',
      mobile: '+91 98220 99887',
      role: 'PROCESSOR',
      token: 'jwt_token_processor_vikram',
      status: 'ACTIVE',
      location: 'Dindori MIDC, Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      lastActive: '2026-03-08T10:45:00Z',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-18T10:00:00Z'
    },
    {
      id: 'usr_processor_02',
      name: 'Kisan Dehydrates & Pulp Ltd',
      email: 'kisan.pulp@agronauts.in',
      mobile: '+91 98224 88990',
      role: 'PROCESSOR',
      token: 'jwt_token_processor_kisan',
      status: 'ACTIVE',
      location: 'Jalgaon Mega Food Park',
      district: 'Jalgaon',
      state: 'Maharashtra',
      lastActive: '2026-03-07T18:20:00Z',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-01T12:00:00Z'
    },
    {
      id: 'usr_admin_01',
      name: 'Dr. Sunita Rao (Agronauts Director)',
      email: 'admin@agronauts.in',
      mobile: '+91 98220 00001',
      role: 'ADMIN',
      token: 'jwt_token_admin_sunita',
      status: 'ACTIVE',
      location: 'Agronauts HQ, Pune',
      district: 'Pune',
      state: 'Maharashtra',
      lastActive: '2026-03-08T11:20:00Z',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 'usr_admin_02',
      name: 'Ajay Kulkarni (Chief Compliance Officer)',
      email: 'ajay.admin@agronauts.in',
      mobile: '+91 98220 00002',
      role: 'ADMIN',
      token: 'jwt_token_admin_ajay',
      status: 'ACTIVE',
      location: 'Agronauts Operations, Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      lastActive: '2026-03-08T10:50:00Z',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-05T00:00:00Z'
    }
  ];

  public cropMasterData: CropMasterData[] = [
    {
      id: 'crp_01',
      cropName: 'Tomato',
      category: 'Vegetables',
      season: 'All Season',
      waterRequirement: 'Medium',
      soilType: 'Black Clay / Sandy Loam (pH 6.0-7.5)',
      suitableRegions: ['Nashik', 'Pune', 'Ahmednagar', 'Satara'],
      averageYieldTonsPerAcre: 20,
      marketPriceRangePerQuintal: { min: 1800, max: 2800 },
      active: true,
      description: 'High-demand perishable crop with dual potential: fresh table consumption and tomato paste/puree processing.'
    },
    {
      id: 'crp_02',
      cropName: 'Onion (Garwa / Rabi)',
      category: 'Vegetables',
      season: 'Rabi',
      waterRequirement: 'Low',
      soilType: 'Well-drained deep loamy soil',
      suitableRegions: ['Nashik (Lasalgaon)', 'Ahmednagar', 'Solapur', 'Dhule'],
      averageYieldTonsPerAcre: 14,
      marketPriceRangePerQuintal: { min: 1400, max: 2400 },
      active: true,
      description: 'Major commercial staple with excellent natural storability in aerated chawls for 4-5 months.'
    },
    {
      id: 'crp_03',
      cropName: 'Wheat (Sharbati)',
      category: 'Grains',
      season: 'Rabi',
      waterRequirement: 'Medium',
      soilType: 'Clayey loam to heavy black soil',
      suitableRegions: ['Vidarbha', 'Marathwada', 'Western Maharashtra'],
      averageYieldTonsPerAcre: 3.5,
      marketPriceRangePerQuintal: { min: 2800, max: 3400 },
      active: true,
      description: 'Premium milling grain with golden luster and high protein content for artisan flours.'
    },
    {
      id: 'crp_04',
      cropName: 'Pomegranate (Bhagwa)',
      category: 'Fruits',
      season: 'Perennial',
      waterRequirement: 'Low',
      soilType: 'Deep, loamy, well-drained soil',
      suitableRegions: ['Solapur', 'Nashik', 'Sangli', 'Ahmednagar'],
      averageYieldTonsPerAcre: 8,
      marketPriceRangePerQuintal: { min: 6500, max: 12000 },
      active: true,
      description: 'High-value export fruit with glossy deep red arils and strong demand in Gulf and EU markets.'
    },
    {
      id: 'crp_05',
      cropName: 'Soybean (JS 335 / 9560)',
      category: 'Oilseeds',
      season: 'Kharif',
      waterRequirement: 'Medium',
      soilType: 'Fertile black soil with good drainage',
      suitableRegions: ['Latur', 'Nanded', 'Amravati', 'Yavatmal'],
      averageYieldTonsPerAcre: 2.2,
      marketPriceRangePerQuintal: { min: 4200, max: 5100 },
      active: true,
      description: 'Crucial cash crop for oil extraction and high-protein de-oiled cake feed manufacture.'
    },
    {
      id: 'crp_06',
      cropName: 'Green Chilli (G4 / Teja)',
      category: 'Vegetables',
      season: 'All Season',
      waterRequirement: 'Medium',
      soilType: 'Light sandy loam rich in organic matter',
      suitableRegions: ['Kolhapur', 'Nandurbar', 'Nagpur'],
      averageYieldTonsPerAcre: 7.5,
      marketPriceRangePerQuintal: { min: 3200, max: 4800 },
      active: true,
      description: 'Pungent commercial condiment suitable for both fresh retail distribution and red powder processing.'
    }
  ];

  public adminAlerts: AdminAlert[] = [
    {
      id: 'alt_01',
      type: 'STORAGE_RISK',
      severity: 'HIGH',
      title: 'Elevated Spoilage Risk in Onion Chamber #14',
      message: 'Sensor telemetry reports 68% relative humidity in Lasalgaon aerated chawl. 8.0 tons of Rabi Onion approaching risk threshold.',
      read: false,
      archived: false,
      createdAt: '2026-03-08T08:30:00Z',
      relatedEntityId: 'AGR-2026-ONI-00002'
    },
    {
      id: 'alt_02',
      type: 'LARGE_TRANSACTION',
      severity: 'MEDIUM',
      title: 'Escrow Lock: ₹3,15,000 for FreshMart Order',
      message: 'Order ORD-78291 confirmed and funded by FreshMart Wholesalers. Awaiting farmgate dispatch verification.',
      read: false,
      archived: false,
      createdAt: '2026-03-08T07:15:00Z',
      relatedEntityId: 'ORD-78291'
    },
    {
      id: 'alt_03',
      type: 'USER_APPROVAL',
      severity: 'LOW',
      title: 'Farmer Registration Pending KYC Verification',
      message: 'Balasaheb Jagtap (Baramati, 8.0 Acres) uploaded 7/12 land records. Review and approve account.',
      read: false,
      archived: false,
      createdAt: '2026-03-07T16:00:00Z',
      relatedEntityId: 'usr_farmer_03'
    },
    {
      id: 'alt_04',
      type: 'AI_FAILURE',
      severity: 'LOW',
      title: 'AI Diagnostic Fallback Triggered',
      message: '1 leaf scan encountered low-resolution blur. Fallback heuristic model engaged smoothly without user disruption.',
      read: true,
      archived: false,
      createdAt: '2026-03-06T14:10:00Z',
      relatedEntityId: 'scan_20260306'
    }
  ];

  public auditLogs: AuditLog[] = [
    {
      id: 'log_01',
      adminEmail: 'admin@agronauts.in',
      action: 'USER_STATUS_CHANGE',
      target: 'Balasaheb Jagtap (usr_farmer_03)',
      timestamp: '2026-03-07T16:05:00Z',
      details: 'Marked user profile as PENDING verification awaiting 7/12 land document review.',
      ipAddress: '10.0.4.12'
    },
    {
      id: 'log_02',
      adminEmail: 'admin@agronauts.in',
      action: 'PRICE_BAND_UPDATE',
      target: 'Tomato (Arka Rakshak)',
      timestamp: '2026-03-07T09:00:00Z',
      details: 'Adjusted dynamic Mandi baseline price from ₹2,200 to ₹2,450/quintal following APMC Nashik reports.',
      ipAddress: '10.0.4.12'
    },
    {
      id: 'log_03',
      adminEmail: 'ajay.admin@agronauts.in',
      action: 'SYSTEM_SETTINGS_UPDATE',
      target: 'AI Quality Grading Thresholds',
      timestamp: '2026-03-06T11:20:00Z',
      details: 'Updated Grade A minimum optical threshold to 88 points.',
      ipAddress: '10.0.4.15'
    },
    {
      id: 'log_04',
      adminEmail: 'admin@agronauts.in',
      action: 'AUDIT_BATCH_VERIFY',
      target: 'AGR-2026-TOM-00001',
      timestamp: '2026-03-05T14:45:00Z',
      details: 'Digitally countersigned farm-to-fork batch passport with cryptographic hash seal.',
      ipAddress: '10.0.4.12'
    }
  ];

  public systemHealth: ServiceHealth[] = [
    {
      id: 'svc_01',
      name: 'Express API & Auth Gateway',
      status: 'OPERATIONAL',
      latencyMs: 14,
      lastChecked: 'Just now',
      errorCount: 0,
      description: 'REST API, JWT validation, and RBAC middleware engine'
    },
    {
      id: 'svc_02',
      name: 'Agronauts Ecosystem Database',
      status: 'OPERATIONAL',
      latencyMs: 8,
      lastChecked: 'Just now',
      errorCount: 0,
      description: 'In-memory persistent synchronized relational store'
    },
    {
      id: 'svc_03',
      name: 'Gemini Multimodal AI Diagnostic Engine',
      status: 'OPERATIONAL',
      latencyMs: 380,
      lastChecked: 'Just now',
      errorCount: 0,
      description: 'Google GenAI Flash multimodal computer vision & zero-waste optimizer'
    },
    {
      id: 'svc_04',
      name: 'IoT Telemetry & Cold-Chain Stream',
      status: 'OPERATIONAL',
      latencyMs: 32,
      lastChecked: 'Just now',
      errorCount: 0,
      description: 'Warehouse temperature, humidity, and ethylene sensor ingest'
    },
    {
      id: 'svc_05',
      name: 'Escrow Clearing & Banking Gateway',
      status: 'OPERATIONAL',
      latencyMs: 120,
      lastChecked: 'Just now',
      errorCount: 0,
      description: 'UPI / IMPS direct account settlement with zero intermediary fees'
    }
  ];

  public systemSettings: SystemSettings = {
    platformName: 'AGRONAUTS Digital Agriculture Platform',
    maintenanceMode: false,
    aiEngineEnabled: true,
    aiModelVersion: 'gemini-2.5-flash',
    autoApproveListings: true,
    minEscrowRetentionHours: 2,
    alertEmailRecipient: 'operations@agronauts.in',
    maxUploadSizeMb: 10,
    requireKycForSellers: true
  };

  public farmerProfile: FarmerProfile = {
    userId: 'usr_farmer_01',
    fullName: 'Ramesh Patil',
    mobile: '+91 98220 12345',
    village: 'Ozar',
    district: 'Nashik',
    state: 'Maharashtra',
    location: 'Nashik, Maharashtra (Pin: 422206)',
    landArea: 6.5,
    soilType: 'Black Clay',
    irrigationType: 'Drip Irrigation',
    waterAvailability: 'Moderate',
    currentCrops: ['Tomato (Arka Rakshak)', 'Onion (Garwa)', 'Wheat (Sharbati)'],
    farmingType: 'Integrated Pest Management',
    preferredLanguage: 'en'
  };

  public activeCrops: CropPlan[] = [
    {
      id: 'crop_tom_01',
      farmerId: 'usr_farmer_01',
      cropName: 'Tomato',
      variety: 'Arka Rakshak (High Yield F1)',
      sowingDate: '2026-01-18',
      expectedHarvestDate: '2026-04-18',
      totalDays: 90,
      currentDay: 48,
      growthStage: 'Fruit Formation',
      landArea: 2.5,
      expectedYieldMin: 18,
      expectedYieldMax: 22,
      waterRequirement: 'Medium',
      diseaseRisk: 'Moderate',
      healthScore: 88,
      marketPriceEstimate: 2400, // ₹ per quintal
      marketDemand: 'High',
      weatherSummary: '28°C • Sunny with 58% humidity. Low frost risk.',
      soilCondition: 'pH 6.8 • High organic carbon • Moisture: 24%',
      tasks: [
        { id: 't1', title: 'Apply Calcium Nitrate & Boron via drip', completed: true, dueDate: 'Day 45', priority: 'High' },
        { id: 't2', title: 'Scout lower canopy for early blight lesions', completed: false, dueDate: 'Day 50', priority: 'High' },
        { id: 't3', title: 'Prune suckers and verify bamboo staking', completed: false, dueDate: 'Day 52', priority: 'Medium' },
        { id: 't4', title: 'Schedule pre-harvest buyer advance notice', completed: false, dueDate: 'Day 65', priority: 'Low' }
      ]
    },
    {
      id: 'crop_mng_02',
      farmerId: 'usr_farmer_01',
      cropName: 'Mango',
      variety: 'Alphonso (GI Tagged)',
      sowingDate: '2025-12-01',
      expectedHarvestDate: '2026-04-30',
      totalDays: 150,
      currentDay: 96,
      growthStage: 'Maturity / Ripening',
      landArea: 2.0,
      expectedYieldMin: 8,
      expectedYieldMax: 10,
      waterRequirement: 'Low',
      diseaseRisk: 'Low',
      healthScore: 94,
      marketPriceEstimate: 6500,
      marketDemand: 'High',
      weatherSummary: '31°C • Warm coastal breeze, ideal for sugar concentration.',
      soilCondition: 'Lateritic Loam • pH 6.2 • Well drained',
      tasks: [
        { id: 'tm1', title: 'Bagging of fruit clusters to prevent fruit fly', completed: true, dueDate: 'Day 80', priority: 'High' },
        { id: 'tm2', title: 'Refrain from synthetic sprays 20 days prior to harvest', completed: false, dueDate: 'Day 100', priority: 'High' }
      ]
    },
    {
      id: 'crop_oni_03',
      farmerId: 'usr_farmer_01',
      cropName: 'Onion',
      variety: 'Garwa Rabi',
      sowingDate: '2026-01-05',
      expectedHarvestDate: '2026-04-15',
      totalDays: 100,
      currentDay: 60,
      growthStage: 'Vegetative',
      landArea: 2.0,
      expectedYieldMin: 28,
      expectedYieldMax: 32,
      waterRequirement: 'Medium',
      diseaseRisk: 'Low',
      healthScore: 91,
      marketPriceEstimate: 1950,
      marketDemand: 'Moderate',
      weatherSummary: '27°C • Clear skies • Minimal thrips pressure',
      soilCondition: 'Black Cotton Clay • Potassium Rich',
      tasks: [
        { id: 'to1', title: 'Sulfate of Potash application for bulb sizing', completed: false, dueDate: 'Day 65', priority: 'High' }
      ]
    }
  ];

  public produceBatches: ProduceBatch[] = [
    {
      batchId: 'AGR-2026-TOM-00001',
      farmerId: 'usr_farmer_01',
      farmerName: 'Ramesh Patil',
      farmerLocation: 'Nashik, Maharashtra',
      crop: 'Tomato',
      variety: 'Arka Rakshak F1',
      harvestDate: '2026-03-01',
      totalQuantity: 15,
      remainingQuantity: 5,
      soldQuantity: 6,
      storedQuantity: 4,
      processingQuantity: 0,
      unit: 'Tons',
      grade: 'Grade A',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
      spoilageRisk: 'LOW',
      expectedShelfLifeDays: 14,
      daysStored: 4,
      basePricePerUnit: 24500, // ₹ per ton
      storageLocation: 'Cold Chamber 2, Nashik Agri Hub',
      createdAt: '2026-03-01T06:30:00Z',
      qualityReport: {
        id: 'qr_001',
        batchId: 'AGR-2026-TOM-00001',
        analyzedAt: '2026-03-01T07:15:00Z',
        overallScore: 92,
        assignedGrade: 'Grade A',
        breakdown: {
          gradeA: 65,
          gradeB: 28,
          gradeC: 7,
          gradeD: 0,
          gradeE: 0,
          gradeF: 0
        },
        metrics: {
          sizeUniformity: 94,
          colorVibrancy: 92,
          surfaceDefects: 4,
          firmnessIndex: 90
        },
        visibleDefects: ['Minor calyx dryness on 4% of fruit', 'Zero fungal blemishes detected'],
        freshnessStatus: 'Crisp, freshly harvested field condition',
        confidenceScore: 96,
        aiExplanation: 'Homogeneous deep red color with firm pericarp wall. Suitable for premium direct retail distribution and export specs.',
        recommendedUtilization: 'Direct Premium Sale'
      },
      bestUtilization: {
        batchId: 'AGR-2026-TOM-00001',
        bestAction: 'SELL DIRECT',
        actionTitle: 'Sell Grade A Fresh to Wholesaler & Process Grade B to Puree',
        reasoning: 'Market wholesale prices for Nashik red tomatoes are at a seasonal peak (₹24.5/kg). Grade A volume earns maximum margin directly, while Grade B can be channeled to Sahyadri Agro-Processing for puree to avoid waste.',
        estimatedDirectSaleValue: 245000,
        estimatedProcessingValue: 282000,
        potentialAdditionalValue: 37000,
        recommendedProcessType: 'Tomato Puree / Paste Contract',
        shelfLifeRemainingDays: 10,
        storageRecommendation: 'Store under 11°C - 13°C with 90% RH to prevent chilling injury'
      }
    },
    {
      batchId: 'AGR-2026-MNG-00002',
      farmerId: 'usr_farmer_01',
      farmerName: 'Ramesh Patil',
      farmerLocation: 'Ratnagiri / Nashik, Maharashtra',
      crop: 'Mango',
      variety: 'Alphonso (Hapus)',
      harvestDate: '2026-02-24',
      totalQuantity: 8,
      remainingQuantity: 3,
      soldQuantity: 5,
      storedQuantity: 0,
      processingQuantity: 0,
      unit: 'Tons',
      grade: 'Grade A',
      status: 'RESERVED',
      imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
      spoilageRisk: 'LOW',
      expectedShelfLifeDays: 18,
      daysStored: 9,
      basePricePerUnit: 68000,
      storageLocation: 'Controlled Atmosphere Bay 4',
      createdAt: '2026-02-24T08:00:00Z',
      qualityReport: {
        id: 'qr_002',
        batchId: 'AGR-2026-MNG-00002',
        analyzedAt: '2026-02-24T09:00:00Z',
        overallScore: 95,
        assignedGrade: 'Grade A',
        breakdown: { gradeA: 85, gradeB: 12, gradeC: 3, gradeD: 0, gradeE: 0, gradeF: 0 },
        metrics: { sizeUniformity: 96, colorVibrancy: 95, surfaceDefects: 2, firmnessIndex: 88 },
        visibleDefects: ['None. Clean skin with golden-yellow blush'],
        freshnessStatus: 'Export grade pre-ripened condition',
        confidenceScore: 98,
        aiExplanation: 'Pristine GI-tagged Alphonso mangoes with consistent fruit sizing (240-270g) and natural wax sheen.',
        recommendedUtilization: 'Direct Premium Sale'
      },
      bestUtilization: {
        batchId: 'AGR-2026-MNG-00002',
        bestAction: 'SELL DIRECT',
        actionTitle: 'Premium Export / Metro Retail Dispatch',
        reasoning: 'Alphonso grade A commands ₹68,000/ton in Mumbai/Pune urban retail chains. Direct sale maximizes farmer profit.',
        estimatedDirectSaleValue: 544000,
        estimatedProcessingValue: 390000,
        potentialAdditionalValue: 154000,
        shelfLifeRemainingDays: 9
      }
    },
    {
      batchId: 'AGR-2026-ONI-00004',
      farmerId: 'usr_farmer_01',
      farmerName: 'Ramesh Patil',
      farmerLocation: 'Lasalgaon, Nashik',
      crop: 'Onion',
      variety: 'Garwa Rabi',
      harvestDate: '2026-02-15',
      totalQuantity: 20,
      remainingQuantity: 12,
      soldQuantity: 0,
      storedQuantity: 8,
      processingQuantity: 0,
      unit: 'Tons',
      grade: 'Grade B',
      status: 'STORED',
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
      spoilageRisk: 'MEDIUM',
      expectedShelfLifeDays: 90,
      daysStored: 18,
      basePricePerUnit: 18500,
      storageLocation: 'Traditional Ventilated Chawl, Lasalgaon',
      createdAt: '2026-02-15T11:00:00Z',
      qualityReport: {
        id: 'qr_004',
        batchId: 'AGR-2026-ONI-00004',
        analyzedAt: '2026-02-15T11:30:00Z',
        overallScore: 78,
        assignedGrade: 'Grade B',
        breakdown: { gradeA: 40, gradeB: 50, gradeC: 10, gradeD: 0, gradeE: 0, gradeF: 0 },
        metrics: { sizeUniformity: 76, colorVibrancy: 82, surfaceDefects: 12, firmnessIndex: 85 },
        visibleDefects: ['Slight skin peeling and size variance between 40mm - 65mm'],
        freshnessStatus: 'Well cured, dry papery outer scales',
        confidenceScore: 92,
        aiExplanation: 'Moderate size uniformity, dry outer coat. Good for onion dehydration units or buffer storage till price rises.',
        recommendedUtilization: 'Industrial Food Processing'
      },
      bestUtilization: {
        batchId: 'AGR-2026-ONI-00004',
        bestAction: 'PROCESS',
        actionTitle: 'Supply to Dehydration Facility for Onion Powder & Flakes',
        reasoning: 'Onion prices are experiencing seasonal supply gluts in Lasalgaon APMC (₹18.5/kg). Processing into dehydrated flakes guarantees ₹24.5/kg equivalent value, shielding against rot loss.',
        estimatedDirectSaleValue: 370000,
        estimatedProcessingValue: 490000,
        potentialAdditionalValue: 120000,
        recommendedProcessType: 'Dehydrated White/Red Flakes & Powder',
        shelfLifeRemainingDays: 72
      }
    }
  ];

  public marketplaceListings: MarketplaceListing[] = [
    {
      id: 'lst_001',
      batchId: 'AGR-2026-TOM-00001',
      farmerId: 'usr_farmer_01',
      farmerName: 'Ramesh Patil',
      farmerLocation: 'Nashik, Maharashtra',
      crop: 'Tomato',
      variety: 'Arka Rakshak F1',
      grade: 'Grade A',
      availableQuantity: 5,
      unit: 'Tons',
      pricePerUnit: 24500,
      minOrderQuantity: 1,
      harvestDate: '2026-03-01',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
      qualityScore: 92,
      shelfLifeDays: 10,
      status: 'ACTIVE',
      createdAt: '2026-03-01T10:00:00Z'
    },
    {
      id: 'lst_002',
      batchId: 'AGR-2026-MNG-00002',
      farmerId: 'usr_farmer_01',
      farmerName: 'Ramesh Patil',
      farmerLocation: 'Ratnagiri, Maharashtra',
      crop: 'Mango',
      variety: 'Alphonso',
      grade: 'Grade A',
      availableQuantity: 3,
      unit: 'Tons',
      pricePerUnit: 68000,
      minOrderQuantity: 0.5,
      harvestDate: '2026-02-24',
      imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
      qualityScore: 95,
      shelfLifeDays: 9,
      status: 'ACTIVE',
      createdAt: '2026-02-24T12:00:00Z'
    },
    {
      id: 'lst_003',
      batchId: 'AGR-2026-ONI-00004',
      farmerId: 'usr_farmer_01',
      farmerName: 'Ramesh Patil',
      farmerLocation: 'Lasalgaon, Maharashtra',
      crop: 'Onion',
      variety: 'Garwa',
      grade: 'Grade B',
      availableQuantity: 12,
      unit: 'Tons',
      pricePerUnit: 18500,
      minOrderQuantity: 2,
      harvestDate: '2026-02-15',
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
      qualityScore: 78,
      shelfLifeDays: 72,
      status: 'ACTIVE',
      createdAt: '2026-02-16T08:00:00Z'
    }
  ];

  public schemes: SchemeRecord[] = [
    {
      id: 'sch_01',
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      category: 'Crop Insurance',
      subsidy: 'Premium capped at 2% for Kharif, 1.5% for Rabi',
      eligibility: 'All farmers cultivating notified crops in notified areas',
      documents: ['Aadhaar Card', 'Land Record (7/12 & 8A)', 'Bank Passbook', 'Sowing Certificate'],
      deadline: '31 March 2026',
      portalUrl: 'https://pmfby.gov.in'
    },
    {
      id: 'sch_02',
      name: 'Agriculture Infrastructure Fund (AIF)',
      category: 'Post-Harvest Infrastructure',
      subsidy: '3% interest subvention on loans up to ₹2 Crore for cold storage, sorting, and grading units',
      eligibility: 'Farmers, FPOs, Agri-entrepreneurs',
      documents: ['Detailed Project Report', 'DPR Financials', 'Land Title / Lease Agreement'],
      deadline: 'Ongoing FY 2025-26',
      portalUrl: 'https://agriinfra.dac.gov.in'
    },
    {
      id: 'sch_03',
      name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      category: 'Equipment Subsidy',
      subsidy: '40% to 50% financial assistance for purchase of tractors, rotavators, and laser land levelers',
      eligibility: 'Small & Marginal Farmers, SC/ST, Women Farmers',
      documents: ['Aadhaar Card', 'Caste Certificate (if applicable)', 'Quotation from Authorized Dealer'],
      deadline: '15 April 2026',
      portalUrl: 'https://agrimachinery.nic.in'
    }
  ];

  public equipmentRentals: EquipmentRecord[] = [
    {
      id: 'eq_01',
      title: 'John Deere 5050D (50 HP) + Rotavator',
      providerName: 'Shree Ganesh Agri Rentals',
      location: 'Ozar / Dindori (5 km away)',
      dailyRate: 1800,
      available: true,
      specs: 'Power steering, fuel-efficient 4WD, operator included',
      imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'eq_02',
      title: 'Precision Agricultural Drone Sprayer (16L)',
      providerName: 'Nashik Tech Krishi Hub',
      location: 'Nashik Rural (12 km away)',
      dailyRate: 2400,
      available: true,
      specs: 'Covers 1 acre in 8 minutes with ultra-low volume nozzle',
      imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'eq_03',
      title: 'Multi-Crop High Capacity Harvester',
      providerName: 'Kisan Seva Sangh',
      location: 'Pimpalgaon Baswant',
      dailyRate: 3500,
      available: false,
      specs: 'Suitable for wheat, soybean, and pulses',
      imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=80'
    }
  ];

  public buyerMatches: BuyerMatch[] = [
    {
      id: 'bm_001',
      buyerName: 'FreshMart Supermarkets Pvt Ltd',
      buyerType: 'Supermarket / Wholesaler',
      location: 'Nashik APMC Sector 4',
      distanceKm: 12,
      cropRequested: 'Tomato',
      preferredGrade: 'Grade A',
      requiredQuantity: 4,
      offeredPricePerUnit: 25000,
      matchScore: 94,
      matchReasons: [
        'Exact Grade A match with 92% quality certification',
        'Within 12 km radius, zero transit decay',
        'Immediate direct bank transfer within 24 hours'
      ]
    },
    {
      id: 'bm_002',
      buyerName: 'Sahyadri Agro Processing Hub',
      buyerType: 'Food Processing Plant',
      location: 'Mohadi Food Park, Dindori, Nashik',
      distanceKm: 18,
      cropRequested: 'Tomato',
      preferredGrade: 'Grade B',
      requiredQuantity: 6,
      offeredPricePerUnit: 21500,
      matchScore: 91,
      matchReasons: [
        'Dedicated bulk contract for puree and paste processing',
        'Accepts Grade B with high brix sugar levels (>4.5)',
        'Assisted cold chain container pickup from farmgate'
      ]
    },
    {
      id: 'bm_003',
      buyerName: 'Deccan Organic Exports',
      buyerType: 'Exporter',
      location: 'JNPT Port Hub, Navi Mumbai',
      distanceKm: 165,
      cropRequested: 'Mango',
      preferredGrade: 'Grade A',
      requiredQuantity: 3,
      offeredPricePerUnit: 70000,
      matchScore: 87,
      matchReasons: [
        'GI Tagged Alphonso verification required',
        'Offers ₹2,000/ton premium above local APMC prices',
        'Phytosanitary inspection at packing shed'
      ]
    }
  ];

  public orders: Order[] = [
    {
      id: 'ord_001',
      orderNumber: 'AGR-ORD-2026-8801',
      batchId: 'AGR-2026-TOM-00001',
      crop: 'Tomato',
      variety: 'Arka Rakshak',
      grade: 'Grade A',
      buyerId: 'usr_buyer_01',
      buyerName: 'Anita Deshmukh (FreshMart Wholesalers)',
      farmerId: 'usr_farmer_01',
      farmerName: 'Ramesh Patil',
      quantity: 4,
      unit: 'Tons',
      unitPrice: 24500,
      totalAmount: 98000,
      orderType: 'FRESH_PURCHASE',
      status: 'IN_TRANSIT',
      destinationAddress: 'FreshMart Distribution Hub, Nashik By-pass',
      trackingStep: 3, // In transit
      estimatedArrival: 'Today, 04:30 PM',
      createdAt: '2026-03-02T14:20:00Z'
    },
    {
      id: 'ord_002',
      orderNumber: 'AGR-ORD-2026-8802',
      batchId: 'AGR-2026-MNG-00002',
      crop: 'Mango',
      variety: 'Alphonso',
      grade: 'Grade A',
      buyerId: 'usr_buyer_01',
      buyerName: 'Anita Deshmukh (FreshMart Wholesalers)',
      farmerId: 'usr_farmer_01',
      farmerName: 'Ramesh Patil',
      quantity: 5,
      unit: 'Tons',
      unitPrice: 68000,
      totalAmount: 340000,
      orderType: 'FRESH_PURCHASE',
      status: 'PAYMENT_RELEASED',
      destinationAddress: 'Vashi APMC Fruit Market, Navi Mumbai',
      trackingStep: 5, // Payment released
      estimatedArrival: 'Delivered',
      createdAt: '2026-02-26T09:00:00Z'
    }
  ];

  public storageRecords: StorageRecord[] = [
    {
      id: 'str_001',
      batchId: 'AGR-2026-TOM-00001',
      crop: 'Tomato',
      quantity: 4,
      unit: 'Tons',
      warehouseName: 'Nashik Cold Chain Chamber 2',
      location: 'Pimpalgaon Baswant',
      storedDate: '2026-03-01',
      expectedShelfLifeDays: 14,
      remainingDays: 10,
      spoilageRisk: 'LOW',
      temperatureC: 12.4,
      humidityPct: 91,
      alerts: ['Optimal environmental parameters maintained']
    },
    {
      id: 'str_002',
      batchId: 'AGR-2026-ONI-00004',
      crop: 'Onion',
      quantity: 8,
      unit: 'Tons',
      warehouseName: 'Lasalgaon Aerated Chawl #14',
      location: 'Lasalgaon Mandi Yard',
      storedDate: '2026-02-15',
      expectedShelfLifeDays: 90,
      remainingDays: 72,
      spoilageRisk: 'MEDIUM',
      temperatureC: 24.2,
      humidityPct: 68,
      alerts: ['Humidity fluctuation detected yesterday (+8%). Check bottom tier for early sprouting.']
    }
  ];

  public getTraceabilityTimeline(batchId: string): TraceabilityStep[] {
    const batch = this.produceBatches.find(b => b.batchId === batchId);
    const cropName = batch ? batch.crop : 'Agricultural Produce';

    return [
      {
        stage: 'PLAN',
        title: 'Crop Planning & Varietal Recommendation',
        timestamp: '2026-01-18 • 10:30 AM',
        location: 'Ozar Farm Cluster, Nashik',
        actor: 'Agronauts AI Planning Engine',
        details: `Soil NPK calibrated for ${cropName}. Seed variety certified F1 with geo-tagged plot mapping.`,
        verified: true
      },
      {
        stage: 'GROW',
        title: 'Precision Micro-Irrigation & Crop Monitoring',
        timestamp: '2026-02-10 • 08:00 AM',
        location: 'Field Sector 2 (Drip Line #4)',
        actor: 'Ramesh Patil (Verified Farmer)',
        details: 'Bi-weekly leaf health scans completed with zero pest infestation flags.',
        verified: true
      },
      {
        stage: 'HARVEST',
        title: 'Morning Manual Harvesting & Batch Registration',
        timestamp: `${batch?.harvestDate || '2026-03-01'} • 06:30 AM`,
        location: 'Farmgate Packing Shed, Nashik',
        actor: 'Harvest Crew #3',
        details: `Harvested at breaker-to-pink maturity stage. Registered under Universal Batch ID: ${batchId}.`,
        verified: true
      },
      {
        stage: 'QUALITY CHECK',
        title: 'AI Computer Vision Quality Inspection',
        timestamp: `${batch?.harvestDate || '2026-03-01'} • 07:15 AM`,
        location: 'Agronauts Vision Hub',
        actor: 'Multimodal Vision Diagnostic AI',
        details: `Analyzed size, surface skin, color consistency and firmness index (Quality Score: ${batch?.qualityReport?.overallScore || 92}/100).`,
        verified: true
      },
      {
        stage: 'GRADING',
        title: 'Provisional Quality Grading Assigned',
        timestamp: `${batch?.harvestDate || '2026-03-01'} • 07:18 AM`,
        location: 'Agronauts Grading Engine',
        actor: 'Automated Agricultural Standards AI',
        details: `Certified as ${batch?.grade || 'Grade A'} (65% Grade A, 28% Grade B, 7% Grade C).`,
        verified: true
      },
      {
        stage: 'INVENTORY',
        title: 'Produce Batch Inventory Entry',
        timestamp: `${batch?.harvestDate || '2026-03-01'} • 08:00 AM`,
        location: 'Batch Registry',
        actor: 'Agronauts Warehouse Protocol',
        details: `${batch?.totalQuantity || 15} ${batch?.unit || 'Tons'} indexed in active ecosystem ledger.`,
        verified: true
      },
      {
        stage: 'PROCESSING / MARKET',
        title: 'Zero-Waste Utilization & Buyer Allocation',
        timestamp: `${batch?.harvestDate || '2026-03-01'} • 08:30 AM`,
        location: 'Digital Marketplace',
        actor: 'AI Value Engine',
        details: 'Split decision: Direct fresh sale for Grade A; processing allocation for Grade B.',
        verified: true
      },
      {
        stage: 'BUYER',
        title: 'Matched with Verified Buyer / Processor',
        timestamp: '2026-03-02 • 02:00 PM',
        location: 'Nashik APMC Terminal',
        actor: 'FreshMart Wholesalers & Sahyadri Agro',
        details: 'Purchase Order locked at ₹24,500/Ton with verified escrow payment intent.',
        verified: true
      },
      {
        stage: 'SALE',
        title: 'Dispatch, Delivery & Direct Farmer Payment',
        timestamp: '2026-03-02 • 04:30 PM',
        location: 'Farmer Direct Account',
        actor: 'Agronauts Clearing Escrow',
        details: 'Seamless settlement credited directly to Ramesh Patil with zero middleman fee.',
        verified: true
      }
    ];
  }

  public allocateBatchInventory(
    batchId: string,
    action: 'STORE' | 'PROCESS' | 'RELEASE_STORAGE',
    quantity: number,
    destination?: string
  ): { success: boolean; message: string; batch?: ProduceBatch } {
    const batch = this.produceBatches.find(b => b.batchId === batchId);
    if (!batch) {
      return { success: false, message: `Batch ${batchId} not found.` };
    }

    if (quantity <= 0) {
      return { success: false, message: 'Quantity must be greater than zero.' };
    }

    if (action === 'STORE') {
      if (quantity > batch.remainingQuantity) {
        return {
          success: false,
          message: `Cannot store ${quantity} ${batch.unit}. Only ${batch.remainingQuantity} ${batch.unit} is unallocated.`
        };
      }
      batch.storedQuantity = (batch.storedQuantity || 0) + quantity;
      batch.remainingQuantity -= quantity;
      batch.storageLocation = destination || 'Nashik Cold Chain Chamber 2';

      this.storageRecords.unshift({
        id: 'str_' + Date.now(),
        batchId: batch.batchId,
        crop: batch.crop,
        quantity,
        unit: batch.unit,
        warehouseName: destination || 'Nashik Cold Chain Chamber 2',
        location: 'Nashik Agri Hub',
        storedDate: new Date().toISOString().split('T')[0],
        expectedShelfLifeDays: 21,
        remainingDays: 21,
        spoilageRisk: 'LOW',
        temperatureC: 11.5,
        humidityPct: 90,
        alerts: ['Optimal environmental parameters maintained']
      });

      if (batch.remainingQuantity === 0 && (batch.soldQuantity || 0) === 0) {
        batch.status = 'STORED';
      }

      return {
        success: true,
        message: `Successfully stored ${quantity} ${batch.unit} in ${destination || 'cold storage'}.`,
        batch
      };
    }

    if (action === 'PROCESS') {
      if (quantity > batch.remainingQuantity) {
        return {
          success: false,
          message: `Cannot allocate ${quantity} ${batch.unit} to processing. Only ${batch.remainingQuantity} ${batch.unit} is unallocated.`
        };
      }
      batch.processingQuantity = (batch.processingQuantity || 0) + quantity;
      batch.remainingQuantity -= quantity;

      return {
        success: true,
        message: `Successfully routed ${quantity} ${batch.unit} of ${batch.crop} to food processing valorization.`,
        batch
      };
    }

    if (action === 'RELEASE_STORAGE') {
      if (quantity > (batch.storedQuantity || 0)) {
        return {
          success: false,
          message: `Cannot release ${quantity} ${batch.unit}. Currently stored: ${batch.storedQuantity || 0} ${batch.unit}.`
        };
      }
      batch.storedQuantity -= quantity;
      batch.remainingQuantity += quantity;
      if (batch.status === 'STORED' && batch.remainingQuantity > 0) {
        batch.status = 'AVAILABLE';
      }

      return {
        success: true,
        message: `Released ${quantity} ${batch.unit} back to active inventory ledger.`,
        batch
      };
    }

    return { success: false, message: 'Invalid inventory action.' };
  }

  // --- ADMIN METHODS & STATS ---

  public getDashboardStats() {
    const totalFarmers = this.users.filter(u => u.role === 'FARMER').length;
    const totalBuyers = this.users.filter(u => u.role === 'BUYER').length;
    const totalProcessors = this.users.filter(u => u.role === 'PROCESSOR').length;
    const totalAdmins = this.users.filter(u => (u.role as string) === 'ADMIN' || (u.role as string) === 'SUPER_ADMIN').length || 1;
    const totalUsers = this.users.length;
    const totalProduceBatches = this.produceBatches.length;
    const activeBatchesCount = this.produceBatches.filter(b => b.status === 'AVAILABLE' || b.status === 'RESERVED' || b.status === 'PROCESSING').length || this.produceBatches.length;
    const activeListings = this.marketplaceListings.filter(l => l.status === 'ACTIVE').length;
    const totalOrders = this.orders.length;
    const totalTransactionValue = this.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const escrowLockedValue = this.orders.filter(o => o.status === 'ORDER_PLACED' || o.status === 'DISPATCHED' || o.status === 'IN_TRANSIT' || (o.status as string) === 'ESCROW_LOCKED').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const settledFarmerPayouts = this.orders.filter(o => o.status === 'DELIVERED' || o.status === 'PAYMENT_RELEASED' || (o.status as string) === 'SETTLED').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const aiQualityAnalyses = this.produceBatches.filter(b => !!b.qualityReport).length + 42; // historical count
    const diseaseAnalyses = 128;
    const highStorageRisk = this.produceBatches.filter(b => b.spoilageRisk === 'HIGH').length +
      this.storageRecords.filter(s => s.spoilageRisk === 'HIGH').length;
    const processingRequests = this.orders.filter(o => o.orderType === 'PROCESSING_CONTRACT').length + 6;

    return {
      totalFarmers,
      totalBuyers,
      totalProcessors,
      totalAdmins,
      totalUsers,
      totalProduceBatches,
      activeBatchesCount,
      activeListings,
      totalOrders,
      totalTransactionValue,
      escrowLockedValue,
      settledFarmerPayouts,
      aiQualityAnalyses,
      diseaseAnalyses,
      highStorageRisk,
      processingRequests,
      activeUsersCount: this.users.filter(u => u.status !== 'SUSPENDED' && u.status !== 'BLOCKED').length,
      unreadAlertsCount: this.adminAlerts.filter(a => !a.read && !a.archived).length
    };
  }

  public getAnalytics(dateRange: string = '30D') {
    return {
      dateRange,
      userGrowth: [
        { month: 'Oct 2025', farmers: 120, buyers: 28, processors: 12 },
        { month: 'Nov 2025', farmers: 210, buyers: 45, processors: 19 },
        { month: 'Dec 2025', farmers: 340, buyers: 72, processors: 26 },
        { month: 'Jan 2026', farmers: 480, buyers: 110, processors: 38 },
        { month: 'Feb 2026', farmers: 620, buyers: 145, processors: 51 },
        { month: 'Mar 2026', farmers: 740, buyers: 182, processors: 64 }
      ],
      farmersByLocation: [
        { district: 'Nashik', count: 420, produceTons: 680 },
        { district: 'Pune', count: 180, produceTons: 290 },
        { district: 'Ahmednagar', count: 95, produceTons: 160 },
        { district: 'Solapur', count: 65, produceTons: 110 },
        { district: 'Jalgaon', count: 48, produceTons: 85 }
      ],
      cropDistribution: [
        { crop: 'Tomato', percentage: 38, tons: 474 },
        { crop: 'Onion', percentage: 29, tons: 362 },
        { crop: 'Wheat', percentage: 14, tons: 175 },
        { crop: 'Pomegranate', percentage: 11, tons: 137 },
        { crop: 'Other', percentage: 8, tons: 100 }
      ],
      produceGradingBreakdown: [
        { grade: 'Grade A (Direct Table/Export)', count: 18, percentage: 60, color: '#10B981' },
        { grade: 'Grade B (Local Mandi/Retail)', count: 9, percentage: 30, color: '#F59E0B' },
        { grade: 'Grade C (Industrial Processing)', count: 3, percentage: 10, color: '#6366F1' }
      ],
      orderVolumeOverTime: [
        { week: 'W1 Feb', freshOrders: 14, processingContracts: 4, value: 420000 },
        { week: 'W2 Feb', freshOrders: 18, processingContracts: 6, value: 580000 },
        { week: 'W3 Feb', freshOrders: 22, processingContracts: 5, value: 690000 },
        { week: 'W4 Feb', freshOrders: 27, processingContracts: 9, value: 880000 },
        { week: 'W1 Mar', freshOrders: 31, processingContracts: 8, value: 990000 }
      ],
      aiUsageBreakdown: [
        { tool: 'Disease Detection Scans', calls: 342, successRate: 99.4 },
        { tool: 'Produce Quality Grading', calls: 186, successRate: 98.9 },
        { tool: 'Smart Crop Recommendations', calls: 245, successRate: 100 },
        { tool: 'Yield Predictions', calls: 198, successRate: 99.1 },
        { tool: 'Zero-Waste Value Matching', calls: 112, successRate: 98.2 }
      ]
    };
  }

  public updateUserStatus(userId: string, status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'BLOCKED', reason: string, adminEmail: string) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found' };

    const oldStatus = user.status || 'ACTIVE';
    user.status = status;

    this.addAuditLog(
      adminEmail,
      'USER_STATUS_CHANGE',
      `${user.name} (${user.id})`,
      `Changed status from ${oldStatus} to ${status}. Reason: ${reason || 'Administrative action'}`
    );

    return { success: true, user, message: `User status changed to ${status}` };
  }

  public addAuditLog(adminEmail: string, action: string, target: string, details: string, ipAddress: string = '127.0.0.1') {
    const log: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      adminEmail: adminEmail || 'admin@agronauts.in',
      action,
      target,
      timestamp: new Date().toISOString(),
      details,
      ipAddress
    };
    this.auditLogs.unshift(log);
    return log;
  }

  public addCropMaster(cropData: Partial<CropMasterData>, adminEmail: string) {
    const newCrop: CropMasterData = {
      id: 'crp_' + Date.now(),
      cropName: cropData.cropName || 'New Crop',
      category: cropData.category || 'Vegetables',
      season: cropData.season || 'All Season',
      waterRequirement: cropData.waterRequirement || 'Medium',
      soilType: cropData.soilType || 'Loamy soil with balanced pH',
      suitableRegions: cropData.suitableRegions || ['Maharashtra'],
      averageYieldTonsPerAcre: cropData.averageYieldTonsPerAcre || 10,
      marketPriceRangePerQuintal: cropData.marketPriceRangePerQuintal || { min: 2000, max: 3000 },
      active: true,
      description: cropData.description || 'Agricultural crop master record'
    };

    this.cropMasterData.push(newCrop);
    this.addAuditLog(adminEmail, 'ADD_CROP_MASTER', newCrop.cropName, `Added new crop ${newCrop.cropName} to master catalog.`);
    return { success: true, crop: newCrop };
  }

  public updateCropMaster(id: string, updateData: Partial<CropMasterData>, adminEmail: string) {
    const crop = this.cropMasterData.find(c => c.id === id);
    if (!crop) return { success: false, message: 'Crop not found' };

    Object.assign(crop, updateData);
    this.addAuditLog(adminEmail, 'UPDATE_CROP_MASTER', crop.cropName, `Updated master data for ${crop.cropName}`);
    return { success: true, crop };
  }

  public toggleCropActive(id: string, adminEmail: string) {
    const crop = this.cropMasterData.find(c => c.id === id);
    if (!crop) return { success: false, message: 'Crop not found' };

    crop.active = !crop.active;
    this.addAuditLog(adminEmail, 'TOGGLE_CROP_ACTIVE', crop.cropName, `Set active status to ${crop.active}`);
    return { success: true, crop, active: crop.active };
  }

  public moderateListing(id: string, action: 'SUSPEND' | 'ACTIVATE', reason: string, adminEmail: string) {
    const listing = this.marketplaceListings.find(l => l.id === id);
    if (!listing) return { success: false, message: 'Listing not found' };

    if (action === 'SUSPEND') {
      listing.status = 'CLOSED';
      this.addAuditLog(adminEmail, 'LISTING_MODERATED', `${listing.crop} (${listing.id})`, `Suspended listing. Reason: ${reason}`);
      return { success: true, listing, message: 'Listing suspended' };
    } else {
      listing.status = 'ACTIVE';
      this.addAuditLog(adminEmail, 'LISTING_REINSTATED', `${listing.crop} (${listing.id})`, `Reinstated listing.`);
      return { success: true, listing, message: 'Listing activated' };
    }
  }

  public markAlertRead(id: string) {
    const alert = this.adminAlerts.find(a => a.id === id);
    if (alert) {
      alert.read = true;
      return { success: true, alert };
    }
    return { success: false, message: 'Alert not found' };
  }

  public markAllAlertsRead() {
    this.adminAlerts.forEach(a => { a.read = true; });
    return { success: true, count: this.adminAlerts.length };
  }

  public updateSettings(newSettings: Partial<SystemSettings>, adminEmail: string) {
    this.systemSettings = { ...this.systemSettings, ...newSettings };
    this.addAuditLog(adminEmail, 'SETTINGS_UPDATE', 'System Configuration', 'Updated platform configuration parameters.');
    return { success: true, settings: this.systemSettings };
  }
}

export const db = new AgronautsDatabase();
