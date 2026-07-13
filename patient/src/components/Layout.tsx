import React from 'react';
import { Screen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

// Screens that show the bottom navigation bar
const NAV_SCREENS: Screen[] = ['HOME', 'HOSPITAL_LIST', 'PROFILE', 'SETTINGS'];

export default function Layout({ children, currentScreen, onNavigate }: LayoutProps) {
  const showNav = NAV_SCREENS.includes(currentScreen);

  // Outer wrapper — always centres the mobile shell in the browser
  return (
    <div className="min-h-screen bg-slate-200 flex items-start justify-center">
      {/* Mobile shell — max 430 px, fills full height */}
      <div
        className="relative w-full flex flex-col bg-[#f8fafb] overflow-hidden shadow-2xl"
        style={{ maxWidth: 430, minHeight: '100svh' }}
      >
        {/* Main content area */}
        <main className={`flex-1 overflow-y-auto no-scrollbar ${showNav ? 'pb-24' : ''}`}>
          {children}
        </main>

        {/* Bottom nav — only on primary screens */}
        {showNav && (
          <nav className="absolute bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 rounded-t-[28px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pt-3 pb-6 px-6">
            <div className="flex justify-between items-center">

              {/* Home */}
              <NavBtn
                icon="home"
                label="Home"
                active={currentScreen === 'HOME'}
                onClick={() => onNavigate('HOME')}
              />

              {/* History (placeholder) */}
              <NavBtn
                icon="history"
                label="History"
                active={false}
                onClick={() => {}}
              />

              {/* Hospitals */}
              <NavBtn
                icon="local_hospital"
                label="Hospitals"
                active={currentScreen === 'HOSPITAL_LIST'}
                onClick={() => onNavigate('HOSPITAL_LIST')}
              />

              {/* Settings */}
              <NavBtn
                icon="settings"
                label="Settings"
                active={currentScreen === 'SETTINGS'}
                onClick={() => onNavigate('SETTINGS')}
              />

            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

interface NavBtnProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavBtn({ icon, label, active, onClick }: NavBtnProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] transition-all"
    >
      <span
        className={`material-symbols-outlined text-[26px] transition-all ${
          active ? 'fill-1 font-variation-settings-fill text-[#0cd8d8]' : 'text-[#94a3b8]'
        }`}
      >
        {icon}
      </span>
      <span
        className={`text-[10px] font-bold tracking-wide transition-all ${
          active ? 'text-[#0cd8d8]' : 'text-[#94a3b8]'
        }`}
      >
        {label}
      </span>
    </button>
  );
}
