"use client";

import React, { useState, useMemo } from 'react';
import { 
    ChevronLeft, 
    ChevronRight, 
    ArrowUpRight, 
    ArrowDownRight, 
    CheckCircle2, 
    X, 
    TrendingUp, 
    TrendingDown,
    Activity,
    Calendar as CalendarIcon
} from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';

interface Habit {
    id: number;
    name: string;
    days: boolean[];
    streak: number;
    type?: string;
    time?: string;
}

interface Transaction {
    id: number;
    amount: number;
    type: 'income' | 'expense';
    note: string;
    category: string;
    date: string;
}

interface CalendarProps {
    lang: Language;
    habits: Habit[];
    finances: Transaction[];
    currency: string;
}

const HabitCalendar: React.FC<CalendarProps> = ({ lang, habits, finances, currency }) => {
    const dict = TRANSLATIONS[lang];
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const weekDays = lang === 'ua' 
        ? ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'НД'] 
        : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    const calendarDays = useMemo(() => {
        const days = [];
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;
        
        for (let i = 0; i < startOffset; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        
        return days;
    }, [viewDate, firstDay, daysInMonth]);

    const getDayData = (day: number) => {
        const dayFinances = finances.filter(f => {
            const fDate = new Date(f.date || f.id);
            return fDate.getDate() === day && fDate.getMonth() === viewDate.getMonth() && fDate.getFullYear() === viewDate.getFullYear();
        });

        const income = dayFinances.filter(f => f.type === 'income').reduce((acc, f) => acc + f.amount, 0);
        const expense = dayFinances.filter(f => f.type === 'expense').reduce((acc, f) => acc + f.amount, 0);
        
        const isCurrentMonth = viewDate.getMonth() === new Date().getMonth() && viewDate.getFullYear() === new Date().getFullYear();
        const dayIndex = day - 1;
        const validIndex = isCurrentMonth && dayIndex >= 0 && dayIndex < 30;
        
        const completed = validIndex ? habits.filter(h => h.days[dayIndex]).length : 0;
        const completedNames = validIndex ? habits.filter(h => h.days[dayIndex]).map(h => h.name) : [];
        const total = habits.length;

        return { dayFinances, income, expense, completed, total, completedNames };
    };

    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* CALENDAR HEADER */}
            <div className="flex items-center justify-between bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-600/10 text-orange-500 rounded-2xl flex items-center justify-center border border-orange-600/20">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">
                            {viewDate.toLocaleString(lang === 'ua' ? 'uk-UA' : 'en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lang === 'ua' ? 'ЛАБОРАТОРІЯ ЧАСУ' : 'TIME LABORATORY'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* CALENDAR GRID */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {weekDays.map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">{d}</div>
                ))}

                {calendarDays.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="aspect-square md:h-32 bg-slate-950/20 rounded-2xl border border-transparent" />;
                    
                    const data = getDayData(day);
                    const isToday = day === new Date().getDate() && viewDate.getMonth() === new Date().getMonth() && viewDate.getFullYear() === new Date().getFullYear();
                    const taskProgress = data.total > 0 ? (data.completed / data.total) * 100 : 0;

                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`relative group aspect-square md:h-auto md:min-h-[128px] p-2 md:p-3 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                                selectedDay === day 
                                ? 'bg-orange-600/10 border-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.15)] ring-1 ring-orange-500/50' 
                                : isToday
                                ? 'bg-slate-900 border-slate-700 ring-1 ring-white/10'
                                : 'bg-slate-900/40 border-slate-800/50 hover:border-slate-600 hover:bg-slate-800/50'
                            }`}
                        >
                            <div className="flex items-center justify-between pointer-events-none w-full">
                                <span className={`text-[10px] md:text-xs font-black italic ${isToday ? 'text-orange-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    {String(day).padStart(2, '0')}
                                </span>
                                <div className="flex gap-0.5 md:gap-1">
                                    {data.income > 0 && <ArrowUpRight size={8} className="text-emerald-500 md:size-10" strokeWidth={3} />}
                                    {data.expense > 0 && <ArrowDownRight size={8} className="text-red-500 md:size-10" strokeWidth={3} />}
                                </div>
                            </div>

                            {/* Financial Labels */}
                            <div className="space-y-0.5 mt-1 hidden md:block">
                                {data.income > 0 && <div className="text-[7px] font-black text-emerald-500">+{currency}{data.income > 1000 ? (data.income/1000).toFixed(0)+'k' : data.income}</div>}
                                {data.expense > 0 && <div className="text-[7px] font-black text-red-500">-{currency}{data.expense > 1000 ? (data.expense/1000).toFixed(0)+'k' : data.expense}</div>}
                            </div>

                            {/* Task Protocols (Rich Text) */}
                            <div className="flex-1 overflow-hidden mt-1 hidden md:flex flex-col gap-0.5">
                                {data.completedNames.slice(0, 3).map((name, i) => (
                                    <div key={i} className="text-[6.5px] font-black text-slate-500 uppercase tracking-tighter truncate text-left border-l border-orange-500/30 pl-1 leading-tight group-hover:text-orange-400/80 transition-colors">
                                        {name}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto w-full pt-1">
                                <div className="flex items-center justify-between mb-0.5">
                                    <div className="text-[7px] md:text-[8px] font-black text-slate-700 group-hover:text-slate-500 transition-colors uppercase tracking-widest italic">
                                        {data.completed}/{data.total}
                                    </div>
                                    {data.completed === data.total && data.total > 0 && (
                                        <CheckCircle2 size={8} className="text-emerald-500" />
                                    )}
                                </div>
                                <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${taskProgress === 100 ? 'bg-orange-500' : 'bg-slate-700'}`}
                                        style={{ width: `${taskProgress}%` }}
                                    />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* DETAIL MODAL */}
            {selectedDay !== null && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="glass-card max-w-xl w-full p-8 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
                            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                                {String(selectedDay).padStart(2, '0')} {viewDate.toLocaleString(lang === 'ua' ? 'uk-UA' : 'en-US', { month: 'long' })}
                            </h2>
                            <button onClick={() => setSelectedDay(null)} className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Activity size={14} className="text-orange-500" />
                                    {(() => {
                                        const isToday = selectedDay === new Date().getDate() && viewDate.getMonth() === new Date().getMonth() && viewDate.getFullYear() === new Date().getFullYear();
                                        return isToday ? (lang === 'ua' ? 'ВИКОНАНІ ЗАДАЧІ' : 'PROTOCOLS EXECUTED') : (lang === 'ua' ? 'ПЛАНОВАНІ ЗАДАЧІ' : 'PLANNED PROTOCOLS');
                                    })()}
                                </h3>
                                <div className="space-y-3">
                                    {habits.map((h, i) => {
                                        const isDone = getDayData(selectedDay).completedNames.includes(h.name);
                                        return (
                                            <div key={i} className={`flex items-center justify-between p-3 bg-slate-950/40 border rounded-xl transition-all ${isDone ? 'border-orange-500/20' : 'border-slate-800 opacity-60'}`}>
                                                <div className="flex items-center gap-3">
                                                    {isDone ? <CheckCircle2 size={16} className="text-orange-500" /> : <Activity size={16} className="text-slate-600" />}
                                                    <span className="text-xs font-bold text-slate-200 uppercase">{h.name}</span>
                                                </div>
                                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{h.time || '07:00'}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp size={14} className="text-emerald-500" />
                                    {lang === 'ua' ? 'ФІНАНСОВІ ПОТОКИ' : 'CAPITAL FLOW'}
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                        <div className="text-[9px] font-black text-emerald-500/60 uppercase mb-1">INFLOW</div>
                                        <div className="text-2xl font-black italic text-emerald-400">+{currency}{getDayData(selectedDay).income.toLocaleString()}</div>
                                    </div>
                                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                        <div className="text-[9px] font-black text-red-500/60 uppercase mb-1">OUTFLOW</div>
                                        <div className="text-2xl font-black italic text-red-400">-{currency}{getDayData(selectedDay).expense.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitCalendar;
