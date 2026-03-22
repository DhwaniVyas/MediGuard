import React, { useState, useEffect, useRef } from 'react';
import { getMedicineNames } from '../services/medicineEngine';

export default function MedicineAutocomplete({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // Update parent state even if not a selected suggestion yet

    if (val.trim().length > 0) {
      const allMeds = getMedicineNames();
      const matches = allMeds
        .filter(m => m.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 8); // Max 8 suggestions
      setSuggestions(matches);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (med) => {
    setQuery(med);
    onChange(med);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {suggestions.map((med, index) => (
            <li
              key={index}
              onClick={() => handleSelect(med)}
              className="px-4 py-2 hover:bg-surface cursor-pointer text-navy transition-colors border-b border-gray-50 last:border-0"
            >
              {med}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
