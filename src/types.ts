export type UserRole = 'FARMER' | 'BUYER' | 'PROCESSOR' | 'ADMIN' | 'Farmer' | 'Buyer' | 'Processor' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  avatar?: string;
  token?: string;
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

export interface TraceabilityStep {
  stage: 'PLAN' | 'GROW' | 'HARVEST' | 'QUALITY CHECK' | 'GRADING' | 'INVENTORY' | 'PROCESSING / MARKET' | 'BUYER' | 'SALE';
  title: string;
  timestamp: string;
  location: string;
  actor: string;
  details: string;
  verified: boolean;
}

export interface FarmerProfile {
  id?: string;
  userId?: string;
  fullName: string;
  mobile?: string;
  phone?: string;
  village: string;
  district: string;
  state?: string;
  location: string;
  landArea: number;
  soilType?: string;
  irrigationType?: string;
  waterAvailability?: string;
  currentCrops?: string[];
  primaryCrops?: string[];
  farmingType?: string;
  preferredLanguage?: 'en' | 'hi' | 'mr';
  agriCreditScore?: number;
}

export interface CropTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
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
  landArea: number;
  expectedYieldMin: number;
  expectedYieldMax: number;
  waterRequirement: 'Low' | 'Medium' | 'High';
  diseaseRisk: 'Low' | 'Moderate' | 'High';
  healthScore: number;
  marketPriceEstimate: number;
  marketDemand: 'High' | 'Moderate' | 'Low';
  weatherSummary: string;
  soilCondition: string;
  tasks: CropTask[];
}

export type ProduceGrade = 'Grade A' | 'Grade B' | 'Grade C' | 'Grade D' | 'Grade E' | 'Grade F';
export type BatchStatus = 'HARVESTED' | 'INSPECTED' | 'STORED' | 'LISTED' | 'SOLD' | 'DELIVERED';

export interface QualityReport {
  id: string;
  batchId: string;
  analyzedAt: string;
  imageUrl?: string;
  overallScore: number;
  assignedGrade: ProduceGrade;
  breakdown: {
    gradeA: number;
    gradeB: number;
    gradeC: number;
    gradeD: number;
    gradeE: number;
    gradeF: number;
  };
  metrics: {
    sizeUniformity: number;
    colorVibrancy: number;
    surfaceDefects: number;
    firmnessIndex: number;
  };
  visibleDefects: string[];
  freshnessStatus: string;
  confidenceScore: number;
  aiExplanation: string;
  recommendedUtilization: string;
  isSimulated?: boolean;
}

export interface BestUtilizationDecision {
  batchId: string;
  bestAction: 'SELL DIRECT' | 'STORE' | 'PROCESS';
  actionTitle: string;
  reasoning: string;
  estimatedDirectSaleValue: number;
  estimatedProcessingValue: number;
  potentialAdditionalValue: number;
  recommendedProcessType?: string;
  shelfLifeRemainingDays: number;
  storageRecommendation?: string;
}

export interface StorageTelemetry {
  facilityName: string;
  spoilageRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedShelfLifeDays: number;
  recommendedAction: string;
}

export interface ProduceBatch {
  batchId: string;
  farmerId?: string;
  farmerName: string;
  farmerLocation: string;
  crop: string;
  variety: string;
  harvestDate: string;
  totalQuantity: number;
  remainingQuantity: number;
  soldQuantity?: number;
  storedQuantity?: number;
  processingQuantity?: number;
  unit: string;
  grade?: ProduceGrade;
  qualityReport?: QualityReport;
  bestUtilization?: BestUtilizationDecision;
  imageUrl?: string;
  status: string;
  storageLocation?: string;
  storageTelemetry?: StorageTelemetry;
  marketPrice?: number;
  createdAt?: string;
}

export interface BuyerMatch {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerType: string;
  location: string;
  distanceKm: number;
  batchId: string;
  cropRequired: string;
  gradeRequired: string;
  quantityRequired: number;
  offeredPricePerUnit: number;
  matchScore: number;
  reasonForMatch: string;
}

export interface Order {
  orderId: string;
  batchId: string;
  crop: string;
  grade: string;
  quantity: number;
  unit: string;
  buyerId: string;
  buyerName: string;
  buyerType: string;
  totalAmount: number;
  deliveryStatus: 'ORDER_PLACED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'PAYMENT_RELEASED';
  createdAt: string;
}

export interface StorageFacility {
  id: string;
  name: string;
  type: string;
  location: string;
  capacityTons: number;
  currentOccupancyTons: number;
  temperature: string;
  humidity: string;
  status: 'ACTIVE' | 'WARNING' | 'MAINTENANCE';
}

export interface GovernmentScheme {
  id: string;
  title: string;
  category: string;
  benefit: string;
  eligibility: string;
  description: string;
  applyUrl: string;
}

export interface EquipmentRental {
  id: string;
  name: string;
  category: string;
  rate: string;
  available: boolean;
  specifications: string;
  hubLocation: string;
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

export interface EcosystemState {
  crops: CropPlan[];
  batches: ProduceBatch[];
  buyerMatches: BuyerMatch[];
  orders: Order[];
  storageFacilities: StorageFacility[];
  farmerProfile: FarmerProfile;
  schemes: GovernmentScheme[];
  equipment: EquipmentRental[];
}

export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'BLOCKED';

export interface ExtendedUser extends User {
  status?: UserStatus;
  location?: string;
  district?: string;
  state?: string;
  lastActive?: string;
  createdAt?: string;
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

export interface AdminDashboardStats {
  totalFarmers: number;
  totalBuyers: number;
  totalProcessors: number;
  totalAdmins?: number;
  totalUsers?: number;
  totalProduceBatches: number;
  activeBatchesCount?: number;
  activeListings: number;
  totalOrders: number;
  totalTransactionValue: number;
  escrowLockedValue?: number;
  settledFarmerPayouts?: number;
  aiQualityAnalyses: number;
  diseaseAnalyses: number;
  highStorageRisk: number;
  processingRequests: number;
  activeUsersCount: number;
  unreadAlertsCount: number;
}

