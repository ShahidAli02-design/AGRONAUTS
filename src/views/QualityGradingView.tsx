import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  TrendingUp,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Factory,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { ProduceBatch, QualityReport, BestUtilizationDecision } from '../types';
import { ApiService } from '../services/api';
import { Language, translations } from '../i18n';

interface QualityGradingViewProps {
  batches: ProduceBatch[];
  initialBatchId?: string;
  lang: Language;
  onNavigateTab: (tab: string, contextId?: string) => void;
  onGradingCompleted?: () => void;
}

export const QualityGradingView: React.FC<QualityGradingViewProps> = ({
  batches,
  initialBatchId,
  lang,
  onNavigateTab,
  onGradingCompleted
}) => {
  const t = translations[lang];

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    initialBatchId || (batches[0] ? batches[0].batchId : '')
  );

  const activeBatch = batches.find(b => b.batchId === selectedBatchId) || batches[0];

  const [uploadedImage, setUploadedImage] = useState<string | null>(
    activeBatch?.imageUrl || null
  );

  const [isLoading, setIsLoading] = useState(false);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(
    activeBatch?.qualityReport || null
  );
  const [bestUtilization, setBestUtilization] = useState<BestUtilizationDecision | null>(
    activeBatch?.bestUtilization || null
  );

  useEffect(() => {
    if (activeBatch) {
      if (activeBatch.qualityReport) {
        setQualityReport(activeBatch.qualityReport);
      }
      if (activeBatch.bestUtilization) {
        setBestUtilization(activeBatch.bestUtilization);
      }
      if (activeBatch.imageUrl) {
        setUploadedImage(activeBatch.imageUrl);
      }
    }
  }, [selectedBatchId, activeBatch]);

  // Sample Produce Images for instant evaluation
  const sampleHarvestImages = [
    {
      title: 'Fresh Red Tomatoes (Export Grade)',
      crop: 'Tomato',
      url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Ripe Alphonso Mangoes',
      crop: 'Mango',
      url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Garwa Field Onions',
      crop: 'Onion',
      url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      runGrading(base64);
    };
    reader.readAsDataURL(file);
  };

  const runGrading = async (imageData: string) => {
    if (!activeBatch) return;
    setIsLoading(true);
    try {
      const res = await ApiService.gradeQuality(
        activeBatch.batchId,
        imageData,
        activeBatch.crop,
        activeBatch.totalQuantity
      );
      if (res.success) {
        setQualityReport(res.qualityReport);
        setBestUtilization(res.bestUtilization);
        if (onGradingCompleted) onGradingCompleted();
      }
    } catch (err) {
      console.error('Grading error:', err);
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
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              AI Produce Quality Grading &amp; Zero-Waste Engine
            </h2>
            <p className="text-xs text-stone-400">
              Computer vision standard inspection assigning Grade A, B, C breakdown and dynamic valorization.
            </p>
          </div>
        </div>

        {/* Mandatory Regulatory Disclaimers */}
        <div className="mt-3 p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-start space-x-2 text-xs text-amber-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span className="font-bold">Mandatory Standards Label: </span>
            <span>{t.disclaimers.grading} Economic and value calculations are estimated market projections.</span>
          </div>
        </div>
      </div>

      {/* Produce Batch Selector */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Select Harvest Batch to Inspect
          </span>
          <button
            onClick={() => onNavigateTab('harvest')}
            className="text-xs font-semibold text-stone-300 hover:text-white"
          >
            + Register New Harvest
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {batches.map((b) => (
            <button
              key={b.batchId}
              onClick={() => setSelectedBatchId(b.batchId)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                selectedBatchId === b.batchId
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950/40'
                  : 'bg-stone-800/60 border-stone-700 hover:bg-stone-800'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                  {b.batchId}
                </span>
                <span className="text-sm font-extrabold text-white block mt-0.5">
                  {b.crop} ({b.variety})
                </span>
                <span className="text-xs text-stone-400">
                  {b.totalQuantity} {b.unit} • {b.farmerLocation}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-stone-700/60 flex items-center justify-between text-[10px]">
                <span className="text-stone-400">{b.harvestDate}</span>
                <span className="px-2 py-0.5 rounded font-bold bg-stone-700 text-stone-200">
                  {b.grade || 'Uninspected'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload / Camera Interface */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center space-x-1.5">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Upload or Capture Harvest Produce Image for Batch: {selectedBatchId}</span>
          </div>

          <a
            href="/quality-detector"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera Viewfinder HUD</span>
          </a>
        </div>

        <div className="border-2 border-dashed border-stone-700 hover:border-emerald-500 rounded-2xl p-6 text-center transition bg-stone-950/40 relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Upload crate / produce photo</p>
              <p className="text-xs text-stone-400">Computer vision analyzes sizing, skin uniformity &amp; defects</p>
            </div>
          </div>
        </div>

        {/* Quick Sample Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Or test with verified harvest samples:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleHarvestImages.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUploadedImage(sample.url);
                  runGrading(sample.url);
                }}
                className="flex items-center space-x-3 p-2.5 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700 text-left transition"
              >
                <img
                  src={sample.url}
                  alt={sample.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{sample.title}</p>
                  <span className="text-[10px] text-emerald-400">Analyze Lot</span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Loading */}
      {isLoading && (
        <div className="p-8 text-center bg-stone-900 rounded-2xl border border-stone-800 space-y-3 animate-pulse">
          <RefreshCw className="w-8 h-8 mx-auto text-emerald-400 animate-spin" />
          <p className="text-sm font-bold text-white">AI Grading Engine analyzing batch metrics...</p>
          <p className="text-xs text-stone-400">Measuring color histograms, surface defects, diameter consistency, and spoilage indicators</p>
        </div>
      )}

      {/* Quality Grading Results */}
      {qualityReport && !isLoading && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                INSPECTION REPORT • BATCH {selectedBatchId}
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-0.5">
                Assigned: <span className="text-emerald-400">{qualityReport.assignedGrade}</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Analyzed at {new Date(qualityReport.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Confidence: {qualityReport.confidenceScore}%
              </p>
            </div>

            <div className="flex items-center space-x-3 self-start sm:self-auto">
              <div className="bg-stone-800/80 px-4 py-2 rounded-xl text-center border border-stone-700">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Quality Score</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {qualityReport.overallScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Grade Distribution Breakdown Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-stone-300">
              <span>Lot Grade Composition</span>
              <span className="text-stone-400 font-normal">Based on 100% optical sampling</span>
            </div>

            <div className="w-full bg-stone-800 h-3.5 rounded-full flex overflow-hidden">
              <div
                style={{ width: `${qualityReport.breakdown.gradeA}%` }}
                className="bg-emerald-500 transition-all flex items-center justify-center text-[9px] font-extrabold text-stone-950"
              >
                A: {qualityReport.breakdown.gradeA}%
              </div>
              <div
                style={{ width: `${qualityReport.breakdown.gradeB}%` }}
                className="bg-amber-500 transition-all flex items-center justify-center text-[9px] font-extrabold text-stone-950"
              >
                B: {qualityReport.breakdown.gradeB}%
              </div>
              <div
                style={{ width: `${qualityReport.breakdown.gradeC}%` }}
                className="bg-red-500 transition-all flex items-center justify-center text-[9px] font-extrabold text-white"
              >
                C: {qualityReport.breakdown.gradeC}%
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50">
                <span className="text-[10px] font-bold text-emerald-400 block">Grade A ({qualityReport.breakdown.gradeA}%)</span>
                <span className="text-[11px] text-stone-300">Direct Retail &amp; Export</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/50">
                <span className="text-[10px] font-bold text-amber-400 block">Grade B ({qualityReport.breakdown.gradeB}%)</span>
                <span className="text-[11px] text-stone-300">Food Processing / Puree</span>
              </div>
              <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-900/50">
                <span className="text-[10px] font-bold text-red-400 block">Grade C ({qualityReport.breakdown.gradeC}%)</span>
                <span className="text-[11px] text-stone-300">Solar Dehydration &amp; Feed</span>
              </div>
            </div>
          </div>

          {/* Detailed Metric Radar Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-800">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Size Uniformity</span>
              <span className="text-base font-extrabold text-white mt-0.5">{qualityReport.metrics.sizeUniformity}%</span>
              <span className="text-[10px] text-stone-500">55–65mm diameter</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-800">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Color Vibrancy</span>
              <span className="text-base font-extrabold text-emerald-400 mt-0.5">{qualityReport.metrics.colorVibrancy}%</span>
              <span className="text-[10px] text-stone-500">Uniform Lycopene</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-800">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Surface Defects</span>
              <span className="text-base font-extrabold text-teal-300 mt-0.5">&lt; {qualityReport.metrics.surfaceDefects}%</span>
              <span className="text-[10px] text-stone-500">Minimal scarring</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-800">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Firmness Index</span>
              <span className="text-base font-extrabold text-stone-100 mt-0.5">{qualityReport.metrics.firmnessIndex}%</span>
              <span className="text-[10px] text-stone-500">Turgid pericarp</span>
            </div>
          </div>

          {/* AI Findings Explanation */}
          <div className="p-4 rounded-xl bg-stone-800/40 border border-stone-800 text-xs space-y-1.5">
            <span className="font-bold text-stone-200">AI Explanation:</span>
            <p className="text-stone-300 leading-relaxed">{qualityReport.aiExplanation}</p>
          </div>

          {/* CORE USP: ZERO-WASTE ENGINE DECISION CARD */}
          {bestUtilization && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-stone-900 to-stone-900 border border-emerald-700/80 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-400">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>ZERO-WASTE BEST UTILIZATION ENGINE</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-stone-950 text-xs font-black">
                  BEST ACTION: {bestUtilization.bestAction}
                </span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-white">
                  {bestUtilization.actionTitle}
                </h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  {bestUtilization.reasoning}
                </p>
              </div>

              {/* Financial Value Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-700/80">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Direct Fresh Sale</span>
                  <div className="text-base font-extrabold text-stone-200 mt-0.5">
                    ₹{bestUtilization.estimatedDirectSaleValue.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-stone-500">Immediate wholesale liquidity</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-700/80">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Processing / Valorized Value</span>
                  <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                    ₹{bestUtilization.estimatedProcessingValue.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-stone-500">Contract puree / paste / flakes</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/80">
                  <span className="text-[10px] text-emerald-300 uppercase font-bold block">Potential Additional Value</span>
                  <div className="text-lg font-black text-emerald-300 mt-0.5">
                    +₹{bestUtilization.potentialAdditionalValue.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-emerald-400">Zero farmgate dump loss</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigateTab('marketplace')}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center justify-center space-x-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>List Grade A on Marketplace</span>
                </button>

                <button
                  onClick={() => onNavigateTab('marketplace')}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                >
                  <Factory className="w-4 h-4" />
                  <span>Allocate Grade B to Food Processor</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
