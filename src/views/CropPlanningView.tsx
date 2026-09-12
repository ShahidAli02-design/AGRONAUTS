import React, { useState } from 'react';
import { Sprout, Sparkles, Droplets, TrendingUp, AlertCircle, CheckCircle2, ArrowRight, Layers } from 'lucide-react';
import { ApiService } from '../services/api';
import { Language, translations } from '../i18n';

interface CropPlanningViewProps {
  lang: Language;
  onNavigateTab: (tab: string) => void;
  onAddCropSuccess?: () => void;
}

export const CropPlanningView: React.FC<CropPlanningViewProps> = ({
  lang,
  onNavigateTab,
  onAddCropSuccess
}) => {
  const t = translations[lang];

  const [formData, setFormData] = useState({
    location: 'Nashik, Maharashtra',
    soilType: 'Black Clay',
    season: 'Rabi / Early Summer',
    landArea: '2.5',
    waterAvailability: 'Moderate',
    irrigation: 'Drip Irrigation',
    previousCrop: 'Soybean'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([
    {
      recommendedCrop: 'Tomato (Arka Rakshak F1)',
      alternativeCrops: ['Sweet Corn', 'French Beans', 'Capsicum'],
      expectedYield: '18–22 tons / acre',
      waterRequirement: 'Medium',
      suitableSeason: 'Rabi / Early Summer',
      marketOpportunity: 'High — APMC Nashik and Mumbai retail chains experiencing 18% supply deficit',
      riskLevel: 'Low',
      reason: 'Calibrated for Black Clay soil with Drip Irrigation. Arka Rakshak provides triple disease resistance (ToLCV + Bacterial Wilt + Early Blight), maximizing commercial yield while keeping fungicide costs low.'
    },
    {
      recommendedCrop: 'Garwa Rabi Onion',
      alternativeCrops: ['Garlic', 'Wheat', 'Mustard'],
      expectedYield: '12–15 tons / acre',
      waterRequirement: 'Low to Moderate',
      suitableSeason: 'Late Rabi',
      marketOpportunity: 'Very High — Buffer procurement starting at Lasalgaon Mandi with price support',
      riskLevel: 'Low',
      reason: 'Excellent storability for 4-5 months in aerated structures. Strong hedge against mid-season market price surges.'
    }
  ]);

  const [addedCropName, setAddedCropName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await ApiService.planCrop(formData);
      if (res.success && res.recommendations) {
        setRecommendations(res.recommendations);
      }
    } catch (err) {
      console.warn('Using fallback crop recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdoptCrop = async (cropTitle: string) => {
    try {
      const cleanCrop = cropTitle.split(' ')[0];
      await ApiService.addCrop({
        cropName: cleanCrop,
        variety: cropTitle,
        landArea: Number(formData.landArea) || 2.0,
        sowingDate: new Date().toISOString().split('T')[0]
      });
      setAddedCropName(cropTitle);
      if (onAddCropSuccess) onAddCropSuccess();
      setTimeout(() => {
        onNavigateTab('cropMonitoring');
      }, 1200);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Smart Crop Planning &amp; Varietal Recommendation
            </h2>
            <p className="text-xs text-stone-400">
              AI-driven agronomic matching based on soil chemistry, seasonal water table, and forward APMC market demand.
            </p>
          </div>
        </div>
      </div>

      {/* Input Parameters Form */}
      <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5 mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Farm &amp; Environmental Inputs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          
          <div>
            <label className="block text-stone-400 font-semibold mb-1">Farm Location / Region</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-stone-400 font-semibold mb-1">Soil Type</label>
            <select
              value={formData.soilType}
              onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Black Clay">Black Clay (Vertisol)</option>
              <option value="Red Sandy Loam">Red Sandy Loam</option>
              <option value="Alluvial">Alluvial Loam</option>
              <option value="Laterite">Laterite Soil</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-400 font-semibold mb-1">Season</label>
            <select
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Rabi / Early Summer">Rabi / Early Summer (Jan - Apr)</option>
              <option value="Kharif Monsoon">Kharif Monsoon (Jun - Oct)</option>
              <option value="Zaid / Summer">Zaid / Summer (Mar - Jun)</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-400 font-semibold mb-1">Available Land Area (Acres)</label>
            <input
              type="number"
              step="0.5"
              value={formData.landArea}
              onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-stone-400 font-semibold mb-1">Irrigation System</label>
            <select
              value={formData.irrigation}
              onChange={(e) => setFormData({ ...formData, irrigation: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Drip Irrigation">Drip Micro-Irrigation (High Efficiency)</option>
              <option value="Canal / Flood">Canal / Surface Flood</option>
              <option value="Borewell Sprinkler">Borewell Sprinkler</option>
              <option value="Rainfed">Rainfed Only</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-400 font-semibold mb-1">Previous Crop</label>
            <input
              type="text"
              value={formData.previousCrop}
              onChange={(e) => setFormData({ ...formData, previousCrop: e.target.value })}
              placeholder="e.g. Soybean, Cotton, Maize"
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-900/30 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Generating AI Recommendations...' : 'Calculate Optimal Crops'}</span>
          </button>
        </div>
      </form>

      {/* Success Notification */}
      {addedCropName && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Added "{addedCropName}" to active crop dashboard! Redirecting to monitoring...</span>
        </div>
      )}

      {/* AI Recommendation Cards */}
      <div className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
          AI-Calibrated Crop Suggestions
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className="bg-stone-900 border border-stone-800 hover:border-emerald-700/60 rounded-2xl p-5 shadow-sm space-y-4 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-400">
                      {i === 0 ? 'Primary Recommendation' : 'Alternative Crop'}
                    </span>
                    <h3 className="text-lg font-extrabold text-white mt-1">
                      {rec.recommendedCrop}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-300 border border-stone-700">
                    Risk: {rec.riskLevel}
                  </span>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-stone-800/60 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block font-semibold">Expected Yield</span>
                    <span className="font-extrabold text-emerald-400">{rec.expectedYield}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-800/60 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block font-semibold">Water Need</span>
                    <span className="font-extrabold text-sky-400">{rec.waterRequirement}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-800/60 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block font-semibold">Season</span>
                    <span className="font-extrabold text-stone-200">{rec.suitableSeason}</span>
                  </div>
                </div>

                {/* Market Opportunity */}
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-xs text-stone-300 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Market Opportunity</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{rec.marketOpportunity}</p>
                </div>

                {/* Why AI Recommends */}
                <div className="text-xs text-stone-300 space-y-1">
                  <span className="font-bold text-stone-200 text-[11px]">Why AI recommends this crop:</span>
                  <p className="text-[11px] text-stone-400 leading-relaxed">{rec.reason}</p>
                </div>

                {/* Alternatives */}
                <div className="text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-300">Viable Alternatives: </span>
                  {rec.alternativeCrops.join(', ')}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800">
                <button
                  onClick={() => handleAdoptCrop(rec.recommendedCrop)}
                  className="w-full py-2.5 bg-stone-800 hover:bg-emerald-600 hover:text-white border border-stone-700 text-emerald-400 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5"
                >
                  <span>Adopt &amp; Start Monitoring</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
