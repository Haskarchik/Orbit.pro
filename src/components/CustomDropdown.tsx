"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Tag } from 'lucide-react';

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-xs font-bold hover:border-orange-500 transition-all outline-none group"
      >
        <div className="flex items-center gap-3">
            <Tag size={14} className="text-slate-500 group-hover:text-orange-500 transition-colors" />
            <span className={value ? 'text-white' : 'text-slate-500'}>{value || 'Select Category'}</span>
        </div>
        <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto p-2 space-y-1">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  value === opt ? 'bg-orange-600/20 text-orange-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {opt}
                {value === opt && <Check size={14} className="text-orange-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
