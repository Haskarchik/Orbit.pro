"use client";

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { useDashboard } from '@/context/DashboardContext';
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    PieChart, 
    Pie, 
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { Activity, Zap, TrendingUp, TrendingDown, Wallet, Award, PieChart as PieIcon } from 'lucide-react';

interface Habit {
  id: number;
  name: string;
  days: boolean[];
  streak: number;
  type: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  note: string;
  category: string;
  date: string;
}

interface AnalyticsProps {
  lang: Language;
  habits: Habit[];
  finances: Transaction[];
  currency: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ lang, habits, finances, currency }) => {
  const dict = TRANSLATIONS[lang];
  const [period, setPeriod] = React.useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const filteredFinances = useMemo(() => {
    if (period === 'all') return finances;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return finances.filter(f => (new Date(f.date || f.id).getTime()) > cutoff);
  }, [finances, period]);

  const stats = useMemo(() => {
     const income = filteredFinances.filter(f => f.type === 'income').reduce((acc, f) => acc + f.amount, 0);
     const expense = filteredFinances.filter(f => f.type === 'expense').reduce((acc, f) => acc + f.amount, 0);
     
     const categories: Record<string, number> = {};
     filteredFinances.forEach(f => {
         if (f.type === 'expense') {
            categories[f.category] = (categories[f.category] || 0) + f.amount;
         }
     });

     const categoryData = Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

     const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
     const dailyFlow = Array.from({ length: days }, (_, i) => {
         const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
         const dayStr = date.toLocaleDateString();
         const dayFinances = filteredFinances.filter(f => new Date(f.date || f.id).toLocaleDateString() === dayStr);
         return {
             day: date.toLocaleDateString(lang === 'ua' ? 'uk-UA' : 'en-US', { day: 'numeric', month: 'short' }),
             income: dayFinances.filter(f => f.type === 'income').reduce((acc, f) => acc + f.amount, 0),
             expense: dayFinances.filter(f => f.type === 'expense').reduce((acc, f) => acc + f.amount, 0)
         };
     });

     return { income, expense, balance: income - expense, categoryData, dailyFlow };
  }, [filteredFinances, period, lang]);

  const taskTrend = useMemo(() => {
       const daysLimit = period === '7d' ? 7 : 30;
       return Array.from({ length: daysLimit }, (_, i) => {
           const date = new Date(Date.now() - (daysLimit - 1 - i) * 24 * 60 * 60 * 1000);
           const dayIdx = date.getDate() - 1;
           const isCurrentMonth = date.getMonth() === new Date().getMonth();
           
           // We only have 30 slots, so we only show data for the current month's days
           // or we'd need a more complex data store.
           const efficiency = (isCurrentMonth && dayIdx >= 0 && dayIdx < 30)
               ? habits.reduce((acc, h) => acc + (h.days[dayIdx] ? 1 : 0), 0) / (habits.length || 1) * 100
               : 0;

           return {
               day: date.toLocaleDateString(lang === 'ua' ? 'uk-UA' : 'en-US', { day: 'numeric', month: 'short' }),
               efficiency
           };
       });
  }, [habits, period, lang]);

  const COLORS = ['#06b6d4', '#f97316', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899'];

  const { aiCache, setAiCache } = useDashboard();
  const [isAiLoading, setIsAiLoading] = useState(false);

  // We only fetch if the core metrics for the current period/lang have changed.
  const aiRequestData = useMemo(() => {
    const balance = stats.income - stats.expense;
    const efficiency = Math.round(taskTrend.reduce((acc, d) => acc + d.efficiency, 0) / (taskTrend.length || 1));
    const topExpense = stats.categoryData[0]?.name || "None";
    
    // The fingerprint should represent ALL data that goes into the AI prompt
    const fingerprint = `v1-${lang}-${period}-${balance}-${efficiency}-${topExpense}-${finances.length}`;
    
    return {
        fingerprint,
        payload: {
            lang,
            data: {
                balance,
                efficiency,
                topExpense,
                recentHighlights: finances.slice(-5).map(f => `${f.note} (${f.category})`)
            }
        }
    };
  }, [lang, period, stats.income, stats.expense, stats.categoryData, taskTrend, finances]);

  const cachedInsight = aiCache[aiRequestData.fingerprint];

  useEffect(() => {
    // ABORT if already loading or we have this exact data combination in cache
    if (isAiLoading || cachedInsight) return;

    const getDynamicAiInsight = async () => {
        setIsAiLoading(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aiRequestData.payload)
            });
            const data = await res.json();
            if (data.summary && !data.error) {
                setAiCache(aiRequestData.fingerprint, data.summary);
            }
        } catch (e) {
            console.error("AI Insight Fetch Failure:", e);
        } finally {
            setIsAiLoading(false);
        }
    };

    // Minor delay to ensure we are not double-fetching in strict mode or rapid-fire renders
    const timer = setTimeout(getDynamicAiInsight, 500);
    return () => clearTimeout(timer);
  }, [aiRequestData.fingerprint, cachedInsight, isAiLoading, setAiCache]);

  const displayedInsight = useMemo(() => {
    if (cachedInsight) return cachedInsight;
    
    // Fallback static summary if no AI insight is available yet
    const isUa = lang === 'ua';
    const balance = stats.income - stats.expense;
    const efficiency = Math.round(taskTrend.reduce((acc, d) => acc + d.efficiency, 0) / (taskTrend.length || 1));
    const topExpense = stats.categoryData[0];
    
    let summary = isUa 
      ? "Ваша фінансова стратегія виглядає збалансованою." 
      : "Your financial strategy looks balanced.";

    if (topExpense) {
        const catName = topExpense.name.toLowerCase();
        if (catName.includes('food') || catName.includes('їж') || catName.includes('ресто')) {
            summary = isUa 
                ? `Схоже, цього місяця ви дуже смачно харчувалися, і це трохи вплинуло на ваш баланс.`
                : `It looks like you enjoyed some great meals this month, which had a noticeable impact on your balance.`;
        }
    }
    return summary;
  }, [cachedInsight, lang, stats, taskTrend]);

  const displayedSummary = displayedInsight;
  const balance = stats.income - stats.expense;
  const velocity = Math.round(taskTrend.reduce((acc, d) => acc + d.efficiency, 0) / (taskTrend.length || 1));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-600/10 text-orange-500 rounded-xl flex items-center justify-center border border-orange-600/20">
                  <Activity size={20} />
              </div>
              <div>
                  <h2 className="text-xl font-black italic text-white uppercase leading-none">{lang === 'ua' ? 'СТРАТЕГІЧНИЙ ХАБ' : 'STRATEGIC HUB'}</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{lang === 'ua' ? 'ЧАСОВА ПЕРСПЕКТИВА' : 'TEMPORAL PERSPECTIVE'}</p>
              </div>
          </div>
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
              {(['7d', '30d', '90d', 'all'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${period === p ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-500 hover:text-white'}`}
                  >
                      {p === '7d' ? (lang === 'ua' ? '7 ДНІВ' : '7 DAYS') : p === '30d' ? (lang === 'ua' ? 'МІСЯЦЬ' : 'MONTH') : p === '90d' ? (lang === 'ua' ? 'КВАРТАЛ' : 'QUARTER') : (lang === 'ua' ? 'ВСЕ' : 'ALL')}
                  </button>
              ))}
          </div>
      </div>

      <div className="glass-card bg-gradient-to-r from-slate-900/10 to-orange-600/5 border-orange-500/20 p-8 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
              <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">{lang === 'ua' ? 'Резюме для керівника' : 'Executive Summary'}</div>
                      {cachedInsight && !isAiLoading && (
                          <div className="text-[8px] font-black bg-orange-600/10 text-orange-500 px-2 py-0.5 rounded border border-orange-500/20 tracking-widest animate-pulse">
                              {lang === 'ua' ? 'AI СПОСТЕРІГАЧ' : 'AI OBSERVER'}
                          </div>
                      )}
                  </div>
                  <h3 className={`text-2xl font-black italic text-white leading-tight uppercase transition-all duration-700 ${isAiLoading ? 'opacity-40' : 'opacity-100'}`}>
                      {isAiLoading ? (lang === 'ua' ? 'АНАЛІЗУЮ ДАНІ...' : 'ANALYZING DATA...') : displayedSummary}
                  </h3>
                  <div className="flex gap-4">
                      <div className="flex items-center gap-2 bg-slate-950/40 p-2 px-3 rounded-lg border border-slate-800">
                          <Zap size={14} className="text-orange-500" />
                          <span className="text-[10px] font-bold text-slate-400">{lang === 'ua' ? 'Ефективність: ' : 'Velocity: '} <span className="text-white">{velocity}%</span></span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-950/40 p-2 px-3 rounded-lg border border-slate-800">
                          <TrendingUp size={14} className="text-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-400">{lang === 'ua' ? 'Потік: ' : 'Flow: '} <span className={balance >= 0 ? 'text-emerald-400' : 'text-red-400'}>{currency}{balance.toLocaleString()}</span></span>
                      </div>
                  </div>
              </div>
              <div className="w-full md:w-48 h-32 bg-slate-950/40 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center relative group">
                  <div className="text-[10px] font-black text-slate-600 uppercase mb-2">STATUS</div>
                  <div className={`text-xl font-black italic ${balance >= 0 && velocity > 70 ? 'text-emerald-500' : 'text-orange-500'}`}>
                      {balance >= 0 && velocity > 70 ? 'OPTIMAL' : 'ADAPTIVE'}
                  </div>
                  <div className="absolute -inset-0.5 bg-orange-600/10 rounded-2xl -z-10 group-hover:bg-orange-600/20 transition-all blur-xl" />
              </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Zap, label: dict.discipline, value: `${velocity}%`, color: 'orange' },
          { icon: TrendingUp, label: dict.income, value: `${currency}${stats.income.toLocaleString()}`, color: 'emerald' },
          { icon: TrendingDown, label: dict.burnRate, value: `${currency}${stats.expense.toLocaleString()}`, color: 'red' },
          { icon: Wallet, label: dict.netTreasury, value: `${currency}${stats.balance.toLocaleString()}`, color: 'cyan', special: true }
        ].map((kpi, i) => (
          <div key={i} className={`glass-card p-8 border-${kpi.color}-500/10 bg-gradient-to-br from-${kpi.color}-500/5 to-transparent flex items-center gap-6 group hover:border-${kpi.color}-500/30 transition-all`}>
            <div className={`w-14 h-14 bg-${kpi.color}-600/10 text-${kpi.color}-500 rounded-2xl flex items-center justify-center border border-${kpi.color}-600/20 shadow-[0_0_20px_rgba(0,0,0,0.15)] group-hover:scale-110 transition-transform`}>
              <kpi.icon size={32} />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{kpi.label}</div>
              <div className={`text-3xl font-black italic ${kpi.special ? (stats.balance >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-white'} leading-none`}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-card p-10 border-slate-800">
                <h3 className="text-sm font-black italic text-white mb-10 flex items-center gap-4 uppercase tracking-[0.2em]">
                  <TrendingUp size={16} className="text-orange-600" />
                    {dict.sprintVelocity}
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={taskTrend}>
                      <defs>
                        <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="efficiency" stroke="#f97316" fillOpacity={1} fill="url(#colorEff)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-card p-10 border-slate-800">
                <h3 className="text-sm font-black italic text-white mb-10 flex items-center gap-4 uppercase tracking-[0.2em]">
                    <PieIcon size={16} className="text-cyan-500" />
                    {lang === 'ua' ? 'Розподіл Сфер' : 'Sphere Allocation'}
                </h3>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={stats.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {stats.categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-6">
                    {stats.categoryData.slice(0, 5).map((c, i) => (
                        <div key={i} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{c.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 italic">{currency}{c.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-10 border-slate-800">
                <h3 className="text-sm font-black italic text-white mb-10 flex items-center gap-4 uppercase tracking-[0.2em]">
                    <Activity size={18} className="text-orange-500" />
                    {dict.financialAudit}
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.dailyFlow}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }} />
                      <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-card p-10 border-slate-800 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-600/10 text-emerald-500 rounded-3xl flex items-center justify-center border border-emerald-600/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                <Award size={40} />
              </div>
              <div>
                <h3 className="text-xl font-black italic text-white uppercase">{lang === 'ua' ? 'Ефективність Капіталу' : 'Capital Efficiency'}</h3>
                <p className="text-xs text-slate-500 font-bold max-w-xs mt-2 mx-auto">
                   {stats.income > stats.expense 
                    ? (lang === 'ua' ? 'Ви накопичуєте ресурси швидше, ніж витрачаєте. Рекомендуємо активувати фріланс-канал.' : 'You are accumulating resources faster than consuming. Recommend activating freelance channel.')
                    : (lang === 'ua' ? 'Витрати перевищують доходи. Потрібна оптимізація.' : 'Consumption exceeds income. Optimization required.')}
                </p>
              </div>
              <div className="w-full pt-6 border-t border-slate-800 flex justify-around">
                 <div>
                    <span className="text-[10px] font-black text-slate-600 uppercase block mb-1">RATIO</span>
                    <span className="text-2xl font-black italic text-orange-500">{stats.expense > 0 ? (stats.income / stats.expense).toFixed(1) : '∞'}x</span>
                 </div>
                 <div>
                    <span className="text-[10px] font-black text-slate-600 uppercase block mb-1">VELOCITY</span>
                    <span className="text-2xl font-black italic text-cyan-500">+{Math.round((stats.income - stats.expense) / (stats.income || 1) * 100)}%</span>
                 </div>
              </div>
            </div>
      </div>
    </div>
  );
};

export default Analytics;
