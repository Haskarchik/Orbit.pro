"use client";

import React, { useState, useRef } from 'react';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { Clock, CheckCircle2, Circle, AlertCircle, Wallet, TrendingUp, TrendingDown, Trash2, GripVertical } from 'lucide-react';

interface Habit {
  id: number;
  name: string;
  status: 'todo' | 'doing' | 'done';
  type: 'routine' | 'task';
  time: string;
  streak: number;
}

interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  note: string;
  category: string;
  date: string;
}

interface BoardProps {
  lang: Language;
  habits: Habit[];
  finances: Transaction[];
  currency: string;
  onStatusChange: (id: number, status: 'todo' | 'doing' | 'done') => void;
  onDeleteFinance?: (id: number) => void;
}

type Status = 'todo' | 'doing' | 'done';

const HabitBoard: React.FC<BoardProps> = ({ lang, habits, finances, currency, onStatusChange, onDeleteFinance }) => {
  const dict = TRANSLATIONS[lang];
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);

  const habitColumns: { id: Status; label: string; icon: React.ElementType; accent: string; bg: string; border: string }[] = [
    {
      id: 'todo',
      label: dict.todo,
      icon: Circle,
      accent: 'text-slate-400',
      bg: 'bg-slate-900/30',
      border: 'border-slate-800/40',
    },
    {
      id: 'doing',
      label: dict.doing,
      icon: AlertCircle,
      accent: 'text-orange-500',
      bg: 'bg-orange-500/5',
      border: 'border-orange-500/20',
    },
    {
      id: 'done',
      label: dict.done,
      icon: CheckCircle2,
      accent: 'text-emerald-500',
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20',
    },
  ];

  const handleDragStart = (e: React.DragEvent, habitId: number) => {
    setDraggingId(habitId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('habitId', String(habitId));
    // Add a slight delay so the ghost image doesn't include styles
    setTimeout(() => {
      const el = document.getElementById(`habit-card-${habitId}`);
      if (el) el.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, habitId: number) => {
    setDraggingId(null);
    setDragOverCol(null);
    const el = document.getElementById(`habit-card-${habitId}`);
    if (el) el.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, colId: Status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  };

  const handleDrop = (e: React.DragEvent, colId: Status) => {
    e.preventDefault();
    const habitId = Number(e.dataTransfer.getData('habitId'));
    if (habitId && colId) {
      onStatusChange(habitId, colId);
    }
    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* HABIT KANBAN — 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {habitColumns.map((col) => {
          const colHabits = habits.filter(h => h.status === col.id);
          const isDropTarget = dragOverCol === col.id;

          return (
            <div key={col.id} className="flex flex-col gap-3">
              {/* Column Header — Always Visible */}
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all flex-shrink-0 ${isDropTarget ? `${col.bg} ${col.border} scale-[1.01]` : 'bg-slate-900/40 border-slate-800/50'}`}>
                <div className="flex items-center gap-2">
                  <col.icon size={14} className={col.accent} />
                  <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${col.accent}`}>{col.label}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDropTarget ? `${col.bg} ${col.border} ${col.accent}` : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                  {colHabits.length}
                </span>
              </div>

              {/* Drop Zone — Scrollable with standardized height */}
              <div
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                onDragLeave={handleDragLeave}
                className={`h-[500px] overflow-y-auto rounded-2xl border-2 border-dashed p-3 space-y-3 transition-all duration-200 scrollbar-hide ${
                  isDropTarget
                    ? `${col.bg} ${col.border.replace('border-', 'border-')} shadow-lg`
                    : 'border-slate-800/30 bg-slate-900/10'
                }`}
              >
                {colHabits.length === 0 ? (
                  <div className={`h-full flex items-center justify-center rounded-xl border border-dashed transition-all ${
                    isDropTarget ? `${col.border} ${col.bg}` : 'border-slate-800/30'
                  }`}>
                    <div className={`text-[9px] font-black uppercase tracking-widest italic ${isDropTarget ? col.accent : 'text-slate-800'}`}>
                      {isDropTarget
                        ? (lang === 'ua' ? 'Відпустити тут' : 'Drop here')
                        : (lang === 'ua' ? 'Перетягніть сюди' : 'Drag here')}
                    </div>
                  </div>
                ) : (
                  colHabits.map((habit) => (
                    <div
                      id={`habit-card-${habit.id}`}
                      key={habit.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, habit.id)}
                      onDragEnd={(e) => handleDragEnd(e, habit.id)}
                      className={`glass-card p-4 group cursor-grab active:cursor-grabbing bg-slate-950/60 transition-all select-none ${
                        draggingId === habit.id ? 'opacity-40 scale-95' : 'hover:border-slate-700 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${
                          habit.type === 'routine' ? 'bg-cyan-500/10 text-cyan-500' : 'bg-purple-500/10 text-purple-500'
                        }`}>
                          {habit.type === 'routine' ? dict.routine : dict.task}
                        </span>
                        <div className="flex items-center gap-1 text-slate-700 group-hover:text-slate-500 transition-colors ml-2">
                          <GripVertical size={14} />
                        </div>
                      </div>

                      <div className="font-bold text-slate-200 text-sm italic leading-tight mb-3">{habit.name}</div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/40">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock size={10} />
                          <span className="text-[10px] font-bold uppercase">{habit.time}</span>
                        </div>
                        {habit.streak > 0 && (
                          <div className="text-[9px] font-bold text-orange-500 bg-orange-500/5 px-2 py-0.5 rounded-full border border-orange-500/10">
                            {habit.streak}{lang === 'ua' ? ' ДН.' : 'D'}
                          </div>
                        )}
                      </div>

                      {/* Quick status buttons on hover */}
                      <div className="grid grid-cols-3 gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-all">
                        {(['todo', 'doing', 'done'] as Status[]).map((st) => (
                          <button
                            key={st}
                            onClick={() => onStatusChange(habit.id, st)}
                            className={`text-[8px] font-black uppercase py-1 rounded border transition-colors ${
                              habit.status === st
                                ? 'bg-slate-800 border-slate-600 text-white'
                                : 'border-slate-800 text-slate-700 hover:text-slate-400'
                            }`}
                          >
                            {st === 'todo' ? dict.todo : st === 'doing' ? dict.doing : dict.done}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitBoard;
