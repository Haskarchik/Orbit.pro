"use client";

import React from 'react';
import HabitCalendar from '@/components/HabitCalendar';
import { useDashboard } from '@/context/DashboardContext';
import { Language } from '@/lib/translations';

export default function CalendarPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: langParam } = React.use(params);
    const lang = langParam as Language;
    const { habits, finances, currencySymbol, dict } = useDashboard();

    return (
        <div className="space-y-12">
            <header className="animate-in slide-in-from-top-4 duration-700">
                <h1 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter uppercase leading-none">
                    {dict.calendar}
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic mt-2">{dict.welcomeSub}</p>
            </header>

            <HabitCalendar 
                lang={lang} 
                habits={habits} 
                finances={finances} 
                currency={currencySymbol} 
            />
        </div>
    );
}
