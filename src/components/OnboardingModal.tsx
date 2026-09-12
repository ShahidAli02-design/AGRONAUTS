import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle, Sparkles, Sprout, ShieldCheck, TrendingUp } from 'lucide-react';
import heroFarmImg from '../assets/images/onboarding_hero_farm_1788605104440.jpg';
import aiGradingImg from '../assets/images/smart_ai_grading_1788605118906.jpg';
import traceabilityImg from '../assets/images/marketplace_traceability_1788605132020.jpg';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'One Connected Agriculture Ecosystem',
      tagline: 'Plan Better, Grow Smarter & Eliminate Post-Harvest Losses',
      description:
        'Agronauts links every stage of farming—from soil planning, micro-irrigation, and leaf disease AI scans to pre-harvest advisories—ensuring optimal yield and healthy crops.',
      image: heroFarmImg,
      icon: <Sprout className="w-5 h-5 text-emerald-400" />,
      features: [
        'AI Crop Planning calibrated to local soil NPK and water',
        'Real-time leaf disease diagnosis with organic remedy protocols',
        'Daily dynamic crop stage monitoring and irrigation alerts'
      ]
    },
    {
      title: 'Computer Vision AI Quality Grading & Batch ID',
      tagline: 'Instant Commercial Grading (Grade A, B, C) at Farmgate',
      description:
        'Upon harvest, upload a photo of your produce. Our multimodal vision AI assigns instant provisional grading, tracks size uniformity, color, and defects, creating a unique Batch ID.',
      image: aiGradingImg,
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      features: [
        'Automated Universal Batch ID (e.g. AGR-2026-TOM-00001)',
        'Grade breakdown % and shelf-life prediction',
        'Zero-Waste Engine: Direct Sell vs Food Processing vs Storage'
      ]
    },
    {
      title: 'Direct Marketplace, Fair Value & Full Traceability',
      tagline: 'Smart Buyer & Processor Matching with Zero Middleman Fees',
      description:
        'Grade A produce is matched to premium supermarket wholesalers (94% match), while Grade B is channeled to food processing units for puree and dehydration, eliminating farm dump waste.',
      image: traceabilityImg,
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      features: [
        'End-to-end transparent supply chain traceability timeline',
        '5-step live order tracking with direct bank escrow payment',
        'Farmer Value Dashboard tracking avoided loss and Agri Credit Score'
      ]
    }
  ];

  const slide = slides[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              {slide.icon}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Agronauts Architecture Tour ({currentStep + 1} of {slides.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="overflow-y-auto p-6 space-y-5">
          
          {/* Creative Onboarding Illustration */}
          <div className="relative w-full h-52 sm:h-60 rounded-xl overflow-hidden border border-stone-800 shadow-inner group">
            <img
              src={slide.image}
              alt={slide.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500 text-stone-950 mb-1">
                {slide.tagline}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow">
                {slide.title}
              </h3>
            </div>
          </div>

          <p className="text-sm text-stone-300 leading-relaxed">
            {slide.description}
          </p>

          <div className="space-y-2 bg-stone-800/60 rounded-xl p-3.5 border border-stone-700/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Key Capabilities</h4>
            {slide.features.map((feat, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs text-stone-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800 bg-stone-950/80">
          <div className="flex items-center space-x-1.5">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-emerald-500' : 'w-2 bg-stone-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-3 py-1.5 text-xs font-medium text-stone-400 hover:text-white transition"
              >
                Back
              </button>
            )}

            {currentStep < slides.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-emerald-900/40"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center space-x-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-extrabold rounded-lg transition shadow-lg shadow-emerald-900/50"
              >
                <span>Start Exploring</span>
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
