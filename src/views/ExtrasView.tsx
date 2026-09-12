import React, { useState } from 'react';
import {
  FileText,
  Wrench,
  Users,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Send,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { GovernmentScheme, EquipmentRental } from '../types';
import { ApiService } from '../services/api';
import { Language, translations } from '../i18n';

interface ExtrasViewProps {
  schemes: GovernmentScheme[];
  equipment: EquipmentRental[];
  lang: Language;
  onNavigateTab: (tab: string) => void;
}

export const ExtrasView: React.FC<ExtrasViewProps> = ({
  schemes,
  equipment,
  lang,
  onNavigateTab
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'SCHEMES' | 'EQUIPMENT' | 'COMMUNITY'>('SCHEMES');
  const [bookedEquipmentId, setBookedEquipmentId] = useState<string | null>(null);

  // Community Questions
  const [questions, setQuestions] = useState([
    {
      id: 'q1',
      author: 'Ramesh Kadam (Nashik)',
      title: 'How to control bacterial wilt organically in clay soils?',
      answer: 'Apply Trichoderma viride enriched farmyard manure 15 days prior to transplanting. Maintain strict drip scheduling to prevent water stagnation around the collar zone.',
      expert: 'Dr. S. Patil (MPKV Agricultural University)',
      upvotes: 42
    },
    {
      id: 'q2',
      author: 'Sunita Shinde (Pune)',
      title: 'What is the optimal harvest stage for export Alphonso?',
      answer: 'Harvest at 80–85% maturity when shoulders rise above stem attachment point and skin transitions from dark olive to light yellowish green with high specific gravity.',
      expert: 'Prof. Joshi (Directorate of Floriculture & Horticulture)',
      upvotes: 38
    }
  ]);

  const [newQuestion, setNewQuestion] = useState('');

  const handleBookEquipment = (id: string, name: string) => {
    setBookedEquipmentId(id);
    setTimeout(() => {
      alert(`Booking request for ${name} confirmed! Dispatch scheduled within 24h.`);
    }, 200);
  };

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setQuestions([
      {
        id: 'q_' + Date.now(),
        author: 'Balasaheb Patil (You)',
        title: newQuestion,
        answer: 'Thank you for your question! An agronomist from MPKV Rahuri will verify and post response shortly.',
        expert: 'Agronauts Agronomist Desk',
        upvotes: 1
      },
      ...questions
    ]);
    setNewQuestion('');
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Farmer Utilities, Equipment Rental &amp; Community Advisory
            </h2>
            <p className="text-xs text-stone-400">
              Direct access to government subsidies, precision drone spraying rentals, and verified agricultural scientist Q&amp;A.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('SCHEMES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'SCHEMES'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
              : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Government Schemes &amp; Subsidies</span>
        </button>

        <button
          onClick={() => setActiveTab('EQUIPMENT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'EQUIPMENT'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
              : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Equipment &amp; Drone Rental</span>
        </button>

        <button
          onClick={() => setActiveTab('COMMUNITY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'COMMUNITY'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
              : 'bg-stone-900 text-stone-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Expert &amp; Peer Community</span>
        </button>
      </div>

      {/* GOVERNMENT SCHEMES */}
      {activeTab === 'SCHEMES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-stone-900 border border-stone-800 hover:border-emerald-700/60 rounded-2xl p-5 shadow-sm space-y-3 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                  {scheme.category}
                </span>
                <h3 className="text-base font-extrabold text-white">
                  {scheme.title}
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {scheme.description}
                </p>

                <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60 text-xs space-y-1">
                  <span className="font-semibold text-emerald-400 text-[11px]">Financial Benefit:</span>
                  <p className="text-stone-200 font-bold">{scheme.benefit}</p>
                </div>

                <div className="text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-300">Eligibility: </span>
                  {scheme.eligibility}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800">
                <a
                  href={scheme.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-stone-800 hover:bg-emerald-600 text-stone-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                >
                  <span>Apply via DBT Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EQUIPMENT & DRONE RENTAL */}
      {activeTab === 'EQUIPMENT' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {equipment.map((eq) => (
            <div
              key={eq.id}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {eq.category}
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-0.5">
                      {eq.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {eq.available ? 'Ready Today' : 'Booked'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60 text-xs">
                  <span className="text-stone-400 text-[10px] block">Standard Rental Rate</span>
                  <span className="text-lg font-black text-emerald-400">{eq.rate}</span>
                </div>

                <div className="text-xs text-stone-300 space-y-1">
                  <span className="font-semibold text-stone-200 text-[11px]">Specifications:</span>
                  <p className="text-[11px] text-stone-400">{eq.specifications}</p>
                  <p className="text-[11px] text-stone-400">Hub Location: {eq.hubLocation}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800">
                <button
                  onClick={() => handleBookEquipment(eq.id, eq.name)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow flex items-center justify-center space-x-1.5 ${
                    bookedEquipmentId === eq.id
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{bookedEquipmentId === eq.id ? 'Booking Requested' : 'Book Equipment with Operator'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMMUNITY & EXPERT Q&A */}
      {activeTab === 'COMMUNITY' && (
        <div className="space-y-4">
          
          {/* Post Question Box */}
          <form onSubmit={handlePostQuestion} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>Ask Agriculture University Experts &amp; Peer Farmers</span>
            </span>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask about fertilizer ratio, disease symptom, or local mandi rates..."
                className="flex-1 px-4 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow flex items-center space-x-1"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Questions Stream */}
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400">Asked by {q.author}</span>
                    <h4 className="text-sm font-extrabold text-white mt-0.5">{q.title}</h4>
                  </div>
                  <button className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 text-xs font-bold hover:text-emerald-400">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{q.upvotes}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-700/60 text-xs space-y-1">
                  <div className="flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Answer ({q.expert})</span>
                  </div>
                  <p className="text-stone-300 leading-relaxed text-xs">{q.answer}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
