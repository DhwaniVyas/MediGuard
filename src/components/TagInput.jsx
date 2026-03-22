import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('');

  const addTag = (tagText) => {
    const newTag = tagText.trim();
    if (newTag && !value.includes(newTag)) {
      onChange([...value, newTag]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
      setInput('');
    }
  };

  const handleBlur = (e) => {
    if (input.trim()) {
      addTag(input);
      setInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 border border-gray-200 bg-white rounded-xl focus-within:border-teal mt-1 transition-all">
      {value.map(tag => (
        <span key={tag} className="flex items-center gap-1 bg-surface border border-gray-200 px-3 py-1 rounded-full text-sm text-navy">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 outline-none bg-transparent min-w-[120px] text-sm text-navy placeholder-gray-400"
      />
    </div>
  );
}
