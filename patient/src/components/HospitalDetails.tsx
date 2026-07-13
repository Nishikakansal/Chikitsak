import React from 'react';
import { Hospital } from '../types';

interface HospitalDetailsProps {
  hospital: Hospital;
  onBack: () => void;
  onNavigate: () => void;
}

const crowdColor = (level: number) => {
  if (level < 0.4) return { bar: '#22c55e', label: 'Low Crowd', badge: 'bg-emerald-50 text-emerald-700' };
  if (level < 0.7) return { bar: '#f59e0b', label: 'Moderate Crowd', badge: 'bg-amber-50 text-amber-700' };
  return { bar: '#ef4444', label: 'High Crowd', badge: 'bg-red-50 text-red-700' };
};

export default function HospitalDetails({ hospital, onBack, onNavigate }: HospitalDetailsProps) {
  const crowd = crowdColor(hospital.crowd_level);
  const initials = hospital.name.split(' ').slice(0, 2).map(w => w[0]).join('');

  return (
    <div className="flex flex-col h-full bg-[#f8fafb] font-['Inter',sans-serif] antialiased">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px] text-slate-600">arrow_back</span>
          </button>
          <h1 className="flex-1 text-[16px] font-bold text-slate-900 truncate">Hospital Details</h1>
          {hospital.emergency && (
            <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
              Emergency
            </span>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto pb-32">

        {/* Hero banner */}
        <div className="mx-4 mt-4 rounded-2xl overflow-hidden bg-gradient-to-br from-[#0cd8d8] to-[#088a8a] p-5 text-white shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <span className="text-[22px] font-black text-white">{initials}</span>
          </div>
          <h2 className="text-[18px] font-bold leading-snug mb-1">{hospital.name}</h2>
          <p className="text-[12px] text-white/80">{hospital.address}</p>
          <div className="flex items-center gap-3 mt-3">
            {hospital.distance_km !== null && (
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <span className="material-symbols-outlined text-[14px]">near_me</span>
                <span className="text-[12px] font-bold">{hospital.distance_km} km</span>
              </div>
            )}
            {hospital.eta_min !== null && (
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                <span className="text-[12px] font-bold">{hospital.eta_min} min ETA</span>
              </div>
            )}
          </div>
        </div>

        {/* Priority Score */}
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#0cd8d8]">analytics</span>
              <span className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Priority Score</span>
            </div>
            <span className="text-[20px] font-black text-[#0cd8d8]">{hospital.priority_score}<span className="text-[13px] text-slate-400">/100</span></span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#0cd8d8] to-[#088a8a]"
              style={{ width: `${hospital.priority_score}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">Based on resources, distance & availability</p>
        </div>

        {/* Real-time Availability */}
        <div className="mx-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0cd8d8] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0cd8d8]" />
            </span>
            <span className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Real-time Availability</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Beds */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-[18px] text-slate-400">bed</span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Beds</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[24px] font-black text-slate-900">{hospital.beds_available}</span>
                <span className="text-[12px] text-slate-400">free</span>
              </div>
            </div>

            {/* ICU */}
            <div className={`bg-white rounded-2xl p-4 shadow-sm border ${hospital.icu_available < 3 ? 'border-red-200' : 'border-slate-100'}`}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`material-symbols-outlined text-[18px] ${hospital.icu_available < 3 ? 'text-red-400' : 'text-slate-400'}`}>
                  monitor_heart
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ICU Beds</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-[24px] font-black ${hospital.icu_available < 3 ? 'text-red-500' : 'text-slate-900'}`}>
                  {hospital.icu_available}
                </span>
                <span className="text-[12px] text-slate-400">free</span>
              </div>
              {hospital.icu_available < 3 && (
                <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">warning</span>Critical Low
                </p>
              )}
            </div>

            {/* Ventilators */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-[18px] text-slate-400">pulmonology</span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ventilators</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[24px] font-black text-slate-900">{hospital.ventilators_available}</span>
                <span className="text-[12px] text-slate-400">avail</span>
              </div>
            </div>

            {/* Doctors */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-[18px] text-slate-400">stethoscope</span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Doctors</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[24px] font-black text-slate-900">{hospital.doctors_on_duty}</span>
                <span className="text-[12px] text-slate-400">on duty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Crowd Level */}
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">groups</span>
              <span className="text-[13px] font-bold text-slate-700">Crowd Level</span>
            </div>
            <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full ${crowd.badge}`}>
              {crowd.label}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${hospital.crowd_level * 100}%`, background: crowd.bar }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{Math.round(hospital.crowd_level * 100)}% capacity used</p>
        </div>

        {/* Specializations */}
        {hospital.specializations.length > 0 && (
          <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[18px] text-slate-400">medical_services</span>
              <span className="text-[13px] font-bold text-slate-700">Specializations</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hospital.specializations.map(spec => (
                <span
                  key={spec}
                  className="px-3 py-1.5 rounded-full bg-[#e6f8f7] text-[#088a8a] text-[12px] font-semibold border border-[#0cd8d8]/20"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto w-full bg-white border-t border-slate-100 p-4 shadow-lg z-30">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-200 bg-white font-bold text-[14px] text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.97]"
          >
            <span className="material-symbols-outlined text-[#0cd8d8]">navigation</span>
            Navigate
          </button>
          <a
            href="tel:112"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500 font-bold text-[14px] text-white shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-[0.97]"
          >
            <span className="material-symbols-outlined">call</span>
            Call 112
          </a>
        </div>
      </div>
    </div>
  );
}
