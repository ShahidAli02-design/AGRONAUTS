import React, { useState } from 'react';
import {
  Layers,
  Search,
  CheckCircle2,
  Package,
  Sparkles,
  TrendingUp,
  MapPin,
  Calendar,
  ShieldCheck,
  QrCode,
  Truck,
  Factory,
  ShoppingBag
} from 'lucide-react';
import { ProduceBatch } from '../types';
import { Language, translations } from '../i18n';

interface TraceabilityViewProps {
  batches: ProduceBatch[];
  initialBatchId?: string;
  lang: Language;
  onNavigateTab: (tab: string, contextId?: string) => void;
}

export const TraceabilityView: React.FC<TraceabilityViewProps> = ({
  batches,
  initialBatchId,
  lang,
  onNavigateTab
}) => {
  const t = translations[lang];

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    initialBatchId || (batches[0] ? batches[0].batchId : '')
  );

  const activeBatch = batches.find(b => b.batchId === selectedBatchId) || batches[0];

  const timelineSteps = [
    {
      stage: '1. PLAN & SOIL',
      date: 'Dec 10, 2025',
      title: 'Precision Soil Calibration & Seed Sourcing',
      desc: 'Soil tested: Black Clay Vertisol with pH 7.2, NPK 240:45:320 kg/ha. Certified Arka Rakshak F1 hybrid seeds sourced with triple-wilt resistance.',
      actor: 'Farmer Balasaheb Patil',
      verified: true
    },
    {
      stage: '2. GROW & CARE',
      date: 'Jan 15, 2026',
      title: 'Micro-Irrigation & AI Disease Sentinel',
      desc: '100% drip fertigation logged. Early Blight symptom detected on Day 34 via AI vision and halted within 48 hours using biological Trichoderma + NSKE spray.',
      actor: 'Agronauts Vision AI',
      verified: true
    },
    {
      stage: '3. HARVEST',
      date: activeBatch?.harvestDate || 'Feb 28, 2026',
      title: `Commercial Farmgate Harvest — ${activeBatch?.totalQuantity} Tons`,
      desc: `Carefully handpicked at turning / pink breaker maturity stage between 06:00 AM and 09:30 AM to prevent heat respiration. Universal Batch ID generated.`,
      actor: 'Patil Organic Farms, Nashik',
      verified: true
    },
    {
      stage: '4. AI QUALITY GRADING',
      date: activeBatch?.harvestDate || 'Feb 28, 2026',
      title: `Computer Vision Grading — Grade: ${activeBatch?.grade || 'Grade A'}`,
      desc: `Visual inspection score: ${activeBatch?.qualityReport?.overallScore || 92}/100. Lot breakdown: ${activeBatch?.qualityReport?.breakdown.gradeA || 65}% Grade A, ${activeBatch?.qualityReport?.breakdown.gradeB || 28}% Grade B.`,
      actor: 'Multimodal Gemini Vision Model',
      verified: true
    },
    {
      stage: '5. STORAGE & ZERO-WASTE',
      date: 'Mar 01, 2026',
      title: 'Cold Storage & Zero-Waste Valorization',
      desc: `Grade A pre-cooled in Cold Chamber 2 at 12°C. Grade B routed directly to Kisan Agro Foods Processing Unit for tomato paste, avoiding ₹37,000 in dump waste.`,
      actor: 'Agronauts Zero-Waste Engine',
      verified: true
    },
    {
      stage: '6. DISPATCH & SALE',
      date: 'Mar 02, 2026',
      title: 'Smart Buyer Match & Escrow Settlement',
      desc: `Matched to FreshDirect Wholesale Mumbai at ₹24,500/Ton. Full traceability passport digitally verified by buyer; payment released directly to farmer account.`,
      actor: 'Agronauts Smart Escrow',
      verified: true
    }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-xl bg-sky-950 text-sky-400 border border-sky-800">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              End-to-End Supply Chain Traceability &amp; Digital Passport
            </h2>
            <p className="text-xs text-stone-400">
              Universal Batch ID verification from soil preparation to retail sale and buyer digital sign-off.
            </p>
          </div>
        </div>
      </div>

      {/* Batch Selector Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Select Universal Batch ID to Audit
        </span>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {batches.map((b) => (
            <button
              key={b.batchId}
              onClick={() => setSelectedBatchId(b.batchId)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition shrink-0 ${
                selectedBatchId === b.batchId
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700'
              }`}
            >
              {b.batchId} ({b.crop})
            </button>
          ))}
        </div>
      </div>

      {/* Digital Passport Card */}
      {activeBatch && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-stone-900 to-stone-900 border border-emerald-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                VERIFIED DIGITAL PRODUCE PASSPORT
              </span>
              <h3 className="text-xl sm:text-2xl font-mono font-black text-white mt-0.5">
                {activeBatch.batchId}
              </h3>
              <p className="text-xs text-stone-300 mt-1">
                {activeBatch.crop} • {activeBatch.variety} • Harvested {activeBatch.harvestDate}
              </p>
            </div>

            <div className="flex items-center space-x-4 shrink-0">
              <div className="w-20 h-20 bg-white p-1.5 rounded-xl shadow-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-stone-950" />
              </div>
              <div className="text-left text-xs space-y-0.5">
                <span className="text-[10px] text-stone-400 block font-semibold">Verification Key</span>
                <span className="font-mono text-emerald-400 font-bold text-xs">AGR-VERIFIED</span>
                <span className="text-[10px] text-stone-400 block">Scan to audit provenance</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
              <span className="text-[10px] text-stone-400 block font-semibold">Farmer &amp; Origin</span>
              <span className="font-bold text-white block mt-0.5">{activeBatch.farmerName}</span>
              <span className="text-[10px] text-stone-400">{activeBatch.farmerLocation}</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
              <span className="text-[10px] text-stone-400 block font-semibold">Quality Standard</span>
              <span className="font-bold text-emerald-400 block mt-0.5">{activeBatch.grade || 'Grade A'}</span>
              <span className="text-[10px] text-stone-400">AI Visual Score: {activeBatch.qualityReport?.overallScore || 92}/100</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
              <span className="text-[10px] text-stone-400 block font-semibold">Cold Chain Status</span>
              <span className="font-bold text-teal-300 block mt-0.5">12°C Controlled</span>
              <span className="text-[10px] text-stone-400">Reefer Transit Logged</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
              <span className="text-[10px] text-stone-400 block font-semibold">Fair Price Settlement</span>
              <span className="font-bold text-stone-200 block mt-0.5">₹24,500 / Ton</span>
              <span className="text-[10px] text-emerald-400">Escrow Direct Bank Settled</span>
            </div>
          </div>
        </div>
      )}

      {/* Vertical Step-by-Step Timeline */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Chronological Lifecycle Milestones
        </h3>

        <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-800">
          {timelineSteps.map((step, idx) => (
            <div key={idx} className="relative flex items-start space-x-4 group">
              
              {/* Node bullet */}
              <div className="w-8 h-8 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow">
                <CheckCircle2 className="w-4 h-4" />
              </div>

              {/* Node Body */}
              <div className="flex-1 p-4 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1.5 transition group-hover:border-emerald-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {step.stage} • {step.date}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Logged by: <strong className="text-stone-200">{step.actor}</strong>
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-white">
                  {step.title}
                </h4>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
