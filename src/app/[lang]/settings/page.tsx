"use client";

import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { ShieldCheck, X, Plus } from 'lucide-react';
import { Language } from '@/lib/translations';

export default function SettingsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: langParam } = React.use(params);
    const lang = langParam as Language;
    const { 
        user, currency, setCurrency, categories, setCategories, setHabits, setFinances, setSavingsGoals, dict 
    } = useDashboard();
    
    const [categoryModal, setCategoryModal] = useState<null | 'income' | 'expense'>(null);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleAddCategory = () => {
        if (!newCategoryName || !categoryModal) return;
        setCategories(prev => ({
            ...prev,
            [categoryModal]: [...prev[categoryModal], newCategoryName]
        }));
        setNewCategoryName('');
        setCategoryModal(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
            <div className="glass-card p-8 border-orange-500/10 bg-gradient-to-r from-orange-500/5 to-transparent">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-600/10 text-orange-500 rounded-2xl flex items-center justify-center border border-orange-600/20">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-1">{dict.settings}</div>
                        <h2 className="text-2xl font-black italic text-white">{dict.commandCenterOptions}</h2>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Preferences */}
                <div className="glass-card space-y-10 p-10">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] italic border-b border-slate-800 pb-4">
                        {lang === 'ua' ? 'Персональні налаштування' : 'Personal Preferences'}
                    </h3>
                    
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{dict.currencySelector}</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['USD', 'EUR', 'UAH'] as const).map((curr) => (
                                <button 
                                    key={curr}
                                    onClick={() => setCurrency(curr)}
                                    className={`py-4 rounded-xl text-sm font-black transition-all border flex flex-col items-center gap-1 ${
                                        currency === curr 
                                        ? 'bg-orange-500/10 border-orange-500/50 text-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.1)]' 
                                        : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-700'
                                    }`}
                                >
                                    <span className="text-xl">{curr === 'USD' ? '$' : curr === 'EUR' ? '€' : '₴'}</span>
                                    <span className="text-[9px] tracking-widest">{curr}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-800/50">
                        <div className="flex items-center justify-between border-t border-slate-800/30 pt-6">
                            <div>
                                <div className="font-bold text-slate-300 italic">{dict.masterCleanup}</div>
                                <div className="text-[9px] text-slate-600 uppercase font-bold tracking-widest italic">{dict.destructiveCloudWipe}</div>
                            </div>
                            <button 
                                onClick={() => { if (confirm(dict.confirmDelete)) { setHabits([]); setFinances([]); setSavingsGoals([]); } }}
                                className="text-[10px] font-black uppercase text-red-500/60 hover:text-red-500 tracking-[0.2em] transition-colors border border-red-500/20 px-4 py-2 rounded-lg"
                            >
                                {dict.wipeAll}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Category Infrastructure */}
                <div className="glass-card space-y-10 p-10 border-orange-500/10">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] italic border-b border-slate-800 pb-4">
                        {lang === 'ua' ? 'Фінансова інфраструктура' : 'Finance Infrastructure'}
                    </h3>
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">{dict.incomeLabels}</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.income.map(cat => (
                                    <div key={cat} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                                        <span className="text-[10px] font-bold text-slate-400">{cat}</span>
                                    </div>
                                ))}
                                <button onClick={() => setCategoryModal('income')} className="p-1 px-3 border border-dashed border-slate-800 rounded-xl text-slate-600 hover:text-white">+</button>
                            </div>
                        </div>
                        <div className="space-y-4 border-t border-slate-800/50 pt-8">
                            <label className="text-[10px] font-black text-red-500/80 uppercase tracking-widest">{dict.expenseLabels}</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.expense.map(cat => (
                                    <div key={cat} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                                        <span className="text-[10px] font-bold text-slate-400">{cat}</span>
                                    </div>
                                ))}
                                <button onClick={() => setCategoryModal('expense')} className="p-1 px-3 border border-dashed border-slate-800 rounded-xl text-slate-600 hover:text-white">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Modal */}
            {categoryModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
                    <div className="glass-card max-w-md w-full p-10 border-slate-800">
                        <header className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black italic text-white uppercase">{lang === 'ua' ? 'Нова Категорія' : 'New Category'}</h2>
                            <button onClick={() => setCategoryModal(null)}><X size={24} className="text-slate-500" /></button>
                        </header>
                        <div className="space-y-6">
                            <input 
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Category Name..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-6 text-white text-sm outline-none focus:border-orange-500 font-bold"
                            />
                            <button onClick={handleAddCategory} className="btn-primary w-full py-4 uppercase font-black tracking-widest text-[10px]">{lang === 'ua' ? 'Додати' : 'Add Category'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
