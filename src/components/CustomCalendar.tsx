"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';

interface DatePickerProps {
    lang: Language;
    value: string;
    onChange: (date: string) => void;
    onClose: () => void;
}

const CustomCalendar: React.FC<DatePickerProps> = ({ lang, value, onChange, onClose }) => {
    const dict = TRANSLATIONS[lang];
    const initialDate = value ? new Date(value) : new Date();
    const [viewDate, setViewDate] = useState(initialDate);

    const months = lang === 'ua' 
        ? ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const weekDays = lang === 'ua' ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'] : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Adjust to start from Monday
    };

    const days = [];
    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const isSelected = (day: number | null) => {
        if (!day) return false;
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        return d.toISOString().split('T')[0] === value;
    };

    const handleSelect = (day: number | null) => {
        if (!day) return;
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(selected.toISOString().split('T')[0]);
        onClose();
    };

    const changeMonth = (offset: number) => {
        const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(next);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass-card max-w-xs w-full p-6 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                    <X size={18} />
                </button>

                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <div className="font-black italic text-sm text-white uppercase tracking-widest leading-none">
                        {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                    {weekDays.map(d => (
                        <div key={d} className="text-center text-[10px] font-black text-slate-600 uppercase mb-2">{d}</div>
                    ))}
                    {days.map((day, i) => (
                        <div 
                            key={i} 
                            onClick={() => handleSelect(day)}
                            className={`
                                h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer
                                ${!day ? 'invisible' : isSelected(day) ? 'bg-orange-600 text-white shadow-[0_0_10px_rgba(234,88,12,0.3)]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between">
                    <button 
                        onClick={() => handleSelect(new Date().getDate())}
                        className="text-[10px] font-black uppercase text-orange-500 tracking-widest hover:text-orange-400 transition-colors"
                    >
                        {lang === 'ua' ? 'Сьогодні' : 'Today'}
                    </button>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                        <CalendarIcon size={12} />
                        Protocol Date
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomCalendar;
