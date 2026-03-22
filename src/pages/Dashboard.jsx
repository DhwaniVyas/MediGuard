import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import DashboardCard from '../components/DashboardCard';
import { Stethoscope, Pill, Newspaper, UserCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard — MediGuard";
    
    async function fetchProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
        
      if (data && data.full_name) {
        setFullName(data.full_name);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const displayName = fullName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter">
      <div className="bg-gradient-to-r from-navy to-skyblue rounded-3xl p-8 md:p-10 mb-10 shadow-lg text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {getGreeting()}, {displayName}!
        </h1>
        <p className="text-teal-100/90 text-lg md:text-xl">
          What would you like to do today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <DashboardCard 
          Icon={Stethoscope}
          colorClass="#3A7BD5"
          route="/symptoms"
          title="Check Symptoms"
          description="Describe your symptoms and get AI-powered disease predictions"
        />
        <DashboardCard 
          Icon={Pill}
          colorClass="#2AAE8A"
          route="/medicine"
          title="Medicine Safety"
          description="Check if two medicines are safe to take together"
        />
        <DashboardCard 
          Icon={Newspaper}
          colorClass="#1D2D50"
          route="/news"
          title="Health News"
          description="Latest global health headlines and medical updates"
        />
        <DashboardCard 
          Icon={UserCircle}
          colorClass="#6366F1"
          route="/profile"
          title="My Profile"
          description="Manage your health profile, allergies and medical history"
        />
      </div>
    </div>
  );
}
