"use client";

import React, { useMemo } from 'react';
import { 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TRANSLATIONS, Language } from '@/lib/translations';

interface Habit {
  id: number;
  name: string;
  days: boolean[];
  streak: number;
}

interface MatrixProps {
  lang: Language;
  habits: Habit[];
  onToggle: (habitId: number, dayIndex: number) => void;
}

const HabitMatrix: React.FC<MatrixProps> = ({ lang, habits, onToggle }) => {
  const dict = TRANSLATIONS[lang];

  const trendData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const dailyCount = habits.filter(h => h.days[i]).length;
      return {
        day: i + 1,
        completed: dailyCount,
      };
    });
  }, [habits]);

  return (
    <div className="space-y-8">
      {/* TREND CHART */}
      <div className="glass-card h-[220px] bg-slate-950/20 border-cyan-500/10 mb-8 p-6">
        <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-500">
                {lang === 'ua' ? 'Динаміка Виконання' : 'Protocol Velocity'}
            </h3>
        </div>
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="#06b6d4" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={3}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* INTERACTIVE MATRIX */}
      <div className="glass-card p-6 md:p-8 border-slate-800/50 bg-slate-900/10 hover:border-slate-700/50 transition-all overflow-hidden">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-500">
                {lang === 'ua' ? 'Цілісність Задач' : 'Task Integrity'}
            </h3>
        </div>

        <div className="overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="min-w-[800px]">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-slate-900/90 backdrop-blur-md z-20 text-left p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-800 mb-2 w-48">
                    {lang === 'ua' ? 'Протокол' : 'Protocol'}
                  </th>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <th key={i} className="text-center p-2 text-[8px] font-black text-slate-700 uppercase">
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => (
                  <tr key={habit.id} className="group/row">
                    <td className="sticky left-0 bg-slate-950/60 backdrop-blur-md z-20 p-4 border border-slate-800/50 rounded-l-2xl group-hover/row:border-orange-500/30 transition-all">
                      <div className="text-xs font-black italic text-slate-300 group-hover/row:text-orange-500 transition-colors truncate w-40">
                        {habit.name}
                      </div>
                      <div className="text-[8px] font-bold text-slate-600 mt-1 uppercase tracking-tighter">
                        {habit.streak} DAY STREAK
                      </div>
                    </td>
                    {habit.days.map((done, i) => (
                      <td key={i} className="p-1 px-1.5">
                        <button
                          onClick={() => onToggle(habit.id, i)}
                          className={`
                            w-full h-8 rounded-lg border transition-all flex items-center justify-center
                            ${done 
                              ? 'bg-orange-500 border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
                              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                            }
                          `}
                        >
                          {done && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                        </button>
                      </td>
                    ))}
                    <td className="w-4 rounded-r-2xl" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {habits.length === 0 && (
            <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl">
                <div className="text-[10px] font-black text-slate-700 uppercase italic">
                    {lang === 'ua' ? 'Задачі не активовано' : 'No Tasks Initialized'}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default HabitMatrix;
