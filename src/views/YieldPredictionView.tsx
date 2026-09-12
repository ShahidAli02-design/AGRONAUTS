import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Sun,
  Droplets,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { ApiService } from '../services/api';
import { Language, translations } from '../i18n';

interface YieldPredictionViewProps {
  lang: Language;
  onNavigateTab: (tab: string) => void;
}

export const YieldPredictionView: React.FC<YieldPredictionViewProps> = ({
  lang,
  onNavigateTab
}) => {
  const t = translations[lang];

  const [crop, setCrop] = useState('Tomato');
  const [landArea, setLandArea] = useState('2.5');
  const [growthStage, setGrowthStage] = useState('Fruit Formation');
  const [isLoading, setIsLoading] = useState(false);

  const [prediction, setPrediction] = useState({
    crop: 'Tomato',
    expectedYield: '21.2 Tons',
    range: '19.1 – 24.3 Tons',
    confidence: 94,
    factors: [
      'Canopy vegetative density: 92% leaf vigor index',
      'Drip irrigation consistency maintained at 84% field water capacity',
      'Minimal nighttime heat stress recorded across previous 21 days',
      'Dense fruit set with 14-18 fruits per productive cluster'
    ]
  });

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await ApiService.predictYield(crop, Number(landArea) || 2.5, growthStage);
      if (res.success && res.prediction) {
        setPrediction(res.prediction);
      }
    } catch (e) {
      console.warn('Yield calculation error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              AI Yield Prediction &amp; Pre-Harvest Intelligence
            </h2>
            <p className="text-xs text-stone-400">
              Predict commercial harvest volume and decide precisely when to harvest for peak market value.
            </p>
          </div>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-stone-800/60 border border-stone-700/60 flex items-center space-x-2 text-xs text-stone-300">
          <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Notice: Yield models calibrated using regional agro-climatic historical yield datasets. Labelled as estimates.</span>
        </div>
      </div>

      {/* Yield Simulator Inputs */}
      <form onSubmit={handlePredict} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Crop Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-stone-400 font-semibold mb-1">Target Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold"
            >
              <option value="Tomato">Tomato (Arka Rakshak)</option>
              <option value="Mango">Mango (Alphonso)</option>
              <option value="Onion">Onion (Garwa)</option>
              <option value="Wheat">Wheat (Sharbati)</option>
              <option value="Potato">Potato (Kufri)</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-400 font-semibold mb-1">Cultivated Land Area (Acres)</label>
            <input
              type="number"
              step="0.1"
              value={landArea}
              onChange={(e) => setLandArea(e.target.value)}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-stone-400 font-semibold mb-1">Current Growth Stage</label>
            <select
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value)}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold"
            >
              <option value="Vegetative">Vegetative</option>
              <option value="Flowering">Flowering</option>
              <option value="Fruit Formation">Fruit Formation</option>
              <option value="Maturity / Ripening">Maturity / Ripening</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Recalculating...' : 'Update Yield Prediction'}</span>
          </button>
        </div>
      </form>

      {/* Yield Prediction Result Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Expected Commercial Harvest
          </span>
          <div className="text-3xl font-extrabold text-emerald-400">
            {prediction.expectedYield}
          </div>
          <p className="text-xs text-stone-400">
            Estimated total tonnage across {landArea} acres.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Confidence Range (90% Interval)
          </span>
          <div className="text-2xl font-extrabold text-stone-100">
            {prediction.range}
          </div>
          <p className="text-xs text-stone-400">
            Lower threshold accounts for potential 8% transit shrinkage.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Model Confidence
          </span>
          <div className="text-3xl font-extrabold text-teal-300 flex items-center space-x-2">
            <span>{prediction.confidence}%</span>
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          </div>
          <p className="text-xs text-stone-400">
            High precision based on sensor + weather historical telemetry.
          </p>
        </div>

      </div>

      {/* Pre-Harvest Decision Module: "WHEN SHOULD I HARVEST?" */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-stone-900 to-stone-900 border border-emerald-800/60 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              Pre-Harvest Decision Engine
            </span>
            <h3 className="text-lg font-extrabold text-white mt-0.5">
              Optimal Harvest Timing Advisory
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500 text-stone-950 text-xs font-extrabold self-start sm:self-auto">
            Recommended: 2 Days (Morning 06:00 AM)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <span className="text-[10px] text-stone-400 block font-semibold">Weather Window</span>
            <span className="text-stone-200 font-bold text-xs mt-1 block">Clear skies • 28°C max</span>
            <span className="text-[10px] text-emerald-400">Zero rain risk for next 72h</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <span className="text-[10px] text-stone-400 block font-semibold">Nutrient &amp; Water Halt</span>
            <span className="text-stone-200 font-bold text-xs mt-1 block">Withhold irrigation 36h</span>
            <span className="text-[10px] text-stone-400">Enhances sugar &amp; shelf-life</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <span className="text-[10px] text-stone-400 block font-semibold">Market Readiness</span>
            <span className="text-stone-200 font-bold text-xs mt-1 block">Breaker / Turning Stage</span>
            <span className="text-[10px] text-emerald-400">Optimal for transit to Mumbai</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60">
            <span className="text-[10px] text-stone-400 block font-semibold">Expected Mandi Price</span>
            <span className="text-stone-200 font-bold text-xs mt-1 block">₹24,500 / Ton</span>
            <span className="text-[10px] text-emerald-400">Peak wholesale demand</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onNavigateTab('harvest')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center space-x-1.5"
          >
            <span>Proceed to Register Harvest &amp; Generate Batch ID</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
