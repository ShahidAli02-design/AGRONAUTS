import React from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Truck,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ProduceBatch, Order } from '../types';
import { Language, translations } from '../i18n';

interface BuyerDashboardProps {
  batches: ProduceBatch[];
  orders: Order[];
  lang: Language;
  onNavigateTab: (tab: string, contextId?: string) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  batches,
  orders,
  lang,
  onNavigateTab
}) => {
  const t = translations[lang];

  // Filter fresh Grade A batches
  const gradeABatches = batches.filter(b => b.grade === 'Grade A');

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Buyer Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-stone-900 to-stone-900 border border-sky-800/60 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
          <ShoppingBag className="w-4 h-4" />
          <span>Fresh Produce Commercial Buyer Portal</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">
          Direct Farmgate Sourcing — 100% Optical AI Graded
        </h2>
        <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
          Source Grade A crops with computer vision verified uniformity, zero intermediary margins, and escrow bank protection.
        </p>
      </div>

      {/* Buyer KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase">Grade A Lots Available</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{gradeABatches.length} Lots</div>
          <span className="text-xs text-stone-400">Direct from Nashik &amp; Pune belts</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase">Active In-Transit Orders</span>
          <div className="text-2xl font-extrabold text-sky-400 mt-1">{orders.length} Shipments</div>
          <span className="text-xs text-stone-400">Cold chain telemetry monitored</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase">Average Procurement Savings</span>
          <div className="text-2xl font-extrabold text-teal-300 mt-1">16.4% Less</div>
          <span className="text-xs text-stone-400">vs APMC middleman commissions</span>
        </div>
      </div>

      {/* Recommended Grade A Lots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Verified Grade A Harvest Lots Ready for Dispatch</span>
          </h3>
          <button
            onClick={() => onNavigateTab('marketplace')}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            Explore Marketplace
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gradeABatches.map((batch) => (
            <div
              key={batch.batchId}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                    {batch.batchId}
                  </span>
                  <h4 className="text-base font-extrabold text-white mt-0.5">
                    {batch.crop} ({batch.variety})
                  </h4>
                  <div className="text-xs text-stone-400 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-500" />
                    <span>Patil Farms, {batch.farmerLocation}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {batch.grade} ({batch.qualityReport?.overallScore || 92}/100)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-[10px] text-stone-400 block font-semibold">Available Lot</span>
                  <span className="font-extrabold text-white">{batch.remainingQuantity} {batch.unit}</span>
                </div>
                <div className="p-2 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-[10px] text-stone-400 block font-semibold">Fair Price</span>
                  <span className="font-extrabold text-emerald-400">₹{batch.marketPrice?.toLocaleString('en-IN') || '24,500'} / T</span>
                </div>
                <div className="p-2 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-[10px] text-stone-400 block font-semibold">Shelf Life</span>
                  <span className="font-extrabold text-amber-400">
                    {batch.storageTelemetry?.estimatedShelfLifeDays || 8} Days
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1 border-t border-stone-800">
                <button
                  onClick={() => onNavigateTab('traceability', batch.batchId)}
                  className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition"
                >
                  Inspect Digital Passport
                </button>
                <button
                  onClick={() => onNavigateTab('marketplace')}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow"
                >
                  Place Procurement Order
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
