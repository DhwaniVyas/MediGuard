import React from 'react';

export default function SymptomCheckbox({ symptom, isSelected, onToggle }) {
  const displayName = symptom.replace(/_/g, ' ');
  
  return (
    <button
      type="button"
      onClick={() => onToggle(symptom)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
        isSelected
          ? 'bg-teal text-white border-teal shadow-md'
          : 'bg-surface text-gray-600 border-gray-200 hover:border-teal hover:text-teal'
      }`}
    >
      {displayName}
    </button>
  );
}
