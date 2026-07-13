
import React, { useState } from 'react';
import { motion } from 'motion/react';

interface AuthProps {
  onLogin: () => void;
  onEmergency: () => void;
}

export default function Auth({ onLogin, onEmergency }: AuthProps) {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'SIGNUP' && (!name || !email || !password)) {
      setError('Name, email, and password are required');
      return;
    }
    if (mode === 'LOGIN' && (!email || !password)) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'LOGIN' ? '/api/auth/login' : '/api/auth/signup';
      const body = mode === 'LOGIN' 
        ? { email, password } 
        : { name, email, phone, password };

      const res = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save token locally
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLogin(); // Trigger parent level navigation
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md h-screen relative flex flex-col bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden mx-auto">
      <div className="absolute -top-[20%] -left-[20%] w-[140%] h-[60%] rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center pt-12 px-6 pb-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/25 rounded-full blur-2xl scale-150 pointer-events-none"></div>
          <div className="relative p-1.5 rounded-2xl ring-2 ring-primary/30 shadow-xl shadow-primary/10">
            <img
              src="/logo.svg"
              alt="CHIKITSAK logo"
              className="w-20 h-20 rounded-xl"
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 text-center">CHIKITSAK</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center font-medium">Verification Required</p>
      </div>

      <div className="px-6 relative z-10 w-full">
        <div className="bg-slate-200/50 dark:bg-black/20 p-1 rounded-xl flex mb-6 backdrop-blur-sm">
          <button 
            type="button"
            onClick={() => { setMode('LOGIN'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'LOGIN' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-dark dark:text-primary' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setMode('SIGNUP'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'SIGNUP' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-dark dark:text-primary' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Create Account
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 flex flex-col gap-6 relative z-10 overflow-y-auto no-scrollbar">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
          {mode === 'SIGNUP' && (
            <div className="group">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </span>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm text-slate-900 dark:text-slate-100" 
                  placeholder="John Doe" 
                  type="text" 
                />
              </div>
            </div>
          )}

          <div className="group">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </span>
              <input 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm text-slate-900 dark:text-slate-100" 
                placeholder="you@example.com" 
                type="email" 
              />
            </div>
          </div>

          {mode === 'SIGNUP' && (
            <div className="group">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Phone Number (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </span>
                <input 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm text-slate-900 dark:text-slate-100" 
                  placeholder="+91 99999 99999" 
                  type="tel" 
                />
              </div>
            </div>
          )}

          <div className="group">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </span>
              <input 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm text-slate-900 dark:text-slate-100" 
                placeholder="••••••••" 
                type="password" 
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 pb-8">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary-dark to-[#088a8a] dark:from-primary dark:to-[#0ea5a5] hover:opacity-90 disabled:opacity-70 text-white dark:text-slate-900 font-bold text-lg rounded-xl shadow-lg shadow-primary/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Processing...' : (mode === 'LOGIN' ? 'Sign In' : 'Create Account')}</span>
              {loading ? (
                <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">{mode === 'LOGIN' ? 'login' : 'how_to_reg'}</span>
              )}
            </button>
            
            <button 
              type="button"
              onClick={onEmergency}
              className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg rounded-xl shadow-xl shadow-rose-200 dark:shadow-none transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 ring-4 ring-rose-500/10"
            >
              <span className="material-symbols-outlined text-[24px] fill-current font-variation-settings-fill">medical_services</span>
              <span className="uppercase tracking-wider">Emergency? Skip Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
