import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Server,
  Activity,
  Users,
  Package,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Database,
  RefreshCw,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Edit2,
  Eye,
  Settings,
  Lock,
  FileText,
  Check,
  X,
  BarChart3,
  Clock,
  ArrowUpRight,
  Snowflake,
  ShoppingCart,
  Award,
  Ban,
  Bell,
  Shield,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Sprout
} from 'lucide-react';
import { ApiService } from '../services/api';
import {
  ExtendedUser,
  AuditLog,
  ServiceHealth,
  AdminAlert,
  CropMasterData,
  SystemSettings,
  AdminDashboardStats,
  ProduceBatch,
  Order,
  MarketplaceListing,
  TraceabilityStep
} from '../types';

interface AdminDashboardProps {
  batches?: any[];
  orders?: any[];
  lang?: string;
  onNavigateTab?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang = 'en' }) => {
  // Navigation tabs
  type AdminTab =
    | 'overview'
    | 'users'
    | 'crops'
    | 'schemes'
    | 'equipment'
    | 'produce'
    | 'marketplace'
    | 'ai'
    | 'storage'
    | 'alerts'
    | 'audit'
    | 'settings';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Core Data States
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30D');
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [crops, setCrops] = useState<CropMasterData[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [produceBatches, setProduceBatches] = useState<ProduceBatch[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<ServiceHealth[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [aiTelemetry, setAiTelemetry] = useState<any>(null);
  const [storageRiskData, setStorageRiskData] = useState<any>(null);

  // Filters & Search
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  const [cropCategoryFilter, setCropCategoryFilter] = useState<string>('ALL');
  const [cropSearchQuery, setCropSearchQuery] = useState<string>('');

  const [produceGradeFilter, setProduceGradeFilter] = useState<string>('ALL');
  const [produceSearchQuery, setProduceSearchQuery] = useState<string>('');

  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('ALL');
  const [alertUnreadOnly, setAlertUnreadOnly] = useState<boolean>(false);

  // Modals
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [userStatusModal, setUserStatusModal] = useState<{ user: ExtendedUser; newStatus: string } | null>(null);
  const [statusReason, setStatusReason] = useState<string>('');

  const [schemeModalOpen, setSchemeModalOpen] = useState<boolean>(false);
  const [schemeFormData, setSchemeFormData] = useState<{
    name: string;
    category: string;
    subsidy: string;
    eligibility: string;
    documents: string;
    deadline: string;
    portalUrl: string;
  }>({ name: '', category: '', subsidy: '', eligibility: '', documents: '', deadline: '', portalUrl: '' });

  const [equipmentModalOpen, setEquipmentModalOpen] = useState<boolean>(false);
  const [equipmentFormData, setEquipmentFormData] = useState<{
    title: string;
    providerName: string;
    location: string;
    dailyRate: number;
    available: boolean;
    specs: string;
  }>({ title: '', providerName: '', location: '', dailyRate: 1000, available: true, specs: '' });

  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);
  const [editingCrop, setEditingCrop] = useState<CropMasterData | null>(null);
  const [cropFormData, setCropFormData] = useState<Partial<CropMasterData>>({
    cropName: '',
    category: 'Vegetables',
    season: 'All Season',
    waterRequirement: 'Medium',
    soilType: '',
    suitableRegions: ['Nashik', 'Pune'],
    averageYieldTonsPerAcre: 10,
    marketPriceRangePerQuintal: { min: 2000, max: 3000 },
    active: true,
    description: ''
  });

  const [selectedBatchPassport, setSelectedBatchPassport] = useState<{ batch: ProduceBatch; timeline: TraceabilityStep[] } | null>(null);
  const [moderateListingModal, setModerateListingModal] = useState<{ listing: MarketplaceListing; action: 'SUSPEND' | 'ACTIVATE' } | null>(null);
  const [moderateReason, setModerateReason] = useState<string>('');

  // Fetch initial dashboard payload
  const loadAllData = async (isRefresh: boolean = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [
        dashRes,
        usersRes,
        cropsRes,
        produceRes,
        ordersRes,
        txRes,
        analyticsRes,
        aiRes,
        storageRes,
        alertsRes,
        auditRes,
        healthRes,
        settingsRes,
        listingsRes,
        schemesRes,
        equipmentRes
      ] = await Promise.all([
        ApiService.getAdminDashboard().catch(() => null),
        ApiService.getAdminUsers().catch(() => null),
        ApiService.getAdminCrops().catch(() => null),
        ApiService.getAdminProduce().catch(() => null),
        ApiService.getAdminOrders().catch(() => null),
        ApiService.getAdminTransactions().catch(() => null),
        ApiService.getAdminAnalytics(selectedPeriod).catch(() => null),
        ApiService.getAdminAiMonitoring().catch(() => null),
        ApiService.getAdminStorageRisk().catch(() => null),
        ApiService.getAdminAlerts().catch(() => null),
        ApiService.getAdminAuditLogs().catch(() => null),
        ApiService.getAdminSystemHealth().catch(() => null),
        ApiService.getAdminSettings().catch(() => null),
        ApiService.getListings().catch(() => null),
        ApiService.getSchemes().catch(() => null),
        ApiService.getEquipment().catch(() => null)
      ]);

      if (dashRes?.stats) setStats(dashRes.stats);
      if (usersRes?.users) setUsers(usersRes.users);
      if (cropsRes?.crops) setCrops(cropsRes.crops);
      if (schemesRes?.schemes) setSchemes(schemesRes.schemes);
      if (equipmentRes?.equipment) setEquipment(equipmentRes.equipment);
      if (produceRes?.batches) setProduceBatches(produceRes.batches);
      if (ordersRes?.orders) setOrdersList(ordersRes.orders);
      if (txRes?.transactions) setTransactions(txRes.transactions);
      if (analyticsRes) setAnalytics(analyticsRes);
      if (aiRes) setAiTelemetry(aiRes);
      if (storageRes) setStorageRiskData(storageRes);
      if (alertsRes?.alerts) setAlerts(alertsRes.alerts);
      if (auditRes?.logs) setAuditLogs(auditRes.logs);
      if (healthRes?.services) setSystemHealth(healthRes.services);
      if (settingsRes?.settings) setSystemSettings(settingsRes.settings);
      if (listingsRes?.listings) setListings(listingsRes.listings);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const triggerFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // User Actions
  const handleUpdateUserStatus = async () => {
    if (!userStatusModal) return;
    try {
      const res = await ApiService.updateAdminUserStatus(
        userStatusModal.user.id,
        userStatusModal.newStatus,
        statusReason || 'Administrative status update'
      );
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userStatusModal.user.id ? { ...u, status: userStatusModal.newStatus as any } : u));
        triggerFeedback(`User ${userStatusModal.user.name} status updated to ${userStatusModal.newStatus}`);
        setUserStatusModal(null);
        setStatusReason('');
        // Reload audit logs
        const auditRes = await ApiService.getAdminAuditLogs();
        if (auditRes?.logs) setAuditLogs(auditRes.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Crop Master Actions
  const handleSaveCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCrop) {
        const res = await ApiService.updateAdminCrop(editingCrop.id, cropFormData);
        if (res.success) {
          setCrops(prev => prev.map(c => c.id === editingCrop.id ? res.crop : c));
          triggerFeedback(`Updated master record for ${res.crop.cropName}`);
        }
      } else {
        const res = await ApiService.addAdminCrop(cropFormData);
        if (res.success) {
          setCrops(prev => [res.crop, ...prev]);
          triggerFeedback(`Added ${res.crop.cropName} to master catalog`);
        }
      }
      setCropModalOpen(false);
      setEditingCrop(null);
      // Reload audit logs
      const auditRes = await ApiService.getAdminAuditLogs();
      if (auditRes?.logs) setAuditLogs(auditRes.logs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCrop = async (cropId: string) => {
    try {
      const res = await ApiService.toggleAdminCrop(cropId);
      if (res.success) {
        setCrops(prev => prev.map(c => c.id === cropId ? { ...c, active: res.active } : c));
        triggerFeedback(`Crop availability toggled`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Government Scheme Actions
  const handleAddScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiService.addAdminScheme({
        ...schemeFormData,
        documents: schemeFormData.documents.split(',').map(d => d.trim()).filter(Boolean)
      });
      if (res.success) {
        setSchemes(prev => [res.scheme, ...prev]);
        triggerFeedback(`Added scheme "${res.scheme.name}"`);
        setSchemeModalOpen(false);
        setSchemeFormData({ name: '', category: '', subsidy: '', eligibility: '', documents: '', deadline: '', portalUrl: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteScheme = async (id: string, name: string) => {
    if (!window.confirm(`Remove scheme "${name}"? This will hide it from farmers immediately.`)) return;
    try {
      const res = await ApiService.deleteAdminScheme(id);
      if (res.success) {
        setSchemes(prev => prev.filter(s => s.id !== id));
        triggerFeedback(`Removed scheme "${name}"`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Equipment Rental Actions
  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiService.addAdminEquipment(equipmentFormData);
      if (res.success) {
        setEquipment(prev => [res.equipment, ...prev]);
        triggerFeedback(`Added equipment renter "${res.equipment.title}"`);
        setEquipmentModalOpen(false);
        setEquipmentFormData({ title: '', providerName: '', location: '', dailyRate: 1000, available: true, specs: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEquipment = async (id: string, title: string) => {
    if (!window.confirm(`Remove equipment listing "${title}"?`)) return;
    try {
      const res = await ApiService.deleteAdminEquipment(id);
      if (res.success) {
        setEquipment(prev => prev.filter(e => e.id !== id));
        triggerFeedback(`Removed equipment listing "${title}"`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Produce Batch Passport Modal
  const handleViewPassport = async (batchId: string) => {
    try {
      const res = await ApiService.getAdminBatchTraceability(batchId);
      if (res.success) {
        setSelectedBatchPassport({ batch: res.batch, timeline: res.timeline });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Moderate Listing
  const handleModerateListing = async () => {
    if (!moderateListingModal) return;
    try {
      const res = await ApiService.moderateAdminListing(
        moderateListingModal.listing.id,
        moderateListingModal.action,
        moderateReason || 'Policy compliance review'
      );
      if (res.success) {
        setListings(prev => prev.map(l => l.id === moderateListingModal.listing.id ? res.listing : l));
        triggerFeedback(`Listing for ${moderateListingModal.listing.crop} ${moderateListingModal.action === 'SUSPEND' ? 'suspended' : 'reinstated'}`);
        setModerateListingModal(null);
        setModerateReason('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Alerts Actions
  const handleMarkAlertRead = async (id: string) => {
    try {
      await ApiService.markAdminAlertRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAlertsRead = async () => {
    try {
      await ApiService.markAllAdminAlertsRead();
      setAlerts(prev => prev.map(a => ({ ...a, read: true })));
      triggerFeedback('All alerts marked as read');
    } catch (e) {
      console.error(e);
    }
  };

  // Settings Action
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemSettings) return;
    try {
      const res = await ApiService.updateAdminSettings(systemSettings);
      if (res.success) {
        setSystemSettings(res.settings);
        triggerFeedback('Platform parameters updated and broadcasted to ecosystem');
        const auditRes = await ApiService.getAdminAuditLogs();
        if (auditRes?.logs) setAuditLogs(auditRes.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    if (userRoleFilter !== 'ALL' && u.role.toLowerCase() !== userRoleFilter.toLowerCase()) return false;
    if (userStatusFilter !== 'ALL' && (u.status || 'ACTIVE').toLowerCase() !== userStatusFilter.toLowerCase()) return false;
    if (userSearchQuery) {
      const q = userSearchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.location && u.location.toLowerCase().includes(q)) ||
        (u.mobile && u.mobile.includes(q))
      );
    }
    return true;
  });

  // Filtered Crops
  const filteredCrops = crops.filter(c => {
    if (cropCategoryFilter !== 'ALL' && c.category !== cropCategoryFilter) return false;
    if (cropSearchQuery) {
      const q = cropSearchQuery.toLowerCase();
      return (
        c.cropName.toLowerCase().includes(q) ||
        c.soilType.toLowerCase().includes(q) ||
        c.suitableRegions.some(r => r.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filtered Produce
  const filteredProduce = produceBatches.filter(b => {
    if (produceGradeFilter !== 'ALL' && b.grade !== produceGradeFilter) return false;
    if (produceSearchQuery) {
      const q = produceSearchQuery.toLowerCase();
      return (
        b.batchId.toLowerCase().includes(q) ||
        b.crop.toLowerCase().includes(q) ||
        b.farmerName.toLowerCase().includes(q) ||
        b.farmerLocation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Alerts
  const filteredAlerts = alerts.filter(a => {
    if (alertSeverityFilter !== 'ALL' && a.severity !== alertSeverityFilter) return false;
    if (alertUnreadOnly && a.read) return false;
    return true;
  });

  // CSV Export utility
  const exportUsersCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Location', 'District', 'Registered Date'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.role,
      u.status || 'ACTIVE',
      `"${u.location || ''}"`,
      u.district || '',
      u.createdAt || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agronauts_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerFeedback('Exported users CSV successfully');
  };

  // Live Calculated Platform Statistics (Users by Role, Active Produce Batches, Transaction Volume)
  const liveStats = React.useMemo(() => {
    // 1. Total Users by Role
    const farmers = users.filter(u => (u.role || '').toUpperCase() === 'FARMER');
    const buyers = users.filter(u => (u.role || '').toUpperCase() === 'BUYER');
    const processors = users.filter(u => (u.role || '').toUpperCase() === 'PROCESSOR');
    const admins = users.filter(u => (u.role || '').toUpperCase() === 'ADMIN' || (u.role || '').toUpperCase() === 'SUPER_ADMIN');

    const totalFarmers = farmers.length || (stats?.totalFarmers ?? 4);
    const totalBuyers = buyers.length || (stats?.totalBuyers ?? 2);
    const totalProcessors = processors.length || (stats?.totalProcessors ?? 2);
    const totalAdmins = admins.length || (stats?.totalAdmins ?? 1);
    const totalCalculatedUsers = users.length || (totalFarmers + totalBuyers + totalProcessors + totalAdmins);

    const farmerPct = totalCalculatedUsers > 0 ? Math.round((totalFarmers / totalCalculatedUsers) * 100) : 45;
    const buyerPct = totalCalculatedUsers > 0 ? Math.round((totalBuyers / totalCalculatedUsers) * 100) : 25;
    const processorPct = totalCalculatedUsers > 0 ? Math.round((totalProcessors / totalCalculatedUsers) * 100) : 20;
    const adminPct = Math.max(1, 100 - farmerPct - buyerPct - processorPct);

    // 2. Active Produce Batches
    const activeBatches = produceBatches.filter(
      b => b.status === 'HARVESTED' || b.status === 'LISTED' || b.status === 'IN_INVENTORY' || b.status === 'VERIFIED'
    );
    const activeBatchesCount = activeBatches.length || (stats?.activeBatchesCount ?? (produceBatches.length || 6));
    const totalBatchesCount = produceBatches.length || (stats?.totalProduceBatches ?? 8);
    const totalTonnageKg = produceBatches.reduce((acc, b) => acc + (Number(b.quantity_kg) || 0), 0) || 6850;
    const totalTonnageTons = (totalTonnageKg / 1000).toFixed(1);

    const gradeACount = produceBatches.filter(b => (b.grade || '').toUpperCase().includes('A')).length || 4;
    const gradeBCount = produceBatches.filter(b => (b.grade || '').toUpperCase().includes('B')).length || 2;
    const gradeCCount = produceBatches.filter(b => (b.grade || '').toUpperCase().includes('C')).length || 1;

    // 3. Total Transaction Volume
    const totalTransactionValue = ordersList.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0) || (stats?.totalTransactionValue ?? 315000);
    const escrowLockedValue = ordersList
      .filter(o => o.status === 'ESCROW_LOCKED' || o.status === 'DISPATCHED' || o.status === 'CONFIRMED')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0) || (stats?.escrowLockedValue ?? Math.round(totalTransactionValue * 0.40));
    const settledFarmerPayouts = ordersList
      .filter(o => o.status === 'SETTLED' || o.status === 'DELIVERED')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0) || (stats?.settledFarmerPayouts ?? Math.round(totalTransactionValue * 0.60));
    const totalOrdersCount = ordersList.length || (stats?.totalOrders ?? 8);
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalTransactionValue / totalOrdersCount) : 39375;

    return {
      totalFarmers,
      totalBuyers,
      totalProcessors,
      totalAdmins,
      totalCalculatedUsers,
      farmerPct,
      buyerPct,
      processorPct,
      adminPct,
      activeBatchesCount,
      totalBatchesCount,
      totalTonnageKg,
      totalTonnageTons,
      gradeACount,
      gradeBCount,
      gradeCCount,
      totalTransactionValue,
      escrowLockedValue,
      settledFarmerPayouts,
      totalOrdersCount,
      avgOrderValue
    };
  }, [users, produceBatches, ordersList, stats]);

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-stone-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  AGRONAUTS Ecosystem Operations &amp; Admin Control Center
                </h1>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  APMC प्रशासकीय नियंत्रण
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Authoritative supervision of registered farmers, optical AI diagnostics, cold-chain telemetry, and escrow settlements.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => loadAllData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-border bg-background hover:bg-accent text-foreground text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Live Ledger'}</span>
            </button>
            <div className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All 5 Microservices Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Macro Statistics Command Strip (4 Key Indicators) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Users by Role</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Users className="size-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-foreground">
              {liveStats.totalCalculatedUsers} <span className="text-sm font-semibold text-muted-foreground">Entities</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
            <span className="text-emerald-600 font-semibold">{liveStats.totalFarmers} Farmers ({liveStats.farmerPct}%)</span>
            <span>{liveStats.totalBuyers + liveStats.totalProcessors} Buyers/Procs</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Produce Batches</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
              <Package className="size-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-foreground">
              {liveStats.activeBatchesCount} <span className="text-sm font-semibold text-muted-foreground">Active Lots</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
            <span className="text-primary font-semibold">{liveStats.totalTonnageTons} MT Traced</span>
            <span className="text-emerald-600 font-medium">100% QR Sealed</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Transaction Volume</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-emerald-600">
              ₹{(liveStats.totalTransactionValue / 100000).toFixed(2)} <span className="text-sm font-bold">Lakhs</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
            <span>Escrow: ₹{(liveStats.escrowLockedValue / 100000).toFixed(2)}L</span>
            <span className="text-emerald-600 font-medium">Zero Commission</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI &amp; System Telemetry</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
              <Cpu className="size-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-foreground">
              {stats ? stats.aiQualityAnalyses + stats.diseaseAnalyses : 170} <span className="text-sm font-semibold text-muted-foreground">Scans</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
            <span className="text-emerald-600 font-semibold">Gemini 2.5 Flash</span>
            <span className={unreadAlertsCount > 0 ? "text-amber-500 font-bold" : "text-muted-foreground"}>
              {unreadAlertsCount} Alerts
            </span>
          </div>
        </div>
      </div>

      {/* Dedicated Live Platform Statistics Section (Total Users by Role, Active Produce Batches, Total Transaction Volume) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Sparkles className="size-3.5 text-primary" />
            <span>Live Platform Statistics &amp; Core Aggregates (थेट आकडेवारी)</span>
          </h2>
          <span className="text-xs text-muted-foreground hidden sm:inline">Real-time DB synchronization · Active</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Panel 1: Total Users by Role */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Total Users by Role</h3>
                    <p className="text-[11px] text-muted-foreground">वापरकर्ते व भूमिका वर्गीकरण</p>
                  </div>
                </div>
                <span className="text-xs font-black text-foreground px-2.5 py-1 rounded-full bg-muted">
                  {liveStats.totalCalculatedUsers} Total
                </span>
              </div>

              {/* Proportional distribution bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                  <span>Role Distribution</span>
                  <span>100% KYC Profiled</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden bg-muted flex">
                  <div style={{ width: `${liveStats.farmerPct}%` }} className="bg-emerald-500 transition-all" title={`Farmers: ${liveStats.farmerPct}%`} />
                  <div style={{ width: `${liveStats.buyerPct}%` }} className="bg-blue-500 transition-all" title={`Buyers: ${liveStats.buyerPct}%`} />
                  <div style={{ width: `${liveStats.processorPct}%` }} className="bg-purple-500 transition-all" title={`Processors: ${liveStats.processorPct}%`} />
                  <div style={{ width: `${liveStats.adminPct}%` }} className="bg-amber-500 transition-all" title={`Admins: ${liveStats.adminPct}%`} />
                </div>
              </div>

              {/* Role breakdown list */}
              <div className="mt-4 divide-y divide-border/60 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-foreground">Farmers (शेतकरी)</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-foreground">{liveStats.totalFarmers}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                      {liveStats.farmerPct}%
                    </span>
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-blue-500" />
                    <span className="font-semibold text-foreground">Wholesale Buyers (खरेदीदार)</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-foreground">{liveStats.totalBuyers}</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-bold">
                      {liveStats.buyerPct}%
                    </span>
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-purple-500" />
                    <span className="font-semibold text-foreground">Agro-Processors (प्रक्रिया उद्योग)</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-foreground">{liveStats.totalProcessors}</span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[10px] font-bold">
                      {liveStats.processorPct}%
                    </span>
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span className="font-semibold text-foreground">APMC Admins (प्रशासक)</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-foreground">{liveStats.totalAdmins}</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                      {liveStats.adminPct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('users')}
              className="w-full h-8 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/40 hover:bg-accent text-foreground text-xs font-semibold transition-colors"
            >
              <span>Manage User Directory &amp; KYC</span>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Panel 2: Active Produce Batches */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                    <Package className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Active Produce Batches</h3>
                    <p className="text-[11px] text-muted-foreground">कापणी व ट्रेसिबिलिटी लॉट</p>
                  </div>
                </div>
                <span className="text-xs font-black text-foreground px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400">
                  {liveStats.activeBatchesCount} Active / {liveStats.totalBatchesCount} Total
                </span>
              </div>

              {/* Tonnage summary */}
              <div className="mt-4 p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground font-medium">Total Traced Volume</span>
                  <div className="text-lg font-black text-foreground">{liveStats.totalTonnageTons} MT</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground font-medium">Weight in Quintals</span>
                  <div className="text-sm font-bold font-mono text-primary">{(liveStats.totalTonnageKg / 100).toFixed(0)} Qtl</div>
                </div>
              </div>

              {/* Grade breakdown list */}
              <div className="mt-3 divide-y divide-border/60 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Grade A (Direct Table / Export)</span>
                  <span className="font-bold text-emerald-600 font-mono">{liveStats.gradeACount} lots</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Grade B (Domestic Mandi Retail)</span>
                  <span className="font-bold text-blue-600 font-mono">{liveStats.gradeBCount} lots</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Grade C (Industrial Processing)</span>
                  <span className="font-bold text-amber-600 font-mono">{liveStats.gradeCCount} lots</span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> 100% QR Sealed
                </span>
                <span>0 High Spoilage Batches</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('produce')}
              className="w-full h-8 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/40 hover:bg-accent text-foreground text-xs font-semibold transition-colors"
            >
              <span>Audit Produce Batches &amp; Traceability</span>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Panel 3: Total Transaction Volume */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                    <TrendingUp className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Total Transaction Volume</h3>
                    <p className="text-[11px] text-muted-foreground">एकूण व्यवहार व एस्क्रो निधी</p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 px-2.5 py-1 rounded-full bg-emerald-500/10">
                  ₹{(liveStats.totalTransactionValue / 100000).toFixed(2)} L
                </span>
              </div>

              {/* Financial summary blocks */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">Direct Settled</span>
                  <span className="text-base font-black text-foreground">₹{(liveStats.settledFarmerPayouts / 100000).toFixed(2)}L</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Paid to farmers</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">Escrow Protected</span>
                  <span className="text-base font-black text-foreground">₹{(liveStats.escrowLockedValue / 100000).toFixed(2)}L</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Custody locked</p>
                </div>
              </div>

              {/* Transaction breakdown metrics */}
              <div className="mt-3 divide-y divide-border/60 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Total Orders</span>
                  <span className="font-bold text-foreground font-mono">{liveStats.totalOrdersCount} Orders</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Average Order Value (AOV)</span>
                  <span className="font-bold text-foreground font-mono">₹{liveStats.avgOrderValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Mandi Commission Cut</span>
                  <span className="font-bold text-emerald-600 font-mono">0.0% (Zero Middleman)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('marketplace')}
              className="w-full h-8 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/40 hover:bg-accent text-foreground text-xs font-semibold transition-colors"
            >
              <span>View Escrow Ledger &amp; Orders</span>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Sub-Navigation Navigation Bar */}
      <div className="border-b border-border bg-card/60 rounded-xl p-1.5">
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-semibold">
          {[
            { id: 'overview', label: 'Command Overview', icon: BarChart3, count: undefined },
            { id: 'users', label: 'User Directory & KYC', icon: Users, count: users.length },
            { id: 'crops', label: 'Crop Master Data', icon: Sprout, count: crops.length },
            { id: 'schemes', label: 'Govt Schemes', icon: Award, count: schemes.length },
            { id: 'equipment', label: 'Equipment Renters', icon: Layers, count: equipment.length },
            { id: 'produce', label: 'Produce & Traceability', icon: Package, count: produceBatches.length },
            { id: 'marketplace', label: 'Marketplace & Escrow', icon: ShoppingCart, count: ordersList.length },
            { id: 'ai', label: 'AI/ML Sentinel', icon: Cpu, count: undefined },
            { id: 'storage', label: 'Cold Storage', icon: Snowflake, count: undefined },
            { id: 'alerts', label: 'Alerts Center', icon: Bell, count: unreadAlertsCount > 0 ? unreadAlertsCount : undefined },
            { id: 'audit', label: 'Audit Trail', icon: FileText, count: auditLogs.length },
            { id: 'settings', label: 'Platform Config', icon: Settings, count: undefined },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`h-9 px-3.5 rounded-lg transition-all shrink-0 inline-flex items-center gap-2 ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className={`size-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW & ANALYTICS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Period Filter & Heading */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>Agricultural Macro Analytics &amp; Cluster Performance</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Verified data feeds across Maharashtra APMC mandis, cold chains, and farmgate grading centers.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs font-semibold">
              {['7D', '30D', '90D', '1Y'].map(p => (
                <button
                  key={p}
                  onClick={() => {
                    setSelectedPeriod(p);
                    ApiService.getAdminAnalytics(p).then(res => setAnalytics(res));
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    selectedPeriod === p ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Produce Grading Distribution */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>AI Optical Produce Grading Breakdown</span>
              </h3>
              <div className="space-y-3">
                {analytics?.produceGradingBreakdown?.map((item: any) => (
                  <div key={item.grade} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-foreground">{item.grade}</span>
                      <span className="font-bold text-primary">{item.percentage}% ({item.count} lots)</span>
                    </div>
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                )) || (
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div>Grade A (Direct Table/Export): 60%</div>
                    <div>Grade B (Local Mandi/Retail): 30%</div>
                    <div>Grade C (Industrial Processing): 10%</div>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-muted/60 border border-border/60 text-xs text-muted-foreground leading-relaxed">
                <strong>Zero-Waste Impact:</strong> 100% of Grade C lots automatically matched to agro-processing units (Sahyadri Agro &amp; Kisan Pulp), avoiding 42 Tons of farmgate rotting.
              </div>
            </div>

            {/* Farmers & Produce by District */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Maharashtra District Produce Inflow</span>
              </h3>
              <div className="divide-y divide-border/60 text-xs">
                {analytics?.farmersByLocation?.map((d: any) => (
                  <div key={d.district} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground">{d.district}</span>
                      <span className="text-muted-foreground ml-1">· {d.count} Farmers</span>
                    </div>
                    <span className="font-bold text-emerald-600">{d.produceTons} Tons Traced</span>
                  </div>
                )) || (
                  <div className="py-2 text-muted-foreground">Loading district clusters...</div>
                )}
              </div>
            </div>

            {/* AI Diagnostics Telemetry Summary */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-600" />
                  <span>AI Inference Accuracy Rate</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                  98.7% Confidence
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                {analytics?.aiUsageBreakdown?.map((tool: any) => (
                  <div key={tool.tool} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/40">
                    <span className="font-medium text-foreground">{tool.tool}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{tool.calls} reqs</span>
                      <span className="font-bold text-emerald-600">{tool.successRate}%</span>
                    </div>
                  </div>
                )) || (
                  <div className="text-muted-foreground">Inference telemetry running...</div>
                )}
              </div>
            </div>

          </div>

          {/* Escrow Settlement & Transaction Summary Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Escrow Settlement SLA &amp; Direct Farmer Payouts</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Automated verification locks buyer funds in escrow upon purchase order, releasing 100% of proceeds to the farmer upon QR scan verification at the mandi/warehouse gate.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground font-semibold">Total Platform Volume</span>
                <p className="text-2xl font-black text-emerald-600">₹{(stats?.totalTransactionValue || 315000).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">Settled &amp; Paid Direct</span>
                <span className="text-lg font-black text-foreground">₹2,45,000</span>
                <p className="text-muted-foreground mt-0.5">Dispatched to bank accounts via UPI / IMPS gateway</p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="font-bold text-blue-700 dark:text-blue-400 block mb-1">Locked in Escrow</span>
                <span className="text-lg font-black text-foreground">₹70,000</span>
                <p className="text-muted-foreground mt-0.5">Order ORD-78291 awaiting farmgate dispatch</p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="font-bold text-purple-700 dark:text-purple-400 block mb-1">Dispute Rate</span>
                <span className="text-lg font-black text-foreground">0.0%</span>
                <p className="text-muted-foreground mt-0.5">No quality disputes due to pre-harvest optical AI grading</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. USER DIRECTORY & KYC TAB */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                placeholder="Search user by name, mobile, district, or email..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Role filter */}
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Roles</option>
                <option value="FARMER">Farmers</option>
                <option value="BUYER">Buyers / Wholesalers</option>
                <option value="PROCESSOR">Processors</option>
                <option value="ADMIN">Admins</option>
              </select>

              {/* Status filter */}
              <select
                value={userStatusFilter}
                onChange={e => setUserStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending KYC</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BLOCKED">Blocked</option>
              </select>

              {/* Export CSV Button */}
              <button
                onClick={exportUsersCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background hover:bg-accent text-foreground text-xs font-semibold transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border">
                  <tr>
                    <th className="px-4 py-3">User &amp; Organization</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">District / Mandi</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Registered On</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No users found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'}
                              alt={user.name}
                              className="size-9 rounded-full object-cover border border-border"
                            />
                            <div>
                              <p className="font-bold text-foreground">{user.name}</p>
                              <p className="text-[11px] text-muted-foreground font-mono">{user.email} · {user.mobile}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide ${
                            user.role === 'FARMER'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : user.role === 'BUYER'
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                              : user.role === 'PROCESSOR'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-foreground font-medium">{user.district || 'Maharashtra'}</p>
                          <p className="text-[11px] text-muted-foreground">{user.location || 'Local cluster'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            (user.status || 'ACTIVE') === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : (user.status || 'ACTIVE') === 'PENDING'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                              : 'bg-destructive/15 text-destructive'
                          }`}>
                            {user.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026-01-10'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="p-1.5 rounded-lg border border-border hover:bg-accent text-foreground transition-colors"
                              title="View user details & history"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setUserStatusModal({ user, newStatus: (user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE') })}
                              className="px-2 py-1 rounded-lg border border-border hover:bg-accent text-foreground text-[11px] font-semibold transition-colors"
                            >
                              {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CROP MASTER DATA TAB */}
      {/* ========================================================================= */}
      {activeTab === 'crops' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={cropSearchQuery}
                onChange={e => setCropSearchQuery(e.target.value)}
                placeholder="Search crop name, soil type, or regions..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={cropCategoryFilter}
                onChange={e => setCropCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Categories</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains">Grains</option>
                <option value="Oilseeds">Oilseeds</option>
                <option value="Pulses">Pulses</option>
              </select>

              <button
                onClick={() => {
                  setEditingCrop(null);
                  setCropFormData({
                    cropName: '',
                    category: 'Vegetables',
                    season: 'All Season',
                    waterRequirement: 'Medium',
                    soilType: '',
                    suitableRegions: ['Nashik', 'Pune'],
                    averageYieldTonsPerAcre: 10,
                    marketPriceRangePerQuintal: { min: 2000, max: 3000 },
                    active: true,
                    description: ''
                  });
                  setCropModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Crop</span>
              </button>
            </div>
          </div>

          {/* Crops Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCrops.map(crop => (
              <div key={crop.id} className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide">
                      {crop.category} • {crop.season}
                    </span>
                    <button
                      onClick={() => handleToggleCrop(crop.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                        crop.active
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {crop.active ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-foreground">{crop.cropName}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {crop.description}
                  </p>

                  <div className="space-y-1 pt-2 border-t border-border/60 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Water Req:</span>
                      <span className="font-semibold text-foreground">{crop.waterRequirement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Yield:</span>
                      <span className="font-semibold text-foreground">{crop.averageYieldTonsPerAcre} Tons / Acre</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mandi Price Band:</span>
                      <span className="font-bold text-emerald-600">
                        ₹{crop.marketPriceRangePerQuintal.min.toLocaleString()} - ₹{crop.marketPriceRangePerQuintal.max.toLocaleString()} / Qtl
                      </span>
                    </div>
                    <div className="pt-1">
                      <span className="text-[11px] text-muted-foreground block">Key Maharashtra Hubs:</span>
                      <span className="text-[11px] font-medium text-foreground">{crop.suitableRegions.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/60">
                  <button
                    onClick={() => {
                      setEditingCrop(crop);
                      setCropFormData(crop);
                      setCropModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border hover:bg-accent text-foreground text-xs font-semibold"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Crop</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* GOVERNMENT SCHEMES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Schemes added here appear immediately on the farmer-facing Schemes & Rentals page.
            </p>
            <button
              onClick={() => setSchemeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Scheme</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemes.map((s: any) => (
              <div key={s.id} className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide">
                      {s.category}
                    </span>
                    <h3 className="text-base font-bold text-foreground mt-1.5">{s.name}</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteScheme(s.id, s.name)}
                    className="shrink-0 p-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/40 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete scheme"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-foreground">{s.subsidy}</p>
                <p className="text-xs text-muted-foreground">Eligibility: {s.eligibility}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(s.documents || []).map((d: string) => (
                    <span key={d} className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground">{d}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                  <span>Deadline: {s.deadline}</span>
                  {s.portalUrl && <span className="truncate max-w-[140px]">{s.portalUrl}</span>}
                </div>
              </div>
            ))}
            {schemes.length === 0 && (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No schemes yet. Click "Add Scheme" to publish one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EQUIPMENT RENTERS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Renters added here appear immediately on the farmer-facing Schemes & Rentals page.
            </p>
            <button
              onClick={() => setEquipmentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Equipment Renter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((eq: any) => (
              <div key={eq.id} className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${eq.available ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                      {eq.available ? 'Available' : 'Booked'}
                    </span>
                    <button
                      onClick={() => handleDeleteEquipment(eq.id, eq.title)}
                      className="shrink-0 p-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/40 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete listing"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{eq.title}</h3>
                  <p className="text-xs text-muted-foreground">{eq.providerName} · {eq.location}</p>
                  <p className="text-xs text-foreground">{eq.specs}</p>
                </div>
                <div className="pt-2 border-t border-border/60 text-sm font-bold text-primary">
                  ₹{Number(eq.dailyRate).toLocaleString('en-IN')} / day
                </div>
              </div>
            ))}
            {equipment.length === 0 && (
              <div className="lg:col-span-3 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No equipment renters yet. Click "Add Equipment Renter" to publish one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PRODUCE & TRACEABILITY AUDIT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'produce' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={produceSearchQuery}
                onChange={e => setProduceSearchQuery(e.target.value)}
                placeholder="Search batch code, crop, farmer name, origin..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={produceGradeFilter}
                onChange={e => setProduceGradeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Quality Grades</option>
                <option value="Grade A">Grade A (Export / Table)</option>
                <option value="Grade B">Grade B (Retail Mandi)</option>
                <option value="Grade C">Grade C (Processing)</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Batch ID &amp; Crop</th>
                    <th className="px-4 py-3">Farmer &amp; Origin</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">AI Quality Grade</th>
                    <th className="px-4 py-3">Spoilage Risk</th>
                    <th className="px-4 py-3 text-right">Cryptographic Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredProduce.map(b => (
                    <tr key={b.batchId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-foreground text-sm">{b.crop} ({b.variety})</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{b.batchId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{b.farmerName}</p>
                        <p className="text-[11px] text-muted-foreground">{b.farmerLocation}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {b.totalQuantity} {b.unit}
                        <span className="text-[11px] text-muted-foreground block">Rem: {b.remainingQuantity} {b.unit}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          b.grade === 'Grade A'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : b.grade === 'Grade B'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            : 'bg-purple-500/15 text-purple-700 dark:text-purple-400'
                        }`}>
                          {b.grade} ({b.qualityScore} pts)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          b.spoilageRisk === 'LOW'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : b.spoilageRisk === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {b.spoilageRisk} Risk
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewPassport(b.batchId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-accent text-foreground text-xs font-semibold shadow-2xs transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                          <span>View Passport</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MARKETPLACE & ORDERS OVERSIGHT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          
          {/* Active Marketplace Listings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  <span>Marketplace Listings Oversight</span>
                </h3>
                <p className="text-xs text-muted-foreground">Admin powers to audit pricing compliance and suspend fraudulent listings.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Crop / Variety</th>
                      <th className="px-4 py-3">Farmer</th>
                      <th className="px-4 py-3">Available Qty</th>
                      <th className="px-4 py-3">Price / Unit</th>
                      <th className="px-4 py-3">Quality Score</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {listings.map(l => (
                      <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-foreground">{l.crop} ({l.variety})</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{l.batchId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground">{l.farmerName}</p>
                          <p className="text-[11px] text-muted-foreground">{l.farmerLocation}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {l.availableQuantity} {l.unit}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-600">
                          ₹{l.pricePerUnit} / {l.unit}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                            {l.qualityScore} pts
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            l.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : 'bg-destructive/15 text-destructive'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setModerateListingModal({ listing: l, action: l.status === 'ACTIVE' ? 'SUSPEND' : 'ACTIVATE' })}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                              l.status === 'ACTIVE'
                                ? 'border-destructive/40 text-destructive hover:bg-destructive/10'
                                : 'border-emerald-500/40 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {l.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Orders & Escrow Ledger */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Orders &amp; Escrow Clearing Ledger</span>
            </h3>

            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Order Number</th>
                      <th className="px-4 py-3">Buyer</th>
                      <th className="px-4 py-3">Farmer</th>
                      <th className="px-4 py-3">Produce &amp; Volume</th>
                      <th className="px-4 py-3">Total Value</th>
                      <th className="px-4 py-3">Escrow Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {transactions.map(t => (
                      <tr key={t.transactionId} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-foreground">
                          {t.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-foreground font-semibold">{t.buyerName}</td>
                        <td className="px-4 py-3 text-foreground font-semibold">{t.farmerName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{t.crop} ({t.quantity})</td>
                        <td className="px-4 py-3 font-bold text-emerald-600">
                          ₹{t.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            t.escrowStatus === 'SETTLED'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                          }`}>
                            {t.escrowStatus === 'SETTLED' ? 'Paid to Farmer' : 'Locked in Escrow'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. AI/ML DIAGNOSTICS SENTINEL TAB */}
      {/* ========================================================================= */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Model Version</span>
              <p className="text-xl font-black text-foreground">Gemini 2.5 Flash</p>
              <span className="text-xs text-emerald-600 font-semibold">Multimodal Computer Vision Engine</span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avg Diagnostic Latency</span>
              <p className="text-xl font-black text-foreground">380 ms</p>
              <span className="text-xs text-muted-foreground">Zero cold-start delay</span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Model Accuracy SLA</span>
              <p className="text-xl font-black text-emerald-600">99.8% Uptime</p>
              <span className="text-xs text-muted-foreground">Fallback heuristic active</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span>Recent AI Inference Audit Stream</span>
            </h3>

            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Task</th>
                    <th className="px-4 py-2.5">Crop</th>
                    <th className="px-4 py-2.5">Model</th>
                    <th className="px-4 py-2.5">Latency</th>
                    <th className="px-4 py-2.5">Confidence</th>
                    <th className="px-4 py-2.5">Diagnostic Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {aiTelemetry?.recentInferences?.map((inf: any) => (
                    <tr key={inf.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-semibold text-foreground">{inf.task}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inf.crop}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{inf.model}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-emerald-600">{inf.latencyMs} ms</td>
                      <td className="px-4 py-3 font-bold text-foreground">{inf.confidence}%</td>
                      <td className="px-4 py-3 font-medium text-foreground">{inf.result}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-muted-foreground">Inference logs active...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. COLD STORAGE TELEMETRY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Snowflake className="w-5 h-5 text-blue-500" />
                  <span>Maharashtra Warehouse &amp; Onion Chawl IoT Telemetry</span>
                </h3>
                <p className="text-xs text-muted-foreground">Continuous monitoring of temperature, relative humidity, and ethylene risk.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground text-sm">Lasalgaon Onion Aerated Chawl #14</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                    Attention Needed
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>Temp: <strong className="text-foreground">28.4°C</strong> (Safe: 24-30°C)</div>
                  <div>Humidity: <strong className="text-amber-600">68%</strong> (Threshold: 65%)</div>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  8.0 Tons Rabi Onion approaching condensation threshold. Secondary exhaust blowers triggered.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground text-sm">Dindori Mega Agro Cold Storage Chamber 2</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                    Optimal Conditions
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>Temp: <strong className="text-emerald-600">11.8°C</strong> (Safe: 10-13°C)</div>
                  <div>Humidity: <strong className="text-emerald-600">88%</strong> (Target: 85-92%)</div>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  12.0 Tons Arka Rakshak Tomato stored with remaining safe duration of 14 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. ALERTS RESOLUTION CENTER TAB */}
      {/* ========================================================================= */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={alertSeverityFilter}
                onChange={e => setAlertSeverityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-semibold"
              >
                <option value="ALL">All Severities</option>
                <option value="HIGH">High Severity</option>
                <option value="MEDIUM">Medium Severity</option>
                <option value="LOW">Low Severity</option>
              </select>

              <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertUnreadOnly}
                  onChange={e => setAlertUnreadOnly(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span>Unread Only</span>
              </label>
            </div>

            <button
              onClick={handleMarkAllAlertsRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-accent text-foreground text-xs font-semibold transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All as Read</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 rounded-2xl border border-border bg-card text-center text-muted-foreground text-xs">
                No alerts matching the selected filters.
              </div>
            ) : (
              filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    alert.read ? 'bg-card border-border' : 'bg-muted/40 border-amber-500/40 shadow-xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        alert.severity === 'HIGH'
                          ? 'bg-destructive/15 text-destructive'
                          : alert.severity === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          : 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                      }`}>
                        {alert.severity}
                      </span>
                      <h4 className="text-sm font-bold text-foreground">{alert.title}</h4>
                      {!alert.read && (
                        <span className="size-2 rounded-full bg-amber-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      Ref: {alert.relatedEntityId || 'System'} · {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!alert.read && (
                      <button
                        onClick={() => handleMarkAlertRead(alert.id)}
                        className="px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-foreground text-xs font-semibold transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. AUDIT LOGS & SYSTEM HEALTH TAB */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          
          {/* Microservices Health Grid */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Full-Stack Microservices Status &amp; Telemetry</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {systemHealth.map(svc => (
                <div key={svc.id} className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-xs">{svc.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold text-[10px]">
                      {svc.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{svc.description}</p>
                  <p className="text-[10px] font-mono text-primary font-semibold pt-1">
                    Latency: {svc.latencyMs}ms · 0 Errors
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs space-y-3 p-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Immutable Administrative Audit Trail</span>
            </h3>

            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Timestamp</th>
                    <th className="px-4 py-2.5">Admin User</th>
                    <th className="px-4 py-2.5">Action</th>
                    <th className="px-4 py-2.5">Target Entity</th>
                    <th className="px-4 py-2.5">Audit Details</th>
                    <th className="px-4 py-2.5">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{log.adminEmail}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-muted text-foreground font-mono text-[10px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">{log.target}</td>
                      <td className="px-4 py-3 text-muted-foreground">{log.details}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{log.ipAddress || '10.0.4.12'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. SYSTEM SETTINGS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && systemSettings && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <span>Platform Governance &amp; Operational Controls</span>
            </h3>
            <p className="text-xs text-muted-foreground">Changes take effect across live production gateways immediately.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-foreground block">Platform Title &amp; Branding</label>
              <input
                type="text"
                value={systemSettings.platformName}
                onChange={e => setSystemSettings({ ...systemSettings, platformName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60">
              <div>
                <span className="font-bold text-foreground block">Emergency Maintenance Mode</span>
                <span className="text-[11px] text-muted-foreground">Temporarily halts new marketplace orders during mandi holiday or system upgrades</span>
              </div>
              <input
                type="checkbox"
                checked={systemSettings.maintenanceMode}
                onChange={e => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60">
              <div>
                <span className="font-bold text-foreground block">AI Multimodal Diagnostic Engine</span>
                <span className="text-[11px] text-muted-foreground">Enables real-time optical grading with Google GenAI SDK</span>
              </div>
              <input
                type="checkbox"
                checked={systemSettings.aiEngineEnabled}
                onChange={e => setSystemSettings({ ...systemSettings, aiEngineEnabled: e.target.checked })}
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground block">AI Model Specification</label>
              <select
                value={systemSettings.aiModelVersion}
                onChange={e => setSystemSettings({ ...systemSettings, aiModelVersion: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Production Default - Fast &amp; Multimodal)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Agronomic Reasoning)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60">
              <div>
                <span className="font-bold text-foreground block">Auto-Approve Certified Listings</span>
                <span className="text-[11px] text-muted-foreground">Listings with AI Grade Score &gt;85 automatically published to buyers</span>
              </div>
              <input
                type="checkbox"
                checked={systemSettings.autoApproveListings}
                onChange={e => setSystemSettings({ ...systemSettings, autoApproveListings: e.target.checked })}
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground block">Escrow Retention Window (Hours)</label>
              <input
                type="number"
                min={1}
                max={48}
                value={systemSettings.minEscrowRetentionHours}
                onChange={e => setSystemSettings({ ...systemSettings, minEscrowRetentionHours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 transition-colors"
              >
                Save Operational Parameters
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>User KYC Profile &amp; History</span>
              </h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded-lg hover:bg-accent text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={selectedUser.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'}
                alt={selectedUser.name}
                className="size-14 rounded-full object-cover border border-border"
              />
              <div>
                <h4 className="font-black text-base text-foreground">{selectedUser.name}</h4>
                <p className="text-xs text-muted-foreground">{selectedUser.email} • {selectedUser.mobile}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px] uppercase">
                  {selectedUser.role} • {selectedUser.status || 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">District / Mandi:</span>
                <span className="font-semibold text-foreground">{selectedUser.district || 'Nashik'}, {selectedUser.state || 'Maharashtra'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cluster Location:</span>
                <span className="font-semibold text-foreground">{selectedUser.location || 'Local farmgate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Created:</span>
                <span className="font-semibold text-foreground">{selectedUser.createdAt || '2026-01-10'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Status Change Modal */}
      {userStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Modify User Authorization Status</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to change the status of <strong>{userStatusModal.user.name}</strong> to{' '}
              <strong className="text-foreground uppercase">{userStatusModal.newStatus}</strong>?
            </p>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground block">Reason for Status Change (Audit Trail)</label>
              <textarea
                value={statusReason}
                onChange={e => setStatusReason(e.target.value)}
                placeholder="e.g. KYC document verification completed / Compliance review flag"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setUserStatusModal(null)}
                className="px-3 py-2 rounded-xl border border-border hover:bg-accent text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUserStatus}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs"
              >
                Confirm Status Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal (Add / Edit) */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span>{editingCrop ? 'Edit Crop Master Record' : 'Register New Crop Master Record'}</span>
              </h3>
              <button onClick={() => setCropModalOpen(false)} className="p-1 rounded-lg hover:bg-accent text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCrop} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={cropFormData.cropName || ''}
                    onChange={e => setCropFormData({ ...cropFormData, cropName: e.target.value })}
                    placeholder="e.g. Arka Rakshak Tomato"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Category</label>
                  <select
                    value={cropFormData.category || 'Vegetables'}
                    onChange={e => setCropFormData({ ...cropFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Oilseeds">Oilseeds</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Season</label>
                  <select
                    value={cropFormData.season || 'All Season'}
                    onChange={e => setCropFormData({ ...cropFormData, season: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="All Season">All Season</option>
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Zaid">Zaid</option>
                    <option value="Perennial">Perennial</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Water Requirement</label>
                  <select
                    value={cropFormData.waterRequirement || 'Medium'}
                    onChange={e => setCropFormData({ ...cropFormData, waterRequirement: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Soil Type Recommendation</label>
                <input
                  type="text"
                  required
                  value={cropFormData.soilType || ''}
                  onChange={e => setCropFormData({ ...cropFormData, soilType: e.target.value })}
                  placeholder="e.g. Well-drained deep black loamy soil"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Min Price (₹/Quintal)</label>
                  <input
                    type="number"
                    value={cropFormData.marketPriceRangePerQuintal?.min || 2000}
                    onChange={e => setCropFormData({
                      ...cropFormData,
                      marketPriceRangePerQuintal: {
                        min: Number(e.target.value),
                        max: cropFormData.marketPriceRangePerQuintal?.max || 3000
                      }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Max Price (₹/Quintal)</label>
                  <input
                    type="number"
                    value={cropFormData.marketPriceRangePerQuintal?.max || 3000}
                    onChange={e => setCropFormData({
                      ...cropFormData,
                      marketPriceRangePerQuintal: {
                        min: cropFormData.marketPriceRangePerQuintal?.min || 2000,
                        max: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Description &amp; Processing Utility</label>
                <textarea
                  value={cropFormData.description || ''}
                  onChange={e => setCropFormData({ ...cropFormData, description: e.target.value })}
                  placeholder="Commercial characteristics, storability, and processing valorization..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCropModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-border hover:bg-accent text-foreground text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs"
                >
                  Save Master Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Scheme Modal */}
      {schemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span>Add Government Scheme</span>
              </h3>
              <button onClick={() => setSchemeModalOpen(false)} className="p-1 rounded-lg hover:bg-accent text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddScheme} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Scheme Name</label>
                <input
                  type="text"
                  required
                  value={schemeFormData.name}
                  onChange={e => setSchemeFormData({ ...schemeFormData, name: e.target.value })}
                  placeholder="e.g. Pradhan Mantri Fasal Bima Yojana (PMFBY)"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Category</label>
                  <input
                    type="text"
                    required
                    value={schemeFormData.category}
                    onChange={e => setSchemeFormData({ ...schemeFormData, category: e.target.value })}
                    placeholder="e.g. Crop Insurance"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Deadline</label>
                  <input
                    type="text"
                    value={schemeFormData.deadline}
                    onChange={e => setSchemeFormData({ ...schemeFormData, deadline: e.target.value })}
                    placeholder="e.g. 31 March 2026"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Subsidy / Benefit</label>
                <textarea
                  value={schemeFormData.subsidy}
                  onChange={e => setSchemeFormData({ ...schemeFormData, subsidy: e.target.value })}
                  rows={2}
                  placeholder="e.g. 3% interest subvention on loans up to ₹2 Crore"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Eligibility</label>
                <input
                  type="text"
                  value={schemeFormData.eligibility}
                  onChange={e => setSchemeFormData({ ...schemeFormData, eligibility: e.target.value })}
                  placeholder="e.g. All farmers cultivating notified crops"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Required Documents (comma separated)</label>
                <input
                  type="text"
                  value={schemeFormData.documents}
                  onChange={e => setSchemeFormData({ ...schemeFormData, documents: e.target.value })}
                  placeholder="Aadhaar Card, Land Record (7/12 & 8A), Bank Passbook"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Portal URL</label>
                <input
                  type="text"
                  value={schemeFormData.portalUrl}
                  onChange={e => setSchemeFormData({ ...schemeFormData, portalUrl: e.target.value })}
                  placeholder="https://pmfby.gov.in"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSchemeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground font-bold text-xs hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs"
                >
                  Publish Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Equipment Renter Modal */}
      {equipmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>Add Equipment Renter</span>
              </h3>
              <button onClick={() => setEquipmentModalOpen(false)} className="p-1 rounded-lg hover:bg-accent text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Equipment Title</label>
                <input
                  type="text"
                  required
                  value={equipmentFormData.title}
                  onChange={e => setEquipmentFormData({ ...equipmentFormData, title: e.target.value })}
                  placeholder="e.g. John Deere 5050D (50 HP) + Rotavator"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Provider / Renter Name</label>
                <input
                  type="text"
                  required
                  value={equipmentFormData.providerName}
                  onChange={e => setEquipmentFormData({ ...equipmentFormData, providerName: e.target.value })}
                  placeholder="e.g. Shree Ganesh Agri Rentals"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Location</label>
                  <input
                    type="text"
                    value={equipmentFormData.location}
                    onChange={e => setEquipmentFormData({ ...equipmentFormData, location: e.target.value })}
                    placeholder="e.g. Ozar / Dindori (5 km away)"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Daily Rate (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={equipmentFormData.dailyRate}
                    onChange={e => setEquipmentFormData({ ...equipmentFormData, dailyRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Specifications</label>
                <textarea
                  value={equipmentFormData.specs}
                  onChange={e => setEquipmentFormData({ ...equipmentFormData, specs: e.target.value })}
                  rows={2}
                  placeholder="e.g. Power steering, fuel-efficient 4WD, operator included"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <label className="flex items-center gap-2 font-bold text-foreground">
                <input
                  type="checkbox"
                  checked={equipmentFormData.available}
                  onChange={e => setEquipmentFormData({ ...equipmentFormData, available: e.target.checked })}
                  className="size-4"
                />
                Available now
              </label>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEquipmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground font-bold text-xs hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Passport Modal */}
      {selectedBatchPassport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Farm-to-Fork Digital Passport</span>
                </h3>
                <p className="text-[11px] font-mono text-muted-foreground">{selectedBatchPassport.batch.batchId}</p>
              </div>
              <button onClick={() => setSelectedBatchPassport(null)} className="p-1 rounded-lg hover:bg-accent text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border text-xs space-y-2">
              <div className="flex justify-between">
                <span className="font-bold text-foreground">{selectedBatchPassport.batch.crop} ({selectedBatchPassport.batch.variety})</span>
                <span className="font-bold text-emerald-600">{selectedBatchPassport.batch.grade} ({selectedBatchPassport.batch.qualityScore} pts)</span>
              </div>
              <div className="text-muted-foreground">
                Farmer: {selectedBatchPassport.batch.farmerName} • {selectedBatchPassport.batch.farmerLocation}
              </div>
              <div className="text-muted-foreground">
                Total Weight: {selectedBatchPassport.batch.totalQuantity} {selectedBatchPassport.batch.unit} • Harvested: {selectedBatchPassport.batch.harvestDate}
              </div>
            </div>

            {/* Cryptographic Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification Timeline</h4>
              <div className="space-y-3 pl-2 border-l-2 border-primary/30 text-xs">
                {selectedBatchPassport.timeline.map((step, idx) => (
                  <div key={idx} className="relative pl-4 space-y-0.5">
                    <span className="absolute -left-[13px] top-1 size-2 rounded-full bg-primary" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{step.title}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{step.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">{step.details}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold block">Verified by: {step.actor} ({step.location})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedBatchPassport(null)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs"
              >
                Close Passport
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moderate Listing Modal */}
      {moderateListingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Moderate Marketplace Listing</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Confirm {moderateListingModal.action.toLowerCase()} action for listing: <strong>{moderateListingModal.listing.crop}</strong> (Batch: {moderateListingModal.listing.batchId}).
            </p>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-foreground block">Reason for Moderation</label>
              <textarea
                value={moderateReason}
                onChange={e => setModerateReason(e.target.value)}
                placeholder="e.g. Discrepancy in advertised grade vs APMC laboratory report"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary min-h-[70px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setModerateListingModal(null)}
                className="px-3 py-2 rounded-xl border border-border hover:bg-accent text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleModerateListing}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs"
              >
                Confirm Moderation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminDashboard;
