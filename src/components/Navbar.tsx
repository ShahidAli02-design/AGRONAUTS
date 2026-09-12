import React, { useState } from 'react';
import {
  Sprout,
  Languages,
  Mic,
  Wifi,
  WifiOff,
  Bell,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  Calendar,
  Eye,
  Activity,
  TrendingUp,
  Package,
  Sparkles,
  Layers,
  ShoppingBag,
  Truck,
  FileText,
  FlaskConical,
  DollarSign,
  BookOpen
} from 'lucide-react';
import { UserRole } from '../types';
import { Language, translations } from '../i18n';

interface NavbarProps {
  currentRole?: UserRole;
  role?: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentLang?: Language;
  lang?: Language;
  onLangChange: (lang: Language) => void;
  onOpenVoice: () => void;
  onOpenOnboarding: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  role,
  onRoleChange,
  currentLang,
  lang,
  onLangChange,
  onOpenVoice,
  onOpenOnboarding,
  activeTab,
  onTabChange,
  isOnline = true
}) => {
  const activeRole = role || currentRole || 'Farmer';
  const activeLang = lang || currentLang || 'en';
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const t = translations[activeLang];

  const rolesList: { role: UserRole; label: string; icon: string }[] = [
    { role: 'Farmer', label: t.roles.FARMER, icon: '👨‍🌾' },
    { role: 'Buyer', label: t.roles.BUYER, icon: '🛒' },
    { role: 'Processor', label: t.roles.PROCESSOR, icon: '🏭' },
    { role: 'Admin', label: t.roles.ADMIN, icon: '🛡' }
  ];

  const farmerTabs = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'cropPlanning', label: t.cropPlanning, icon: Calendar },
    { id: 'cropMonitoring', label: t.cropMonitoring, icon: Eye },
    { id: 'diseaseDetect', label: t.diseaseDetection, icon: Activity },
    { id: 'yieldPrediction', label: t.yieldPrediction, icon: TrendingUp },
    { id: 'harvest', label: t.harvest, icon: Package },
    { id: 'qualityGrading', label: t.qualityGrading, icon: Sparkles },
    { id: 'inventory', label: t.inventory, icon: Layers },
    { id: 'marketplace', label: t.marketplace, icon: ShoppingBag },
    { id: 'orders', label: t.orders, icon: Truck },
    { id: 'traceability', label: t.traceability, icon: FileText },
    { id: 'soilHealth', label: t.soilHealth, icon: FlaskConical },
    { id: 'valueAnalytics', label: t.analytics, icon: DollarSign },
    { id: 'extras', label: t.ancillary, icon: BookOpen }
  ];

  const buyerTabs = [
    { id: 'dashboard', label: 'Buyer Hub', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Browse Produce', icon: ShoppingBag },
    { id: 'orders', label: 'Orders & Tracking', icon: Truck },
    { id: 'traceability', label: 'Batch Traceability', icon: FileText }
  ];

  const processorTabs = [
    { id: 'dashboard', label: 'Processor Hub', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Grade B/C Lots', icon: ShoppingBag },
    { id: 'orders', label: 'Processing Orders', icon: Truck },
    { id: 'traceability', label: 'Batch Traceability', icon: FileText }
  ];

  const adminTabs = [
    { id: 'dashboard', label: 'Control Tower', icon: LayoutDashboard },
    { id: 'inventory', label: 'Produce Ledger', icon: Layers },
    { id: 'marketplace', label: 'Marketplace Monitor', icon: ShoppingBag },
    { id: 'orders', label: 'Orders & Escrow SLA', icon: Truck },
    { id: 'traceability', label: 'Traceability Registry', icon: FileText }
  ];

  const currentTabs =
    activeRole === 'Buyer'
      ? buyerTabs
      : activeRole === 'Processor'
      ? processorTabs
      : activeRole === 'Admin'
      ? adminTabs
      : farmerTabs;

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md text-white border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                  AGRONAUTS
                </span>
                <span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  SMART AGRI ECOSYSTEM
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-stone-400 font-medium truncate max-w-xs">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Center Actions: Voice Button & Role Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Voice Assistant Trigger */}
            <button
              id="btn-voice-assistant"
              onClick={onOpenVoice}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/50 text-emerald-300 text-xs font-semibold transition shadow-sm hover:shadow-emerald-900/30"
              title="Voice Assistant (English / Marathi / Hindi)"
            >
              <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Voice AI</span>
            </button>

            {/* Role Dropdown */}
            <div className="relative">
              <button
                id="btn-role-selector"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-medium text-stone-200 transition"
              >
                <span>{rolesList.find(r => r.role === activeRole)?.icon}</span>
                <span className="font-semibold text-emerald-400">
                  {rolesList.find(r => r.role === activeRole)?.label}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-stone-800 rounded-xl shadow-2xl border border-stone-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-700">
                    Switch Demo Persona
                  </div>
                  {rolesList.map(item => (
                    <button
                      key={item.role}
                      onClick={() => {
                        onRoleChange(item.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition ${
                        activeRole === item.role
                          ? 'bg-emerald-900/40 text-emerald-300 font-bold'
                          : 'text-stone-300 hover:bg-stone-700/50'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      {activeRole === item.role && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700 text-xs">
              <button
                onClick={() => onLangChange('en')}
                className={`px-2 py-1 rounded font-semibold transition ${
                  activeLang === 'en' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLangChange('mr')}
                className={`px-2 py-1 rounded font-semibold transition ${
                  activeLang === 'mr' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                मराठी
              </button>
              <button
                onClick={() => onLangChange('hi')}
                className={`px-2 py-1 rounded font-semibold transition ${
                  activeLang === 'hi' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Online/Offline Status */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-stone-800 text-[11px] font-medium border border-stone-700 text-stone-300">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400">PWA Offline</span>
                </>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                id="btn-notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 relative transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-stone-800 rounded-xl shadow-2xl border border-stone-700 p-3 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-700 mb-2">
                    <span className="font-bold text-white">Alerts &amp; Activity</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">3 New</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 rounded bg-stone-700/50 border-l-2 border-emerald-400">
                      <p className="font-semibold text-stone-200">Quality Verified: Batch AGR-2026-TOM-00001</p>
                      <p className="text-stone-400 text-[11px]">AI assigned Grade A (Score: 92%). Wholesaler matched.</p>
                      <span className="text-[10px] text-stone-500">10 mins ago</span>
                    </div>
                    <div className="p-2 rounded bg-stone-700/50 border-l-2 border-amber-400">
                      <p className="font-semibold text-stone-200">Pre-Harvest Advisory: Tomato</p>
                      <p className="text-stone-400 text-[11px]">Harvest recommended in 2 days during cool morning hours.</p>
                      <span className="text-[10px] text-stone-500">2 hours ago</span>
                    </div>
                    <div className="p-2 rounded bg-stone-700/50 border-l-2 border-sky-400">
                      <p className="font-semibold text-stone-200">Mandi Price Spike</p>
                      <p className="text-stone-400 text-[11px]">Nashik APMC Red Tomato increased +₹150 to ₹2,450/Qtl.</p>
                      <span className="text-[10px] text-stone-500">Today, 09:15 AM</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tour / Guide Button */}
            <button
              onClick={onOpenOnboarding}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
              title="View Ecosystem Guide"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

        </div>
      </div>

      {/* Horizontal Category Navigation Bar */}
      <nav className="border-t border-stone-800/80 bg-stone-950/60 overflow-x-auto scrollbar-none px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 py-2 min-w-max">
          {currentTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
