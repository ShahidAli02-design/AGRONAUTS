import { Router, Request, Response } from 'express';
import { db } from './db';
import {
  analyzeLeafDisease,
  analyzeProduceQuality,
  computeZeroWasteDecision
} from './gemini';
import { sendFarmerOrderNotification } from './notifications';
import { ProduceBatch, MarketplaceListing, Order } from './types';

export const apiRouter = Router();

// -------------------------------------------------------------
// 1. AUTHENTICATION & DEMO LOGIN
// -------------------------------------------------------------
apiRouter.post('/auth/login', (req, res) => {
  const { email, password, role } = req.body;

  let user = db.users.find(u => u.email === email);
  if (!user && role) {
    user = db.users.find(u => u.role === role);
  }
  if (!user) {
    user = db.users[0]; // fallback to farmer
  }

  res.json({
    success: true,
    user,
    token: user.token || 'jwt_token_' + user.id
  });
});

apiRouter.post('/auth/demo-switch', (req, res) => {
  const { role } = req.body;
  const user = db.users.find(u => u.role === role) || db.users[0];
  res.json({ success: true, user, token: user.token });
});

apiRouter.post('/auth/register', (req, res) => {
  const { name, email, mobile, role } = req.body;
  const newUser = {
    id: 'usr_' + Date.now(),
    name: name || 'New User',
    email: email || `user_${Date.now()}@agronauts.in`,
    mobile: mobile || '+91 98000 00000',
    role: role || 'FARMER',
    token: 'jwt_token_' + Date.now(),
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  res.json({ success: true, user: newUser });
});

apiRouter.get('/auth/me', (req, res) => {
  res.json({ success: true, user: db.users[0] });
});

// -------------------------------------------------------------
// 2. FARMER PROFILE
// -------------------------------------------------------------
apiRouter.get('/profile', (req, res) => {
  res.json({ success: true, profile: db.farmerProfile });
});

apiRouter.put('/profile', (req, res) => {
  db.farmerProfile = { ...db.farmerProfile, ...req.body };
  res.json({ success: true, profile: db.farmerProfile, message: 'Profile updated successfully' });
});

// -------------------------------------------------------------
// 3. CROP PLANNING & DYNAMIC CROP DASHBOARDS
// -------------------------------------------------------------
apiRouter.get('/crops', (req, res) => {
  res.json({ success: true, crops: db.activeCrops });
});

apiRouter.get('/crops/:id', (req, res) => {
  const crop = db.activeCrops.find(c => c.id === req.params.id) || db.activeCrops[0];
  res.json({ success: true, crop });
});

apiRouter.post('/crops/plan-recommend', (req, res) => {
  const { location, soilType, season, landArea, waterAvailability, irrigation } = req.body;

  // AI-Based Smart Crop Recommendation
  const recommendations = [
    {
      recommendedCrop: 'Tomato (Arka Rakshak F1)',
      alternativeCrops: ['Sweet Corn', 'French Beans', 'Capsicum'],
      expectedYield: '18–22 tons / acre',
      waterRequirement: 'Medium',
      suitableSeason: season || 'Rabi / Early Summer',
      marketOpportunity: 'High — APMC Nashik and Mumbai retail chains experiencing 18% supply deficit',
      riskLevel: 'Low',
      reason: `Calibrated for ${soilType || 'Black Clay'} with ${irrigation || 'Drip Irrigation'}. Arka Rakshak provides multi-disease resistance (ToLCV + Bacterial Wilt + Early Blight), maximizing commercial yield while keeping fungicide costs low.`
    },
    {
      recommendedCrop: 'Garwa Onion',
      alternativeCrops: ['Garlic', 'Wheat', 'Mustard'],
      expectedYield: '12–15 tons / acre',
      waterRequirement: 'Low to Moderate',
      suitableSeason: 'Late Rabi',
      marketOpportunity: 'Very High — Buffer procurement starting at Lasalgaon Mandi with price support',
      riskLevel: 'Low',
      reason: 'Excellent storability for 4-5 months in aerated structures. Strong hedge against mid-season market price surges.'
    }
  ];

  res.json({ success: true, recommendations });
});

apiRouter.post('/crops', (req, res) => {
  const { cropName, variety, landArea, sowingDate } = req.body;
  const newCrop = {
    id: 'crop_' + Date.now(),
    farmerId: 'usr_farmer_01',
    cropName: cropName || 'Wheat',
    variety: variety || 'Sharbati Gold',
    sowingDate: sowingDate || new Date().toISOString().split('T')[0],
    expectedHarvestDate: '2026-05-15',
    totalDays: 100,
    currentDay: 1,
    growthStage: 'Germination' as const,
    landArea: Number(landArea) || 2.0,
    expectedYieldMin: 14,
    expectedYieldMax: 18,
    waterRequirement: 'Medium' as const,
    diseaseRisk: 'Low' as const,
    healthScore: 96,
    marketPriceEstimate: 2600,
    marketDemand: 'High' as const,
    weatherSummary: '26°C • Favorable clear weather for seed germination',
    soilCondition: 'Adequate seedbed moisture, optimal root aeration',
    tasks: [
      { id: 'nt1', title: 'First light sprinkler irrigation', completed: false, dueDate: 'Day 3', priority: 'High' as const },
      { id: 'nt2', title: 'Pre-emergence bio-herbicide application', completed: false, dueDate: 'Day 7', priority: 'Medium' as const }
    ]
  };
  db.activeCrops.push(newCrop);
  res.json({ success: true, crop: newCrop });
});

apiRouter.put('/crops/:cropId/task/:taskId', (req, res) => {
  const crop = db.activeCrops.find(c => c.id === req.params.cropId);
  if (crop) {
    const task = crop.tasks.find(t => t.id === req.params.taskId);
    if (task) {
      task.completed = !task.completed;
    }
  }
  res.json({ success: true, crop });
});

// -------------------------------------------------------------
// 4. AI DISEASE DETECTION (Supports Vision & Symptom Diagnostics)
// -------------------------------------------------------------
const handleDiseaseDetect = async (req: Request, res: Response) => {
  const { image, cropHint, symptoms } = req.body;
  try {
    const result = await analyzeLeafDisease(image, cropHint, symptoms);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.post('/ai/disease-detect', handleDiseaseDetect);
apiRouter.post('/disease-doctor/analyze', handleDiseaseDetect);

// -------------------------------------------------------------
// 4B. FARMER ORDER NOTIFICATIONS (SMS + WHATSAPP + EMAIL)
// -------------------------------------------------------------
apiRouter.post('/notify/order-placed', async (req: Request, res: Response) => {
  const {
    farmerName,
    farmerPhone,
    farmerEmail,
    buyerName,
    crop,
    variety,
    quantityKg,
    pricePerKg,
    totalAmount,
    batchCode
  } = req.body;

  try {
    const result = await sendFarmerOrderNotification({
      farmerName: farmerName || 'Farmer',
      farmerPhone,
      farmerEmail,
      buyerName: buyerName || 'A buyer',
      crop: crop || 'Produce',
      variety,
      quantityKg: Number(quantityKg) || 0,
      pricePerKg: Number(pricePerKg) || 0,
      totalAmount: Number(totalAmount) || 0,
      batchCode: batchCode || 'N/A'
    });
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 5. HARVEST REGISTRATION & BATCH GENERATION
// -------------------------------------------------------------
apiRouter.post('/harvest/register', (req, res) => {
  const { crop, variety, harvestDate, quantity, unit, location, expectedQuality, storageRequirement } = req.body;

  // Automatically generate UNIQUE PRODUCE BATCH ID: AGR-2026-CROP-XXXXX
  const cropCode = (crop || 'PRD').substring(0, 3).toUpperCase();
  const randomSeq = String(Math.floor(1000 + Math.random() * 9000));
  const batchId = `AGR-2026-${cropCode}-${randomSeq}`;

  const numQty = Number(quantity) || 10;
  const unitStr = unit || 'Tons';

  const newBatch: ProduceBatch = {
    batchId,
    farmerId: 'usr_farmer_01',
    farmerName: db.farmerProfile.fullName,
    farmerLocation: location || db.farmerProfile.location,
    crop: crop || 'Tomato',
    variety: variety || 'Arka Rakshak',
    harvestDate: harvestDate || new Date().toISOString().split('T')[0],
    totalQuantity: numQty,
    remainingQuantity: numQty,
    soldQuantity: 0,
    storedQuantity: 0,
    processingQuantity: 0,
    unit: unitStr,
    status: 'AVAILABLE',
    spoilageRisk: 'LOW',
    expectedShelfLifeDays: 14,
    daysStored: 0,
    basePricePerUnit: crop === 'Tomato' ? 24500 : crop === 'Mango' ? 68000 : 19000,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    storageLocation: storageRequirement || 'Farmgate Dispatch Staging Bay',
    createdAt: new Date().toISOString()
  };

  db.produceBatches.unshift(newBatch);

  res.json({
    success: true,
    message: 'Harvest registered and universal Batch ID generated successfully',
    batch: newBatch
  });
});

apiRouter.get('/batches', (req, res) => {
  res.json({ success: true, batches: db.produceBatches });
});

apiRouter.get('/batches/:batchId', (req, res) => {
  const batch = db.produceBatches.find(b => b.batchId === req.params.batchId);
  if (!batch) {
    return res.status(404).json({ success: false, error: 'Batch not found' });
  }
  res.json({ success: true, batch });
});

// -------------------------------------------------------------
// 6. AI QUALITY GRADING & ZERO-WASTE DECISION ENGINE
// -------------------------------------------------------------
const handleQualityGrading = async (req: Request, res: Response) => {
  const { batchId, image, crop, quantity } = req.body;

  const targetBatchId = batchId || `LOT-${Date.now().toString().slice(-6)}`;
  const batch = batchId ? db.produceBatches.find(b => b.batchId === batchId) : undefined;
  const cropName = crop || batch?.crop || 'Tomato';
  const qty = Number(quantity) || batch?.totalQuantity || 10;

  try {
    const qualityReport = await analyzeProduceQuality(targetBatchId, image, cropName, qty);
    const zeroWasteDecision = computeZeroWasteDecision(
      targetBatchId,
      cropName,
      qualityReport.assignedGrade,
      qty,
      batch?.basePricePerUnit || 24500
    );

    if (batch) {
      batch.grade = qualityReport.assignedGrade;
      batch.qualityReport = qualityReport;
      batch.bestUtilization = zeroWasteDecision;
      if (image && image.length > 50) {
        batch.imageUrl = image;
      }
    }

    res.json({
      success: true,
      batchId: targetBatchId,
      qualityReport,
      bestUtilization: zeroWasteDecision,
      batch
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

apiRouter.post('/ai/quality-grade', handleQualityGrading);
apiRouter.post('/quality-detector/analyze', handleQualityGrading);

// -------------------------------------------------------------
// 7. SOIL HEALTH & MINERAL CALCULATOR
// -------------------------------------------------------------
apiRouter.post('/ai/soil-calculator', (req, res) => {
  const { ph, nitrogen, phosphorus, potassium, organicCarbon, moisture } = req.body;
  const numPh = Number(ph) || 6.8;
  const numN = Number(nitrogen) || 240;
  const numP = Number(phosphorus) || 18;
  const numK = Number(potassium) || 290;
  const numOC = Number(organicCarbon) || 0.65;

  const deficiencies: string[] = [];
  if (numN < 250) deficiencies.push('Available Nitrogen (N) is moderately deficient');
  if (numP < 20) deficiencies.push('Available Phosphorus (P2O5) is below optimal threshold');
  if (numOC < 0.75) deficiencies.push('Soil Organic Carbon (SOC) needs organic replenishment');

  const overallScore = Math.min(100, Math.max(40, Math.round((numPh >= 6.5 && numPh <= 7.5 ? 30 : 20) + (numN > 240 ? 25 : 15) + (numP > 15 ? 20 : 10) + (numK > 250 ? 25 : 15))));

  res.json({
    success: true,
    result: {
      soilHealthStatus: deficiencies.length === 0 ? 'Optimal' : 'Moderately Deficient',
      overallScore,
      deficiencies: deficiencies.length > 0 ? deficiencies : ['Balanced macronutrient ratio verified'],
      suitableCrops: ['Tomato (Solanaceous)', 'Rabi Onion', 'Chickpea', 'Marigold (Nematode trap crop)'],
      improvementSuggestions: [
        'Incorporate 5 tons/acre well-decomposed Farm Yard Manure (FYM) or vermicompost',
        'Apply PSB (Phosphorus Solubilizing Bacteria) bio-inoculant @ 2 kg/acre with irrigation',
        'Use green manuring with Sunhemp or Dhaincha before the monsoon cycle'
      ],
      organicTreatments: [
        'Jeevamrutha foliar drenching every 14 days',
        'Neem cake powder @ 150 kg/acre to suppress soil-borne pathogens'
      ]
    }
  });
});

// -------------------------------------------------------------
// 8. YIELD PREDICTION
// -------------------------------------------------------------
apiRouter.post('/ai/yield-prediction', (req, res) => {
  const { crop, landArea, growthStage } = req.body;
  const area = Number(landArea) || 2.5;

  let basePerAcre = 8;
  if (crop === 'Tomato') basePerAcre = 8.5;
  else if (crop === 'Onion') basePerAcre = 12;
  else if (crop === 'Mango') basePerAcre = 4;
  else if (crop === 'Wheat') basePerAcre = 3;

  const expectedYield = Math.round(basePerAcre * area * 10) / 10;
  const minYield = Math.round(expectedYield * 0.9 * 10) / 10;
  const maxYield = Math.round(expectedYield * 1.15 * 10) / 10;

  res.json({
    success: true,
    prediction: {
      crop: crop || 'Tomato',
      expectedYield: `${expectedYield} Tons`,
      range: `${minYield} – ${maxYield} Tons`,
      confidence: 93,
      factors: [
        'Canopy vegetative density: 92% vigor',
        'Drip moisture consistency at 82% field capacity',
        'Minimal heat stress recorded in recent 14 days',
        'Optimal bee pollination activity observed during flowering'
      ]
    }
  });
});

// -------------------------------------------------------------
// 9. INVENTORY & STORAGE MANAGEMENT
// -------------------------------------------------------------
apiRouter.get('/inventory', (req, res) => {
  res.json({
    success: true,
    totalBatches: db.produceBatches.length,
    totalQuantityTons: db.produceBatches.reduce((acc, b) => acc + b.remainingQuantity, 0),
    batches: db.produceBatches
  });
});

apiRouter.get('/storage', (req, res) => {
  res.json({
    success: true,
    storageRecords: db.storageRecords
  });
});

apiRouter.post('/inventory/allocate', (req, res) => {
  const { batchId, action, quantity, destination } = req.body;
  const numQty = Number(quantity) || 0;

  const result = db.allocateBatchInventory(batchId, action, numQty, destination);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.message });
  }

  res.json({
    success: true,
    message: result.message,
    batch: result.batch,
    storageRecords: db.storageRecords
  });
});

// -------------------------------------------------------------
// 10. MARKETPLACE & SMART MATCHING
// -------------------------------------------------------------
apiRouter.get('/marketplace/listings', (req, res) => {
  res.json({ success: true, listings: db.marketplaceListings });
});

apiRouter.post('/marketplace/listings', (req, res) => {
  const { batchId, pricePerUnit, minOrderQuantity } = req.body;
  const batch = db.produceBatches.find(b => b.batchId === batchId);
  if (!batch) {
    return res.status(404).json({ success: false, error: 'Batch not found' });
  }

  const newListing: MarketplaceListing = {
    id: 'lst_' + Date.now(),
    batchId: batch.batchId,
    farmerId: batch.farmerId,
    farmerName: batch.farmerName,
    farmerLocation: batch.farmerLocation,
    crop: batch.crop,
    variety: batch.variety,
    grade: batch.grade || 'Grade A',
    availableQuantity: batch.remainingQuantity,
    unit: batch.unit,
    pricePerUnit: Number(pricePerUnit) || batch.basePricePerUnit,
    minOrderQuantity: Number(minOrderQuantity) || 1,
    harvestDate: batch.harvestDate,
    imageUrl: batch.imageUrl,
    qualityScore: batch.qualityReport?.overallScore || 90,
    shelfLifeDays: batch.expectedShelfLifeDays,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };

  db.marketplaceListings.unshift(newListing);
  res.json({ success: true, listing: newListing });
});

apiRouter.get('/matching/:batchId', (req, res) => {
  const batch = db.produceBatches.find(b => b.batchId === req.params.batchId) || db.produceBatches[0];
  res.json({
    success: true,
    batchId: batch.batchId,
    matches: db.buyerMatches
  });
});

// -------------------------------------------------------------
// 11. ORDERS & DELIVERY TRACKING
// -------------------------------------------------------------
apiRouter.get('/orders', (req, res) => {
  res.json({ success: true, orders: db.orders });
});

apiRouter.post('/orders', (req, res) => {
  const { batchId, quantity, buyerName, buyerType, destinationAddress, unitPrice: customPrice } = req.body;
  const batch = db.produceBatches.find(b => b.batchId === batchId);
  if (!batch) {
    return res.status(404).json({ success: false, error: 'Produce batch not found.' });
  }

  const reqQty = Number(quantity) || 0;
  if (reqQty <= 0) {
    return res.status(400).json({ success: false, error: 'Order quantity must be greater than zero.' });
  }

  if (reqQty > batch.remainingQuantity) {
    return res.status(400).json({
      success: false,
      error: `Insufficient inventory: Requested ${reqQty} ${batch.unit}, but only ${batch.remainingQuantity} ${batch.unit} is available for sale.`
    });
  }

  const unitPrice = customPrice ? Number(customPrice) : batch.basePricePerUnit;
  const totalAmount = reqQty * unitPrice;

  // Update batch inventory
  batch.remainingQuantity -= reqQty;
  batch.soldQuantity = (batch.soldQuantity || 0) + reqQty;

  // Verify invariants: sold + stored + processing <= totalQuantity
  const totalAllocated = (batch.soldQuantity || 0) + (batch.storedQuantity || 0) + (batch.processingQuantity || 0);
  if (totalAllocated > batch.totalQuantity) {
    batch.soldQuantity -= reqQty;
    batch.remainingQuantity += reqQty;
    return res.status(400).json({
      success: false,
      error: 'Inventory integrity check failed: total allocated quantity exceeds total harvested quantity.'
    });
  }

  if (batch.remainingQuantity <= 0) {
    batch.status = 'SOLD';
  } else {
    batch.status = 'RESERVED';
  }

  const newOrder: Order = {
    id: 'ord_' + Date.now(),
    orderNumber: `AGR-ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    batchId: batch.batchId,
    crop: batch.crop,
    variety: batch.variety,
    grade: batch.grade || 'Grade A',
    buyerId: buyerType === 'PROCESSOR' ? 'usr_processor_01' : 'usr_buyer_01',
    buyerName: buyerName || (buyerType === 'PROCESSOR' ? 'Sahyadri Agro-Processing' : 'FreshMart Wholesalers'),
    farmerId: batch.farmerId,
    farmerName: batch.farmerName,
    quantity: reqQty,
    unit: batch.unit,
    unitPrice,
    totalAmount,
    orderType: buyerType === 'PROCESSOR' ? 'PROCESSING_CONTRACT' : 'FRESH_PURCHASE',
    status: 'ORDER_PLACED',
    destinationAddress: destinationAddress || 'Vashi APMC Central Terminal, Mumbai',
    trackingStep: 1,
    estimatedArrival: 'Tomorrow, 11:00 AM',
    createdAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder);

  res.json({
    success: true,
    message: `Order ${newOrder.orderNumber} successfully created and funded into smart escrow.`,
    order: newOrder,
    batch
  });
});

apiRouter.put('/orders/:id/advance-status', (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

  if (order.trackingStep < 5) {
    order.trackingStep += 1;
    const statusMap = [
      'ORDER_PLACED',
      'DISPATCHED',
      'IN_TRANSIT',
      'DELIVERED',
      'PAYMENT_RELEASED'
    ] as const;
    order.status = statusMap[order.trackingStep - 1];
  }
  res.json({ success: true, order });
});

// -------------------------------------------------------------
// 12. BATCH TRACEABILITY
// -------------------------------------------------------------
apiRouter.get('/traceability/:batchId', (req, res) => {
  const timeline = db.getTraceabilityTimeline(req.params.batchId);
  const batch = db.produceBatches.find(b => b.batchId === req.params.batchId);
  res.json({
    success: true,
    batchId: req.params.batchId,
    batch,
    timeline
  });
});

// -------------------------------------------------------------
// 13. VALUE CREATION & FARMER EARNINGS
// -------------------------------------------------------------
apiRouter.get('/analytics/farmer-value', (req, res) => {
  const totalHarvestTons = db.produceBatches.reduce((acc, b) => acc + b.totalQuantity, 0);
  const soldTons = db.produceBatches.reduce((acc, b) => acc + b.soldQuantity, 0);
  const storedTons = db.produceBatches.reduce((acc, b) => acc + b.storedQuantity, 0);
  const totalRevenue = db.orders.reduce((acc, o) => acc + o.totalAmount, 0);

  // Avoided post-harvest losses through AI zero-waste and cold chain:
  const estimatedAvoidedLoss = Math.round(totalRevenue * 0.18);
  const potentialAdditionalValue = 68000;

  res.json({
    success: true,
    summary: {
      totalHarvestTons,
      soldTons,
      storedTons,
      totalRevenue,
      estimatedAvoidedLoss,
      potentialAdditionalValue,
      gradeDistribution: {
        gradeA: '62%',
        gradeB: '28%',
        gradeC: '10%'
      },
      agriCreditScore: 742,
      greenScore: 88
    }
  });
});

// -------------------------------------------------------------
// 14. ANCILLARY MODULES (Weather, Mandi, Schemes, Equipment, Community)
// -------------------------------------------------------------
apiRouter.get('/extras/weather', (req, res) => {
  res.json({
    success: true,
    weather: {
      location: 'Nashik, Maharashtra',
      temp: '28°C',
      condition: 'Sunny & Clear',
      humidity: '54%',
      wind: '12 km/h WNW',
      rainProbability: '5%',
      forecast: [
        { day: 'Today', temp: '28° / 17°', rain: '5%', condition: 'Sunny' },
        { day: 'Tomorrow', temp: '29° / 18°', rain: '10%', condition: 'Clear' },
        { day: 'Thursday', temp: '31° / 19°', rain: '15%', condition: 'Partly Cloudy' },
        { day: 'Friday', temp: '30° / 18°', rain: '20%', condition: 'Afternoon Breeze' }
      ],
      advisory: 'Optimal weather for harvesting and solar dehydration operations. No rain alerts for the next 72 hours.'
    }
  });
});

apiRouter.get('/extras/market-prices', (req, res) => {
  res.json({
    success: true,
    prices: [
      { crop: 'Tomato (Red)', mandi: 'Nashik APMC', modalPrice: '₹2,450 / Qtl', trend: '+₹150 (Rising)', demand: 'High' },
      { crop: 'Onion (Garwa)', mandi: 'Lasalgaon APMC', modalPrice: '₹1,850 / Qtl', trend: '-₹50 (Stable)', demand: 'Moderate' },
      { crop: 'Mango (Alphonso)', mandi: 'Vashi Mumbai', modalPrice: '₹6,800 / Qtl', trend: '+₹400 (Peak)', demand: 'Very High' },
      { crop: 'Wheat (Sharbati)', mandi: 'Khandwa APMC', modalPrice: '₹2,650 / Qtl', trend: '+₹80 (Steady)', demand: 'High' },
      { crop: 'Potato (Kufri)', mandi: 'Pune Market Yard', modalPrice: '₹1,550 / Qtl', trend: 'Stable', demand: 'Moderate' }
    ]
  });
});

apiRouter.get('/extras/schemes', (req, res) => {
  res.json({
    success: true,
    schemes: db.schemes
  });
});

apiRouter.get('/extras/equipment', (req, res) => {
  res.json({
    success: true,
    equipment: db.equipmentRentals
  });
});

apiRouter.get('/ecosystem/state', (req, res) => {
  res.json({
    success: true,
    crops: db.activeCrops,
    batches: db.produceBatches,
    buyerMatches: db.buyerMatches,
    orders: db.orders,
    storageFacilities: [
      {
        id: 'fac_1',
        name: 'Nashik Cold Chain Chamber 2',
        type: 'Cold Storage (12°C Controlled)',
        location: 'Pimpalgaon Baswant',
        capacityTons: 120,
        currentOccupancyTons: 74,
        temperature: '12.4°C',
        humidity: '91%',
        status: 'ACTIVE'
      },
      {
        id: 'fac_2',
        name: 'Lasalgaon Aerated Chawl #14',
        type: 'Ventilated Onion Storage',
        location: 'Lasalgaon Mandi Hub',
        capacityTons: 350,
        currentOccupancyTons: 210,
        temperature: '24.2°C',
        humidity: '68%',
        status: 'WARNING'
      }
    ],
    farmerProfile: db.farmerProfile,
    schemes: [
      {
        id: 'sch_01',
        title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        category: 'Crop Insurance',
        benefit: 'Premium capped at 1.5% - 2.0% with full weather index payout',
        eligibility: 'All farmers cultivating notified food crops in notified areas',
        description: 'Comprehensive risk insurance against non-preventable natural risks from pre-sowing to post-harvest.',
        applyUrl: 'https://pmfby.gov.in'
      },
      {
        id: 'sch_02',
        title: 'Agriculture Infrastructure Fund (AIF)',
        category: 'Cold Chain & Storage Subsidy',
        benefit: '3% interest subvention on loans up to ₹2 Crore for on-farm cold rooms',
        eligibility: 'Farmers, FPOs, Self Help Groups, Agri-entrepreneurs',
        description: 'Medium-long term debt financing facility for investment in viable post-harvest management infrastructure.',
        applyUrl: 'https://agriinfra.dac.gov.in'
      },
      {
        id: 'sch_03',
        title: 'SMAM Sub-Mission on Agricultural Mechanization',
        category: 'Farm Machinery Subsidy',
        benefit: '40% to 50% capital subsidy for tractors, rotavators, and sprayers',
        eligibility: 'Small and marginal farmers with verified land records',
        description: 'Financial assistance for custom hiring centers and high-tech farm machinery hubs.',
        applyUrl: 'https://agrimachinery.nic.in'
      }
    ],
    equipment: [
      {
        id: 'eq_01',
        name: 'John Deere 5050D (50 HP) + Rotavator',
        category: 'Tractor & Tillage',
        rate: '₹1,800 / Day',
        available: true,
        specifications: 'Power steering, 4WD, fuel-efficient, operator included',
        hubLocation: 'Dindori Hub (5 km)'
      },
      {
        id: 'eq_02',
        name: 'Precision Agricultural Drone Sprayer (16L)',
        category: 'Drone Spraying',
        rate: '₹600 / Acre',
        available: true,
        specifications: 'Covers 1 acre in 8 minutes with ultra-low volume electrostatic nozzles',
        hubLocation: 'Nashik Tech Krishi Hub (12 km)'
      },
      {
        id: 'eq_03',
        name: 'Multi-Crop High Capacity Combine Harvester',
        category: 'Harvester',
        rate: '₹3,500 / Day',
        available: true,
        specifications: 'Suitable for wheat, soybean, and pulses with 98% clean grain separation',
        hubLocation: 'Pimpalgaon Baswant Hub (15 km)'
      }
    ]
  });
});

// -------------------------------------------------------------
// 12. ADMIN CONTROL CENTER & PROTECTED APIS
// -------------------------------------------------------------

// RBAC middleware checking admin role
const requireAdminRole = (req: any, res: any, next: any) => {
  const role = (req.headers['x-user-role'] || req.query.userRole || 'ADMIN').toString().toUpperCase();
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Administrative authorization required to access this endpoint.'
    });
  }
  next();
};

apiRouter.use('/admin', requireAdminRole);

// Dashboard Summary Stats
apiRouter.get('/admin/dashboard', (req, res) => {
  const stats = db.getDashboardStats();
  res.json({
    success: true,
    stats,
    recentAlerts: db.adminAlerts.filter(a => !a.archived).slice(0, 5),
    recentAudits: db.auditLogs.slice(0, 5),
    systemHealth: db.systemHealth
  });
});

// User Management
apiRouter.get('/admin/users', (req, res) => {
  const { role, status, q } = req.query;
  let list = [...db.users];

  if (role && role !== 'ALL') {
    list = list.filter(u => u.role.toLowerCase() === (role as string).toLowerCase());
  }

  if (status && status !== 'ALL') {
    list = list.filter(u => (u.status || 'ACTIVE').toLowerCase() === (status as string).toLowerCase());
  }

  if (q) {
    const query = (q as string).toLowerCase();
    list = list.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.location && u.location.toLowerCase().includes(query)) ||
      (u.mobile && u.mobile.includes(query))
    );
  }

  res.json({ success: true, count: list.length, users: list });
});

apiRouter.get('/admin/users/:id', (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Related data
  const userBatches = db.produceBatches.filter(b => b.farmerId === user.id);
  const userOrders = db.orders.filter(o => o.farmerId === user.id || o.buyerId === user.id);

  res.json({
    success: true,
    user,
    batches: userBatches,
    orders: userOrders
  });
});

apiRouter.patch('/admin/users/:id/status', (req, res) => {
  const { status, reason } = req.body;
  const adminEmail = (req.headers['x-admin-email'] || 'admin@agronauts.in').toString();

  const result = db.updateUserStatus(req.params.id, status, reason, adminEmail);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

apiRouter.get('/admin/farmers', (req, res) => {
  const farmers = db.users.filter(u => u.role === 'FARMER');
  res.json({ success: true, count: farmers.length, farmers });
});

apiRouter.get('/admin/buyers', (req, res) => {
  const buyers = db.users.filter(u => u.role === 'BUYER');
  res.json({ success: true, count: buyers.length, buyers });
});

apiRouter.get('/admin/processors', (req, res) => {
  const processors = db.users.filter(u => u.role === 'PROCESSOR');
  res.json({ success: true, count: processors.length, processors });
});

// Agriculture Master Data Management
apiRouter.get('/admin/crops', (req, res) => {
  const { category, active, q } = req.query;
  let crops = [...db.cropMasterData];

  if (category && category !== 'ALL') {
    crops = crops.filter(c => c.category === category);
  }
  if (active !== undefined && active !== 'ALL') {
    const isActive = active === 'true';
    crops = crops.filter(c => c.active === isActive);
  }
  if (q) {
    const query = (q as string).toLowerCase();
    crops = crops.filter(c =>
      c.cropName.toLowerCase().includes(query) ||
      c.soilType.toLowerCase().includes(query) ||
      c.suitableRegions.some(r => r.toLowerCase().includes(query))
    );
  }

  res.json({ success: true, count: crops.length, crops });
});

apiRouter.post('/admin/crops', (req, res) => {
  const adminEmail = (req.headers['x-admin-email'] || 'admin@agronauts.in').toString();
  const result = db.addCropMaster(req.body, adminEmail);
  res.status(201).json(result);
});

apiRouter.patch('/admin/crops/:id', (req, res) => {
  const adminEmail = (req.headers['x-admin-email'] || 'admin@agronauts.in').toString();
  const result = db.updateCropMaster(req.params.id, req.body, adminEmail);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

apiRouter.patch('/admin/crops/:id/toggle', (req, res) => {
  const adminEmail = (req.headers['x-admin-email'] || 'admin@agronauts.in').toString();
  const result = db.toggleCropActive(req.params.id, adminEmail);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// Government Schemes Management
apiRouter.get('/admin/schemes', (req, res) => {
  res.json({ success: true, count: db.schemes.length, schemes: db.schemes });
});

apiRouter.post('/admin/schemes', (req, res) => {
  const { name, category, subsidy, eligibility, documents, deadline, portalUrl } = req.body;
  if (!name || !category) {
    return res.status(400).json({ success: false, message: 'Scheme name and category are required.' });
  }
  const newScheme = {
    id: 'sch_' + Date.now(),
    name,
    category,
    subsidy: subsidy || '',
    eligibility: eligibility || '',
    documents: Array.isArray(documents) ? documents : (documents ? String(documents).split(',').map((d: string) => d.trim()) : []),
    deadline: deadline || 'Ongoing',
    portalUrl: portalUrl || ''
  };
  db.schemes.unshift(newScheme);
  res.status(201).json({ success: true, scheme: newScheme });
});

apiRouter.delete('/admin/schemes/:id', (req, res) => {
  const idx = db.schemes.findIndex(s => s.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Scheme not found' });
  }
  db.schemes.splice(idx, 1);
  res.json({ success: true, message: 'Scheme deleted' });
});

// Equipment Rental Management
apiRouter.get('/admin/equipment', (req, res) => {
  res.json({ success: true, count: db.equipmentRentals.length, equipment: db.equipmentRentals });
});

apiRouter.post('/admin/equipment', (req, res) => {
  const { title, providerName, location, dailyRate, available, specs, imageUrl } = req.body;
  if (!title || !providerName) {
    return res.status(400).json({ success: false, message: 'Equipment title and provider name are required.' });
  }
  const newEquipment = {
    id: 'eq_' + Date.now(),
    title,
    providerName,
    location: location || '',
    dailyRate: Number(dailyRate) || 0,
    available: available !== undefined ? Boolean(available) : true,
    specs: specs || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&auto=format&fit=crop&q=80'
  };
  db.equipmentRentals.unshift(newEquipment);
  res.status(201).json({ success: true, equipment: newEquipment });
});

apiRouter.delete('/admin/equipment/:id', (req, res) => {
  const idx = db.equipmentRentals.findIndex(e => e.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Equipment not found' });
  }
  db.equipmentRentals.splice(idx, 1);
  res.json({ success: true, message: 'Equipment deleted' });
});

// Produce Management
apiRouter.get('/admin/produce', (req, res) => {
  const { grade, status, risk, q } = req.query;
  let batches = [...db.produceBatches];

  if (grade && grade !== 'ALL') {
    batches = batches.filter(b => b.grade === grade);
  }
  if (status && status !== 'ALL') {
    batches = batches.filter(b => b.status === status);
  }
  if (risk && risk !== 'ALL') {
    batches = batches.filter(b => b.spoilageRisk === risk);
  }
  if (q) {
    const query = (q as string).toLowerCase();
    batches = batches.filter(b =>
      b.batchId.toLowerCase().includes(query) ||
      b.crop.toLowerCase().includes(query) ||
      b.farmerName.toLowerCase().includes(query) ||
      b.farmerLocation.toLowerCase().includes(query)
    );
  }

  res.json({ success: true, count: batches.length, batches });
});

apiRouter.get('/admin/batches/:batchId', (req, res) => {
  const batch = db.produceBatches.find(b => b.batchId === req.params.batchId);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }

  const timeline = db.getTraceabilityTimeline(batch.batchId);
  res.json({ success: true, batch, timeline });
});

// Orders & Transactions
apiRouter.get('/admin/orders', (req, res) => {
  const { status, type, q } = req.query;
  let orders = [...db.orders];

  if (status && status !== 'ALL') {
    orders = orders.filter(o => o.status === status);
  }
  if (type && type !== 'ALL') {
    orders = orders.filter(o => o.orderType === type);
  }
  if (q) {
    const query = (q as string).toLowerCase();
    orders = orders.filter(o =>
      o.orderNumber.toLowerCase().includes(query) ||
      o.buyerName.toLowerCase().includes(query) ||
      o.farmerName.toLowerCase().includes(query) ||
      o.crop.toLowerCase().includes(query)
    );
  }

  const totalValue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  res.json({ success: true, count: orders.length, totalValue, orders });
});

apiRouter.get('/admin/transactions', (req, res) => {
  const transactions = db.orders.map(o => ({
    transactionId: 'TXN-' + o.orderNumber.replace('ORD-', ''),
    orderId: o.id,
    orderNumber: o.orderNumber,
    buyerName: o.buyerName,
    farmerName: o.farmerName,
    crop: o.crop,
    quantity: `${o.quantity} ${o.unit}`,
    amount: o.totalAmount,
    escrowStatus: o.status === 'PAYMENT_RELEASED' ? 'SETTLED' : 'LOCKED_IN_ESCROW',
    paymentMethod: 'UPI Direct Farmer Gateway',
    timestamp: o.createdAt
  }));

  const totalEscrow = transactions.reduce((s, t) => s + t.amount, 0);
  res.json({ success: true, count: transactions.length, totalEscrow, transactions });
});

// Marketplace Moderation
apiRouter.patch('/admin/marketplace/listings/:id/moderate', (req, res) => {
  const { action, reason } = req.body;
  const adminEmail = (req.headers['x-admin-email'] || 'admin@agronauts.in').toString();

  const result = db.moderateListing(req.params.id, action, reason, adminEmail);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// Analytics
apiRouter.get('/admin/analytics', (req, res) => {
  const dateRange = (req.query.period || '30D').toString();
  const data = db.getAnalytics(dateRange);
  res.json({ success: true, ...data });
});

// AI/ML Telemetry
apiRouter.get('/admin/ai-monitoring', (req, res) => {
  res.json({
    success: true,
    geminiStatus: {
      status: 'OPERATIONAL',
      model: db.systemSettings.aiModelVersion,
      endpoint: 'generativelanguage.googleapis.com',
      averageLatencyMs: 380,
      uptimePct: 99.98,
      lastHealthCheck: new Date().toISOString()
    },
    metrics: {
      totalDiseaseScans: 342,
      totalQualityScans: 186,
      cropRecommendations: 245,
      yieldPredictions: 198,
      processingDecisions: 112,
      accuracyRate: '98.7%'
    },
    recentInferences: [
      {
        id: 'inf_01',
        task: 'Leaf Blight Detection',
        crop: 'Tomato',
        confidence: 96,
        model: 'gemini-2.5-flash',
        latencyMs: 340,
        result: 'Early Blight (Alternaria solani)',
        timestamp: '12 mins ago'
      },
      {
        id: 'inf_02',
        task: 'Optical Quality Grading',
        crop: 'Garwa Onion',
        confidence: 94,
        model: 'gemini-2.5-flash',
        latencyMs: 410,
        result: 'Grade A (Score: 92/100)',
        timestamp: '35 mins ago'
      },
      {
        id: 'inf_03',
        task: 'Zero-Waste Utilization Optimizer',
        crop: 'Tomato',
        confidence: 98,
        model: 'gemini-2.5-flash',
        latencyMs: 290,
        result: 'Food Processing (Puree/Paste valorization)',
        timestamp: '1 hour ago'
      }
    ]
  });
});

// Storage Risk Sentinel
apiRouter.get('/admin/storage-risk', (req, res) => {
  const records = db.storageRecords;
  const highRiskCount = records.filter(r => r.spoilageRisk === 'HIGH').length;
  const mediumRiskCount = records.filter(r => r.spoilageRisk === 'MEDIUM').length;

  res.json({
    success: true,
    totalRecords: records.length,
    highRiskCount,
    mediumRiskCount,
    records
  });
});

// Alerts Center
apiRouter.get('/admin/alerts', (req, res) => {
  const { severity, unreadOnly } = req.query;
  let alerts = db.adminAlerts.filter(a => !a.archived);

  if (severity && severity !== 'ALL') {
    alerts = alerts.filter(a => a.severity === severity);
  }
  if (unreadOnly === 'true') {
    alerts = alerts.filter(a => !a.read);
  }

  res.json({ success: true, count: alerts.length, unreadCount: alerts.filter(a => !a.read).length, alerts });
});

apiRouter.patch('/admin/alerts/:id/read', (req, res) => {
  const result = db.markAlertRead(req.params.id);
  res.json(result);
});

apiRouter.post('/admin/alerts/mark-all-read', (req, res) => {
  const result = db.markAllAlertsRead();
  res.json(result);
});

// Audit Logs
apiRouter.get('/admin/audit-logs', (req, res) => {
  const { action, q } = req.query;
  let logs = [...db.auditLogs];

  if (action && action !== 'ALL') {
    logs = logs.filter(l => l.action === action);
  }
  if (q) {
    const query = (q as string).toLowerCase();
    logs = logs.filter(l =>
      l.target.toLowerCase().includes(query) ||
      l.details.toLowerCase().includes(query) ||
      l.adminEmail.toLowerCase().includes(query)
    );
  }

  res.json({ success: true, count: logs.length, logs });
});

// System Health
apiRouter.get('/admin/system-health', (req, res) => {
  res.json({
    success: true,
    overallStatus: 'HEALTHY',
    services: db.systemHealth,
    serverUptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024)
  });
});

// System Settings
apiRouter.get('/admin/settings', (req, res) => {
  res.json({ success: true, settings: db.systemSettings });
});

apiRouter.post('/admin/settings', (req, res) => {
  const adminEmail = (req.headers['x-admin-email'] || 'admin@agronauts.in').toString();
  const result = db.updateSettings(req.body, adminEmail);
  res.json(result);
});

export default apiRouter;

