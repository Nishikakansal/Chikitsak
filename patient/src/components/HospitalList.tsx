import React, { useEffect, useState } from 'react';
import { Hospital } from '../types';

interface HospitalListProps {
  severity: 'CRITICAL' | 'MEDIUM' | 'LOW' | null;
  onHospitalClick: (hospital: Hospital) => void;
  onBack: () => void;
}

const CROWD_LABEL = (level: number) => {
  if (level < 0.4) return { label: 'Low', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  if (level < 0.7) return { label: 'Moderate', cls: 'bg-amber-50 text-amber-700 border-amber-100' };
  return { label: 'High', cls: 'bg-red-50 text-red-700 border-red-100' };
};

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#22c55e',
};

export default function HospitalList({ severity, onHospitalClick, onBack }: HospitalListProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  useEffect(() => {
    // Try to get user GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        () => {
          // Permission denied — fetch without coordinates
          fetchHospitals(null, null);
        }
      );
    } else {
      fetchHospitals(null, null);
    }
  }, []);

  useEffect(() => {
    if (userLat !== null && userLng !== null) {
      fetchHospitals(userLat, userLng);
    }
  }, [userLat, userLng]);

  const fetchHospitals = async (lat: number | null, lng: number | null) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:5000/api/hospitals/ranked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: lat,
          lng: lng,
          severity: severity ?? 'MEDIUM',
        }),
      });
      if (!res.ok) throw new Error('Failed to fetch hospitals');
      const data: Hospital[] = await res.json();
      setHospitals(data);
    } catch (e: any) {
      setError('Could not load hospitals. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const accentColor = SEVERITY_COLOR[severity ?? 'MEDIUM'];

  return (
    <div className="flex flex-col h-full bg-[#f8fafb]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px] text-slate-600">arrow_back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-[17px] font-bold text-slate-900 leading-tight">Recommended Hospitals</h1>
            {severity && (
              <p className="text-[11px] font-semibold" style={{ color: accentColor }}>
                Ranked for {severity} severity
              </p>
            )}
          </div>
          {userLat && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <span className="material-symbols-outlined text-[14px]">my_location</span>
              GPS
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#0cd8d8] animate-spin" />
            <p className="text-[14px] font-medium text-slate-500">Finding best hospitals near you...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span className="material-symbols-outlined text-[48px] text-red-400">wifi_off</span>
            <p className="text-[14px] font-semibold text-slate-700">{error}</p>
            <button
              onClick={() => fetchHospitals(userLat, userLng)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#0cd8d8] text-white font-bold text-[14px]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Hospital Cards */}
        {!loading && !error && hospitals.map((h, i) => {
          const crowd = CROWD_LABEL(h.crowd_level);
          const isTop = i === 0;

          return (
            <div
              key={`${h.name}-${i}`}
              onClick={() => onHospitalClick(h)}
              className="bg-white rounded-2xl border shadow-sm cursor-pointer active:scale-[0.98] transition-all overflow-hidden"
              style={{ borderColor: isTop ? accentColor + '50' : '#f1f5f9' }}
            >
              {/* Top-pick banner */}
              {isTop && (
                <div
                  className="px-4 py-1.5 flex items-center gap-1.5"
                  style={{ background: accentColor + '15' }}
                >
                  <span className="material-symbols-outlined text-[14px]" style={{ color: accentColor }}>verified</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                    Top Recommendation
                  </span>
                </div>
              )}

              <div className="p-4">
                {/* Name + emergency badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h2 className="text-[15px] font-bold text-slate-900 leading-snug">{h.name}</h2>
                    <p className="text-[12px] text-slate-400 mt-0.5">{h.address}</p>
                  </div>
                  {h.emergency && (
                    <span className="shrink-0 text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full mt-0.5">
                      24/7 Emergency
                    </span>
                  )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-100 my-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-1 text-[#0cd8d8]">
                      <span className="material-symbols-outlined text-[16px]">timer</span>
                      <span className="text-[13px] font-bold">
                        {h.eta_min !== null ? `${h.eta_min} min` : '—'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">ETA</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 border-x border-slate-100">
                    <div className="flex items-center gap-1 text-slate-700">
                      <span className="material-symbols-outlined text-[16px]">near_me</span>
                      <span className="text-[13px] font-bold">
                        {h.distance_km !== null ? `${h.distance_km} km` : '—'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Distance</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className={`flex items-center gap-1 ${h.icu_available > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      <span className="material-symbols-outlined text-[16px]">bed</span>
                      <span className="text-[13px] font-bold">{h.icu_available} ICU</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Available</span>
                  </div>
                </div>

                {/* Resource chips */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${crowd.cls}`}>
                    {crowd.label} Crowd
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {h.ventilators_available} Ventilators
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                    {h.doctors_on_duty} Doctors
                  </span>
                </div>

                {/* Priority score bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority Score</span>
                    <span className="text-[12px] font-bold" style={{ color: accentColor }}>{h.priority_score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${h.priority_score}%`, background: accentColor }}
                    />
                  </div>
                </div>

                {/* Specializations */}
                {h.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {h.specializations.slice(0, 3).map(s => (
                      <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {s}
                      </span>
                    ))}
                    {h.specializations.length > 3 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        +{h.specializations.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {!loading && !error && hospitals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-300">local_hospital</span>
            <p className="text-[15px] font-semibold text-slate-500">No hospitals found in database</p>
            <p className="text-[12px] text-slate-400">Please check your backend connection.</p>
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
}
