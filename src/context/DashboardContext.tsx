"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface DashboardContextType {
    user: any;
    habits: any[];
    finances: any[];
    savingsGoals: any[];
    activityLog: any[];
    categories: { income: string[], expense: string[] };
    currency: 'USD' | 'EUR' | 'UAH';
    exchangeRates: Record<string, number>;
    loading: boolean;
    disciplineLevel: number;
    currencySymbol: string;
    totalBalance: number;
    dict: any;
    
    // Actions
    setHabits: React.Dispatch<React.SetStateAction<any[]>>;
    setFinances: React.Dispatch<React.SetStateAction<any[]>>;
    setSavingsGoals: React.Dispatch<React.SetStateAction<any[]>>;
    setCategories: React.Dispatch<React.SetStateAction<{ income: string[], expense: string[] }>>;
    setCurrency: React.Dispatch<React.SetStateAction<'USD' | 'EUR' | 'UAH'>>;
    logActivity: (type: string, text: string, extra?: any) => void;
    toggleDay: (habitId: number, dayIndex: number) => void;
    addHabit: (name: string, type: 'routine' | 'task', time?: string) => void;
    updateHabitStatus: (id: number, status: 'todo' | 'doing' | 'done') => void;
    deleteHabit: (id: number) => void;
    addFinance: (amount: number, type: 'income' | 'expense', note: string, category: string, currency?: 'USD' | 'EUR' | 'UAH') => void;
    deleteFinance: (id: number) => void;
    addSavingsGoal: (name: string, target: number, current: number, deadline?: string) => void;
    updateSavingsGoal: (id: number, current: number) => void;
    deleteSavingsGoal: (id: number) => void;
    handleLogout: () => Promise<void>;
    recordActivity: (type: string, text: string, extra?: any) => void;
    aiCache: Record<string, string>;
    setAiCache: (fingerprint: string, text: string) => void;
    convertCurrency: (amount: number, from: 'USD' | 'EUR' | 'UAH', to: 'USD' | 'EUR' | 'UAH') => number;
    
    // Notifications & Reminders
    reminders: {
        enabled: boolean;
        start: string; // "HH:MM"
        end: string;
        interval: number; // minutes
        offset: number; // minutes before
    };
    setReminders: React.Dispatch<React.SetStateAction<any>>;
    requestNotificationPermission: () => Promise<boolean>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children, lang }: { children: ReactNode, lang: Language }) {
    const [user, setUser] = useState<User | any>(null);
    const [habits, setHabits] = useState<any[]>([]);
    const [finances, setFinances] = useState<any[]>([]);
    const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
    const [activityLog, setActivityLog] = useState<any[]>([]);
    const [categories, setCategories] = useState<{ income: string[], expense: string[] }>({
        income: ['Salary', 'Freelance', 'Gift', 'Investment', 'Other'],
        expense: ['Food', 'Transport', 'Rent', 'Shopping', 'Entertainment', 'Health', 'Other']
    });
    const [currency, setCurrency] = useState<'USD' | 'EUR' | 'UAH'>('USD');
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ USD: 1, EUR: 0.92, UAH: 39 });
    const [loading, setLoading] = useState(true);
    const [reminders, setReminders] = useState({
        enabled: false,
        start: "09:00",
        end: "21:00",
        interval: 60,
        offset: 0
    });

    // Fetch live rates
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await fetch('https://open.er-api.com/v6/latest/USD');
                const data = await res.json();
                if (data.rates) {
                    setExchangeRates({
                        USD: 1,
                        EUR: data.rates.EUR,
                        UAH: data.rates.UAH
                    });
                }
            } catch (e) {
                console.error("Failed to fetch rates, using defaults.");
            }
        };
        fetchRates();
    }, []);

    const handleLogout = async () => {
        const { signOut } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebase/config');
        if (user?.uid === 'guest') {
            localStorage.removeItem('orbit_pro_user_mode');
            window.location.reload();
        } else {
            await signOut(auth);
        }
    };

    const currencySymbol = useMemo(() => ({ USD: '$', EUR: '€', UAH: '₴' }[currency]), [currency]);

    const logActivity = (type: string, text: string, extra?: any) => {
        const entry = { id: Date.now(), type, text, date: new Date().toISOString(), ...extra };
        setActivityLog(prev => [entry, ...prev].slice(0, 100));
    };

    // Firebase Auth & Initial Sync
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                await syncFromExternal(firebaseUser.uid);
            } else {
                const isGuest = localStorage.getItem('orbit_pro_user_mode') === 'guest';
                if (isGuest) {
                    setUser({ uid: 'guest', displayName: 'Guest Explorer' });
                    setLoading(false);
                } else {
                    setUser(null);
                    setLoading(false);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const syncFromExternal = async (uid: string) => {
        setLoading(true);
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setHabits(data.habits || []);
                setFinances(data.finances || []);
                setSavingsGoals(data.savingsGoals || []);
                if (data.categories) setCategories(data.categories);
                if (data.currency) setCurrency(data.currency);
                if (data.activityLog) setActivityLog(data.activityLog);
                if (data.reminders) setReminders(data.reminders);
            }
        } catch (err) {
            console.error("Firestore sync failed:", err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-Save Effect
    useEffect(() => {
        if (!loading && user && user.uid !== 'guest') {
            const syncToFirestore = async () => {
                try {
                    await setDoc(doc(db, "users", user.uid), {
                        habits, finances, categories, savingsGoals, activityLog, currency,
                        reminders,
                        lastUpdated: new Date().toISOString()
                    }, { merge: true });
                } catch (e) { console.error("Cloud sync error:", e); }
            };
            syncToFirestore();
        }
    }, [habits, finances, categories, savingsGoals, currency, reminders, loading, user]);

    const disciplineLevel = useMemo(() => {
        const totalDays = habits.length * 30;
        const completedDays = habits.reduce((acc, h) => acc + h.days.filter((d: any) => d).length, 0);
        return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    }, [habits]);

    // Action Handlers
    const toggleDay = (habitId: number, dayIndex: number) => {
        setHabits(prev => prev.map(h => {
            if (h.id === habitId) {
                const newDays = [...h.days];
                newDays[dayIndex] = !newDays[dayIndex];
                return { ...h, days: newDays, streak: calculateStreak(newDays) };
            }
            return h;
        }));
    };

    const calculateStreak = (days: boolean[]) => {
        let current = 0, max = 0;
        for (const d of days) { if (d) { current++; max = Math.max(max, current); } else { current = 0; } }
        return max;
    };

    const addHabit = (name: string, type: 'routine' | 'task', time?: string) => {
        const newHabit = { id: Date.now(), name, streak: 0, status: 'todo', type, time, days: Array(30).fill(false) };
        setHabits(prev => [...prev, newHabit]);
        logActivity('habit-created', lang === 'ua' ? `Створено ритуал: ${name}` : `Ritual Created: ${name}`, { habitId: newHabit.id });
    };

    const updateHabitStatus = (id: number, status: 'todo' | 'doing' | 'done') => {
        setHabits(prev => prev.map(h => h.id === id ? { ...h, status } : h));
    };

    const deleteHabit = (id: number) => {
        setHabits(prev => prev.filter(h => h.id !== id));
    };

    const totalBalance = useMemo(() => {
        return finances.reduce((acc, f) => {
            const amount = f.amount;
            const rateFrom = exchangeRates[f.currency || 'USD'] || 1;
            const rateTo = exchangeRates[currency] || 1;
            // Convert to USD first, then to base currency
            const convertedAmount = (amount / rateFrom) * rateTo;
            return f.type === 'income' ? acc + convertedAmount : acc - convertedAmount;
        }, 0);
    }, [finances, currency, exchangeRates]);

    const addFinance = (amount: number, type: 'income' | 'expense', note: string, category: string, transCurrency?: 'USD' | 'EUR' | 'UAH') => {
        const c = transCurrency || currency;
        const newTrans = { 
            id: Date.now(), 
            amount, 
            type, 
            note, 
            category, 
            currency: c, 
            date: new Date().toISOString() 
        };
        setFinances(prev => [newTrans, ...prev]);
    };

    const deleteFinance = (id: number) => {
        setFinances(prev => prev.filter(f => f.id !== id));
    };

    const addSavingsGoal = (name: string, target: number, current: number, deadline?: string) => {
        const history = current > 0 ? [{ id: Date.now() + 1, date: new Date().toISOString().split('T')[0], amount: current }] : [];
        const newGoal = { id: Date.now(), name, target, current, deadline, history };
        setSavingsGoals(prev => [...prev, newGoal]);
    };

    const updateSavingsGoal = (id: number, current: number) => {
        setSavingsGoals(prev => prev.map(g => {
            if (g.id === id && current > g.current) {
                const addedAmount = current - g.current;
                const newHistoryEntry = { id: Date.now(), date: new Date().toISOString().split('T')[0], amount: addedAmount };
                return { ...g, current, history: [...g.history, newHistoryEntry] };
            }
            return g.id === id ? { ...g, current } : g;
        }));
    };

    const deleteSavingsGoal = (id: number) => {
        setSavingsGoals(prev => prev.filter(g => g.id !== id));
    };

    const dict = useMemo(() => TRANSLATIONS[lang], [lang]);

    const [aiCache, setAiCacheState] = useState<Record<string, string>>({});

    const setAiCache = (fingerprint: string, text: string) => {
        setAiCacheState(prev => ({ ...prev, [fingerprint]: text }));
    };

    const convertCurrency = (amount: number, from: 'USD' | 'EUR' | 'UAH', to: 'USD' | 'EUR' | 'UAH') => {
        const rateFrom = exchangeRates[from] || 1;
        const rateTo = exchangeRates[to] || 1;
        return (amount / rateFrom) * rateTo;
    };

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) return false;
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            setReminders(prev => ({ ...prev, enabled: true }));
            return true;
        }
        return false;
    };

    // Notification Logic Effect
    const lastFiredRef = React.useRef<number>(0);

    useEffect(() => {
        if (!reminders.enabled) return;

        const checkReminders = () => {
            const now = new Date();
            const nowTotalMin = now.getHours() * 60 + now.getMinutes();
            
            // Avoid double firing in the same minute
            if (lastFiredRef.current === nowTotalMin) return;

            const getMinutes = (timeStr: string) => {
                const [h, m] = timeStr.split(':').map(Number);
                return h * 60 + m;
            };

            const startMin = getMinutes(reminders.start);
            const endMin = getMinutes(reminders.end);

            if (nowTotalMin >= startMin && nowTotalMin <= endMin) {
                // (current_min + offset) % interval == 0
                if ((nowTotalMin + reminders.offset) % reminders.interval === 0) {
                    new Notification("Orbit Pro Protocol", {
                        body: lang === 'ua' 
                            ? "Минуло ще коло часу! Перевір свої ритуали та фінансові цілі." 
                            : "Another cycle completed! Review your rituals and financial objectives.",
                        icon: "/favicon.ico"
                    });
                    lastFiredRef.current = nowTotalMin;
                }
            }
        };

        const interval = setInterval(checkReminders, 15000); // Check every 15 seconds
        return () => clearInterval(interval);
    }, [reminders, lang]);

    return (
        <DashboardContext.Provider value={{
            user, habits, finances, savingsGoals, activityLog, categories, currency, exchangeRates, loading, disciplineLevel, currencySymbol, totalBalance, dict,
            setHabits, setFinances, setSavingsGoals, setCategories, setCurrency, logActivity, toggleDay, addHabit,
            updateHabitStatus, deleteHabit, addFinance, deleteFinance, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
            handleLogout, recordActivity: logActivity, aiCache, setAiCache, convertCurrency,
            reminders, setReminders, requestNotificationPermission
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
    return context;
}
