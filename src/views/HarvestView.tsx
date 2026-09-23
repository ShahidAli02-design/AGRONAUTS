import React, { useState } from 'react';
import {
  Package,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Tag
} from 'lucide-react';
import { ProduceBatch, FarmerProfile } from '../types';
import { ApiService } from '../services/api';
import { Language, translations } from '../i18n';

interface HarvestViewProps {
  batches: ProduceBatch[];
  profile: FarmerProfile;
  lang: Language;
  onNavigateTab: (tab: string, contextId?: string) => void;
  onHarvestCreated: () => void;
}

export const HarvestView: React.FC<HarvestViewProps> = ({
  batches,
  profile,
  lang,
  onNavigateTab,
  onHarvestCreated
}) => {
  const t = translations[lang];

  const [formData, setFormData] = useState({
    crop: 'Tomato',
    variety: 'Arka Rakshak F1',
    harvestDate: new Date().toISOString().split('T')[0],
    quantity: '15',
    unit: 'Tons',
    location: profile.location || 'Nashik, Maharashtra',
    expectedQuality: 'Grade A',
    storageRequirement: 'Cold Storage Chamber 2 (11°C - 13°C)'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [newlyCreatedBatch, setNewlyCreatedBatch] = useState<ProduceBatch | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await ApiService.registerHarvest(formData);
      if (res.success && res.batch) {
        setNewlyCreatedBatch(res.batch);
        onHarvestCreated();
      }
    } catch (err) {
      console.error('Harvest registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Harvest Registration &amp; Produce Batch Generator
            </h2>
            <p className="text-xs text-stone-400">
              Registers harvested produce and generates a Universal Batch ID that connects grading, inventory, storage, zero-waste processing, and sale.
            </p>
          </div>
        </div>
      </div>

      {/* Success Banner when batch is created */}
      {newlyCreatedBatch && (
        <div className="bg-emerald-950 border border-emerald-700/80 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Universal Produce Batch ID Generated Successfully!</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950/80 p-4 rounded-xl border border-emerald-800">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-mono block">Central Ecosystem Key</span>
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-400">
                {newlyCreatedBatch.batchId}
              </span>
              <p className="text-xs text-stone-300 mt-0.5">
                {newlyCreatedBatch.crop} • {newlyCreatedBatch.totalQuantity} {newlyCreatedBatch.unit} • {newlyCreatedBatch.farmerLocation}
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('qualityGrading', newlyCreatedBatch.batchId)}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-xs rounded-xl transition shadow-lg flex items-center justify-center space-x-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Perform AI Quality Grading Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
          <Tag className="w-4 h-4" />
          <span>Harvest Lot Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          
          <div>
            <label className="block text-stone-400 font-semibold mb-1">Harvested Crop</label>
            <select
              value={formData.crop}
              onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold"
            >
              <option value="Tomato">Tomato</option>
              <option value="Mango">Mango</option>
              <option value="Onion">Onion</option>
              <option value="Wheat">Wheat</option>
              <option value="Potato">Potato</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-400 font-semibold mb-1">Variety / Cultivar</label>
            <input
              type="text"
              value={formData.variety}
              onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-stone-400 font-semibold mb-1">Harvest Date</label>
            <input
              type="date"
              value={formData.harvestDate}
              onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-stone-400 font-semibold mb-1">Harvest Quantity</label>
            <input
              type="number"
              step="0.5"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-stone-400 font-semibold mb-1">Unit of Measurement</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold"
            >
              <option value="Tons">Tons (Metric)</option>
              <option value="Quintals">Quintals (100 kg)</option>
              <option value="Kg">Kilograms (Kg)</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-400 font-semibold mb-1">Origin Farm Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-stone-400 font-semibold mb-1">Storage / Initial Staging Requirement</label>
            <input
              type="text"
              value={formData.storageRequirement}
              onChange={(e) => setFormData({ ...formData, storageRequirement: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold"
              placeholder="e.g. Ventilated Chawl, Cold Storage 12°C, On-farm Shaded Shed"
            />
          </div>

        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow flex items-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>{isLoading ? 'Generating Batch ID...' : 'Register Harvest & Create Batch ID'}</span>
          </button>
        </div>
      </form>

      {/* Existing Registered Produce Batches */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Active Registered Produce Batches ({batches.length})
          </span>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            View Full Inventory
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {batches.map((batch) => (
            <div
              key={batch.batchId}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                    {batch.batchId}
                  </span>
                  <h4 className="text-base font-extrabold text-white">
                    {batch.crop} ({batch.variety})
                  </h4>
                  <div className="text-[11px] text-stone-400">
                    Harvested: {batch.harvestDate} • {batch.farmerLocation}
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {batch.grade || 'Pending Grade'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">Total Qty</span>
                  <span className="font-extrabold text-white">{batch.totalQuantity} {batch.unit}</span>
                </div>

                <div className="p-2 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">Remaining</span>
                  <span className="font-extrabold text-emerald-400">{batch.remainingQuantity} {batch.unit}</span>
                </div>

                <div className="p-2 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">Status</span>
                  <span className="font-extrabold text-amber-400">{batch.status}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1 border-t border-stone-800">
                <button
                  onClick={() => onNavigateTab('qualityGrading', batch.batchId)}
                  className="flex-1 py-1.5 bg-stone-800 hover:bg-emerald-900/60 hover:text-emerald-300 text-stone-200 text-xs font-semibold rounded-lg transition text-center"
                >
                  Grade AI
                </button>

                <button
                  onClick={() => onNavigateTab('traceability', batch.batchId)}
                  className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition text-center"
                >
                  Traceability
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
