"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useDashboard } from '@/context/DashboardContext';
import AuthScreen from '@/components/AuthScreen';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { LayoutDashboard, Target, ShieldCheck, BarChart3, User as UserIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children, lang }: { children: React.ReactNode, lang: Language }) {
    const { user, loading } = useDashboard();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const pathname = usePathname();
    const dict = TRANSLATIONS[lang];

    // Tactical navigation detection
    React.useEffect(() => {
        setIsNavigating(true);
        const timer = setTimeout(() => setIsNavigating(false), 600);
        return () => clearTimeout(timer);
    }, [pathname]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-16 h-1 bg-slate-900 overflow-hidden rounded-full">
                    <div className="w-1/2 h-full bg-orange-600 animate-slide-loading" />
                </div>
            </div>
        );
    }

    if (!user) {
        return <AuthScreen lang={lang} onSuccess={() => window.location.reload()} />;
    }

    const mobileMenuItems = [
        { icon: LayoutDashboard, href: `/${lang}/dashboard` },
        { icon: Target, href: `/${lang}/goals` },
        { icon: ShieldCheck, href: `/${lang}/calendar` },
        { icon: BarChart3, href: `/${lang}/analytics` },
        { icon: UserIcon, href: `/${lang}/profile` },
        { icon: Settings, href: `/${lang}/settings` }
    ];

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-orange-500/30 selection:text-orange-500 overflow-x-hidden relative">
            {/* TACTICAL TOP PROGRESS BAR */}
            <div className={`fixed top-0 left-0 right-0 h-[3px] bg-indigo-500/10 z-[200] transition-opacity duration-300 ${isNavigating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="h-full bg-gradient-to-r from-orange-600 via-orange-400 to-cyan-500 shadow-[0_0_15px_rgba(249,115,22,0.8)] transition-all duration-500 ease-out" style={{ width: isNavigating ? '70%' : '100%' }} />
            </div>

            {/* DESKTOP SIDEBAR */}
            <div className="hidden lg:block">
                <Sidebar 
                    lang={lang} 
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            </div>

            {/* MOBILE BOTTOM NAV */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/50 z-[100] px-6 py-4 flex items-center justify-around">
                {mobileMenuItems.map(item => (
                    <Link 
                        key={item.href}
                        href={item.href}
                        className={`p-3 rounded-2xl transition-all ${pathname === item.href ? 'bg-orange-600/10 text-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.1)]' : 'text-slate-600'}`}
                    >
                        <item.icon size={22} className={pathname === item.href ? 'animate-in zoom-in-75 duration-300' : ''} />
                    </Link>
                ))}
            </div>

            <section className={`transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:pl-32' : 'lg:pl-80'} min-h-screen pb-32 px-6 md:px-10 lg:px-16 space-y-12 pt-8 md:pt-12`}>
                {children}
            </section>
        </main>
    );
}
