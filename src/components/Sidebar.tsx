"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Target, 
  BarChart3, 
  ShieldCheck, 
  Settings as SettingsIcon, 
  LogOut,
  ChevronRight,
  ChevronLeft,
  Globe,
  User
} from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';

interface SidebarProps {
  lang: Language;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ lang, isCollapsed, onToggleCollapse }) => {
  const pathname = usePathname();
  const dict = TRANSLATIONS[lang];

  const menuItems = [
    { icon: LayoutDashboard, label: dict.dashboard, href: `/${lang}/dashboard` },
    { icon: Target, label: dict.goals, href: `/${lang}/goals` },
    { icon: BarChart3, label: dict.analytics, href: `/${lang}/analytics` },
    { icon: ShieldCheck, label: dict.calendar, href: `/${lang}/calendar` },
    { icon: User, label: dict.profile || 'PROFILE', href: `/${lang}/profile` },
    { icon: SettingsIcon, label: dict.settings, href: `/${lang}/settings` },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    // Logic moved to a central logout or kept here if simple
    localStorage.removeItem('orbit_pro_user_mode');
    window.location.href = `/${lang}`;
  };

  const switchLang = () => {
      const newLang = lang === 'ua' ? 'en' : 'ua';
      window.location.href = pathname.replace(`/${lang}`, `/${newLang}`);
  };

  return (
    <aside className={`transition-all duration-500 ease-in-out bg-slate-900/50 h-screen border-r border-slate-800 flex flex-col fixed left-0 top-0 z-[60] ${isCollapsed ? 'w-20 p-4' : 'w-72 p-8'}`}>
      <button 
        onClick={onToggleCollapse}
        className="absolute -right-3 top-24 w-6 h-6 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-all z-10 shadow-lg"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <div className={`flex items-center gap-4 mb-12 transition-all duration-500 ${isCollapsed ? 'justify-center overflow-hidden' : ''}`}>
        <img 
          src="/icon.png" 
          alt="Orbit Pro" 
          className="w-10 h-10 rounded-2xl flex-shrink-0 shadow-[0_0_20px_rgba(234,88,12,0.2)] object-cover border border-slate-800"
        />
        {!isCollapsed && (
            <span className="text-2xl font-black italic tracking-tighter whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-500">
                Orbit<span className="text-orange-500">.</span>Pro
            </span>
        )}
      </div>

      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`w-full flex items-center rounded-2xl transition-all duration-300 group relative ${
              isCollapsed ? 'justify-center p-3' : 'px-4 py-3.5 gap-4'
            } ${
              isActive(item.href)
                ? 'bg-orange-600/10 text-orange-500 border border-orange-600/20' 
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-white border border-transparent'
            }`}
          >
            <item.icon size={20} className={`flex-shrink-0 transition-all ${isActive(item.href) ? 'text-orange-500 scale-110' : 'text-slate-500 group-hover:text-slate-300'}`} />
            {!isCollapsed && (
                <span className="font-black uppercase text-[10px] tracking-[0.2em] whitespace-nowrap animate-in fade-in duration-500">
                    {item.label}
                </span>
            )}
            {!isCollapsed && isActive(item.href) && <ChevronRight size={14} className="ml-auto opacity-40" />}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <button 
          onClick={switchLang}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all border border-transparent"
        >
          <Globe size={20} className="flex-shrink-0" />
          {!isCollapsed && (
              <span className="uppercase font-bold text-[10px] tracking-widest whitespace-nowrap">{lang === 'ua' ? 'English' : 'Українська'}</span>
          )}
        </button>
        
        <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all group"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform flex-shrink-0" />
          {!isCollapsed && (
              <span className="font-bold text-[10px] tracking-widest whitespace-nowrap">{dict.logout}</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
