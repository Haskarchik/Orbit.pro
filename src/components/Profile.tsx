"use client";

import React, { useState, useMemo } from 'react';
import { 
    User, Settings, LogOut, History, Shield, 
    CreditCard, Bell, ChevronRight, LayoutGrid, 
    Zap, Target, Wallet, CheckCircle2, ChevronDown
} from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';

interface ProfileProps {
    lang: Language;
    user: any;
    habits: any[];
    finances: any[];
    savingsGoals: any[];
    activityLog: any[];
    habitsCount: number;
    financesCount: number;
    savingsGoalsCount: number;
    onLogout: () => void;
    onLanguageChange: (l: Language) => void;
    currencySymbol: string;
}

const Profile: React.FC<ProfileProps> = ({ 
    lang, user, habits, finances, savingsGoals, activityLog,
    habitsCount, financesCount, savingsGoalsCount, 
    onLogout, onLanguageChange, currencySymbol 
}) => {
    const dict = TRANSLATIONS[lang];
    const [journalExpanded, setJournalExpanded] = useState(false);

    // DYNAMIC REAL-TIME JOURNAL LOGIC
    const journalEntries = useMemo(() => {
        // Use the explicit activityLog first
        const entries = activityLog.map((log: any) => ({
            id: log.id,
            type: log.type,
            title: log.text,
            date: new Date(log.date || log.id).toLocaleString(lang === 'ua' ? 'uk-UA' : 'en-US', { 
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            }),
            status: log.type.includes('habit') ? (lang === 'ua' ? 'Завершено' : 'Verified') : (lang === 'ua' ? 'Системно' : 'System'),
            rawDate: new Date(log.date || log.id).getTime(),
            amount: log.amount ? `${log.type === 'income' ? '+' : '-'}${currencySymbol}${log.amount.toLocaleString()}` : undefined
        }));

        // If log is short, backfill with existing ritual/finance history for legacy
        if (entries.length < 5) {
             // ... existing habit/finance mapping can go here if needed
        }

        return entries.sort((a, b) => b.rawDate - a.rawDate).slice(0, journalExpanded ? 50 : 15);
    }, [activityLog, lang, currencySymbol, journalExpanded]);

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header: User Profile Card */}
            <div className="glass-card p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                    <div className="relative w-32 h-32 bg-slate-900 rounded-full border-4 border-slate-950 flex items-center justify-center overflow-hidden">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User size={64} className="text-slate-700" />
                        )}
                    </div>
                    <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 border-4 border-slate-950 rounded-full flex items-center justify-center">
                        <Shield size={14} className="text-white" />
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-2">
                        {user?.displayName || (lang === 'ua' ? 'Оператор Протоколу' : 'Protocol Operator')}
                    </h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <span className="px-3 py-1 bg-orange-600/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest rounded-full leading-none">
                            {lang === 'ua' ? 'Агент 42 Рівня' : 'Level 42 Agent'}
                        </span>
                        <div className="text-sm font-bold text-slate-500 italic">
                            {user?.email || 'authenticated://id.system.001'}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onLogout}
                    className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    title={dict.logout}
                >
                    <LogOut size={24} />
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: lang === 'ua' ? 'РИТУАЛИ' : 'RITUALS', val: habitsCount, icon: <Zap size={18} />, color: 'text-orange-500' },
                    { label: lang === 'ua' ? 'ОПЕРАЦІЇ' : 'OPERATIONS', val: financesCount, icon: <Wallet size={18} />, color: 'text-emerald-500' },
                    { label: lang === 'ua' ? 'ЦІЛІ' : 'OBJECTIVES', val: savingsGoalsCount, icon: <Target size={18} />, color: 'text-cyan-500' }
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
                        <div className={`w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center ${stat.color} border border-slate-800 group-hover:border-slate-700 transition-colors`}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{stat.label}</div>
                            <div className="text-2xl font-black italic text-white leading-none">{stat.val}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* SETTINGS MODULE */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2 mb-8">
                        <Settings size={14} className="text-orange-500" />
                        {dict.settings}
                    </h3>
                    
                    <div className="glass-card p-4 space-y-2">
                        {/* Language Toggle Link */}
                        <div className="p-6 bg-slate-950/40 border border-slate-800/50 rounded-3xl flex items-center justify-between hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-cyan-500/10 text-cyan-500 rounded-xl flex items-center justify-center border border-cyan-500/20">
                                    <LayoutGrid size={18} />
                                </div>
                                <div>
                                    <div className="text-xs font-black text-white italic uppercase">{dict.systemLanguage}</div>
                                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{dict.interfaceLocalization}</div>
                                </div>
                            </div>
                            <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                                <button 
                                    onClick={() => onLanguageChange('ua')}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest transition-all ${lang === 'ua' ? 'bg-orange-600 text-white shadow-lg font-black' : 'text-slate-500 hover:text-white font-bold'}`}
                                >
                                    UA
                                </button>
                                <button 
                                    onClick={() => onLanguageChange('en')}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-orange-600 text-white shadow-lg font-black' : 'text-slate-500 hover:text-white font-bold'}`}
                                >
                                    EN
                                </button>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="p-6 bg-slate-950/40 border border-slate-800/50 rounded-3xl flex items-center justify-between opacity-50 grayscale">
                            <div className="flex items-center gap-4 text-slate-500">
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
                                    <Bell size={18} />
                                </div>
                                <div>
                                    <div className="text-xs font-black italic uppercase">Interface Notifications</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5">{dict.futureFeature}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* JOURNAL / HISTORY MODULE */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2 mb-8">
                        <History size={14} className="text-cyan-500" />
                        {dict.chronicle}
                    </h3>

                    <div className={`glass-card p-0 overflow-hidden transition-all duration-700 ${journalExpanded ? 'max-h-[800px]' : 'max-h-[400px]'}`}>
                        <div className="divide-y divide-slate-800/50">
                            {journalEntries.map((entry) => (
                                <div key={entry.id} className="p-6 flex items-center justify-between hover:bg-slate-900/40 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-2 h-2 rounded-full ${entry.status === (lang === 'ua' ? 'Успіх' : 'Success') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-cyan-500'}`}></div>
                                        <div>
                                            <div className="text-xs font-black text-white italic truncate max-w-[200px]">{entry.title}</div>
                                            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{entry.date}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {entry.amount && (
                                            <div className="text-xs font-black text-red-500 italic mr-2">{entry.amount}</div>
                                        )}
                                        <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400">
                                            {entry.status || (lang === 'ua' ? 'Перевірено' : 'Verified')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => setJournalExpanded(!journalExpanded)}
                            className="w-full py-6 bg-slate-900/50 border-t border-slate-800 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white hover:bg-slate-900 transition-all flex items-center justify-center gap-4"
                        >
                            {journalExpanded ? (
                                <><ChevronRight className="rotate-[-90deg]" size={14} /> {lang === 'ua' ? 'ЗГОРНУТИ' : 'COLLAPSE LOG'}</>
                            ) : (
                                <><ChevronDown size={14} /> {dict.viewCompleteChronicle}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
