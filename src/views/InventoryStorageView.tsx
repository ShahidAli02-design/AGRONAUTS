import React, { useState } from 'react';
import {
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  Droplets,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Snowflake,
  Factory,
  RefreshCw
} from 'lucide-react';
import { ProduceBatch, StorageFacility } from '../types';
import { ApiService } from '../services/api';
import { Language, translations } from '../i18n';

interface InventoryStorageViewProps {
  batches: ProduceBatch[];
  storageFacilities: StorageFacility[];
  lang: Language;
  onNavigateTab: (tab: string, contextId?: string) => void;
  onInventoryUpdated?: () => void;
}

export const InventoryStorageView: React.FC<InventoryStorageViewProps> = ({
  batches,
  storageFacilities,
  lang,
  onNavigateTab,
  onInventoryUpdated
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Allocation modal state
  const [selectedBatch, setSelectedBatch] = useState<ProduceBatch | null>(null);
  const [allocationAction, setAllocationAction] = useState<'STORE' | 'PROCESS' | 'RELEASE_STORAGE'>('STORE');
  const [allocationQty, setAllocationQty] = useState<string>('2');
  const [allocationDestination, setAllocationDestination] = useState<string>('Nashik Cold Chain Chamber 2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocationError, setAllocationError] = useState<string | null>(null);
  const [allocationSuccess, setAllocationSuccess] = useState<string | null>(null);

  const filteredBatches = batches.filter(b => {
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (b.batchId || '').toLowerCase().includes(term) ||
      (b.crop || '').toLowerCase().includes(term) ||
      (b.variety || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAllocation = (batch: ProduceBatch) => {
    setSelectedBatch(batch);
    setAllocationAction('STORE');
    setAllocationQty(String(Math.min(2, batch.remainingQuantity || 1)));
    setAllocationDestination(storageFacilities[0]?.name || 'Nashik Cold Chain Chamber 2');
    setAllocationError(null);
    setAllocationSuccess(null);
  };

  const handleExecuteAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const numQty = parseFloat(allocationQty);
    if (isNaN(numQty) || numQty <= 0) {
      setAllocationError('Please enter a valid quantity greater than 0.');
      return;
    }

    if (allocationAction === 'STORE' || allocationAction === 'PROCESS') {
      if (numQty > selectedBatch.remainingQuantity) {
        setAllocationError(
          `Cannot allocate ${numQty} ${selectedBatch.unit}. Only ${selectedBatch.remainingQuantity} ${selectedBatch.unit} is available in unallocated inventory.`
        );
        return;
      }
    } else if (allocationAction === 'RELEASE_STORAGE') {
      const stored = selectedBatch.storedQuantity || 0;
      if (numQty > stored) {
        setAllocationError(
          `Cannot release ${numQty} ${selectedBatch.unit}. Currently stored: ${stored} ${selectedBatch.unit}.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    setAllocationError(null);

    try {
      const res = await ApiService.allocateInventory({
        batchId: selectedBatch.batchId,
        action: allocationAction,
        quantity: numQty,
        destination: allocationDestination
      });

      if (res.success) {
        setAllocationSuccess(res.message);
        setSelectedBatch(res.batch);
        if (onInventoryUpdated) {
          onInventoryUpdated();
        }
        setTimeout(() => {
          setSelectedBatch(null);
          setAllocationSuccess(null);
        }, 1500);
      } else {
        setAllocationError(res.message || 'Allocation failed');
      }
    } catch (err: any) {
      setAllocationError(err.message || 'Server error occurred during inventory allocation');
    } finally {
      setIsSubmitting(false);
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
              Produce Inventory Ledger &amp; Storage Optimization
            </h2>
            <p className="text-xs text-stone-400">
              Universal Batch ID tracking with strict inventory constraints: total quantity = remaining + stored + processing + sold.
            </p>
          </div>
        </div>
      </div>

      {/* Storage Facilities Telemetry Overview */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Storage Warehouse Telemetry &amp; Micro-climate Monitoring
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storageFacilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-white">{fac.name}</h4>
                  <span className="text-xs text-stone-400">{fac.location} • Type: {fac.type}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {Math.round((fac.currentOccupancyTons / fac.capacityTons) * 100)}% Occupied
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-800 flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-stone-400 block font-semibold">Chamber Temp</span>
                    <span className="font-extrabold text-stone-200">{fac.temperature}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-800 flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-stone-400 block font-semibold">Relative Humidity</span>
                    <span className="font-extrabold text-stone-200">{fac.humidity}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800">
                <span>Total Stored: {fac.currentOccupancyTons} / {fac.capacityTons} Tons</span>
                <span className="text-emerald-400 font-semibold">Sensor Active (Auto-Alerts On)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Produce Batches Ledger Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-300">
            Universal Produce Batch Ledger ({filteredBatches.length})
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Batch ID, crop..."
                className="pl-8 pr-3 py-1.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs"
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="HARVESTED">Harvested</option>
              <option value="INSPECTED">Inspected</option>
              <option value="STORED">Stored</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>
        </div>

        {/* Batch Cards */}
        <div className="space-y-4">
          {filteredBatches.map((batch) => {
            const riskColor =
              batch.storageTelemetry?.spoilageRisk === 'HIGH'
                ? 'text-red-400 bg-red-950/80 border-red-800'
                : batch.storageTelemetry?.spoilageRisk === 'MEDIUM'
                ? 'text-amber-400 bg-amber-950/80 border-amber-800'
                : 'text-emerald-400 bg-emerald-950/80 border-emerald-800';

            const storedQty = batch.storedQuantity || 0;
            const processingQty = batch.processingQuantity || 0;
            const soldQty = batch.soldQuantity || 0;

            return (
              <div
                key={batch.batchId}
                className="p-5 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/80 space-y-3.5 transition shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-extrabold text-emerald-400 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-700">
                      {batch.batchId}
                    </span>
                    <h4 className="text-sm font-extrabold text-white">
                      {batch.crop} ({batch.variety})
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-stone-700 text-stone-200">
                      {batch.grade || 'Pending Grade'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${riskColor}`}>
                      Risk: {batch.storageTelemetry?.spoilageRisk || 'LOW'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Status: {batch.status}
                    </span>
                  </div>
                </div>

                {/* Quantitative Strict Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block font-semibold">Total Harvest</span>
                    <span className="font-extrabold text-white text-sm">
                      {batch.totalQuantity} {batch.unit}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                    <span className="text-[10px] text-emerald-400 block font-semibold">Available Unallocated</span>
                    <span className="font-extrabold text-emerald-300 text-sm">
                      {batch.remainingQuantity} {batch.unit}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-800/60">
                    <span className="text-[10px] text-sky-400 block font-semibold">In Cold Storage</span>
                    <span className="font-extrabold text-sky-300 text-sm">
                      {storedQty} {batch.unit}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/60">
                    <span className="text-[10px] text-purple-400 block font-semibold">In Processing</span>
                    <span className="font-extrabold text-purple-300 text-sm">
                      {processingQty} {batch.unit}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-amber-400 block font-semibold">Sold to Buyers</span>
                    <span className="font-extrabold text-amber-300 text-sm">
                      {soldQty} {batch.unit}
                    </span>
                  </div>
                </div>

                {/* Storage & Zero-Waste Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-stone-900/60 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block font-semibold">Storage Location</span>
                    <span className="font-semibold text-stone-200 truncate block">
                      {batch.storageLocation || batch.storageTelemetry?.facilityName || 'On-farm ventilated shed'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-stone-900/60 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block font-semibold">Estimated Shelf Life</span>
                    <span className="font-extrabold text-amber-300">
                      {batch.storageTelemetry?.estimatedShelfLifeDays || 8} Days Remaining
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-stone-900/60 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block font-semibold">AI Recommendation</span>
                    <span className="font-bold text-emerald-400 truncate block">
                      {batch.storageTelemetry?.recommendedAction || 'Monitor & List'}
                    </span>
                  </div>
                </div>

                {/* Zero-Waste Action Reminder if Grade B/C */}
                {batch.bestUtilization && (
                  <div className="text-[11px] bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/60 text-stone-300 flex items-center justify-between">
                    <span>
                      <strong className="text-emerald-400">Zero-Waste Engine: </strong>
                      {batch.bestUtilization.actionTitle}
                    </span>
                    <span className="text-emerald-300 font-bold">
                      +₹{batch.bestUtilization.potentialAdditionalValue.toLocaleString('en-IN')} added
                    </span>
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-700/60">
                  <button
                    onClick={() => handleOpenAllocation(batch)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1.5 shadow"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Allocate Inventory</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('qualityGrading', batch.batchId)}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition"
                  >
                    Inspect Quality
                  </button>

                  <button
                    onClick={() => onNavigateTab('traceability', batch.batchId)}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-700 text-sky-400 text-xs font-semibold rounded-lg transition"
                  >
                    View Traceability
                  </button>

                  <button
                    onClick={() => onNavigateTab('marketplace')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition ml-auto"
                  >
                    Match Buyers / Processors
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: INVENTORY ALLOCATION DRAWER */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  {selectedBatch.batchId}
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Allocate Inventory: {selectedBatch.crop} ({selectedBatch.variety})
                </h3>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Inventory Snapshot */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-stone-800/60 border border-stone-700">
              <div>
                <span className="text-[10px] text-stone-400 block font-semibold">Total Harvest</span>
                <span className="font-extrabold text-white">{selectedBatch.totalQuantity} {selectedBatch.unit}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 block font-semibold">Unallocated</span>
                <span className="font-extrabold text-emerald-300">{selectedBatch.remainingQuantity} {selectedBatch.unit}</span>
              </div>
              <div>
                <span className="text-[10px] text-sky-400 block font-semibold">Stored</span>
                <span className="font-extrabold text-sky-300">{selectedBatch.storedQuantity || 0} {selectedBatch.unit}</span>
              </div>
            </div>

            <form onSubmit={handleExecuteAllocation} className="space-y-4 text-xs">
              {/* Action Selection Tabs */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-300 block">Select Allocation Destination:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAllocationAction('STORE');
                      setAllocationError(null);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center justify-center space-y-1 transition ${
                      allocationAction === 'STORE'
                        ? 'bg-sky-950 text-sky-300 border-sky-600'
                        : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:bg-stone-800'
                    }`}
                  >
                    <Snowflake className="w-4 h-4" />
                    <span>Cold Storage</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAllocationAction('PROCESS');
                      setAllocationError(null);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center justify-center space-y-1 transition ${
                      allocationAction === 'PROCESS'
                        ? 'bg-purple-950 text-purple-300 border-purple-600'
                        : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:bg-stone-800'
                    }`}
                  >
                    <Factory className="w-4 h-4" />
                    <span>Food Processing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAllocationAction('RELEASE_STORAGE');
                      setAllocationError(null);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center justify-center space-y-1 transition ${
                      allocationAction === 'RELEASE_STORAGE'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                        : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:bg-stone-800'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Release Storage</span>
                  </button>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-300">
                    Quantity to Allocate ({selectedBatch.unit}):
                  </label>
                  <span className="text-[10px] text-stone-400">
                    {allocationAction === 'RELEASE_STORAGE'
                      ? `Max Stored: ${selectedBatch.storedQuantity || 0} ${selectedBatch.unit}`
                      : `Max Available: ${selectedBatch.remainingQuantity} ${selectedBatch.unit}`}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={
                      allocationAction === 'RELEASE_STORAGE'
                        ? selectedBatch.storedQuantity || 0
                        : selectedBatch.remainingQuantity
                    }
                    value={allocationQty}
                    onChange={(e) => setAllocationQty(e.target.value)}
                    className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold text-sm focus:ring-1 focus:ring-emerald-500"
                    required
                  />

                  {/* Quick Preset Buttons */}
                  <button
                    type="button"
                    onClick={() => {
                      const max =
                        allocationAction === 'RELEASE_STORAGE'
                          ? selectedBatch.storedQuantity || 0
                          : selectedBatch.remainingQuantity;
                      setAllocationQty(String(Math.round((max * 0.5) * 10) / 10));
                    }}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-semibold text-xs border border-stone-700"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const max =
                        allocationAction === 'RELEASE_STORAGE'
                          ? selectedBatch.storedQuantity || 0
                          : selectedBatch.remainingQuantity;
                      setAllocationQty(String(max));
                    }}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-emerald-400 rounded-xl font-bold text-xs border border-stone-700"
                  >
                    100%
                  </button>
                </div>
              </div>

              {/* Destination Facility / Processor Unit */}
              {allocationAction === 'STORE' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Storage Facility:</label>
                  <select
                    value={allocationDestination}
                    onChange={(e) => setAllocationDestination(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs font-semibold"
                  >
                    {storageFacilities.map((fac) => (
                      <option key={fac.id} value={fac.name}>
                        {fac.name} ({fac.location} • {fac.type})
                      </option>
                    ))}
                    <option value="On-Farm Aerated Shed">On-Farm Aerated Shed (Ambient)</option>
                  </select>
                </div>
              )}

              {allocationAction === 'PROCESS' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Target Processing Facility:</label>
                  <select
                    value={allocationDestination}
                    onChange={(e) => setAllocationDestination(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs font-semibold"
                  >
                    <option value="Sahyadri Agro-Processing Cluster">Sahyadri Agro-Processing Cluster (Puree/Paste)</option>
                    <option value="Nashik Solar Dehydration Unit">Nashik Solar Dehydration Unit (Dried Flakes)</option>
                    <option value="Mahindra Bio-Fertilizer Fermentation Unit">Bio-Fertilizer Fermentation Unit (Zero-Waste)</option>
                  </select>
                </div>
              )}

              {/* Feedback Alerts */}
              {allocationError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{allocationError}</span>
                </div>
              )}

              {allocationSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{allocationSuccess}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBatch(null)}
                  className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing Ledger...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Allocation</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
