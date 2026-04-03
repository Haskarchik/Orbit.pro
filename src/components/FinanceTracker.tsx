"use client";

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Plus, Trash2, X, Tag, FileText, DollarSign } from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';

interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  note: string;
  category: string;
  date: string;
}

import CustomDropdown from './CustomDropdown';

interface FinanceProps {
  lang: Language;
  finances: Transaction[];
  categories: { income: string[], expense: string[] };
  currency: string;
  onAdd: (amount: number, type: 'income' | 'expense', note: string, category: string) => void;
  onDelete: (id: number) => void;
}

const FinanceTracker: React.FC<FinanceProps> = ({ lang, finances, categories, currency, onAdd, onDelete }) => {
  const dict = TRANSLATIONS[lang];
  const [showForm, setShowForm] = useState<null | 'income' | 'expense'>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('');

  const balance = finances.reduce((acc, curr) => 
    curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !showForm) return;
    
    onAdd(parseFloat(amount), showForm, note || (lang === 'ua' ? 'Транзакція' : 'Transaction'), category || categories[showForm][0]);
    
    setShowForm(null);
    setAmount('');
    setNote('');
    setCategory('');
  };

  return (
    <div className="space-y-6">
      {/* GLOBAL BALANCE CARD */}
      <div className="glass-card relative overflow-hidden group">
        <div className="relative z-10">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Wallet size={12} />
            {dict.totalBalance}
          </div>
          <div className={`text-4xl font-bold tracking-tighter ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {currency}{balance.toLocaleString()}
          </div>
        </div>
        <div className="absolute top-1/2 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />
      </div>

      {/* ACTION TABS */}
      {!showForm ? (
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => { setShowForm('income'); setCategory(categories.income[0]); }}
            className="flex items-center justify-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 hover:bg-emerald-500/20 transition-all font-black uppercase text-[10px] tracking-widest"
          >
            <Plus size={16} />
            {dict.income}
          </button>
          <button 
            onClick={() => { setShowForm('expense'); setCategory(categories.expense[0]); }}
            className="flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 hover:bg-red-500/20 transition-all font-black uppercase text-[10px] tracking-widest"
          >
            <Plus size={16} />
            {dict.expense}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card bg-slate-900 border-orange-500/30 animate-in slide-in-from-top-4 duration-300 relative space-y-4">
          <button 
            type="button"
            onClick={() => setShowForm(null)}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
          
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-4">
            {showForm === 'income' ? dict.recordIncome : dict.recordExpense}
          </div>

          <div className="space-y-4">
             <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">{currency}</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white font-bold focus:border-orange-500 outline-none transition-colors"
                />
             </div>

             <div className="grid grid-cols-1 gap-4">
                <CustomDropdown 
                    options={categories[showForm]}
                    value={category}
                    onChange={setCategory}
                />
                
                <div className="relative">
                    <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={dict.notePlaceholder}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white text-xs focus:border-orange-500 outline-none transition-colors"
                    />
                </div>
             </div>

             <button 
                type="submit"
                className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-white transition-all ${
                    showForm === 'income' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                }`}
             >
                {showForm === 'income' ? dict.applyIncome : dict.applyExpense}
             </button>
          </div>
        </form>
      )}

      {/* HISTORY TABLE */}
      <div className="glass-card flex-1 min-h-[400px]">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 px-2 flex items-center justify-between">
            {dict.history}
            <span className="bg-slate-800 px-2 py-1 rounded-md text-white font-bold">{finances.length}</span>
        </h3>
        
        <div className="space-y-3">
          {finances.length === 0 ? (
            <div className="text-center py-20 text-slate-600 text-[10px] uppercase font-bold tracking-widest italic leading-relaxed">
                {dict.noHistory}
            </div>
          ) : (
            finances.slice().reverse().map(f => (
              <div key={f.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-800/10 hover:bg-slate-950 hover:border-slate-800 border border-slate-800/30 rounded-2xl transition-all group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${f.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {f.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-300 italic truncate">{f.note}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[9px] bg-slate-900 px-2 py-1 rounded-lg text-slate-500 font-black uppercase tracking-tighter border border-slate-800 whitespace-nowrap">{f.category}</span>
                        <span className="text-[9px] text-slate-600 font-bold whitespace-nowrap">{new Date(f.id).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-800/30 sm:border-0">
                    <div className={`font-black italic text-md ${f.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {f.type === 'income' ? '+' : '-'}{currency}{f.amount.toLocaleString()}
                    </div>
                    <button 
                        onClick={() => onDelete(f.id)}
                        className="text-slate-800 hover:text-red-500 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceTracker;
