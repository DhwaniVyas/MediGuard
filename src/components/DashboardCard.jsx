import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function DashboardCard({ Icon, colorClass, route, title, description }) {
  return (
    <Link 
      to={route} 
      className="bg-white rounded-2xl shadow-card p-6 flex flex-col hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 relative group"
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 text-white`} style={{ backgroundColor: colorClass }}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-navy mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      
      <div className="mt-auto self-end">
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal transition-colors" />
      </div>
    </Link>
  );
}
