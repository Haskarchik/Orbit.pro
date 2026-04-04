"use client";

import React, { useMemo } from 'react';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { List, CheckCircle2, Circle, Clock, Trash2, TrendingUp, TrendingDown, Zap, Wallet } from 'lucide-react';

interface Habit {
  id: number;
  name: string;
  status: 'todo' | 'doing' | 'done';
  type: 'routine' | 'task';
  time: string;
  streak: number;
  days: boolean[];
}

interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  note: string;
  category: string;
  date: string;
}

interface ListProps {
  lang: Language;
  habits: Habit[];
  finances: Transaction[];
  currency: string;
  onDelete: (id: number) => void;
  onDeleteFinance: (id: number) => void;
  onStatusChange: (id: number, status: 'todo' | 'doing' | 'done') => void;
}

const CompactList: React.FC<ListProps> = ({ lang, habits, finances, currency, onDelete, onDeleteFinance, onStatusChange }) => {
  const dict = TRANSLATIONS[lang];

  const sortedHabits = useMemo(() => [...habits].sort((a, b) => b.id - a.id), [habits]);
  const sortedFinances = useMemo(() => [...finances].sort((a, b) => b.id - a.id), [finances]);

  const totalIncome = finances.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const totalExpense = finances.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-700">
      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 md:p-5 border-slate-800/50 flex items-center gap-4 md:gap-6">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center border border-orange-500/20 shadow-[0_0_15px_rgba(234,88,12,0.1)] flex-shrink-0">
            <Zap size={18} />
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.1em] md:tracking-widest">{lang === 'ua' ? 'Ритуалів' : 'Rituals'}</div>
            <div className="text-lg md:text-xl font-black italic text-white">{habits.length}</div>
          </div>
        </div>
        <div className="glass-card p-4 md:p-5 border-emerald-500/10 flex items-center gap-4">
          <div className="w-9 h-9 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp size={16} />
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.1em] md:tracking-widest">{dict.income}</div>
            <div className="text-lg md:text-xl font-black italic text-emerald-400">+{currency}{totalIncome.toLocaleString()}</div>
          </div>
        </div>
        <div className="glass-card p-4 md:p-5 border-red-500/10 flex items-center gap-4">
          <div className="w-9 h-9 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingDown size={16} />
          </div>
          <div>
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.1em] md:tracking-widest">{dict.expense}</div>
            <div className="text-lg md:text-xl font-black italic text-red-400">-{currency}{totalExpense.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* LEFT: HABITS / TASKS */}
        <div className="glass-card flex flex-col h-[450px] md:h-[500px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 flex-shrink-0 gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <Zap size={12} className="text-orange-500" />
              {lang === 'ua' ? 'Ритуали та задачі' : 'Rituals & Tasks'}
            </h3>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wider md:tracking-widest">
              {sortedHabits.length} {dict.loggedEntities}
            </span>
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1 scrollbar-hide">
            {sortedHabits.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-800 rounded-2xl text-center">
                <div className="text-[10px] font-black text-slate-700 uppercase italic">{dict.noGoals}</div>
              </div>
            ) : sortedHabits.map((item) => (
              <div
                key={item.id}
                className="flex items-center group bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 hover:border-slate-700/80 transition-all hover:bg-slate-800/30"
              >
                <div className="w-10 flex justify-center">
                  <button
                    onClick={() => onStatusChange(item.id, item.status === 'done' ? 'todo' : 'done')}
                    className={`transition-colors ${item.status === 'done' ? 'text-emerald-500' : 'text-slate-700 hover:text-slate-500'}`}
                  >
                    {item.status === 'done' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                </div>

                <div className="flex-1 px-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold transition-all text-sm ${item.status === 'done' ? 'text-slate-600 line-through' : 'text-slate-200'}`}>
                      {item.name}
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                      item.type === 'routine' ? 'border-cyan-900/50 text-cyan-500/60' : 'border-purple-900/50 text-purple-500/60'
                    }`}>
                      {item.type === 'routine' ? dict.routine : dict.task}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold uppercase">
                      <Clock size={10} />
                      {item.time}
                    </div>
                    {item.streak > 0 && (
                      <div className="text-[10px] text-orange-600 font-bold uppercase tracking-tighter">
                        ● {item.streak} {lang === 'ua' ? 'ДН. СЕРІЯ' : 'DAY STREAK'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-slate-700 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: FINANCES */}
        <div className="glass-card flex flex-col h-[500px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 flex-shrink-0 gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <Wallet size={12} className="text-cyan-500" />
              {lang === 'ua' ? 'Фінансові операції' : 'Transactions'}
            </h3>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-700 tracking-wider md:tracking-widest">
              {sortedFinances.length} {dict.loggedEntities}
            </span>
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1 scrollbar-hide">
            {sortedFinances.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-800 rounded-2xl text-center">
                <div className="text-[10px] font-black text-slate-700 uppercase italic">{dict.noHistory}</div>
              </div>
            ) : sortedFinances.map((item) => (
              <div
                key={item.id}
                className="flex items-center group bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 hover:border-slate-700/80 transition-all hover:bg-slate-800/30"
              >
                <div className="w-10 flex justify-center">
                  <div className={`p-2 rounded-lg ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {item.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </div>
                </div>

                <div className="flex-1 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-sm">{item.note || (lang === 'ua' ? 'Операція' : 'Transaction')}</span>
                    <span className={`text-[9px] font-black italic ${item.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.type === 'income' ? '+' : '-'}{currency}{item.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">
                    {item.category}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => onDeleteFinance(item.id)}
                    className="p-2 text-slate-700 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactList;
