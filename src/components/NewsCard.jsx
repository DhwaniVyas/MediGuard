import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function NewsCard({ article }) {
  const { title, description, urlToImage, url, source, publishedAt } = article;

  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-200 flex flex-col h-full">
      {urlToImage ? (
        <img src={urlToImage} alt={title} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-navy flex items-center justify-center">
          <ShieldCheck className="w-16 h-16 text-teal" />
        </div>
      )}
      
      <div className="p-5 flex flex-col flex-1">
        <span className="text-teal font-medium text-xs uppercase tracking-wider mb-2">
          {source?.name || 'Medical News'}
        </span>
        <h3 className="text-navy font-semibold text-lg leading-tight mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">
          {description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="text-gray-400 text-sm">{formattedDate}</span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-skyblue font-medium text-sm hover:underline">
            Read More →
          </a>
        </div>
      </div>
    </div>
  );
}
