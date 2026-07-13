
import React, { useEffect, useState } from 'react';

interface SettingsProps {
  onLogout: () => void;
}

export default function Settings({ onLogout }: SettingsProps) {
  const [userName, setUserName] = useState('Patient');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj.name) {
          setUserName(userObj.name);
        }
      }
    } catch (e) {
      console.error('Error reading user from localStorage', e);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-center flex-1">Settings</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 w-full max-w-md mx-auto space-y-6">
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary font-bold text-xl uppercase">
              {userName.charAt(0)}
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-800">PRO</div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">{userName}</h2>
            <p className="text-xs text-slate-400">ID: CHK-882190</p>
          </div>
          <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
            <span className="material-symbols-outlined">edit</span>
          </button>
        </section>

        <div className="space-y-2">
          <h3 className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preferences</h3>
          <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary-dark dark:text-primary">
                  <span className="material-symbols-outlined text-[20px]">language</span>
                </div>
                <span className="font-medium">Language</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-sm text-slate-500">English</span>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </div>
            </button>
            <div className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                </div>
                <span className="font-medium">Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input checked className="sr-only peer" type="checkbox" readOnly />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                </div>
                <span className="font-medium">Dark Mode</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input className="sr-only peer" type="checkbox" readOnly />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Support</h3>
          <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <span className="material-symbols-outlined text-[20px]">security</span>
                </div>
                <span className="font-medium">Privacy & Security</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <span className="material-symbols-outlined text-[20px]">help</span>
                </div>
                <span className="font-medium">Help & Support</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button 
            onClick={onLogout}
            className="w-full bg-white dark:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-medium py-3.5 px-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>

        <div className="text-center py-4">
          <p className="text-xs text-slate-400 dark:text-slate-600">CHIKITSAK Version 1.0.2 (Build 240)</p>
        </div>
      </main>
    </div>
  );
}
