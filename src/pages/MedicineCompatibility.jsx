import React, { useState, useEffect } from 'react';
import MedicineAutocomplete from '../components/MedicineAutocomplete';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { checkCompatibility } from '../services/medicineEngine';
import { analyzeMedicineCompatibilityWithAI } from '../services/aiEngine';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Pill, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

export default function MedicineCompatibility() {
  const [med1, setMed1] = useState('');
  const [med2, setMed2] = useState('');
  const [result, setResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [userAllergies, setUserAllergies] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Medicine Compatibility — MediGuard";
    
    async function loadAllergies() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('allergies').eq('id', user.id).single();
      if (data && data.allergies) {
        setUserAllergies(data.allergies.map(a => a.toLowerCase().trim()));
      }
    }
    loadAllergies();
  }, [user]);

  const handleCheck = async () => {
    if (!med1 || !med2) return;
    setIsChecking(true);
    let res = checkCompatibility(med1, med2);
    
    if (!res.found) {
      try {
        res = await analyzeMedicineCompatibilityWithAI(med1, med2);
        res.isAI = true;
      } catch (err) {
        toast.error(err.message, { duration: 6000 });
        setIsChecking(false);
        return;
      }
    }
    
    setResult(res);
    setIsChecking(false);
  };

  let allergicToM1 = null;
  let allergicToM2 = null;

  if (result && result.found) {
    const checkAllergy = (med) => {
      if (!med) return null;
      return userAllergies.find(al => {
        return (
          (med.Allergy_Group || '').toLowerCase().includes(al) ||
          (med.Active_Ingredient || '').toLowerCase().includes(al) ||
          (med.Medicine_Name || '').toLowerCase().includes(al) ||
          al.includes((med.Allergy_Group || '').toLowerCase())
        );
      });
    };
    allergicToM1 = checkAllergy(result.m1);
    allergicToM2 = checkAllergy(result.m2);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter">
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="bg-teal/10 p-4 rounded-full mb-4">
          <Pill className="w-10 h-10 text-teal" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">Medicine Compatibility Checker</h1>
        <p className="text-gray-500 max-w-2xl">
          Check potential interactions between two medications before taking them together. Complete database analysis.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-card border border-gray-50 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-8 relative">
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">First Medication</label>
            <MedicineAutocomplete value={med1} onChange={setMed1} placeholder="E.g., Paracetamol" />
          </div>
          
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-2 w-10 h-10 rounded-full bg-surface border-4 border-white items-center justify-center text-gray-400 font-bold z-10">
            +
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Second Medication</label>
            <MedicineAutocomplete value={med2} onChange={setMed2} placeholder="E.g., Ibuprofen" />
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={!med1 || !med2 || isChecking}
          className={`w-full md:w-auto md:px-12 md:mx-auto flex h-14 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg items-center justify-center gap-3 ${
            (med1 && med2 && !isChecking) 
              ? 'bg-navy text-white hover:bg-skyblue shadow-navy/20 hover:-translate-y-1' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed hidden md:flex shadow-none'
          }`}
        >
          {isChecking ? <><LoadingSpinner size="sm" /> Analyzing Risk Profile...</> : 'Check Compatibility →'}
        </button>
      </div>

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Banner */}
          {!result.found ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-2xl flex items-start gap-4 border border-red-100">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold mb-1">Medication Not Found</h3>
                <p>{result.message}</p>
              </div>
            </div>
          ) : (
            <>
              {result.compatible && (
                <div className="bg-green-50 p-6 rounded-2xl flex items-start gap-4 border border-green-200 shadow-sm transition-all duration-300 transform hover:scale-[1.01]">
                  <CheckCircle className="w-8 h-8 text-green-500 border-none flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-green-800 mb-1">These medicines appear compatible</h3>
                    <p className="text-green-700">No major interaction risks detected in our database.</p>
                  </div>
                </div>
              )}
              {result.riskLevel === 'Moderate' && (
                <div className="bg-amber-50 p-6 rounded-2xl flex items-start gap-4 border border-amber-200 shadow-sm transition-all duration-300 transform hover:scale-[1.01]">
                  <AlertTriangle className="w-8 h-8 text-amber-500 border-none flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-amber-800 mb-1">Use with caution</h3>
                    <p className="text-amber-700">Some shared properties detected — consult your pharmacist.</p>
                  </div>
                </div>
              )}
              {result.riskLevel === 'High' && (
                <div className="bg-red-50 p-6 rounded-2xl flex items-start gap-4 border border-red-200 shadow-sm transition-all duration-300 transform hover:scale-[1.01]">
                  <XCircle className="w-8 h-8 text-red-500 border-none flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-red-800 mb-1">High risk — do not combine</h3>
                    <p className="text-red-700">These medicines share critical properties that may cause adverse effects.</p>
                  </div>
                </div>
              )}

              {result.interaction_reason && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-bold text-navy uppercase tracking-wider mb-2 opacity-50">Detailed Analysis</h4>
                  <p className="text-navy text-lg leading-relaxed">{result.interaction_reason}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gauge */}
                <div className="bg-white p-8 rounded-3xl shadow-card border border-gray-50 flex flex-col items-center justify-center">
                  <h3 className="text-xl font-bold text-navy mb-4">Risk Gauge</h3>
                  <div className="w-48 h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart 
                        cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                        barSize={20} data={[{ name: 'risk', x: result.riskScore, fill: result.riskScore >= 70 ? '#EF4444' : result.riskScore >= 30 ? '#F59E0B' : '#2AAE8A' }]}
                        startAngle={180} endAngle={0}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar minAngle={15} background clockWise dataKey="x" cornerRadius={10} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-4">
                      <span className="text-4xl font-bold text-navy">{result.riskScore}</span>
                      <span className="text-sm font-medium text-gray-500">Risk Score</span>
                    </div>
                  </div>
                </div>

                {/* Factors Table - Simplified */}
                <div className="bg-white p-8 rounded-3xl shadow-card border border-gray-50 lg:col-span-2 flex flex-col justify-center relative overflow-hidden">
                  <h3 className="text-xl font-bold text-navy mb-6">Risk Factor Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className={`p-5 rounded-2xl border-2 transition-colors ${result.sameIngredient ? 'bg-red-50/50 border-red-200' : 'bg-green-50/50 border-green-100'}`}>
                      <h4 className="font-bold text-navy text-sm uppercase tracking-wide mb-2 opacity-60">Active Ingredient</h4>
                      {result.sameIngredient 
                        ? <p className="text-red-700 font-bold text-lg leading-tight">Conflict: High Risk Duplication</p> 
                        : <p className="text-green-700 font-bold text-lg leading-tight">Distinct Chemical Ingredients</p>}
                    </div>
                    
                    <div className={`p-5 rounded-2xl border-2 transition-colors ${result.sameAllergy ? 'bg-amber-50/50 border-amber-200' : 'bg-green-50/50 border-green-100'}`}>
                      <h4 className="font-bold text-navy text-sm uppercase tracking-wide mb-2 opacity-60">Drug Family</h4>
                      {result.sameAllergy 
                        ? <p className="text-amber-700 font-bold text-lg leading-tight">Same Drug Class / Allergy Group</p> 
                        : <p className="text-green-700 font-bold text-lg leading-tight">Different Anatomical Families</p>}
                    </div>
                    
                    <div className={`p-5 rounded-2xl border-2 transition-colors ${result.contraConflict ? 'bg-red-50/50 border-red-200' : 'bg-green-50/50 border-green-100'}`}>
                      <h4 className="font-bold text-navy text-sm uppercase tracking-wide mb-2 opacity-60">Contraindications</h4>
                      {result.contraConflict 
                        ? <p className="text-red-700 font-bold text-lg leading-tight">Direct Chemical Interaction Risk</p> 
                        : <p className="text-green-700 font-bold text-lg leading-tight">No Known Medical Conflicts</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {[
                  { med: result.m1, allergy: allergicToM1 },
                  { med: result.m2, allergy: allergicToM2 }
                ].map(({ med, allergy }, i) => (
                  <div key={i} className={`bg-white p-8 rounded-3xl shadow-card border flex flex-col relative overflow-hidden ${allergy ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-50'}`}>
                    {allergy && (
                      <div className="bg-red-500 text-white text-xs font-bold px-4 py-2 mb-6 rounded-xl flex items-center gap-2 shadow-sm">
                        <AlertTriangle className="w-4 h-4" /> 
                        PERSONAL ALLERGY TRIGGER: {allergy.toUpperCase()}
                      </div>
                    )}
                    <h3 className={`text-2xl font-bold mb-4 border-b pb-4 ${allergy ? 'text-red-700' : 'text-navy'}`}>
                      {med?.Medicine_Name?.replace(/_/g, ' ')}
                    </h3>
                    <div className="space-y-4 flex-1">
                      <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Ingredient</span>
                        <span className={`font-medium ${allergy ? 'text-red-900' : 'text-navy'}`}>{med?.Active_Ingredient?.replace(/_/g, ' ') || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Allergy Group</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${allergy ? 'bg-red-100 text-red-700' : 'bg-skyblue/10 text-skyblue'}`}>
                          {med?.Allergy_Group || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contraindications</span>
                        <p className={`${allergy ? 'text-red-700/80' : 'text-amber-600'} text-sm leading-relaxed`}>{med?.Contraindications?.replace(/_/g, ' ') || 'None reported'}</p>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Common Side Effects</span>
                        <p className="text-gray-500 text-sm leading-relaxed">{med?.Side_Effects?.replace(/_/g, ' ') || 'None reported'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 flex gap-3 text-amber-800 text-sm mt-8 items-start">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Disclaimer:</strong> This tool checks for basic software-matched interaction vectors based on public medical datasets. It is for informational purposes only and does not constitute medical advice. Please consult a licensed physician or pharmacist.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
