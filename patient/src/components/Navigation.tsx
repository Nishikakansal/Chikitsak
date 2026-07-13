import React from 'react';
import { Hospital } from '../types';

interface NavigationProps {
  hospital: Hospital;
  onBack: () => void;
}

export default function Navigation({ hospital, onBack }: NavigationProps) {
  return (
    <div className="bg-[#f8fafb] font-['Inter',sans-serif] antialiased overflow-hidden h-full w-full flex flex-col relative">

      {/* Top overlay header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-8 pb-3 bg-gradient-to-b from-white/95 to-transparent pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <div className="flex flex-col items-center bg-white px-4 py-2 rounded-full shadow-md">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Navigating to</span>
            <span className="text-[13px] font-bold text-slate-900 max-w-[160px] truncate">{hospital.name}</span>
          </div>

          <div className="h-10 w-10" /> {/* spacer */}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="relative flex-1 w-full bg-[#e8eff0] overflow-hidden">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Stylised route SVG */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 375 600">
          {/* Road blocks */}
          <rect x="60" y="0" width="14" height="600" fill="white" opacity="0.6" />
          <rect x="290" y="0" width="14" height="600" fill="white" opacity="0.6" />
          <rect x="0" y="180" width="375" height="12" fill="white" opacity="0.6" />
          <rect x="0" y="370" width="375" height="12" fill="white" opacity="0.6" />

          {/* Route path */}
          <path
            d="M187 560 C 187 460, 67 440, 67 370 C 67 300, 67 260, 67 180 C 67 120, 140 110, 187 110"
            fill="none"
            stroke="#0cd8d8"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="12 6"
          />

          {/* Hospital pin */}
          <circle cx="187" cy="100" r="18" fill="#0cd8d880" />
          <circle cx="187" cy="100" r="10" fill="#0cd8d8" />
          <text x="187" y="104" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">H</text>

          {/* User pin */}
          <circle cx="187" cy="562" r="22" fill="#ef444430" className="animate-ping" />
          <circle cx="187" cy="562" r="12" fill="white" stroke="#0cd8d8" strokeWidth="3" />
        </svg>

        {/* Map zoom controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-white shadow-md text-slate-700">
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-white shadow-md text-slate-700">
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
          <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-white shadow-md text-[#0cd8d8] mt-1">
            <span className="material-symbols-outlined text-[20px]">my_location</span>
          </button>
        </div>
      </div>

      {/* Bottom info sheet */}
      <div className="relative z-10 w-full bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="px-5 pb-8 pt-2">
          <h2 className="text-[17px] font-bold text-slate-900 mb-0.5">{hospital.name}</h2>
          <p className="text-[12px] text-slate-400 mb-4">{hospital.address}</p>

          {/* ETA + Distance */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ETA</span>
              <span className="text-[22px] font-black text-emerald-500">
                {hospital.eta_min !== null ? hospital.eta_min : '—'}
                <span className="text-[13px] font-semibold text-slate-500 ml-1">min</span>
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distance</span>
              <span className="text-[22px] font-black text-slate-900">
                {hospital.distance_km !== null ? hospital.distance_km : '—'}
                <span className="text-[13px] font-semibold text-slate-500 ml-1">km</span>
              </span>
            </div>
            {hospital.emergency && (
              <>
                <div className="w-px h-8 bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  <span className="text-[13px] font-bold text-emerald-500 flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Open 24/7
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Traffic alert */}
          <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <span className="material-symbols-outlined text-amber-500 text-[18px]">traffic</span>
            <p className="text-[12px] text-amber-700 font-medium">Moderate traffic on route — allow extra time</p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-4 gap-3">
            <a
              href="tel:112"
              className="col-span-1 flex flex-col items-center justify-center h-14 rounded-xl border border-slate-200 bg-white text-slate-700 gap-0.5"
            >
              <span className="material-symbols-outlined text-[20px] text-red-500">call</span>
              <span className="text-[10px] font-bold text-slate-500">112</span>
            </a>
            <button className="col-span-3 flex items-center justify-center gap-2 h-14 rounded-xl bg-[#0cd8d8] text-white font-bold text-[15px] shadow-lg shadow-[#0cd8d8]/30 active:scale-[0.97] transition-all">
              <span className="material-symbols-outlined fill-1">near_me</span>
              Start Navigation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
