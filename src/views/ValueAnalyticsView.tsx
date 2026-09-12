import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Award,
  Leaf,
  CheckCircle2,
  DollarSign,
  Package,
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Language, translations } from '../i18n';

interface ValueAnalyticsViewProps {
  lang: Language;
  onNavigateTab: (tab: string) => void;
}

export const ValueAnalyticsView: React.FC<ValueAnalyticsViewProps> = ({ lang, onNavigateTab }) => {
  const t = translations[lang];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Farmer Value Creation &amp; Platform Impact Analytics
            </h2>
            <p className="text-xs text-stone-400">
              Quantifiable return on investment, post-harvest loss avoidance, and verified credit rating.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Impact Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase">Total Revenue Earned</span>
            <span className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">₹4,38,000</div>
          <p className="text-xs text-stone-400">
            Across 3 verified harvest lots with 0 middleman deductions.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase">Avoided Post-Harvest Loss</span>
            <span className="p-1.5 rounded-lg bg-teal-950 text-teal-400 border border-teal-800">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-teal-300">₹78,800</div>
          <p className="text-xs text-stone-400">
            Recovered value from Grade B lots routed to industrial food processing.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase">Internal Agri Credit Score</span>
            <span className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white flex items-center space-x-1.5">
            <span>742</span>
            <span className="text-xs text-stone-400 font-normal">/ 900</span>
          </div>
          <p className="text-xs text-emerald-400 font-semibold">
            Prime Tier (Unlocks 4% priority crop loans).
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase">Green Carbon Rewards</span>
            <span className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Leaf className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-300">88 / 100</div>
          <p className="text-xs text-stone-400">
            Precision drip irrigation &amp; organic biological pest control.
          </p>
        </div>

      </div>

      {/* Breakdown Cards: Zero-Waste Savings & Agri Credit Rating */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Zero-Waste Economics Breakdown */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Zero-Waste Valorization Economics</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60 flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">Tomato Grade B Puree Match</span>
                <span className="text-[10px] text-stone-400">4.2 Tons diverted to Kisan Agro Processing</span>
              </div>
              <span className="font-extrabold text-emerald-400 text-sm">+₹37,000</span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60 flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">Garwa Onion Dehydration Flakes</span>
                <span className="text-[10px] text-stone-400">6.0 Tons stored and processed at peak margin</span>
              </div>
              <span className="font-extrabold text-emerald-400 text-sm">+₹41,800</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex justify-between items-center text-stone-200">
              <span className="font-bold text-emerald-300">Total Post-Harvest Value Salvaged:</span>
              <span className="font-black text-emerald-300 text-base">₹78,800</span>
            </div>
          </div>
        </div>

        {/* Agri Credit Score Diagnostic */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Agronauts Internal Credit Score Diagnostic</span>
          </h3>

          <p className="text-xs text-stone-300 leading-relaxed">
            Unlike traditional banks that require heavy collateral, our proprietary score aggregates 4 objective on-chain telemetry vectors:
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-800/50">
              <span className="text-stone-300">Fulfillment Consistency (100% On-Time)</span>
              <span className="font-extrabold text-emerald-400">+260 pts</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-800/50">
              <span className="text-stone-300">AI Quality Inspection Pass Rate (94%)</span>
              <span className="font-extrabold text-emerald-400">+230 pts</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-800/50">
              <span className="text-stone-300">Sustainable Soil &amp; Water Practices</span>
              <span className="font-extrabold text-emerald-400">+140 pts</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-800/50">
              <span className="text-stone-300">Buyer Rating &amp; Zero Dispute History</span>
              <span className="font-extrabold text-emerald-400">+112 pts</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
