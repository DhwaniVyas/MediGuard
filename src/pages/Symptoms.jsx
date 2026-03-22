import React, { useState, useEffect } from 'react';
import { SYMPTOM_CATEGORIES, predictDisease } from '../services/symptomEngine';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { getMedicinesForDisease, hydrateMedicineStrings } from '../services/medicineEngine';
import { analyzeSymptomsWithAI } from '../services/aiEngine';
import SymptomCheckbox from '../components/SymptomCheckbox';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Stethoscope, Search, AlertTriangle, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Symptoms() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [results, setResults] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(Object.keys(SYMPTOM_CATEGORIES));
  const [userAllergies, setUserAllergies] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Symptoms Checker — MediGuard";
    
    async function loadAllergies() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('allergies').eq('id', user.id).single();
      if (data && data.allergies) {
        setUserAllergies(data.allergies.map(a => a.toLowerCase().trim()));
      }
    }
    loadAllergies();
  }, [user]);

  const toggleSymptom = (s) => {
    if (selectedSymptoms.includes(s)) {
      setSelectedSymptoms(selectedSymptoms.filter(x => x !== s));
    } else {
      setSelectedSymptoms([...selectedSymptoms, s]);
    }
  };

  const toggleCategory = (cat) => {
    if (expandedCategories.includes(cat)) {
      setExpandedCategories(expandedCategories.filter(c => c !== cat));
    } else {
      setExpandedCategories([...expandedCategories, cat]);
    }
  };

  const clearSymptoms = () => {
    setSelectedSymptoms([]);
    setSearchQuery('');
    setAiInput('');
  };

  const handleAnalyze = async () => {
    if (aiInput.trim()) {
      setIsAnalyzingAI(true);
      try {
        const aiResults = await analyzeSymptomsWithAI(aiInput);
        setResults(aiResults);
      } catch (err) {
        toast.error(err.message, { duration: 6000 });
      }
      setIsAnalyzingAI(false);
    } else {
      setResults(predictDisease(selectedSymptoms));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (results) {
    const topResult = results[0];
    const chartData = results.map(r => ({
      name: r.disease,
      probability: r.probability,
      fill: `url(#colorGradient${r.diseaseKey})`
    }));
    
    const suggestedMedsRaw = topResult 
      ? (topResult.suggested_medicines 
          ? hydrateMedicineStrings(topResult.suggested_medicines) 
          : getMedicinesForDisease(topResult.diseaseKey))
      : [];
    const suggestedMeds = suggestedMedsRaw.map(med => {
      const allergicToPattern = userAllergies.find(al => {
        return (
          (med.Allergy_Group || '').toLowerCase().includes(al) ||
          (med.Active_Ingredient || '').toLowerCase().includes(al) ||
          (med.Medicine_Name || '').toLowerCase().includes(al) ||
          al.includes((med.Allergy_Group || '').toLowerCase())
        );
      });
      return { ...med, allergicToPattern };
    });

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter animate-in fade-in duration-300">
        <button onClick={() => setResults(null)} className="flex items-center gap-2 text-gray-500 hover:text-navy transition-colors mb-6 font-medium">
          <ArrowLeft className="w-5 h-5" /> Back to symptom selection
        </button>

        {!topResult ? (
          <div className="bg-surface rounded-2xl p-10 text-center border">
            <h3 className="text-xl font-bold text-navy mb-2">No Prediction Available</h3>
            <p className="text-gray-500">Not enough symptoms matched to form a reliable prediction.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Prediction Card */}
            <div className="bg-gradient-to-r from-navy to-skyblue rounded-3xl p-8 shadow-card text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 blur-xl transform translate-x-1/4 -translate-y-1/4">
                <Stethoscope className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="bg-teal text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">
                    Match: {topResult.probability}%
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide border ${
                    topResult.severity === 'High' ? 'bg-red-500/20 border-red-500 text-red-100' :
                    topResult.severity === 'Medium' ? 'bg-amber-500/20 border-amber-500 text-amber-100' :
                    'bg-green-500/20 border-green-500 text-green-100'
                  }`}>
                    Severity: {topResult.severity}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">{topResult.disease}</h1>
                
                <div className="max-w-md">
                  <div className="flex justify-between text-sm text-skyblue mb-2 font-medium tracking-wide">
                    <span>Prognosis Index</span>
                    <span>{Math.round(topResult.prognosisScore * 100)} / 100</span>
                  </div>
                  <div className="w-full bg-navy/50 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        topResult.prognosisScore >= 0.75 ? 'bg-red-400' : 
                        topResult.prognosisScore >= 0.5 ? 'bg-amber-400' : 'bg-teal'
                      }`} 
                      style={{ width: `${Math.min(topResult.prognosisScore * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-50">
                <h3 className="text-xl font-bold text-navy mb-6">Disease Probability Analysis</h3>
                <div className="h-80 w-full ml-[-20px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                      <defs>
                        {chartData.map((d, index) => (
                          <linearGradient key={`grad-${index}`} id={`colorGradient${results[index].diseaseKey}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3A7BD5" />
                            <stop offset="100%" stopColor="#2AAE8A" />
                          </linearGradient>
                        ))}
                      </defs>
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={150} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} />
                      <Tooltip cursor={{fill: '#F7F9FB'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} formatter={(val) => [`${val}%`, 'Probability']} />
                      <Bar dataKey="probability" radius={[0, 8, 8, 0]} barSize={24}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Medicines */}
              <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-50">
                <h3 className="text-xl font-bold text-navy mb-6">Suggested Medicines Overview</h3>
                {suggestedMeds.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 italic mb-2">No specific basic counter-medications found in the database.</p>
                    <p className="text-navy font-semibold">Consult a physician for medication guidance.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {suggestedMeds.map((med, i) => {
                      const isRisk = med.allergicToPattern;
                      return (
                        <div key={i} className={`border rounded-2xl p-5 transition-colors group relative overflow-hidden ${isRisk ? 'border-red-300 bg-red-50/50 hover:border-red-400 shadow-sm' : 'border-gray-100 hover:border-teal'}`}>
                          {isRisk && (
                            <div className="bg-red-500 text-white text-xs text-left font-bold px-3 py-1.5 mb-3 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
                              <AlertTriangle className="w-4 h-4" /> 
                              AVOID: High Risk — Patient Allergic to {isRisk.toUpperCase()}
                            </div>
                          )}
                          <div className={`flex justify-between items-start mb-2 ${isRisk ? 'opacity-80' : ''}`}>
                            <h4 className={`font-bold text-lg ${isRisk ? 'text-red-900 line-through decoration-red-900/50 decoration-2' : 'text-navy'}`}>
                              {(med.Medicine_Name || '').replace(/_/g, ' ')}
                            </h4>
                            <span className={`text-xs font-bold px-2 py-1 ${isRisk ? 'bg-red-100 text-red-700' : 'bg-surface text-gray-500'} rounded`}>
                              {med.Allergy_Group || 'Unknown'}
                            </span>
                          </div>
                          <p className={`text-sm mb-3 ${isRisk ? 'text-red-800/80' : 'text-gray-500'}`}>
                            <span className={`font-semibold ${isRisk ? 'text-red-900' : 'text-gray-700'}`}>Active Ingredient:</span> {(med.Active_Ingredient || '').replace(/_/g, ' ')}
                          </p>
                          
                          <details className={`text-sm mb-2 cursor-pointer ${isRisk ? 'text-red-800/80 marker:text-red-500' : 'text-gray-600 marker:text-teal'}`}>
                            <summary className={`font-medium transition-colors ${isRisk ? 'hover:text-red-900' : 'hover:text-teal'}`}>View Side Effects</summary>
                            <p className={`pt-2 pl-4 ${isRisk ? 'text-red-800/70' : 'text-gray-500'}`}>{(med.Side_Effects || '').replace(/_/g, ' ')}</p>
                          </details>
                          
                          {med.Contraindications && med.Contraindications !== 'None' && (
                            <div className="mt-3 inline-flex">
                              <span className={`text-xs border px-3 py-1 rounded-full font-medium ${isRisk ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                Contraindications: {(med.Contraindications || '').replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 flex gap-3 text-amber-800 text-sm mt-8 items-start">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Disclaimer:</strong> This tool is for informational purposes only and does not constitute medical advice. Please consult a licensed physician.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // INPUT STATE
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter pb-32">
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="bg-skyblue/10 p-4 rounded-full mb-4">
          <Stethoscope className="w-10 h-10 text-skyblue" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">Hybrid Symptom Checker</h1>
        <p className="text-gray-500 text-lg">Describe your symptoms to our Medical AI, or manually select them below.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 focus-within:border-skyblue transition-colors mb-10 relative">
        <h3 className="text-xl font-bold text-navy mb-4">Describe your symptoms</h3>
        <textarea
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          placeholder="E.g., I have a radiating pain in my left arm that started yesterday, accompanied by a metallic taste in my mouth and mild fever..."
          className="w-full h-32 outline-none resize-none text-gray-700 bg-transparent placeholder-gray-400"
        ></textarea>
        {aiInput.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
            <span>AI will completely override manual checklist selection when analyzing.</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-gray-400 font-semibold text-sm tracking-wider uppercase">Or Select Manually</span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      <div className="relative mb-8 max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Filter symptoms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 shadow-sm focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 outline-none transition-all text-navy text-lg"
        />
        <Search className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
      </div>

      <div className="space-y-4">
        {Object.entries(SYMPTOM_CATEGORIES).map(([category, symptoms]) => {
          const filteredSymptoms = symptoms.filter(s => 
            s.replace(/_/g, ' ').toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredSymptoms.length === 0) return null;

          const isExpanded = expandedCategories.includes(category);

          return (
            <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button 
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-navy text-lg">{category}</h3>
                  <span className="text-sm font-medium text-gray-400 bg-surface px-2 py-0.5 rounded-full border">
                    {filteredSymptoms.length}
                  </span>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-gray-50 flex flex-wrap gap-2 mt-4">
                  {filteredSymptoms.map((s) => (
                    <SymptomCheckbox
                      key={s}
                      symptom={s}
                      isSelected={selectedSymptoms.includes(s)}
                      onToggle={toggleSymptom}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 p-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-navy font-semibold text-lg flex items-center gap-2">
              {aiInput.trim() ? (
                <span className="bg-skyblue/20 text-skyblue px-3 py-1 rounded-lg text-sm font-bold border border-skyblue/30">AI Active</span>
              ) : null}
              {selectedSymptoms.length} manual symptom{selectedSymptoms.length !== 1 ? 's' : ''}
            </span>
            {(selectedSymptoms.length > 0 || aiInput.length > 0) && (
              <button onClick={clearSymptoms} className="text-gray-400 text-sm hover:text-red-500 underline transition-colors">
                Clear all
              </button>
            )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={(selectedSymptoms.length === 0 && !aiInput.trim()) || isAnalyzingAI}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              (selectedSymptoms.length > 0 || aiInput.trim()) && !isAnalyzingAI
                ? 'bg-navy text-white hover:bg-skyblue hover:-translate-y-1 shadow-lg shadow-navy/20' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isAnalyzingAI ? (
              <><LoadingSpinner size="sm" /> AI Analyzing...</>
            ) : (
              <>Analyse Symptoms →</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
