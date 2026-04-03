"use client";

import React, { useState } from 'react';
import HabitMatrix from '@/components/HabitMatrix';
import HabitBoard from '@/components/HabitBoard';
import HabitCalendar from '@/components/HabitCalendar';
import CompactList from '@/components/CompactList';
import FinanceTracker from '@/components/FinanceTracker';
import SavingsTracker from '@/components/SavingsTracker';
import { useDashboard } from '@/context/DashboardContext';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { 
    Zap, 
    ShieldCheck, 
    PlusCircle, 
    LayoutDashboard,
    Wallet,
    BarChart3,
    Target as TargetIcon,
    Activity,
    Plus,
    X,
    Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: langParam } = React.use(params);
    const lang = langParam as Language;
    const { 
        habits, finances, savingsGoals, disciplineLevel, currencySymbol,
        toggleDay, addHabit, updateHabitStatus, deleteHabit,
        addFinance, deleteFinance, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, dict
    } = useDashboard();

    const [activeSubview, setActiveSubview] = useState<string>('protocol');
    const [habitModal, setHabitModal] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitType, setNewHabitType] = useState<'routine' | 'task'>('routine');
    const [newHabitTime, setNewHabitTime] = useState('09:00');

    const handleAddHabit = () => {
        if (!newHabitName) return;
        addHabit(newHabitName, newHabitType, newHabitTime);
        setNewHabitName('');
        setHabitModal(false);
    };

    const handleToggle = (id: number, day: number) => {
        toggleDay(id, day);
        // Confetti logic was in toggleDay or here? Keep it here for UI effect
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f97316', '#06b6d4', '#10b981']
        });
    };

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter uppercase leading-none">
                        {dict.dashboard}
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic">{dict.welcomeSub}</p>
                </div>
                <button onClick={() => setHabitModal(true)} className="btn-primary w-full md:w-auto hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all">
                    <PlusCircle size={20} />
                    {dict.addTask}
                </button>
            </header>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="glass-card border-orange-500/20 bg-orange-500/5 p-6 md:p-8 flex items-center gap-6 md:gap-8 group hover:bg-orange-500/10 transition-all">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-600/10 text-orange-500 rounded-2xl flex items-center justify-center border border-orange-600/20 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] md:tracking-[0.3em] mb-2">{dict.discipline}</div>
                        <div className="text-2xl md:text-3xl font-black italic text-white leading-none">{disciplineLevel}%</div>
                    </div>
                </div>
                <div className="glass-card border-emerald-500/20 bg-emerald-500/5 p-6 md:p-8 flex items-center gap-6 md:gap-8 group hover:bg-emerald-500/10 transition-all">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-600/20 group-hover:scale-110 transition-transform">
                        <Wallet size={28} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] md:tracking-[0.3em] mb-2">{dict.totalBalance}</div>
                        <div className="text-2xl md:text-3xl font-black italic text-white leading-none">{currencySymbol}{finances.reduce((acc, f) => f.type === 'income' ? acc + f.amount : acc - f.amount, 0).toLocaleString()}</div>
                    </div>
                </div>
                <div className="glass-card border-cyan-500/20 bg-cyan-500/5 p-6 md:p-8 flex items-center gap-6 md:gap-8 group hover:bg-cyan-500/10 transition-all">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-cyan-600/10 text-cyan-500 rounded-2xl flex items-center justify-center border border-cyan-600/20 group-hover:scale-110 transition-transform">
                        <TargetIcon size={28} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] md:tracking-[0.3em] mb-2">{dict.savings}</div>
                        <div className="text-2xl md:text-3xl font-black italic text-white leading-none">{savingsGoals.length} ACTIVE</div>
                    </div>
                </div>
                <div className="glass-card border-slate-800 bg-slate-900/40 p-6 md:p-8 flex items-center gap-6 md:gap-8 group hover:bg-slate-800/80 transition-all">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BarChart3 size={28} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] md:tracking-[0.3em] mb-2">{dict.longestStreak}</div>
                        <div className="text-2xl md:text-3xl font-black italic text-white leading-none">{Math.max(...habits.map(h => h.streak), 0)} {lang === 'ua' ? 'ДН.' : 'DAYS'}</div>
                    </div>
                </div>
            </div>

            {/* Subviews & Main Content */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex items-center gap-2">
                    {([
                        { key: 'protocol', label: lang === 'ua' ? 'Протокол' : 'Protocol' },
                        { key: 'matrix', label: lang === 'ua' ? 'Матриця' : 'Matrix' },
                        { key: 'board', label: lang === 'ua' ? 'Дошка' : 'Board' },
                        { key: 'list', label: lang === 'ua' ? 'Список' : 'List' },
                        { key: 'calendar', label: lang === 'ua' ? 'Календар' : 'Calendar' },
                    ]).map(({ key, label }) => (
                        <button 
                            key={key}
                            onClick={() => setActiveSubview(key)}
                            className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all border whitespace-nowrap ${
                                activeSubview === key 
                                ? 'bg-orange-500/10 border-orange-500/40 text-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.1)]' 
                                : 'bg-transparent border-transparent text-slate-600 hover:text-slate-400 hover:bg-slate-900'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="col-span-12 lg:col-span-8 space-y-12">
                    {activeSubview === 'protocol' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 animate-in slide-in-from-bottom-4 duration-700">
                             <div className="glass-card border-slate-800/50 bg-slate-900/10 p-5 md:p-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
                                    <h3 className="text-sm font-black italic text-white flex items-center gap-3 uppercase tracking-[0.1em] md:tracking-widest">
                                        <Zap size={18} className="text-orange-500" />
                                        {dict.dailyProtocol}
                                    </h3>
                                    <div className="text-[10px] font-black text-slate-700 uppercase">{new Date().toLocaleDateString(lang === 'ua' ? 'uk-UA' : 'en-US', { day: 'numeric', month: 'long' })}</div>
                                </div>
                                <div className="h-[380px] overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                                    {habits.map(h => (
                                        <div key={h.id} className="flex items-center justify-between p-4 md:p-5 bg-slate-950/40 border border-slate-800/30 rounded-3xl group hover:border-orange-500/30 transition-all cursor-pointer" onClick={() => handleToggle(h.id, new Date().getDate() - 1)}>
                                            <div className="flex items-center gap-4 md:gap-5">
                                                <div className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${h.days[new Date().getDate() - 1] ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-800'}`}>
                                                    {h.days[new Date().getDate() - 1] && <ShieldCheck size={16} />}
                                                </div>
                                                <div className="font-bold text-slate-200 text-sm">{h.name}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="glass-card p-5 md:p-8 border-slate-800">
                                <h3 className="text-sm font-black italic text-white mb-6 md:mb-8 uppercase flex items-center gap-3 tracking-[0.1em] md:tracking-widest">
                                    <Zap size={18} className="text-cyan-500" />
                                    {dict.strategicObjectives}
                                </h3>
                                <div className="space-y-6">
                                    {savingsGoals.slice(0, 3).map(goal => (
                                        <div key={goal.id} className="space-y-3">
                                            <div className="flex justify-between px-1 gap-2">
                                                <span className="text-[10px] font-black text-slate-500 italic uppercase truncate flex-1">{goal.name}</span>
                                                <span className="text-[10px] font-black text-orange-500 whitespace-nowrap">{Math.round((goal.current/goal.target)*100)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                                                <div className="h-full bg-orange-600" style={{ width: `${(goal.current/goal.target)*100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSubview === 'matrix' && <HabitMatrix lang={lang} habits={habits} onToggle={handleToggle} />}
                    {activeSubview === 'board' && <HabitBoard lang={lang} habits={habits} finances={finances} currency={currencySymbol} onStatusChange={updateHabitStatus} onDeleteFinance={deleteFinance} />}
                    {activeSubview === 'list' && <CompactList lang={lang} habits={habits} finances={finances} currency={currencySymbol} onDelete={deleteHabit} onDeleteFinance={deleteFinance} onStatusChange={updateHabitStatus} />}
                    {activeSubview === 'calendar' && <HabitCalendar lang={lang} habits={habits} finances={finances} currency={currencySymbol} />}

                    <SavingsTracker lang={lang} goals={savingsGoals} finances={finances} currency={currencySymbol} onAdd={addSavingsGoal} onUpdate={updateSavingsGoal} onDelete={deleteSavingsGoal} />
                </div>
                <div className="col-span-12 lg:col-span-4 lg:sticky top-12">
                    <FinanceTracker lang={lang} finances={finances} categories={{ income: [], expense: [] }} currency={currencySymbol} onAdd={addFinance} onDelete={deleteFinance} />
                </div>
            </div>

            {/* Modal for adding habit */}
            {habitModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
                    <div className="glass-card max-w-md w-full p-6 md:p-10 border-slate-800">
                        <header className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black italic text-white uppercase">{dict.addTask}</h2>
                            <button onClick={() => setHabitModal(false)}><X size={24} className="text-slate-500" /></button>
                        </header>
                        <div className="space-y-6">
                            <input 
                                type="text"
                                value={newHabitName}
                                onChange={(e) => setNewHabitName(e.target.value)}
                                placeholder="Task Name..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-6 text-white text-sm outline-none focus:border-orange-500 font-bold"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setNewHabitType('routine')} className={`py-3 rounded-xl border font-black uppercase text-[10px] ${newHabitType === 'routine' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'border-slate-800 text-slate-600'}`}>{dict.routine}</button>
                                <button onClick={() => setNewHabitType('task')} className={`py-3 rounded-xl border font-black uppercase text-[10px] ${newHabitType === 'task' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'border-slate-800 text-slate-600'}`}>{dict.task}</button>
                            </div>
                            <button onClick={handleAddHabit} className="btn-primary w-full py-4">{dict.addTask}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
