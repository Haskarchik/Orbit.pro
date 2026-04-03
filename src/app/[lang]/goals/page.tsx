"use client";

import React from 'react';
import SavingsTracker from '@/components/SavingsTracker';
import { useDashboard } from '@/context/DashboardContext';
import { Language } from '@/lib/translations';

export default function GoalsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: langParam } = React.use(params);
    const lang = langParam as Language;
    const { savingsGoals, finances, currencySymbol, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, dict } = useDashboard();

    return (
        <div className="max-w-4xl mx-auto py-10 pb-20 space-y-12">
            <header className="animate-in slide-in-from-top-4 duration-700">
                <h1 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter uppercase leading-none">
                    {dict.goals}
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic mt-2">{dict.welcomeSub}</p>
            </header>

            <SavingsTracker 
                lang={lang}
                goals={savingsGoals}
                onAdd={addSavingsGoal}
                onUpdate={updateSavingsGoal}
                onDelete={deleteSavingsGoal}
                finances={finances}
                currency={currencySymbol}
            />
        </div>
    );
}
