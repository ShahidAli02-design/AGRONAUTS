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
  DiseaseDetectionResult,
  QualityReport,
  BestUtilizationDecision,
  ExtendedUser,
  AuditLog,
  ServiceHealth,
  AdminAlert,
  CropMasterData,
  SystemSettings,
  AdminDashboardStats
} from '../types';

const BASE_URL = '/api';

export class ApiService {
  public static isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  // Helper for requests with local cache backup
  private static async request<T>(endpoint: string, options?: RequestInit, cacheKey?: string): Promise<T> {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {})
        }
      });

      if (!res.ok) {
        throw new Error(`API error (${res.status}): ${res.statusText}`);
      }

      const data = await res.json();
      if (cacheKey && typeof window !== 'undefined') {
        localStorage.setItem(`agronauts_cache_${cacheKey}`, JSON.stringify(data));
        localStorage.setItem('agronauts_last_synced', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
      return data;
    } catch (error) {
      console.warn(`Request failed for ${endpoint}, checking offline cache...`, error);
      if (cacheKey && typeof window !== 'undefined') {
        const cached = localStorage.getItem(`agronauts_cache_${cacheKey}`);
        if (cached) {
          return JSON.parse(cached);
        }
      }
      throw error;
    }
  }

  // Auth & Roles
  static async login(email?: string, role?: string): Promise<{ success: boolean; user: User; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role })
    });
  }

  static async switchRole(role: string): Promise<{ success: boolean; user: User }> {
    return this.request('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  }

  // Profile
  static async getProfile(): Promise<{ success: boolean; profile: FarmerProfile }> {
    return this.request('/profile', undefined, 'profile');
  }

  static async updateProfile(profile: Partial<FarmerProfile>): Promise<{ success: boolean; profile: FarmerProfile }> {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
  }

  // Crops
  static async getCrops(): Promise<{ success: boolean; crops: CropPlan[] }> {
    return this.request('/crops', undefined, 'crops');
  }

  static async getCrop(id: string): Promise<{ success: boolean; crop: CropPlan }> {
    return this.request(`/crops/${id}`);
  }

  static async planCrop(payload: any): Promise<{ success: boolean; recommendations: any[] }> {
    return this.request('/crops/plan-recommend', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static async addCrop(payload: any): Promise<{ success: boolean; crop: CropPlan }> {
    return this.request('/crops', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static async toggleTask(cropId: string, taskId: string): Promise<{ success: boolean; crop: CropPlan }> {
    return this.request(`/crops/${cropId}/task/${taskId}`, { method: 'PUT' });
  }

  // Disease AI
  static async detectDisease(image: string, cropHint?: string): Promise<{ success: boolean; result: DiseaseDetectionResult }> {
    return this.request('/ai/disease-detect', {
      method: 'POST',
      body: JSON.stringify({ image, cropHint })
    });
  }

  // Harvest & Batches
  static async registerHarvest(payload: any): Promise<{ success: boolean; batch: ProduceBatch; message: string }> {
    return this.request('/harvest/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static async getBatches(): Promise<{ success: boolean; batches: ProduceBatch[] }> {
    return this.request('/batches', undefined, 'batches');
  }

  static async getBatch(batchId: string): Promise<{ success: boolean; batch: ProduceBatch }> {
    return this.request(`/batches/${batchId}`);
  }

  // AI Quality Grading & Zero-Waste
  static async gradeQuality(batchId: string, image: string, crop: string, quantity: number): Promise<{
    success: boolean;
    batchId: string;
    qualityReport: QualityReport;
    bestUtilization: BestUtilizationDecision;
    batch: ProduceBatch;
  }> {
    return this.request('/ai/quality-grade', {
      method: 'POST',
      body: JSON.stringify({ batchId, image, crop, quantity })
    });
  }

  // Soil & Yield calculators
  static async calculateSoil(payload: any): Promise<{ success: boolean; result: any }> {
    return this.request('/ai/soil-calculator', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static async predictYield(crop: string, landArea: number, growthStage: string): Promise<{ success: boolean; prediction: any }> {
    return this.request('/ai/yield-prediction', {
      method: 'POST',
      body: JSON.stringify({ crop, landArea, growthStage })
    });
  }

  // Storage & Inventory
  static async getEcosystemState(): Promise<any> {
    return this.request('/ecosystem/state', undefined, 'ecosystem_state');
  }

  static async getInventory(): Promise<{ success: boolean; totalBatches: number; totalQuantityTons: number; batches: ProduceBatch[] }> {
    return this.request('/inventory', undefined, 'inventory');
  }

  static async getStorage(): Promise<{ success: boolean; storageRecords: StorageRecord[] }> {
    return this.request('/storage', undefined, 'storage');
  }

  static async allocateInventory(payload: {
    batchId: string;
    action: 'STORE' | 'PROCESS' | 'RELEASE_STORAGE';
    quantity: number;
    destination?: string;
  }): Promise<{ success: boolean; message: string; batch: ProduceBatch; storageRecords: StorageRecord[] }> {
    return this.request('/inventory/allocate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Marketplace & Matching
  static async getListings(): Promise<{ success: boolean; listings: MarketplaceListing[] }> {
    return this.request('/marketplace/listings', undefined, 'listings');
  }

  static async createListing(batchId: string, pricePerUnit?: number, minOrderQuantity?: number): Promise<{ success: boolean; listing: MarketplaceListing }> {
    return this.request('/marketplace/listings', {
      method: 'POST',
      body: JSON.stringify({ batchId, pricePerUnit, minOrderQuantity })
    });
  }

  static async getBuyerMatches(batchId: string): Promise<{ success: boolean; batchId: string; matches: BuyerMatch[] }> {
    return this.request(`/matching/${batchId}`);
  }

  // Orders
  static async getOrders(): Promise<{ success: boolean; orders: Order[] }> {
    return this.request('/orders', undefined, 'orders');
  }

  static async createOrder(payload: any): Promise<{ success: boolean; order: Order; batch: ProduceBatch }> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static async advanceOrderStatus(orderId: string): Promise<{ success: boolean; order: Order }> {
    return this.request(`/orders/${orderId}/advance-status`, { method: 'PUT' });
  }

  // Traceability
  static async getTraceability(batchId: string): Promise<{ success: boolean; batchId: string; batch?: ProduceBatch; timeline: TraceabilityStep[] }> {
    return this.request(`/traceability/${batchId}`, undefined, `trace_${batchId}`);
  }

  // Farmer Analytics & Value
  static async getFarmerAnalytics(): Promise<{ success: boolean; summary: any }> {
    return this.request('/analytics/farmer-value', undefined, 'analytics');
  }

  // Extras
  static async getWeather(): Promise<{ success: boolean; weather: any }> {
    return this.request('/extras/weather', undefined, 'weather');
  }

  static async getMarketPrices(): Promise<{ success: boolean; prices: any[] }> {
    return this.request('/extras/market-prices', undefined, 'prices');
  }

  static async getSchemes(): Promise<{ success: boolean; schemes: any[] }> {
    return this.request('/extras/schemes', undefined, 'schemes');
  }

  static async getEquipment(): Promise<{ success: boolean; equipment: any[] }> {
    return this.request('/extras/equipment', undefined, 'equipment');
  }

  static async getCommunity(): Promise<{ success: boolean; discussions: any[] }> {
    return this.request('/extras/community', undefined, 'community');
  }

  // --- ADMIN APIs ---
  static async getAdminDashboard(): Promise<{
    success: boolean;
    stats: AdminDashboardStats;
    recentAlerts: AdminAlert[];
    recentAudits: AuditLog[];
    systemHealth: ServiceHealth[];
  }> {
    return this.request('/admin/dashboard', { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async getAdminUsers(params?: { role?: string; status?: string; q?: string }): Promise<{
    success: boolean;
    count: number;
    users: ExtendedUser[];
  }> {
    const query = new URLSearchParams();
    if (params?.role) query.set('role', params.role);
    if (params?.status) query.set('status', params.status);
    if (params?.q) query.set('q', params.q);
    return this.request(`/admin/users?${query.toString()}`, { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async getAdminUserDetail(userId: string): Promise<{
    success: boolean;
    user: ExtendedUser;
    batches: ProduceBatch[];
    orders: Order[];
  }> {
    return this.request(`/admin/users/${userId}`, { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async updateAdminUserStatus(userId: string, status: string, reason?: string): Promise<{
    success: boolean;
    user: ExtendedUser;
    message: string;
  }> {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'x-user-role': 'ADMIN' },
      body: JSON.stringify({ status, reason })
    });
  }

  static async getAdminCrops(params?: { category?: string; active?: string; q?: string }): Promise<{
    success: boolean;
    count: number;
    crops: CropMasterData[];
  }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.active) query.set('active', params.active);
    if (params?.q) query.set('q', params.q);
    return this.request(`/admin/crops?${query.toString()}`, { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async addAdminCrop(cropData: Partial<CropMasterData>): Promise<{ success: boolean; crop: CropMasterData }> {
    return this.request('/admin/crops', {
      method: 'POST',
      headers: { 'x-user-role': 'ADMIN' },
      body: JSON.stringify(cropData)
    });
  }

  static async updateAdminCrop(id: string, cropData: Partial<CropMasterData>): Promise<{ success: boolean; crop: CropMasterData }> {
    return this.request(`/admin/crops/${id}`, {
      method: 'PATCH',
      headers: { 'x-user-role': 'ADMIN' },
      body: JSON.stringify(cropData)
    });
  }

  static async toggleAdminCrop(id: string): Promise<{ success: boolean; crop: CropMasterData; active: boolean }> {
    return this.request(`/admin/crops/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'x-user-role': 'ADMIN' }
    });
  }

  static async addAdminScheme(schemeData: {
    name: string;
    category: string;
    subsidy?: string;
    eligibility?: string;
    documents?: string[];
    deadline?: string;
    portalUrl?: string;
  }): Promise<{ success: boolean; scheme: any }> {
    return this.request('/admin/schemes', {
      method: 'POST',
      headers: { 'x-user-role': 'ADMIN' },
      body: JSON.stringify(schemeData)
    });
  }

  static async deleteAdminScheme(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/admin/schemes/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-role': 'ADMIN' }
    });
  }

  static async addAdminEquipment(equipmentData: {
    title: string;
    providerName: string;
    location?: string;
    dailyRate?: number;
    available?: boolean;
    specs?: string;
    imageUrl?: string;
  }): Promise<{ success: boolean; equipment: any }> {
    return this.request('/admin/equipment', {
      method: 'POST',
      headers: { 'x-user-role': 'ADMIN' },
      body: JSON.stringify(equipmentData)
    });
  }

  static async deleteAdminEquipment(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/admin/equipment/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-role': 'ADMIN' }
    });
  }

  static async getAdminProduce(params?: { grade?: string; status?: string; risk?: string; q?: string }): Promise<{
    success: boolean;
    count: number;
    batches: ProduceBatch[];
  }> {
    const query = new URLSearchParams();
    if (params?.grade) query.set('grade', params.grade);
    if (params?.status) query.set('status', params.status);
    if (params?.risk) query.set('risk', params.risk);
    if (params?.q) query.set('q', params.q);
    return this.request(`/admin/produce?${query.toString()}`, { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async getAdminBatchTraceability(batchId: string): Promise<{
    success: boolean;
    batch: ProduceBatch;
    timeline: TraceabilityStep[];
  }> {
    return this.request(`/admin/batches/${batchId}`, { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async getAdminOrders(params?: { status?: string; type?: string; q?: string }): Promise<{
    success: boolean;
    count: number;
    totalValue: number;
    orders: Order[];
  }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    if (params?.q) query.set('q', params.q);
    return this.request(`/admin/orders?${query.toString()}`, { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async getAdminTransactions(): Promise<{
    success: boolean;
    count: number;
    totalEscrow: number;
    transactions: any[];
  }> {
    return this.request('/admin/transactions', { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async moderateAdminListing(id: string, action: 'SUSPEND' | 'ACTIVATE', reason?: string): Promise<{
    success: boolean;
    listing: MarketplaceListing;
    message: string;
  }> {
    return this.request(`/admin/marketplace/listings/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'x-user-role': 'ADMIN' },
      body: JSON.stringify({ action, reason })
    });
  }

  static async getAdminAnalytics(period: string = '30D'): Promise<any> {
    return this.request(`/admin/analytics?period=${period}`, { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async getAdminAiMonitoring(): Promise<any> {
    return this.request('/admin/ai-monitoring', { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async getAdminStorageRisk(): Promise<any> {
    return this.request('/admin/storage-risk', { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async getAdminAlerts(params?: { severity?: string; unreadOnly?: boolean }): Promise<{
    success: boolean;
    count: number;
    unreadCount: number;
    alerts: AdminAlert[];
  }> {
    const query = new URLSearchParams();
    if (params?.severity) query.set('severity', params.severity);
    if (params?.unreadOnly) query.set('unreadOnly', 'true');
    return this.request(`/admin/alerts?${query.toString()}`, { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async markAdminAlertRead(id: string): Promise<{ success: boolean; alert?: AdminAlert }> {
    return this.request(`/admin/alerts/${id}/read`, {
      method: 'PATCH',
      headers: { 'x-user-role': 'ADMIN' }
    });
  }

  static async markAllAdminAlertsRead(): Promise<{ success: boolean; count: number }> {
    return this.request('/admin/alerts/mark-all-read', {
      method: 'POST',
      headers: { 'x-user-role': 'ADMIN' }
    });
  }

  static async getAdminAuditLogs(params?: { action?: string; q?: string }): Promise<{
    success: boolean;
    count: number;
    logs: AuditLog[];
  }> {
    const query = new URLSearchParams();
    if (params?.action) query.set('action', params.action);
    if (params?.q) query.set('q', params.q);
    return this.request(`/admin/audit-logs?${query.toString()}`, { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async getAdminSystemHealth(): Promise<any> {
    return this.request('/admin/system-health', { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async getAdminSettings(): Promise<{ success: boolean; settings: SystemSettings }> {
    return this.request('/admin/settings', { headers: { 'x-user-role': 'ADMIN' } });
  }

  static async updateAdminSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; settings: SystemSettings }> {
    return this.request('/admin/settings', {
      method: 'POST',
      headers: { 'x-user-role': 'ADMIN' },
      body: JSON.stringify(settings)
    });
  }
}
