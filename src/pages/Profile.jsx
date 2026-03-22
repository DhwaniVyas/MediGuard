import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import TagInput from '../components/TagInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    blood_group: 'A+',
    height: '',
    weight: '',
    emergency_contact: '',
    chronic_diseases: [],
    allergies: [],
    current_medications: []
  });
  
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Profile — MediGuard";
    
    async function loadProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          age: data.age || '',
          blood_group: data.blood_group || 'A+',
          height: data.height || '',
          weight: data.weight || '',
          emergency_contact: data.emergency_contact || '',
          chronic_diseases: Array.isArray(data.chronic_diseases) ? data.chronic_diseases : [],
          allergies: Array.isArray(data.allergies) ? data.allergies : [],
          current_medications: Array.isArray(data.current_medications) ? data.current_medications : []
        });
        if (data.updated_at) {
          setLastUpdated(new Date(data.updated_at).toLocaleDateString());
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Convert empty strings to null for integer/numeric columns
    const payload = { ...formData, updated_at: new Date().toISOString() };
    
    if (payload.age === '') payload.age = null;
    else if (payload.age !== null) payload.age = parseInt(payload.age, 10);
    
    if (payload.height === '') payload.height = null;
    else if (payload.height !== null) payload.height = parseFloat(payload.height);
    
    if (payload.weight === '') payload.weight = null;
    else if (payload.weight !== null) payload.weight = parseFloat(payload.weight);

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...payload
    }, { onConflict: 'id' });
    
    setSaving(false);
    
    if (error) {
      toast.error('Database Error: ' + error.message, { duration: 6000 });
      console.error("Supabase upsert error:", error);
    } else {
      toast.success('Profile saved successfully ✓');
      setLastUpdated(new Date().toLocaleDateString());
    }
  };

  const calculateBMI = () => {
    if (!formData.weight || !formData.height) return null;
    const h = parseFloat(formData.height) / 100;
    const w = parseFloat(formData.weight);
    if (h <= 0 || w <= 0) return null;
    
    const bmi = w / (h * h);
    let category = '';
    let colClass = '';
    
    if (bmi < 18.5) { category = 'Underweight'; colClass = 'text-skyblue'; }
    else if (bmi >= 18.5 && bmi <= 24.9) { category = 'Normal'; colClass = 'text-teal'; }
    else if (bmi >= 25 && bmi <= 29.9) { category = 'Overweight'; colClass = 'text-amber-500'; }
    else { category = 'Obese'; colClass = 'text-red-500'; }
    
    return { value: bmi.toFixed(1), category, colClass };
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]"><LoadingSpinner size="lg" /></div>;
  }

  const bmiData = calculateBMI();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Form */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <User className="w-8 h-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">My Health Profile</h1>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-navy mb-4 border-b border-gray-100 pb-2">Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-teal outline-none" placeholder="Jane Doe" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" min="1" max="120" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-teal outline-none" placeholder="30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-teal outline-none bg-white">
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input type="text" value={formData.emergency_contact} onChange={e => setFormData({...formData, emergency_contact: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-teal outline-none" placeholder="Phone or Name" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-navy mb-4 border-b border-gray-100 pb-2">Physical Specs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                  <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-teal outline-none" placeholder="175" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-teal outline-none" placeholder="70" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-navy mb-4 border-b border-gray-100 pb-2">Medical History</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Diseases</label>
                  <TagInput value={formData.chronic_diseases} onChange={v => setFormData({...formData, chronic_diseases: v})} placeholder="Type and press enter..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <TagInput value={formData.allergies} onChange={v => setFormData({...formData, allergies: v})} placeholder="E.g., Peanuts, Penicillin..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                  <TagInput value={formData.current_medications} onChange={v => setFormData({...formData, current_medications: v})} placeholder="E.g., Ibuprofen, Lisinopril..." />
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full flex justify-center items-center h-14 bg-teal text-white rounded-xl hover:bg-teal/90 transition-all font-bold text-lg shadow-lg shadow-teal/20">
              {saving ? <LoadingSpinner size="sm" /> : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Right Summary Card */}
        <div className="lg:mt-[4.5rem]">
          <div className="bg-white rounded-2xl shadow-card p-8 sticky top-24 border border-gray-50">
            <h3 className="text-2xl font-bold text-navy mb-6">Health Summary</h3>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="flex-1 text-center bg-surface py-4 rounded-2xl border border-gray-100">
                <div className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">Blood Group</div>
                <div className="text-3xl font-bold text-navy">{formData.blood_group}</div>
              </div>
              <div className="flex-1 text-center bg-surface py-4 rounded-2xl border border-gray-100">
                <div className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">BMI</div>
                {bmiData ? (
                  <>
                    <div className="text-3xl font-bold text-navy">{bmiData.value}</div>
                    <div className={`text-sm font-semibold mt-1 ${bmiData.colClass}`}>{bmiData.category}</div>
                  </>
                ) : (
                  <div className="text-lg font-medium text-gray-400 mt-2">N/A</div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Chronic Diseases</h4>
                {formData.chronic_diseases.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.chronic_diseases.map(d => <span key={d} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">{d}</span>)}
                  </div>
                ) : <p className="text-sm text-gray-400 italic">None reported</p>}
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Allergies</h4>
                {formData.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.allergies.map(a => <span key={a} className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-sm font-medium">{a}</span>)}
                  </div>
                ) : <p className="text-sm text-gray-400 italic">None reported</p>}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Current Medications</h4>
                {formData.current_medications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.current_medications.map(m => <span key={m} className="px-3 py-1 bg-skyblue/10 text-skyblue rounded-full text-sm font-medium">{m}</span>)}
                  </div>
                ) : <p className="text-sm text-gray-400 italic">None reported</p>}
              </div>
            </div>

            {lastUpdated && (
              <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
                Last updated: {lastUpdated}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
