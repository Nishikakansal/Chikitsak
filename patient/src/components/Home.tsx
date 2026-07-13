import React, { useState } from 'react';
import { motion } from 'motion/react';

interface HomeProps {
  onServiceClick: (service: string) => void;
  onEmergency: () => void;
  onProfile: () => void;
}

export default function Home({ onServiceClick, onEmergency, onProfile }: HomeProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onEmergency();
    }
  };

  return (
    <div className="flex flex-col pb-28 pt-6 min-h-screen bg-[#f8fafb] font-['Inter',sans-serif] antialiased">
      {/* Header */}
      <header className="flex items-center justify-between px-6 z-20 w-full mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="CHIKITSAK logo" className="h-10 w-10 rounded-[10px] shadow-md shadow-[#0cd8d8]/20" />
          <h1 className="font-extrabold text-[#1e293b] text-[20px] tracking-wide uppercase">
            CHIKITSAK
          </h1>
        </div>
        <button onClick={onProfile} className="h-[42px] w-[42px] rounded-full bg-[#e2e8f0] flex items-center justify-center transition-colors hover:bg-[#cbd5e1]">
          <span className="material-symbols-outlined text-[#64748b] text-[26px] fill-1 font-variation-settings-fill">person</span>
        </button>
      </header>

      {/* Hero Banner */}
      <section className="px-6 mb-8 w-full">
        <div className="relative w-full rounded-[24px] overflow-hidden bg-[#e6f8f7] flex items-center px-6 py-6 border border-[#cff2f0]">
          <div className="z-10 w-[60%] flex flex-col gap-1.5">
            <h2 className="text-[22px] font-extrabold text-[#1e293b] leading-[1.2]">
              Your Health,<br/>
              <span className="text-[#0cd8d8]">Our Priority</span>
            </h2>
            <p className="text-[12px] text-[#64748b] mt-1.5 leading-relaxed font-medium">
              Connecting you to emergency<br/>care in seconds.
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-0 top-[10%] w-[50%] flex items-center justify-center opacity-90">
             <svg className="w-[120px] h-[120px] text-[#b6f0ec]" viewBox="0 0 100 100" fill="currentColor">
               <path d="M 50 15 C 65 18 80 22 80 40 C 80 65 65 85 50 90 C 35 85 20 65 20 40 C 20 22 35 18 50 15 Z" />
               <path d="M 42 42 L 42 32 L 58 32 L 58 42 L 68 42 L 68 58 L 58 58 L 58 68 L 42 68 L 42 58 L 32 58 L 32 42 Z" fill="#e6f8f7" />
             </svg>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="px-6 mb-8 w-full">
        <form onSubmit={handleSearch} className="relative w-full flex items-center bg-white rounded-full p-[6px] border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] h-[56px]">
          <div className="pl-4 pr-3 flex items-center text-[#94a3b8]">
            <span className="material-symbols-outlined text-[24px]">search</span>
          </div>
          <input 
            className="flex-1 bg-transparent border-0 placeholder:text-[#94a3b8] text-[#1e293b] text-[15px] focus:ring-0 focus:outline-none font-medium w-full" 
            placeholder="Enter disease or symptoms..." 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="h-[44px] w-[44px] rounded-full bg-[#e6f8f7] flex items-center justify-center mr-1 flex-shrink-0 transition-colors hover:bg-[#cff2f0]">
            <span className="material-symbols-outlined text-[#0cd8d8] text-[22px] fill-1 font-variation-settings-fill">mic</span>
          </button>
        </form>
      </section>

      {/* Quick Services */}
      <section className="w-full mb-10">
        <div className="px-6 mb-4">
          <h3 className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.15em]">Quick Services</h3>
        </div>
        <div className="flex justify-between px-6">
          {[
            { id: 'ambulance', name: 'Ambulance', icon: 'ambulance', color: 'text-[#0cd8d8]' },
            { id: 'labs', name: 'Labs', icon: 'biotech', color: 'text-[#3b82f6]' },
            { id: 'blood', name: 'Blood Bank', icon: 'bloodtype', color: 'text-[#ef4444]' },
            { id: 'pharmacy', name: 'Pharmacy', icon: 'medication', color: 'text-[#22c55e]' },
          ].map((service) => (
            <div key={service.id} className="flex flex-col items-center gap-2">
              <button 
                onClick={() => onServiceClick(service.id)}
                className={`h-[68px] w-[68px] rounded-full bg-white shadow-[0_6px_15px_rgba(0,0,0,0.05)] flex items-center justify-center ${service.color} transition-transform active:scale-95 border border-slate-50`}
              >
                <div className="relative">
                  <span className="material-symbols-outlined text-[32px] fill-1 font-variation-settings-fill">{service.icon}</span>
                  {service.id === 'ambulance' && (
                    <div className="absolute top-[-2px] right-[-2px] bg-white rounded-full">
                      <span className="material-symbols-outlined text-[12px] text-[#0cd8d8] font-bold">check_circle</span>
                    </div>
                  )}
                </div>
              </button>
              <span className="text-[11px] font-bold text-[#475569]">{service.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency SOS Button */}
      <section className="flex flex-col items-center justify-center mt-2 px-6 w-full">
        <div className="relative flex items-center justify-center w-[180px] h-[180px] mb-2">
          {/* Soft Glow */}
          <div className="absolute inset-0 bg-[#fde8e8] rounded-full opacity-60"></div>
          <div className="absolute inset-5 bg-[#fbd5d5] rounded-full opacity-60"></div>
          
          <button 
            onClick={onEmergency}
            className="relative z-10 w-[124px] h-[124px] rounded-full bg-[#ef4444] text-white shadow-[0_12px_25px_rgba(239,68,68,0.35)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none"
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Flashing rays */}
              <path d="M12 4V2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M17.6569 6.34315L19.0711 4.92893" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6.34315 6.34315L4.92893 4.92893" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M22 12H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4 12H2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              {/* Dome */}
              <path d="M12 7C9.23858 7 7 9.23858 7 12V16H17V12C17 9.23858 14.7614 7 12 7Z" fill="white"/>
              {/* Base */}
              <path d="M5 16H19V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V16Z" fill="white"/>
            </svg>
          </button>
        </div>
        
        <div className="text-center w-full max-w-[280px]">
          <h2 className="text-[#ef4444] font-bold text-[20px] tracking-wide mb-[6px]">EMERGENCY SOS</h2>
          <p className="text-[12px] text-[#94a3b8] font-medium leading-[1.6]">
            Single tap for immediate medical<br/>assistance and ambulance dispatch
          </p>
        </div>
      </section>
    </div>
  );
}
