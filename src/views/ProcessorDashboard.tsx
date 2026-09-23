import React from 'react';
import {
  Factory,
  Sparkles,
  Package,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { ProduceBatch } from '../types';
import { Language, translations } from '../i18n';

interface ProcessorDashboardProps {
  batches: ProduceBatch[];
  lang: Language;
  onNavigateTab: (tab: string, contextId?: string) => void;
}

export const ProcessorDashboard: React.FC<ProcessorDashboardProps> = ({
  batches,
  lang,
  onNavigateTab
}) => {
  const t = translations[lang];

  // Grade B & Grade C processing-ready batches
  const processingBatches = batches.filter(b => b.grade === 'Grade B' || b.grade === 'Grade C' || b.bestUtilization?.bestAction === 'PROCESS');

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-stone-900 border border-amber-800/60 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Factory className="w-4 h-4" />
          <span>Industrial Food Processing &amp; Zero-Waste Valorization</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">
          Direct Farmgate Raw Material Sourcing (Grade B / C)
        </h2>
        <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
          Secure fresh processing lots (paste, puree, dehydration flakes, solar chips) at 30–40% lower farmgate raw material cost while eliminating farm-level dump waste.
        </p>
      </div>

      {/* Processor Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase">Available Processing Lots</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">4.2 Tons</div>
          <span className="text-xs text-stone-400">High soluble solids (Brix &gt; 5.2°)</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase">Raw Material Cost Advantage</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">₹14,500 / Ton</div>
          <span className="text-xs text-stone-400">38% lower than retail Grade A table rates</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-stone-400 uppercase">Post-Harvest Loss Averted</span>
          <div className="text-2xl font-extrabold text-teal-300 mt-1">100% Utilized</div>
          <span className="text-xs text-stone-400">Zero farmgate dump landfill waste</span>
        </div>
      </div>

      {/* Suitable Produce For Your Processing Requirement */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Suitable Produce For Your Processing Requirements</span>
          </h3>
          <span className="text-xs text-stone-400 font-mono">Nashik &amp; Pune Cluster</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processingBatches.map((batch) => (
            <div
              key={batch.batchId}
              className="bg-stone-900 border border-stone-800 hover:border-amber-700/60 rounded-2xl p-5 shadow-sm space-y-4 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold block">
                    BATCH: {batch.batchId}
                  </span>
                  <h4 className="text-base font-extrabold text-white mt-0.5">
                    {batch.crop} (Processing Grade)
                  </h4>
                  <div className="text-xs text-stone-400 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-500" />
                    <span>{batch.farmerLocation} • Patil Farms</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-950 text-amber-400 border border-amber-800">
                  {batch.grade || 'Grade B'} (Puree / Flakes)
                </span>
              </div>

              {/* Zero-waste action highlights */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50 text-xs space-y-1">
                <span className="font-bold text-amber-300 flex items-center space-x-1">
                  <Factory className="w-3.5 h-3.5" />
                  <span>Processing Opportunity:</span>
                </span>
                <p className="text-stone-300 leading-relaxed text-xs">
                  {batch.bestUtilization?.reasoning || 'Ideal for automated pulp extraction, industrial ketchup formulation, or dehydration powder.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-[10px] text-stone-400 block font-semibold">Procurement Rate</span>
                  <span className="font-extrabold text-emerald-400 text-sm">₹14,500 / Ton</span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-[10px] text-stone-400 block font-semibold">Available Lot Volume</span>
                  <span className="font-extrabold text-white text-sm">4.2 Tons</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center space-x-2">
                <button
                  onClick={() => onNavigateTab('traceability', batch.batchId)}
                  className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition"
                >
                  Verify Lot Traceability
                </button>
                <button
                  onClick={() => onNavigateTab('marketplace')}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition shadow"
                >
                  Send Processing Offer
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
