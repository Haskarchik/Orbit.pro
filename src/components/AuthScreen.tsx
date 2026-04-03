"use client";

import React, { useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInAnonymously
} from 'firebase/auth';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { Shield, Sparkles, Orbit, LogIn, UserCircle2 } from 'lucide-react';

interface AuthScreenProps {
  lang: Language;
  onSuccess: (user: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ lang, onSuccess }) => {
  const dict = TRANSLATIONS[lang];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'options' | 'email'>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      onSuccess(result.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
          let user;
          if (isRegister) {
              const result = await createUserWithEmailAndPassword(auth, email, password);
              user = result.user;
          } else {
              const result = await signInWithEmailAndPassword(auth, email, password);
              user = result.user;
          }
          onSuccess(user);
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleGuestLogin = async () => {
      setLoading(true);
      setError(null);
      try {
          onSuccess({ uid: 'guest', displayName: 'Guest Explorer' });
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="max-w-md w-full glass-card border-slate-800/50 p-12 text-center space-y-8 relative z-10 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-400 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-transform hover:scale-110">
                    <Orbit size={32} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-white mb-1 uppercase italic">Orbit<span className="text-orange-500">.</span>Pro</h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">{lang === 'ua' ? 'Розкрийте свій потенціал' : 'Unlock Your Maximum Potential'}</p>
                </div>
            </div>

            {mode === 'options' ? (
                <div className="space-y-4">
                    <button 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-white text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all shadow-xl"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                        {lang === 'ua' ? 'Увійти через Google' : 'Login With Google'}
                    </button>

                    <button 
                         onClick={() => setMode('email')}
                         className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 hover:border-slate-700 transition-all"
                    >
                        <LogIn size={18} />
                        {lang === 'ua' ? 'Електронна пошта' : 'Continue With Email'}
                    </button>

                    <div className="flex items-center gap-4 py-4 text-slate-800">
                        <div className="h-[1px] flex-1 bg-slate-900" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ua' ? 'Або' : 'Or'}</span>
                        <div className="h-[1px] flex-1 bg-slate-900" />
                    </div>

                    <button 
                        onClick={handleGuestLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-4 py-4 px-6 border border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all italic"
                    >
                        <UserCircle2 size={18} />
                        {lang === 'ua' ? 'Увійти як гість' : 'Continue As Guest'}
                    </button>
                </div>
            ) : (
                <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">{lang === 'ua' ? 'Пошта' : 'Email Address'}</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="pilot@orbital.pro"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">{lang === 'ua' ? 'Пароль' : 'Password'}</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="●●●●●●●●"
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-orange-500 transition-all shadow-xl shadow-orange-950/20"
                    >
                        {loading ? '...' : (isRegister ? (lang === 'ua' ? 'Створити акаунт' : 'Create Account') : (lang === 'ua' ? 'Увійти' : 'Login'))}
                    </button>

                    <div className="flex justify-between items-center px-1">
                        <button 
                            type="button" 
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            {isRegister ? (lang === 'ua' ? 'Вже є акаунт?' : 'Already have an account?') : (lang === 'ua' ? 'Немає акаунта?' : 'Need an account?')}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setMode('options')}
                            className="text-[10px] font-bold text-cyan-600 hover:text-cyan-400 uppercase tracking-widest"
                        >
                            {lang === 'ua' ? 'Назад' : 'Back'}
                        </button>
                    </div>
                </form>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-bold p-3 rounded-xl uppercase leading-tight">
                    {error}
                </div>
            )}

            <div className="pt-4 border-t border-slate-900">
                <p className="text-slate-700 text-[9px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                    {lang === 'ua' ? 'Ваш цифровий відбиток зашифровано' : 'Your digital footprint is end-to-end encrypted'}
                </p>
            </div>
        </div>

        {/* Floating Lab Decorations */}
        <div className="absolute top-[20%] left-[15%] text-slate-900 opacity-20 rotate-45 animate-bounce" style={{ animationDuration: '6s' }}><Shield size={80} /></div>
        <div className="absolute bottom-[20%] right-[15%] text-slate-900 opacity-20 -rotate-12 animate-pulse" style={{ animationDuration: '4s' }}><Sparkles size={80} /></div>
    </div>
  );
};

export default AuthScreen;
