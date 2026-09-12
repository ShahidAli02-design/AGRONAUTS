export type UserRole = 'FARMER' | 'BUYER' | 'PROCESSOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'BLOCKED';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  token?: string;
  avatar?: string;
  status?: UserStatus;
  location?: string;
  district?: string;
  state?: string;
  lastActive?: string;
  createdAt: string;
}

export type AdminPermission =
  | 'USER_VIEW'
  | 'USER_EDIT'
  | 'USER_SUSPEND'
  | 'PRODUCE_VIEW'
  | 'MARKETPLACE_VIEW'
  | 'MARKETPLACE_MODERATE'
  | 'ORDER_VIEW'
  | 'ANALYTICS_VIEW'
  | 'AI_MONITOR'
  | 'AUDIT_VIEW'
  | 'SYSTEM_SETTINGS';

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
}

export interface ServiceHealth {
  id: string;
  name: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  lastChecked: string;
  errorCount: number;
  description: string;
}

export interface AdminAlert {
  id: string;
  type: 'STORAGE_RISK' | 'AI_FAILURE' | 'SUSPICIOUS_LISTING' | 'USER_APPROVAL' | 'LARGE_TRANSACTION' | 'ORDER_ISSUE' | 'SYSTEM_DOWNTIME';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  read: boolean;
  archived?: boolean;
  createdAt: string;
  relatedEntityId?: string;
}

export interface CropMasterData {
  id: string;
  cropName: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Pulses' | 'Oilseeds' | 'Cash Crops';
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Perennial' | 'All Season';
  waterRequirement: 'Low' | 'Medium' | 'High';
  soilType: string;
  suitableRegions: string[];
  averageYieldTonsPerAcre: number;
  marketPriceRangePerQuintal: { min: number; max: number };
  active: boolean;
  description: string;
}

export interface SchemeRecord {
  id: string;
  name: string;
  category: string;
  subsidy: string;
  eligibility: string;
  documents: string[];
  deadline: string;
  portalUrl: string;
}

export interface EquipmentRecord {
  id: string;
  title: string;
  providerName: string;
  location: string;
  dailyRate: number;
  available: boolean;
  specs: string;
  imageUrl: string;
}

export interface SystemSettings {
  platformName: string;
  maintenanceMode: boolean;
  aiEngineEnabled: boolean;
  aiModelVersion: string;
  autoApproveListings: boolean;
  minEscrowRetentionHours: number;
  alertEmailRecipient: string;
  maxUploadSizeMb: number;
  requireKycForSellers: boolean;
}

export interface FarmerProfile {
  userId: string;
  fullName: string;
  mobile: string;
  village: string;
  district: string;
  state: string;
  location: string;
  landArea: number; // in acres
  soilType: 'Black Clay' | 'Red Sandy Loam' | 'Alluvial' | 'Laterite' | 'Loamy';
  irrigationType: 'Drip Irrigation' | 'Canal' | 'Borewell / Sprinkler' | 'Rainfed';
  waterAvailability: 'Abundant' | 'Moderate' | 'Critical / Seasonal';
  currentCrops: string[];
  farmingType: 'Natural / Organic' | 'Integrated Pest Management' | 'Conventional';
  preferredLanguage: 'en' | 'hi' | 'mr';
}

export interface CropPlan {
  id: string;
  farmerId: string;
  cropName: string;
  variety: string;
  sowingDate: string;
  expectedHarvestDate: string;
  totalDays: number;
  currentDay: number;
  growthStage: 'Germination' | 'Vegetative' | 'Flowering' | 'Fruit Formation' | 'Maturity / Ripening';
  landArea: number; // acres
  expectedYieldMin: number; // tons
  expectedYieldMax: number; // tons
  waterRequirement: 'Low' | 'Medium' | 'High';
  diseaseRisk: 'Low' | 'Moderate' | 'High';
  healthScore: number; // 0-100
  marketPriceEstimate: number; // ₹ per quintal / ton
  marketDemand: 'High' | 'Moderate' | 'Low';
  weatherSummary: string;
  soilCondition: string;
  tasks: Array<{ id: string; title: string; completed: boolean; dueDate: string; priority: 'High' | 'Medium' | 'Low' }>;
}

export type ProduceGrade = 'Grade A' | 'Grade B' | 'Grade C' | 'Grade D' | 'Grade E' | 'Grade F';
export type BatchStatus = 'AVAILABLE' | 'RESERVED' | 'STORED' | 'PROCESSING' | 'SOLD' | 'DELIVERED';

export interface QualityReport {
  id: string;
  batchId: string;
  analyzedAt: string;
  imageUrl?: string;
  overallScore: number; // 0-100
  assignedGrade: ProduceGrade;
  breakdown: {
    gradeA: number; // percentage
    gradeB: number;
    gradeC: number;
    gradeD: number;
    gradeE: number;
    gradeF: number;
  };
  metrics: {
    sizeUniformity: number; // %
    colorVibrancy: number; // %
    surfaceDefects: number; // %
    firmnessIndex: number; // %
  };
  visibleDefects: string[];
  freshnessStatus: string;
  confidenceScore: number; // %
  aiExplanation: string;
  recommendedUtilization: 'Direct Premium Sale' | 'Industrial Food Processing' | 'Dehydration / Puree / Animal Feed';
  isSimulated?: boolean;
}

export interface BestUtilizationDecision {
  batchId: string;
  bestAction: 'SELL DIRECT' | 'STORE' | 'PROCESS';
  actionTitle: string;
  reasoning: string;
  estimatedDirectSaleValue: number; // in ₹
  estimatedProcessingValue: number; // in ₹
  potentialAdditionalValue: number; // in ₹
  recommendedProcessType?: string; // e.g. "Puree / Paste / Sun-drying"
  shelfLifeRemainingDays: number;
  storageRecommendation?: string;
}

export interface ProduceBatch {
  batchId: string; // e.g. AGR-2026-TOM-00001
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  crop: string;
  variety: string;
  harvestDate: string;
  totalQuantity: number; // in Quintals or Tons
  remainingQuantity: number;
  soldQuantity: number;
  storedQuantity: number;
  processingQuantity: number;
  unit: 'Tons' | 'Quintals' | 'Kg';
  grade?: ProduceGrade;
  qualityReport?: QualityReport;
  bestUtilization?: BestUtilizationDecision;
  imageUrl?: string;
  status: BatchStatus;
  storageLocation?: string;
  spoilageRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedShelfLifeDays: number;
  daysStored: number;
  basePricePerUnit: number; // ₹
  createdAt: string;
}

export interface MarketplaceListing {
  id: string;
  batchId: string;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  crop: string;
  variety: string;
  grade: ProduceGrade;
  availableQuantity: number;
  unit: string;
  pricePerUnit: number;
  minOrderQuantity: number;
  harvestDate: string;
  imageUrl?: string;
  qualityScore: number;
  shelfLifeDays: number;
  status: 'ACTIVE' | 'PENDING' | 'CLOSED';
  createdAt: string;
}

export interface BuyerMatch {
  id: string;
  buyerName: string;
  buyerType: 'Supermarket / Wholesaler' | 'Food Processing Plant' | 'Exporter' | 'Retail Chain';
  location: string;
  distanceKm: number;
  cropRequested: string;
  preferredGrade: ProduceGrade;
  requiredQuantity: number;
  offeredPricePerUnit: number;
  matchScore: number; // e.g. 94%
  matchReasons: string[];
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ORD-78291
  batchId: string;
  crop: string;
  variety: string;
  grade: ProduceGrade;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  orderType: 'FRESH_PURCHASE' | 'PROCESSING_CONTRACT';
  status: 'ORDER_PLACED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'PAYMENT_RELEASED';
  destinationAddress: string;
  trackingStep: number; // 1 to 5
  estimatedArrival: string;
  createdAt: string;
}

export interface StorageRecord {
  id: string;
  batchId: string;
  crop: string;
  quantity: number;
  unit: string;
  warehouseName: string;
  location: string;
  storedDate: string;
  expectedShelfLifeDays: number;
  remainingDays: number;
  spoilageRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  temperatureC: number;
  humidityPct: number;
  alerts: string[];
}

export interface DiseaseDetectionResult {
  cropDetected: string;
  possibleDisease: string;
  visibleSymptoms: string[];
  confidenceScore: number;
  severity: 'Mild' | 'Moderate' | 'Severe';
  recommendedAction: string;
  preventiveGuidance: string[];
  organicRemedies: string[];
  disclaimer: string;
  isSimulated?: boolean;
}

export interface SoilHealthResult {
  soilHealthStatus: 'Optimal' | 'Moderately Deficient' | 'Critically Deficient';
  overallScore: number; // 0-100
  deficiencies: string[];
  suitableCrops: string[];
  improvementSuggestions: string[];
  organicTreatments: string[];
}

export interface TraceabilityStep {
  stage: 'PLAN' | 'GROW' | 'HARVEST' | 'QUALITY CHECK' | 'GRADING' | 'INVENTORY' | 'PROCESSING / MARKET' | 'BUYER' | 'SALE';
  title: string;
  timestamp: string;
  location: string;
  actor: string;
  details: string;
  verified: boolean;
}
