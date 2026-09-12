import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Package,
  Sparkles,
  ShoppingBag,
  Factory,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Tag,
  MapPin,
  Clock
} from 'lucide-react';
import { ProduceBatch, BuyerMatch } from '../types';
import { ApiService } from '../services/api';
import { Language, translations } from '../i18n';

interface MarketplaceViewProps {
  batches: ProduceBatch[];
  buyerMatches: BuyerMatch[];
  lang: Language;
  onNavigateTab: (tab: string, contextId?: string) => void;
  onOrderCreated: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  batches,
  buyerMatches,
  lang,
  onNavigateTab,
  onOrderCreated
}) => {
  const t = translations[lang];
  const [selectedCropFilter, setSelectedCropFilter] = useState('ALL');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'MATCHES' | 'LISTINGS'>('MATCHES');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Direct Procurement Order Modal state
  const [procureBatch, setProcureBatch] = useState<ProduceBatch | null>(null);
  const [procureQty, setProcureQty] = useState<string>('2');
  const [procureBuyerName, setProcureBuyerName] = useState<string>('FreshMart Wholesalers');
  const [procureBuyerType, setProcureBuyerType] = useState<'SUPERMARKET' | 'WHOLESALER' | 'PROCESSOR'>('WHOLESALER');
  const [procureDestination, setProcureDestination] = useState<string>('Vashi APMC Central Terminal, Mumbai');
  const [isProcuring, setIsProcuring] = useState(false);
  const [procureError, setProcureError] = useState<string | null>(null);

  const filteredBatches = batches.filter(b => {
    const matchesCrop = selectedCropFilter === 'ALL' || b.crop === selectedCropFilter;
    const matchesGrade = selectedGradeFilter === 'ALL' || b.grade === selectedGradeFilter;
    return matchesCrop && matchesGrade;
  });

  const handleOpenProcureModal = (batch: ProduceBatch) => {
    setProcureBatch(batch);
    setProcureQty(String(Math.min(2, batch.remainingQuantity || 1)));
    setProcureError(null);
  };

  const handleExecuteDirectOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procureBatch) return;

    const numQty = parseFloat(procureQty);
    if (isNaN(numQty) || numQty <= 0) {
      setProcureError('Please enter a valid procurement quantity greater than 0.');
      return;
    }

    if (numQty > procureBatch.remainingQuantity) {
      setProcureError(
        `Cannot procure ${numQty} ${procureBatch.unit}. Only ${procureBatch.remainingQuantity} ${procureBatch.unit} is available in this lot.`
      );
      return;
    }

    setIsProcuring(true);
    setProcureError(null);

    try {
      const price = procureBatch.marketPrice || procureBatch.basePricePerUnit || 24500;
      const res = await ApiService.createOrder({
        batchId: procureBatch.batchId,
        quantity: numQty,
        buyerName: procureBuyerName,
        buyerType: procureBuyerType,
        destinationAddress: procureDestination,
        unitPrice: price
      });

      if (res.success) {
        setActionSuccess(`Procurement order placed! ₹${(numQty * price).toLocaleString('en-IN')} escrow deposited.`);
        onOrderCreated();
        setProcureBatch(null);
        setTimeout(() => {
          onNavigateTab('orders');
        }, 1200);
      } else {
        setProcureError((res as any).message || 'Failed to place procurement order');
      }
    } catch (err: any) {
      setProcureError(err.message || 'Error occurred while creating order');
    } finally {
      setIsProcuring(false);
    }
  };

  const handleCreateOrderFromMatch = async (match: BuyerMatch) => {
    try {
      const res = await ApiService.createOrder({
        batchId: match.batchId,
        crop: match.cropRequired,
        grade: match.gradeRequired,
        quantity: match.quantityRequired,
        unit: 'Tons',
        buyerId: match.buyerId,
        buyerName: match.buyerName,
        buyerType: match.buyerType,
        totalAmount: match.quantityRequired * match.offeredPricePerUnit
      });

      if (res.success) {
        setActionSuccess(`Order initiated with ${match.buyerName}! Escrow funded (₹${(match.quantityRequired * match.offeredPricePerUnit).toLocaleString('en-IN')}).`);
        onOrderCreated();
        setTimeout(() => {
          onNavigateTab('orders');
        }, 1200);
      }
    } catch (e) {
      console.error('Order creation error:', e);
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
              Smart Produce Marketplace &amp; Algorithmic Matchmaking
            </h2>
            <p className="text-xs text-stone-400">
              Direct fair-value connections with supermarket wholesalers (Grade A) and food processing units (Grade B/C) with zero middleman commissions.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('MATCHES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'MATCHES'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
              : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Buyer &amp; Processor Matches ({buyerMatches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LISTINGS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'LISTINGS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
              : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Active Produce Lots ({batches.length})</span>
        </button>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* SMART MATCHES VIEW */}
      {activeTab === 'MATCHES' && (
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>AI Match Engine — Calibrated by Distance, Grade &amp; Shelf-Life</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buyerMatches.map((match) => {
              const isProcessor = match.buyerType === 'Processor';
              const matchPercentageColor =
                match.matchScore >= 90 ? 'text-emerald-400 bg-emerald-950 border-emerald-800' : 'text-amber-400 bg-amber-950 border-amber-800';

              return (
                <div
                  key={match.id}
                  className="bg-stone-900 border border-stone-800 hover:border-emerald-700/60 rounded-2xl p-5 shadow-sm space-y-4 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2.5">
                        <div className={`p-2 rounded-xl shrink-0 ${isProcessor ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                          {isProcessor ? <Factory className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-extrabold text-white">{match.buyerName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                              {match.buyerType}
                            </span>
                          </div>
                          <div className="text-xs text-stone-400 flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-stone-500" />
                            <span>{match.location} ({match.distanceKm} km transit)</span>
                          </div>
                        </div>
                      </div>

                      <div className={`px-2.5 py-1 rounded-xl border font-mono font-extrabold text-xs ${matchPercentageColor}`}>
                        {match.matchScore}% MATCH
                      </div>
                    </div>

                    {/* Requirements details */}
                    <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Demand Lot:</span>
                        <span className="font-bold text-white">
                          {match.quantityRequired} Tons {match.cropRequired} ({match.gradeRequired})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Offered Farmgate Price:</span>
                        <span className="font-extrabold text-emerald-400">
                          ₹{match.offeredPricePerUnit.toLocaleString('en-IN')} / Ton
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Estimated Total Payout:</span>
                        <span className="font-extrabold text-teal-300">
                          ₹{(match.quantityRequired * match.offeredPricePerUnit).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Why Matched */}
                    <div className="text-xs text-stone-300 bg-stone-950/40 p-2.5 rounded-lg border border-stone-800">
                      <span className="font-bold text-emerald-400 text-[11px]">Match Rationale: </span>
                      <span className="text-stone-300 text-[11px] leading-relaxed">{match.reasonForMatch}</span>
                    </div>

                    <div className="text-[10px] text-stone-400 font-mono">
                      Matched to your Batch: <span className="text-emerald-400 font-bold">{match.batchId}</span>
                    </div>
                  </div>

                  {/* Accept / Send Request Button */}
                  <div className="pt-3 border-t border-stone-800">
                    <button
                      onClick={() => handleCreateOrderFromMatch(match)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Match &amp; Create Escrow Order</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ALL PRODUCE LISTINGS VIEW */}
      {activeTab === 'LISTINGS' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
              Your Marketplace Produce Lots ({filteredBatches.length})
            </span>

            <div className="flex items-center space-x-2 text-xs">
              <select
                value={selectedCropFilter}
                onChange={(e) => setSelectedCropFilter(e.target.value)}
                className="px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold text-xs"
              >
                <option value="ALL">All Crops</option>
                <option value="Tomato">Tomato</option>
                <option value="Mango">Mango</option>
                <option value="Onion">Onion</option>
              </select>

              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold text-xs"
              >
                <option value="ALL">All Grades</option>
                <option value="Grade A">Grade A (Fresh)</option>
                <option value="Grade B">Grade B (Processing)</option>
                <option value="Grade C">Grade C (Dehydration)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBatches.map((batch) => (
              <div
                key={batch.batchId}
                className="p-4 rounded-xl bg-stone-800/60 border border-stone-700 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 block">
                      {batch.batchId}
                    </span>
                    <h4 className="text-sm font-extrabold text-white">
                      {batch.crop} ({batch.variety})
                    </h4>
                    <span className="text-xs text-stone-400">
                      {batch.remainingQuantity} {batch.unit} Available • {batch.farmerLocation}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {batch.grade || 'Grade A'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/80 border border-stone-800 text-xs flex justify-between">
                  <span className="text-stone-400">Suggested Fair Price:</span>
                  <span className="font-extrabold text-emerald-400">
                    ₹{batch.marketPrice ? batch.marketPrice.toLocaleString('en-IN') : '24,500'} / Ton
                  </span>
                </div>

                <div className="flex items-center space-x-2 pt-1 border-t border-stone-700/60">
                  <button
                    onClick={() => onNavigateTab('traceability', batch.batchId)}
                    className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition"
                  >
                    Traceability
                  </button>

                  <button
                    onClick={() => setActiveTab('MATCHES')}
                    className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition"
                  >
                    Matches
                  </button>

                  <button
                    onClick={() => handleOpenProcureModal(batch)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow flex items-center justify-center space-x-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Procure Lot</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* DIRECT PROCUREMENT ORDER MODAL */}
      {procureBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  {procureBatch.batchId}
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Procure: {procureBatch.crop} ({procureBatch.variety})
                </h3>
              </div>
              <button
                onClick={() => setProcureBatch(null)}
                className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-stone-800/60 border border-stone-700">
              <div>
                <span className="text-[10px] text-stone-400 block font-semibold">Available Lot</span>
                <span className="font-extrabold text-white">{procureBatch.remainingQuantity} {procureBatch.unit}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block font-semibold">Quality Grade</span>
                <span className="font-extrabold text-emerald-400">{procureBatch.grade || 'Grade A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block font-semibold">Fair Farmgate Price</span>
                <span className="font-extrabold text-teal-300">₹{(procureBatch.marketPrice || 24500).toLocaleString('en-IN')} / T</span>
              </div>
            </div>

            <form onSubmit={handleExecuteDirectOrder} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-300 block">
                  Procurement Quantity ({procureBatch.unit}):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={procureBatch.remainingQuantity}
                  value={procureQty}
                  onChange={(e) => setProcureQty(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold text-sm focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <span className="text-[10px] text-stone-400">
                  Max available for instant procurement: {procureBatch.remainingQuantity} {procureBatch.unit}
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-300 block">Buyer Name / Enterprise:</label>
                <input
                  type="text"
                  value={procureBuyerName}
                  onChange={(e) => setProcureBuyerName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-300 block">Buyer Classification:</label>
                <select
                  value={procureBuyerType}
                  onChange={(e) => setProcureBuyerType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs font-semibold"
                >
                  <option value="WHOLESALER">APMC Wholesaler</option>
                  <option value="SUPERMARKET">Supermarket Retail Chain</option>
                  <option value="PROCESSOR">Food Processing &amp; Valorization Unit</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-300 block">Delivery Terminal / Cold Hub:</label>
                <input
                  type="text"
                  value={procureDestination}
                  onChange={(e) => setProcureDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs"
                  required
                />
              </div>

              {/* Instant Escrow Calculation */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-400 font-semibold block">Smart Escrow Total Amount</span>
                  <span className="text-stone-300 text-[11px]">Direct 0-commission settlement</span>
                </div>
                <span className="text-base font-extrabold text-emerald-300">
                  ₹{((parseFloat(procureQty) || 0) * (procureBatch.marketPrice || 24500)).toLocaleString('en-IN')}
                </span>
              </div>

              {procureError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300">
                  {procureError}
                </div>
              )}

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProcureBatch(null)}
                  className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcuring}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {isProcuring ? 'Locking Escrow...' : 'Confirm & Deposit Escrow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
