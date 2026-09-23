import React, { useState } from 'react';
import {
  Droplets,
  Sprout,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
  FlaskConical
} from 'lucide-react';
import { Language, translations } from '../i18n';

interface SoilHealthViewProps {
  lang: Language;
  onNavigateTab: (tab: string) => void;
}

export const SoilHealthView: React.FC<SoilHealthViewProps> = ({ lang, onNavigateTab }) => {
  const t = translations[lang];

  const [soilData, setSoilData] = useState({
    nitrogen: 240, // kg/ha (Medium: 280 is target)
    phosphorus: 38, // kg/ha (Medium: 45 is target)
    potassium: 330, // kg/ha (High)
    ph: 7.2, // Ideal: 6.5 - 7.5
    organicCarbon: 0.62 // % (Medium: > 0.75% is optimal)
  });

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Soil Health Card &amp; Micro-Nutrient Calibration
            </h2>
            <p className="text-xs text-stone-400">
              Diagnostic laboratory integration mapping N-P-K bioavailability, pH, and organic bio-fertilizer dosages.
            </p>
          </div>
        </div>
      </div>

      {/* Soil Parameter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <span className="text-[10px] text-stone-400 uppercase font-bold block">Available Nitrogen (N)</span>
          <div className="text-xl font-extrabold text-amber-400 mt-1">{soilData.nitrogen} kg/ha</div>
          <span className="text-[10px] text-amber-500 font-semibold">Deficit (Low)</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <span className="text-[10px] text-stone-400 uppercase font-bold block">Phosphorus (P₂O₅)</span>
          <div className="text-xl font-extrabold text-stone-100 mt-1">{soilData.phosphorus} kg/ha</div>
          <span className="text-[10px] text-emerald-400 font-semibold">Sufficient</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <span className="text-[10px] text-stone-400 uppercase font-bold block">Potassium (K₂O)</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">{soilData.potassium} kg/ha</div>
          <span className="text-[10px] text-emerald-400 font-semibold">High (Ideal for Tomato)</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
          <span className="text-[10px] text-stone-400 uppercase font-bold block">Soil pH</span>
          <div className="text-xl font-extrabold text-teal-300 mt-1">{soilData.ph}</div>
          <span className="text-[10px] text-teal-400 font-semibold">Neutral / Optimal</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-stone-400 uppercase font-bold block">Organic Carbon</span>
          <div className="text-xl font-extrabold text-amber-300 mt-1">{soilData.organicCarbon}%</div>
          <span className="text-[10px] text-stone-400">Moderate</span>
        </div>

      </div>

      {/* AI Biological Prescription */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Biological Fertilizer &amp; Conditioning Prescription</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>Nitrogen &amp; Organic Carbon Boost</span>
            </h4>
            <p className="text-stone-300 leading-relaxed">
              Incorporate 2 tons of decomposed vermicompost per acre enriched with <strong>Azotobacter chroococcum</strong> (2 kg/acre). Fixes atmospheric nitrogen naturally, saving 30% on synthetic urea application.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span>Zinc &amp; Boron Foliar Spray</span>
            </h4>
            <p className="text-stone-300 leading-relaxed">
              Black soils often exhibit locked Zinc. Apply Chelated Zinc EDTA 12% @ 1g/L and Solubor Boron 20% @ 1g/L during early flowering stage to eliminate flower drop and cat-facing in tomatoes.
            </p>
          </div>

        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onNavigateTab('cropPlanning')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow"
          >
            Apply to Crop Planning
          </button>
        </div>
      </div>

    </div>
  );
};
