import React, { useState } from 'react';
import {
  Sprout,
  Sun,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { CropPlan } from '../types';
import { ApiService } from '../services/api';
import { Language, translations } from '../i18n';

interface CropMonitoringViewProps {
  crops: CropPlan[];
  initialCropId?: string;
  lang: Language;
  onNavigateTab: (tab: string, contextId?: string) => void;
  onTaskToggled?: () => void;
}

export const CropMonitoringView: React.FC<CropMonitoringViewProps> = ({
  crops,
  initialCropId,
  lang,
  onNavigateTab,
  onTaskToggled
}) => {
  const t = translations[lang];
  const [selectedCropId, setSelectedCropId] = useState<string>(
    initialCropId || (crops[0] ? crops[0].id : '')
  );

  const activeCrop = crops.find(c => c.id === selectedCropId) || crops[0];

  const handleToggleTask = async (taskId: string) => {
    if (!activeCrop) return;
    try {
      await ApiService.toggleTask(activeCrop.id, taskId);
      if (onTaskToggled) onTaskToggled();
    } catch (e) {
      console.error(e);
    }
  };

  if (!activeCrop) {
    return (
      <div className="p-8 text-center text-stone-400 bg-stone-900 rounded-2xl border border-stone-800">
        <Sprout className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
        <p className="text-sm">No active crops registered yet.</p>
        <button
          onClick={() => onNavigateTab('cropPlanning')}
          className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Plan New Crop
        </button>
      </div>
    );
  }

  const stages = [
    'Germination',
    'Vegetative',
    'Flowering',
    'Fruit Formation',
    'Maturity / Ripening'
  ];

  const currentStageIndex = stages.indexOf(activeCrop.growthStage);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Crop Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-stone-800">
        {crops.map((crop) => (
          <button
            key={crop.id}
            onClick={() => setSelectedCropId(crop.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
              selectedCropId === crop.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
            }`}
          >
            <span>🌱</span>
            <span>{crop.cropName}</span>
            <span className="text-[10px] opacity-75 font-normal">({crop.variety.split(' ')[0]})</span>
          </button>
        ))}

        <button
          onClick={() => onNavigateTab('cropPlanning')}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-emerald-400 border border-dashed border-emerald-800 flex items-center space-x-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Crop</span>
        </button>
      </div>

      {/* Main Dynamic Crop Dashboard Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Dynamic Crop Lifecycle Dashboard
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              {activeCrop.cropName} — {activeCrop.variety}
            </h2>
            <div className="text-xs text-stone-400 mt-0.5">
              Cultivated on {activeCrop.landArea} Acres • Sown on {activeCrop.sowingDate} • Harvest: {activeCrop.expectedHarvestDate}
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onNavigateTab('diseaseDetection')}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>AI Disease Scan</span>
            </button>

            <button
              onClick={() => onNavigateTab('yieldPrediction')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Yield Forecast</span>
            </button>
          </div>
        </div>

        {/* Growth Stage Progress Visualizer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">
              Day {activeCrop.currentDay} of {activeCrop.totalDays} ({Math.round((activeCrop.currentDay / activeCrop.totalDays) * 100)}% Completed)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold">
              Current Stage: {activeCrop.growthStage}
            </span>
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stage} className="text-center">
                  <div
                    className={`h-2 rounded-full mb-1 transition-all ${
                      isPast || isCurrent
                        ? 'bg-emerald-500'
                        : 'bg-stone-800'
                    }`}
                  />
                  <span
                    className={`text-[9px] block truncate font-medium ${
                      isCurrent
                        ? 'text-emerald-400 font-bold'
                        : isPast
                        ? 'text-stone-300'
                        : 'text-stone-600'
                    }`}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6 Grid Real-Time Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          
          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-800 text-center">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Health Score</span>
            <div className="text-base font-extrabold text-emerald-400 mt-1">{activeCrop.healthScore}%</div>
            <span className="text-[9px] text-stone-500">Optimum Vigor</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-800 text-center">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Water Need</span>
            <div className="text-base font-extrabold text-sky-400 mt-1">{activeCrop.waterRequirement}</div>
            <span className="text-[9px] text-stone-500">Drip Scheduled</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-800 text-center">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Disease Alert</span>
            <div className="text-base font-extrabold text-amber-400 mt-1">{activeCrop.diseaseRisk}</div>
            <span className="text-[9px] text-stone-500">Low Fungal Index</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-800 text-center">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Market Price</span>
            <div className="text-base font-extrabold text-stone-100 mt-1">₹{activeCrop.marketPriceEstimate}</div>
            <span className="text-[9px] text-stone-500">Per Quintal</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-800 text-center">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Market Demand</span>
            <div className="text-base font-extrabold text-emerald-400 mt-1">{activeCrop.marketDemand}</div>
            <span className="text-[9px] text-stone-500">Metro Deficit</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-800 text-center">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Est. Yield</span>
            <div className="text-base font-extrabold text-teal-300 mt-1">
              {activeCrop.expectedYieldMin}–{activeCrop.expectedYieldMax}T
            </div>
            <span className="text-[9px] text-stone-500">High Pack-out</span>
          </div>

        </div>

      </div>

      {/* Two Columns: Environmental Advisory & Dynamic Agronomic Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weather & Soil Advisory */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Environmental &amp; Soil Calibration</span>
          </h3>

          <div className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-700/60 text-xs space-y-1.5">
            <span className="font-bold text-stone-200">Weather Forecast:</span>
            <p className="text-stone-300 text-xs leading-relaxed">{activeCrop.weatherSummary}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-700/60 text-xs space-y-1.5">
            <span className="font-bold text-stone-200">Soil Condition:</span>
            <p className="text-stone-300 text-xs leading-relaxed">{activeCrop.soilCondition}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs space-y-1">
            <span className="font-bold text-emerald-400 flex items-center space-x-1">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Smart Irrigation Advisory</span>
            </span>
            <p className="text-[11px] text-stone-300">
              Run drip cycle for 45 minutes at 07:00 AM. Add water-soluble Potassium Nitrate (13:0:45) at 3g/L to support rapid fruit sizing.
            </p>
          </div>
        </div>

        {/* Dynamic Task Checklist */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Agronomic Schedule &amp; Actions</span>
            </h3>
            <span className="text-[10px] text-stone-400 font-mono">
              {activeCrop.tasks.filter(t => t.completed).length} / {activeCrop.tasks.length} Completed
            </span>
          </div>

          <div className="space-y-2">
            {activeCrop.tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`flex items-start justify-between p-3 rounded-xl border transition cursor-pointer ${
                  task.completed
                    ? 'bg-stone-950/60 border-stone-800 opacity-60'
                    : 'bg-stone-800/60 border-stone-700/80 hover:border-emerald-700'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}}
                    className="mt-1 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                  />
                  <div>
                    <p className={`text-xs font-semibold ${task.completed ? 'line-through text-stone-400' : 'text-stone-100'}`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] text-stone-400">Target: {task.dueDate}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    task.priority === 'High'
                      ? 'bg-red-950 text-red-400 border border-red-900'
                      : 'bg-stone-700 text-stone-300'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('harvest')}
            className="w-full mt-2 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
          >
            <span>Proceed to Harvest Registration</span>
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>

      </div>

    </div>
  );
};
