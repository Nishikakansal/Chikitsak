import React from 'react';
import { TriageResult } from '../types';

interface TriageResultProps {
  onFindHospital: () => void;
  onBack: () => void;
  result?: TriageResult | null;
}

export default function TriageResultScreen({ onFindHospital, onBack, result }: TriageResultProps) {
  const data: TriageResult = result || {
    severity: 'MEDIUM',
    summary: 'Symptom analysis complete. Please review the results below.',
    probable_condition: 'Requires clinical assessment',
    action_required: 'Visit the nearest hospital for evaluation.',
    symptoms: '',
  };

  const config = {
    CRITICAL: {
      color: '#ef4444',
      bg: '#fef2f2',
      pillBg: '#fee2e2',
      pillText: '#ef4444',
      pillBorder: '#fecaca',
      icon: 'emergency',
      iconBg: '#fee2e2',
      topMsg: 'Call emergency services immediately',
      topMsgColor: '#ef4444',
      btnShadow: '#ef444440',
    },
    MEDIUM: {
      color: '#f59e0b',
      bg: '#fffbeb',
      pillBg: '#fef3c7',
      pillText: '#d97706',
      pillBorder: '#fde68a',
      icon: 'warning',
      iconBg: '#fef3c7',
      topMsg: 'Seek medical attention soon',
      topMsgColor: '#d97706',
      btnShadow: '#f59e0b40',
    },
    LOW: {
      color: '#22c55e',
      bg: '#f0fdf4',
      pillBg: '#dcfce7',
      pillText: '#16a34a',
      pillBorder: '#bbf7d0',
      icon: 'check_circle',
      iconBg: '#dcfce7',
      topMsg: 'Visit a nearby clinic at your convenience',
      topMsgColor: '#16a34a',
      btnShadow: '#22c55e40',
    },
  };

  const cfg = config[data.severity];

  return (
    <div
      className="min-h-screen w-full flex flex-col font-['Inter',sans-serif] antialiased pb-10"
      style={{ background: cfg.bg }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4">
        <button
          onClick={onBack}
          className="h-10 w-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[22px] text-slate-600">arrow_back</span>
        </button>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
          <img src="/logo.svg" alt="CHIKITSAK" className="h-4 w-4 rounded-sm" />
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">CHIKITSAK AI</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 gap-4">

        {/* Severity Card */}
        <div className="w-full bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: cfg.color }} />
          <div className="p-6 flex flex-col items-center gap-3">
            <div className="h-20 w-20 rounded-full flex items-center justify-center" style={{ background: cfg.iconBg }}>
              <span
                className="material-symbols-outlined text-[40px] fill-1 font-variation-settings-fill"
                style={{ color: cfg.color }}
              >
                {cfg.icon}
              </span>
            </div>

            <div
              className="px-5 py-1.5 rounded-full border font-extrabold text-[13px] tracking-widest uppercase"
              style={{ background: cfg.pillBg, color: cfg.pillText, borderColor: cfg.pillBorder }}
            >
              {data.severity} SEVERITY
            </div>

            {(data as any).confidence && (
              <p className="text-[12px] font-semibold text-slate-400">
                AI Confidence: <span className="font-bold" style={{ color: cfg.color }}>{(data as any).confidence}%</span>
              </p>
            )}

            <p className="text-[13px] font-bold text-center" style={{ color: cfg.topMsgColor }}>
              {cfg.topMsg}
            </p>

            <div className="w-full h-px bg-slate-100 my-1" />

            <div className="w-full">
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Recommended Action</p>
              <p className="text-[14px] font-semibold text-[#1e293b] leading-relaxed">{data.action_required}</p>
            </div>
          </div>
        </div>

        {/* AI Analysis Card */}
        <div className="w-full bg-white rounded-[24px] shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#e6f8f7] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0cd8d8] text-[16px]">psychology</span>
            </div>
            <p className="text-[12px] font-extrabold text-[#1e293b] uppercase tracking-wider">AI Analysis</p>
          </div>

          {data.symptoms && (
            <div className="bg-[#f8fafb] rounded-[14px] p-3 border border-slate-100">
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Reported Symptoms</p>
              <p className="text-[13px] text-[#475569] font-medium italic">"{data.symptoms}"</p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">AI Observation</p>
            <p className="text-[13px] text-[#1e293b] font-medium leading-relaxed">{data.summary}</p>
          </div>

          <div className="bg-[#f8fafb] rounded-[14px] p-3 border border-slate-100">
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Probable Condition</p>
            <p className="text-[14px] font-bold text-[#1e293b]">{data.probable_condition}</p>
            <p className="text-[10px] text-[#94a3b8] mt-1">⚠ Disclaimer: Not a medical diagnosis.</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={onFindHospital}
            className="w-full h-[56px] rounded-[18px] flex items-center justify-center gap-3 font-bold text-[15px] text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            style={{ background: cfg.color, boxShadow: `0 8px 25px ${cfg.btnShadow}` }}
          >
            <span className="material-symbols-outlined text-[20px] fill-1">local_hospital</span>
            View Recommended Hospitals
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>

          <a
            href="tel:112"
            className="w-full h-[50px] rounded-[18px] flex items-center justify-center gap-2 font-bold text-[14px] text-[#ef4444] bg-white border border-[#fecaca] shadow-sm hover:bg-[#fef2f2] transition-all"
          >
            <span className="material-symbols-outlined text-[20px] fill-1">call</span>
            Call Emergency (112)
          </a>
        </div>

      </div>
    </div>
  );
}
