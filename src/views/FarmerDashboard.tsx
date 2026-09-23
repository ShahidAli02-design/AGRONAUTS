import React, { useState } from 'react';
import {
  TrendingUp,
  Sprout,
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Search,
  Truck,
  Sparkles,
  Sun,
  Droplets,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { CropPlan, ProduceBatch, FarmerProfile } from '../types';
import { Language, translations } from '../i18n';

interface FarmerDashboardProps {
  crops: CropPlan[];
  batches: ProduceBatch[];
  profile: FarmerProfile;
  lang: Language;
  onNavigateTab: (tab: string, contextId?: string) => void;
  onAdvanceOrderTransit?: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  crops,
  batches,
  profile,
  lang,
  onNavigateTab
}) => {
  const t = translations[lang];
  const activeCrop = crops[0] || null;
  const latestBatch = batches[0] || null;

  // Compute summary stats
  const totalBatchesCount = batches.length;
  const totalInventoryTons = batches.reduce((sum, b) => sum + b.remainingQuantity, 0);
  const totalRevenue = 438000;
  const avoidedLoss = 78800;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome Banner with Farm Context */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-stone-900 to-stone-900 border border-emerald-800/40 p-5 sm:p-7 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sprout className="w-4 h-4" />
              <span>{profile.village}, {profile.district} • {profile.landArea} Acres</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
              Welcome, {profile.fullName} 👨‍🌾
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
              From Soil Planning to Direct Escrow Settlement — your produce is monitored by multimodal AI and zero-waste matching.
            </p>
          </div>

          {/* Quick Badges: Internal Agri Credit Score & Green Rewards */}
          <div className="flex items-center space-x-3 shrink-0">
            <div
              onClick={() => onNavigateTab('analytics')}
              className="cursor-pointer bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-xl p-3 text-center transition"
            >
              <div className="text-[10px] font-bold uppercase text-stone-400">Agri Credit Score</div>
              <div className="text-xl font-extrabold text-emerald-400 flex items-center justify-center space-x-1">
                <span>742</span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-[9px] text-stone-400">Verified Platform Tier</div>
            </div>

            <div
              onClick={() => onNavigateTab('analytics')}
              className="cursor-pointer bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-xl p-3 text-center transition"
            >
              <div className="text-[10px] font-bold uppercase text-stone-400">Green Rewards</div>
              <div className="text-xl font-extrabold text-teal-300 flex items-center justify-center space-x-1">
                <span>88</span>
                <span className="text-xs">pts</span>
              </div>
              <div className="text-[9px] text-stone-400">Low-Carbon Farm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <button
          onClick={() => onNavigateTab('cropPlanning')}
          className="flex items-center justify-center space-x-1.5 p-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-bold transition shadow-sm hover:border-emerald-600/50"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>{t.quickActions.addCrop}</span>
        </button>

        <button
          onClick={() => onNavigateTab('harvest')}
          className="flex items-center justify-center space-x-1.5 p-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-bold transition shadow-sm hover:border-emerald-600/50"
        >
          <Package className="w-4 h-4 text-amber-400" />
          <span>{t.quickActions.registerHarvest}</span>
        </button>

        <button
          onClick={() => onNavigateTab('qualityGrading')}
          className="flex items-center justify-center space-x-1.5 p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-bold transition shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{t.quickActions.checkQuality}</span>
        </button>

        <button
          onClick={() => onNavigateTab('marketplace')}
          className="flex items-center justify-center space-x-1.5 p-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-bold transition shadow-sm hover:border-emerald-600/50"
        >
          <TrendingUp className="w-4 h-4 text-sky-400" />
          <span>{t.quickActions.listProduce}</span>
        </button>

        <button
          onClick={() => onNavigateTab('marketplace')}
          className="flex items-center justify-center space-x-1.5 p-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-bold transition shadow-sm hover:border-emerald-600/50 col-span-2 sm:col-span-1"
        >
          <Search className="w-4 h-4 text-purple-400" />
          <span>{t.quickActions.findBuyer}</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Active Cultivations</span>
            <span className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-900">
              <Sprout className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{crops.length} Crops</div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center space-x-1">
            <span>Tomato, Mango, Onion</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Produce Inventory</span>
            <span className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-900">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{totalInventoryTons} Tons</div>
          <div className="mt-1 text-[11px] text-stone-400 flex items-center space-x-1">
            <span>Across {totalBatchesCount} registered batches</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Total Farmer Revenue</span>
            <span className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-900">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="mt-1 text-[11px] text-stone-400">Direct escrow bank settlements</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Avoided Post-Harvest Loss</span>
            <span className="p-1.5 rounded-lg bg-teal-950 text-teal-400 border border-teal-900">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-teal-300">₹{avoidedLoss.toLocaleString('en-IN')}</div>
          <div className="mt-1 text-[11px] text-emerald-400">Zero-Waste food processing contracts</div>
        </div>

      </div>

      {/* Main Two-Column Hub: Active Crop Dashboard & Harvest Quality Zero-Waste Batch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dynamic Crop Monitoring Card */}
        {activeCrop && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-base font-extrabold text-white">
                  Active Crop: {activeCrop.cropName} ({activeCrop.variety})
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('cropMonitoring', activeCrop.id)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-0.5"
              >
                <span>Full Monitor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Growth Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-stone-300">
                  Day {activeCrop.currentDay} of {activeCrop.totalDays}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold">
                  {activeCrop.growthStage}
                </span>
              </div>
              <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.round((activeCrop.currentDay / activeCrop.totalDays) * 100)}%` }}
                />
              </div>
            </div>

            {/* Crop Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-stone-800/60 rounded-xl p-2.5 border border-stone-800">
                <div className="text-stone-400 text-[10px] uppercase font-bold">Crop Health</div>
                <div className="text-sm font-extrabold text-emerald-400 mt-0.5">{activeCrop.healthScore}%</div>
                <div className="text-[10px] text-stone-500">Vigorous canopy</div>
              </div>

              <div className="bg-stone-800/60 rounded-xl p-2.5 border border-stone-800">
                <div className="text-stone-400 text-[10px] uppercase font-bold">Disease Risk</div>
                <div className="text-sm font-extrabold text-amber-400 mt-0.5">{activeCrop.diseaseRisk}</div>
                <div className="text-[10px] text-stone-500">Scout lower leaves</div>
              </div>

              <div className="bg-stone-800/60 rounded-xl p-2.5 border border-stone-800">
                <div className="text-stone-400 text-[10px] uppercase font-bold">Expected Yield</div>
                <div className="text-sm font-extrabold text-stone-100 mt-0.5">
                  {activeCrop.expectedYieldMin}–{activeCrop.expectedYieldMax} T
                </div>
                <div className="text-[10px] text-stone-500">{activeCrop.landArea} Acres</div>
              </div>
            </div>

            {/* Weather & Soil snapshot */}
            <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-800 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-stone-300">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium">{activeCrop.weatherSummary}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-stone-400 text-[11px]">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                <span>{activeCrop.soilCondition}</span>
              </div>
            </div>

            {/* Urgent Tasks */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Immediate Agronomic Tasks
              </div>
              {activeCrop.tasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-stone-800/60 border border-stone-700/60 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${task.completed ? 'text-emerald-400' : 'text-stone-500'}`}
                    />
                    <span className={task.completed ? 'line-through text-stone-400' : 'text-stone-200'}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-700 text-stone-300">
                    {task.dueDate}
                  </span>
                </div>
              ))}
            </div>

            {/* Disease Scanner Fast Trigger */}
            <button
              onClick={() => onNavigateTab('diseaseDetection')}
              className="w-full py-2 px-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-xs font-bold text-emerald-400 flex items-center justify-center space-x-1.5 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Scan Leaves with AI Disease Detection</span>
            </button>
          </div>
        )}

        {/* Latest Registered Harvest Batch & Zero-Waste Recommendation */}
        {latestBatch && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-900">
                  <Package className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                    BATCH ID: {latestBatch.batchId}
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    {latestBatch.crop} • {latestBatch.totalQuantity} {latestBatch.unit}
                  </h3>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-extrabold">
                  {latestBatch.grade || 'Grade A'}
                </span>
              </div>
            </div>

            {/* Produce Image & Quality Breakdown */}
            <div className="flex gap-3">
              {latestBatch.imageUrl && (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-stone-800 shrink-0">
                  <img
                    src={latestBatch.imageUrl}
                    alt={latestBatch.crop}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Quality Inspection Score</span>
                  <span className="font-extrabold text-emerald-400">
                    {latestBatch.qualityReport?.overallScore || 92}/100
                  </span>
                </div>

                {/* Grade breakdown pill meter */}
                <div className="w-full bg-stone-800 h-2 rounded-full flex overflow-hidden">
                  <div style={{ width: '65%' }} className="bg-emerald-500" title="Grade A: 65%" />
                  <div style={{ width: '28%' }} className="bg-amber-500" title="Grade B: 28%" />
                  <div style={{ width: '7%' }} className="bg-red-500" title="Grade C: 7%" />
                </div>
                <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                  <span>Gr.A: 65%</span>
                  <span>Gr.B: 28%</span>
                  <span>Gr.C: 7%</span>
                </div>

                <div className="text-[11px] text-stone-300 bg-stone-800/40 p-2 rounded-lg border border-stone-800">
                  <span className="font-semibold text-stone-200">AI Finding: </span>
                  {latestBatch.qualityReport?.freshnessStatus || 'High turgidity, minimal dermal bruising.'}
                </div>
              </div>
            </div>

            {/* Zero-Waste Engine Decision Box */}
            {latestBatch.bestUtilization && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-stone-800/60 to-stone-800/40 border border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>ZERO-WASTE BEST ACTION</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px] font-mono font-bold">
                    {latestBatch.bestUtilization.bestAction}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {latestBatch.bestUtilization.actionTitle}
                </h4>

                <p className="text-[11px] text-stone-300 leading-relaxed">
                  {latestBatch.bestUtilization.reasoning}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-700/60">
                    <div className="text-[10px] text-stone-400">Direct Sale Est.</div>
                    <div className="text-xs font-extrabold text-stone-200">
                      ₹{latestBatch.bestUtilization.estimatedDirectSaleValue.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/60">
                    <div className="text-[10px] text-emerald-400">Processing Potential</div>
                    <div className="text-xs font-extrabold text-emerald-300">
                      +₹{latestBatch.bestUtilization.potentialAdditionalValue.toLocaleString('en-IN')} Added
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Traceability & Buyer Match actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateTab('traceability', latestBatch.batchId)}
                className="py-2 px-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-xs font-semibold text-stone-200 flex items-center justify-center space-x-1 transition"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>View Traceability</span>
              </button>

              <button
                onClick={() => onNavigateTab('marketplace')}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-1 shadow transition"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Match Buyers (94%)</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* APMC Mandi Prices Live Ticker */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live Mandi Price Intelligence
            </span>
            <span className="text-[10px] text-stone-400 font-mono">Nashik &amp; Lasalgaon APMC</span>
          </div>
          <button
            onClick={() => onNavigateTab('marketplace')}
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <span>Marketplace</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Tomato (Nashik)</span>
              <span className="text-emerald-400 font-bold">+₹150 (Rising)</span>
            </div>
            <div className="mt-1 text-lg font-extrabold text-stone-100">₹2,450 / Qtl</div>
            <div className="text-[10px] text-stone-400">High Metro Demand • Direct sale recommended</div>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Onion (Lasalgaon)</span>
              <span className="text-amber-400 font-bold">Stable (High Supply)</span>
            </div>
            <div className="mt-1 text-lg font-extrabold text-stone-100">₹1,850 / Qtl</div>
            <div className="text-[10px] text-stone-400">Process to dehydrated flakes (+32% value)</div>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Mango (Alphonso)</span>
              <span className="text-emerald-400 font-bold">Seasonal Peak</span>
            </div>
            <div className="mt-1 text-lg font-extrabold text-stone-100">₹6,800 / Qtl</div>
            <div className="text-[10px] text-stone-400">Export &amp; Metro retail premium</div>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Wheat (Sharbati)</span>
              <span className="text-emerald-400 font-bold">+₹80 (Steady)</span>
            </div>
            <div className="mt-1 text-lg font-extrabold text-stone-100">₹2,650 / Qtl</div>
            <div className="text-[10px] text-stone-400">Moisture below 12% • Long storage safe</div>
          </div>
        </div>
      </div>

    </div>
  );
};
