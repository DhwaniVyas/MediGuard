import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Stethoscope, Pill, Newspaper, ArrowRight } from 'lucide-react';

export default function Home() {
  useEffect(() => {
    document.title = "MediGuard — Your Personal Health Guardian";
  }, []);

  return (
    <div className="bg-surface min-h-screen font-inter flex flex-col">
      {/* SECTION 1 - HERO */}
      <section className="relative w-full min-h-screen bg-navy flex items-center justify-center overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-teal opacity-20 rounded-full mix-blend-multiply filter blur-2xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-skyblue opacity-20 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal opacity-20 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
          <ShieldCheck className="w-20 h-20 text-teal mb-6" />
          <h1 className="text-white text-5xl md:text-7xl font-bold tracking-tight mb-6">
            MediGuard
          </h1>
          <p className="text-skyblue text-xl md:text-2xl mb-12 max-w-2xl leading-relaxed">
            Your personal health guardian — predict, protect, and stay informed
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto px-8 py-4 bg-teal text-white text-lg font-semibold rounded-2xl hover:bg-teal/90 transition-all duration-200 shadow-lg hover:shadow-teal/20"
            >
              Get Started Free
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-2xl hover:bg-white hover:text-navy transition-all duration-200"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 - FEATURES */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-navy text-center mb-16">
            Everything you need to stay healthy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-gray-50">
              <div className="w-16 h-16 bg-skyblue/10 rounded-2xl flex items-center justify-center mb-6">
                <Stethoscope className="w-8 h-8 text-skyblue" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-4">Symptom Checker</h3>
              <p className="text-gray-500 leading-relaxed">
                Select your symptoms and get instant disease predictions powered by medical data, with probability charts.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-gray-50">
              <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center mb-6">
                <Pill className="w-8 h-8 text-teal" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-4">Medicine Safety</h3>
              <p className="text-gray-500 leading-relaxed">
                Check if two medicines are safe to take together. Understand risk levels with clear visual indicators.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-gray-50">
              <div className="w-16 h-16 bg-navy/10 rounded-2xl flex items-center justify-center mb-6">
                <Newspaper className="w-8 h-8 text-navy" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-4">Health News</h3>
              <p className="text-gray-500 leading-relaxed">
                Stay updated with live health headlines from trusted global sources, filtered and curated for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 - STATS */}
      <section className="py-16 bg-navy relative border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-700">
          <div className="flex flex-col items-center text-center pt-6 sm:pt-0">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
            <div className="text-gray-400 uppercase tracking-widest text-sm font-semibold">Diseases Tracked</div>
          </div>
          <div className="flex flex-col items-center text-center pt-6 sm:pt-0">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">150+</div>
            <div className="text-gray-400 uppercase tracking-widest text-sm font-semibold">Medicines in Database</div>
          </div>
          <div className="flex flex-col items-center text-center pt-6 sm:pt-0">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2 text-teal flex items-center">Live <span className="ml-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span></div>
            <div className="text-gray-400 uppercase tracking-widest text-sm font-semibold">Health News</div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - CTA */}
      <section className="py-24 bg-teal px-4 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
            Ready to take charge of your health?
          </h2>
          <Link 
            to="/signup" 
            className="flex items-center gap-2 px-8 py-4 bg-navy text-white text-lg font-bold rounded-2xl hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-navy pt-12 pb-8 border-t border-gray-800 text-center flex-1">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-6 text-white">
            <ShieldCheck className="w-6 h-6 text-teal" />
            <span className="font-bold text-lg">MediGuard © 2026</span>
          </div>
          <p className="text-gray-500 text-sm max-w-md mx-auto bg-gray-900 border border-gray-800 py-3 px-4 rounded-xl">
            Disclaimer: This tool is for informational purposes only and does not constitute professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
