import React, { useEffect, useState } from 'react';
import NewsCard from '../components/NewsCard';
import { Newspaper, Search, AlertCircle } from 'lucide-react';

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    document.title = "Health News — MediGuard";
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        // Use the proxy server in both dev and production
        // In dev, Vite handles the proxy to http://localhost:3001
        // In production, the actual domain should have /api/news mapped to the proxy server
        let url = `/api/news`;
        if (debouncedQuery.trim()) {
          url += `?q=${encodeURIComponent(debouncedQuery.trim())}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.status === 'ok' && data.articles) {
          setArticles(data.articles.filter(a => a.title !== '[Removed]'));
        } else {
          loadFallbackNews();
        }
      } catch (err) {
        loadFallbackNews();
      }
      setLoading(false);
    }
    
    fetchNews();
  }, [debouncedQuery]);

  const loadFallbackNews = () => {
    const fallbacks = [
      {
        title: 'New Study Shows Benefits of Regular Cardio for Long-term Heart Health',
        description: 'Researchers have identified key markers in cardiovascular improvement after just 30 days of consistent aerobic exercise.',
        source: { name: 'Medical Journal' },
        publishedAt: new Date().toISOString(),
        url: '#',
        urlToImage: null
      },
      {
        title: 'Breakthrough in AI-assisted Diagnostic Medical Imaging',
        description: 'Healthcare providers are rapidly adopting new machine learning tools that can detect anomalies with 99% accuracy.',
        source: { name: 'Tech Health Daily' },
        publishedAt: new Date().toISOString(),
        url: '#',
        urlToImage: null
      },
      {
        title: 'Nutritional Psychiatry: How Food Impacts Mental Health',
        description: 'Examining the growing body of evidence linking gut microbiome health directly to symptom severity in anxiety and depression.',
        source: { name: 'Global Health News' },
        publishedAt: new Date().toISOString(),
        url: '#',
        urlToImage: null
      },
      {
        title: 'Understanding the New Guidelines for Preventive Screenings',
        description: 'The global medical board has released updated recommendations for annual checkups and bloodwork across all adult age groups.',
        source: { name: 'Health Policy Watch' },
        publishedAt: new Date().toISOString(),
        url: '#',
        urlToImage: null
      }
    ];

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      setArticles(fallbacks.filter(a => 
        a.title?.toLowerCase().includes(q) || 
        a.description?.toLowerCase().includes(q)
      ));
    } else {
      setArticles(fallbacks);
    }
  };

  const filteredArticles = articles; // Render articles directly since API does the filtering

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Newspaper className="w-8 h-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">Health News</h1>
          </div>
          <p className="text-gray-500 text-lg">Latest medical and health updates from around the world</p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all shadow-sm"
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 h-96 overflow-hidden animate-pulse flex flex-col">
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="w-1/3 h-3 bg-gray-200 rounded"></div>
                <div className="w-full h-5 bg-gray-200 rounded"></div>
                <div className="w-4/5 h-5 bg-gray-200 rounded mb-2"></div>
                <div className="w-full h-3 bg-gray-200 rounded"></div>
                <div className="w-full h-3 bg-gray-200 rounded"></div>
                <div className="mt-auto flex justify-between">
                  <div className="w-1/4 h-3 bg-gray-200 rounded"></div>
                  <div className="w-1/4 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article, index) => (
            <NewsCard key={index} article={article} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-navy mb-2">No articles found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            We couldn't find any health news matching "{searchQuery}". Try using different keywords.
          </p>
        </div>
      )}
    </div>
  );
}
