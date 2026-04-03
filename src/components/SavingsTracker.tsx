"use client";

import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, Calendar, Trash2, Plus, X, ArrowRight, PieChart } from 'lucide-react';
import CustomCalendar from './CustomCalendar';
import { TRANSLATIONS, Language } from '@/lib/translations';

interface Goal {
    id: number;
    name: string;
    target: number;
    current: number;
    deadline?: string;
    history: { id: number, date: string, amount: number }[];
}

interface SavingsProps {
    lang: Language;
    goals: Goal[];
    finances: any[];
    currency: string;
    onAdd: (name: string, target: number, current: number, deadline?: string) => void;
    onUpdate: (id: number, current: number) => void;
    onDelete: (id: number) => void;
}

const SavingsTracker: React.FC<SavingsProps> = ({ lang, goals, finances, currency, onAdd, onUpdate, onDelete }) => {
    const dict = TRANSLATIONS[lang];
    const [showAdd, setShowAdd] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [newName, setNewName] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const [newCurrent, setNewCurrent] = useState('');
    const [newDeadline, setNewDeadline] = useState('');

    // FORECAST LOGIC
    const monthlyVelocity = useMemo(() => {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        
        const recentTrans = finances.filter(f => new Date(f.date || f.id) > last30Days);
        const income = recentTrans.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
        const expense = recentTrans.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
        
        return Math.max(0, (income - expense));
    }, [finances]);

    const activeGoalsCount = useMemo(() => goals.filter(g => g.current < g.target).length, [goals]);

    const calculateForecast = (goal: Goal, isPreview: boolean = false) => {
        const remaining = goal.target - goal.current;
        if (remaining <= 0) return { months: 0, date: dict.reachedLabel };
        
        // Split surplus among all active goals
        const totalActive = isPreview ? activeGoalsCount + 1 : activeGoalsCount;
        const availableFlowPerGoal = monthlyVelocity / (totalActive || 1);

        if (availableFlowPerGoal <= 0) return { months: Infinity, date: dict.neverLabel };
        
        const months = remaining / availableFlowPerGoal;
        const date = new Date();
        date.setMonth(date.getMonth() + Math.ceil(months));
        
        return { 
            months: Math.ceil(months), 
            date: date.toLocaleDateString(lang === 'ua' ? 'uk-UA' : 'en-US', { month: 'short', year: 'numeric' })
        };
    };

    const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

    const activeGoal = useMemo(() => goals.find(g => g.id === selectedGoalId), [selectedGoalId, goals]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[0.05em] md:tracking-[0.2em] text-slate-500 flex items-center gap-2 min-w-0">
                    <Target size={16} className="text-cyan-500 flex-shrink-0" />
                    <span className="truncate">{dict.savings}</span>
                </h3>
                <button 
                    onClick={() => setShowAdd(!showAdd)}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                >
                    {showAdd ? <X size={16} /> : <Plus size={16} />}
                </button>
            </div>

            {showAdd && (
                <div className="glass-card border-orange-500/20 bg-orange-500/5 p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <input 
                        type="text" 
                        placeholder={dict.goalName}
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-orange-500"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="number" 
                            placeholder={dict.targetAmount}
                            value={newTarget}
                            onChange={e => setNewTarget(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-orange-500"
                        />
                        <input 
                            type="number" 
                            placeholder={dict.currentAmount}
                            value={newCurrent}
                            onChange={e => setNewCurrent(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-orange-500"
                        />
                    </div>
                    
                    {/* FORECAST PREVIEW DURING CREATION */}
                    {(Number(newTarget) > 0 && monthlyVelocity > 0) && (
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 border-dashed flex justify-between items-center animate-in fade-in duration-500">
                            <div className="text-[10px] font-black uppercase text-orange-500 flex items-center gap-2">
                                <PieChart size={12} />
                                {lang === 'ua' ? 'Очікуване завершення:' : 'Expected completion:'}
                            </div>
                            <div className="text-[10px] font-black text-white italic">
                                {(() => {
                                    const forecast = calculateForecast({ 
                                        id: 0, 
                                        name: '', 
                                        target: Number(newTarget), 
                                        current: Number(newCurrent) || 0,
                                        history: []
                                    }, true);
                                    return forecast.months === Infinity ? '---' : `${forecast.date} (${forecast.months} ${lang === 'ua' ? 'міс.' : 'mo.'})`;
                                })()}
                            </div>
                        </div>
                    )}

                    <button 
                        type="button"
                        onClick={() => setShowDatePicker(true)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-orange-500 text-left flex items-center justify-between"
                    >
                        <span className={newDeadline ? 'text-white font-bold' : 'text-slate-600 font-bold'}>
                            {newDeadline || (lang === 'ua' ? 'Виберіть дату дедлайну...' : 'Select Deadline Date...')}
                        </span>
                        <Calendar size={14} className="text-orange-500" />
                    </button>

                    {showDatePicker && (
                        <CustomCalendar 
                            lang={lang} 
                            value={newDeadline} 
                            onChange={setNewDeadline} 
                            onClose={() => setShowDatePicker(false)} 
                        />
                    )}

                    <button 
                        onClick={() => {
                            if (newName && newTarget) {
                                onAdd(newName, Number(newTarget), Number(newCurrent) || 0, newDeadline);
                                setShowAdd(false);
                                setNewName(''); setNewTarget(''); setNewCurrent(''); setNewDeadline('');
                            }
                        }}
                        className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                    >
                        {dict.confirm}
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {goals.map(goal => {
                    const progress = Math.min(100, (goal.current / goal.target) * 100);
                    
                    return (
                        <div key={goal.id} className="glass-card group hover:border-slate-700/50 transition-all p-5 md:p-6 relative">
                            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedGoalId(goal.id)} />
                            
                            <div className="relative z-10 flex items-start justify-between mb-4 pointer-events-none">
                                <div>
                                    <h4 className="text-sm font-black italic text-white mb-1 uppercase tracking-tight">{goal.name}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {currency}{goal.current.toLocaleString()} / {currency}{goal.target.toLocaleString()}
                                        </span>
                                        {goal.deadline && (
                                            <span className="text-[9px] font-black text-orange-500/60 uppercase flex items-center gap-1">
                                                <Calendar size={10} /> {goal.deadline}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }} 
                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-700 hover:text-red-500 transition-all pointer-events-auto"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="relative z-10 h-2 bg-slate-900 rounded-full overflow-hidden mb-6 pointer-events-none">
                                <div 
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="relative z-10 flex items-center justify-between mb-4 pointer-events-none">
                                <div className="text-[10px] font-black uppercase text-slate-700 tracking-widest">{dict.discipline}: <span className={progress >= 100 ? 'text-emerald-500' : 'text-cyan-500'}>{Math.round(progress)}%</span></div>
                                <div className="text-[10px] font-black uppercase text-slate-700 tracking-widest leading-none bg-slate-900 px-2 py-1 rounded">
                                    {progress >= 100 ? (lang === 'ua' ? 'ВЕРИФІКОВАНО' : 'VERIFIED') : (lang === 'ua' ? 'У ПРОЦЕСІ' : 'IN PROGRESS')}
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center gap-3">
                                <div className="flex-1 relative flex items-center">
                                    <span className="absolute left-4 text-slate-600 text-[10px] font-black">{currency}</span>
                                    <input 
                                        type="number"
                                        placeholder={lang === 'ua' ? 'Поповнити на...' : 'Replenish by...'}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = Number((e.target as HTMLInputElement).value);
                                                if (val > 0) {
                                                    onUpdate(goal.id, goal.current + val);
                                                    (e.target as HTMLInputElement).value = '';
                                                }
                                            }
                                        }}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-4 text-white text-[11px] font-bold outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-800"
                                    />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                                        const val = Number(input.value);
                                        if (val > 0) {
                                            onUpdate(goal.id, goal.current + val);
                                            input.value = '';
                                        }
                                    }}
                                    className="p-2.5 bg-cyan-600/10 border border-cyan-500/20 text-cyan-500 rounded-xl hover:bg-cyan-600 hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                >
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {activeGoal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="glass-card max-w-lg w-full p-8 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-cyan-600/10 text-cyan-500 rounded-2xl flex items-center justify-center border border-cyan-600/20">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">{activeGoal.name}</h3>
                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">
                                        {lang === 'ua' ? 'Історія поповнень та прогрес' : 'Replenishment History & Progress'}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedGoalId(null)}
                                className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{dict.targetAmount}</div>
                                    <div className="text-lg font-black italic text-white">{currency}{activeGoal.target.toLocaleString()}</div>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{lang === 'ua' ? 'Залишилося' : 'Remaining'}</div>
                                    <div className="text-lg font-black italic text-cyan-400">{currency}{Math.max(0, activeGoal.target - activeGoal.current).toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{lang === 'ua' ? 'ЛОГ ПОПОВНЕНЬ' : 'COLLECTION LOG'}</h4>
                                <div className="bg-slate-950/40 rounded-2xl border border-slate-800 divide-y divide-slate-800/50 max-h-[250px] overflow-y-auto scrollbar-hide">
                                    {activeGoal.history && activeGoal.history.slice().reverse().map((entry: { id: number, date: string, amount: number }, idx: number) => (
                                        <div key={entry.id || idx} className="p-4 flex items-center justify-between hover:bg-slate-950/60 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                <div className="text-xs font-bold text-slate-400">{entry.date}</div>
                                            </div>
                                            <div className="text-xs font-black italic text-emerald-500">+{currency}{entry.amount.toLocaleString()}</div>
                                        </div>
                                    ))}
                                    {(!activeGoal.history || activeGoal.history.length === 0) && (
                                        <div className="p-8 text-center text-[10px] font-black text-slate-700 uppercase italic">
                                            {lang === 'ua' ? 'Історія відсутня' : 'No history found'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {goals.length === 0 && !showAdd && (
                <div className="py-12 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
                    <Target size={24} className="text-slate-800" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic">{dict.noGoals}</span>
                </div>
            )}
        </div>
    );
};

export default SavingsTracker;
