import React, { useEffect, useState } from 'react';
import { 
  Package, Bed, Activity, Ambulance, Smile, Meh, Frown, 
  RefreshCw, ShieldCheck, Users, AlertTriangle, CheckCircle, Loader2
} from 'lucide-react';
import { getHospitalInfo, updateResources, getStoredUser } from '../services/api';

type CrowdLevel = 'Low' | 'Medium' | 'High';
type EmergencyStatus = 'Normal' | 'High' | 'Critical';

const CROWD_CONFIG = {
  Low:    { icon: Smile,  label: 'Low',    desc: 'Minimal wait time. Immediate care.',     color: { border: 'border-emerald-500/20', bg: 'bg-emerald-50', text: 'text-emerald-500', ring: 'ring-emerald-500/10', subtext: 'text-emerald-600/70' } },
  Medium: { icon: Meh,    label: 'Medium',  desc: 'Moderate queue. 15–30 min wait.',        color: { border: 'border-amber-500',     bg: 'bg-amber-50',   text: 'text-amber-500',   ring: 'ring-amber-500/20',   subtext: 'text-amber-600/70'   } },
  High:   { icon: Frown,  label: 'High',   desc: 'High volume. Significant delay.',         color: { border: 'border-rose-500/20',   bg: 'bg-rose-50',    text: 'text-rose-500',    ring: 'ring-rose-500/10',    subtext: 'text-rose-600/70'    } },
};

const EMERGENCY_OPTIONS: EmergencyStatus[] = ['Normal', 'High', 'Critical'];

export default function Resources() {
  const user = getStoredUser();
  const hospital_id = user?.hospital_id || '';

  const [availableBeds, setAvailableBeds] = useState('');
  const [icuBeds,       setIcuBeds]       = useState('');
  const [ventilators,   setVentilators]   = useState('');
  const [ambulances,    setAmbulances]    = useState('');
  const [crowdLevel,    setCrowdLevel]    = useState<CrowdLevel>('Low');
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus>('Normal');

  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [lastSaved, setLastSaved] = useState('');
  const [success,   setSuccess]   = useState('');
  const [error,     setError]     = useState('');

  // Load existing data
  useEffect(() => {
    if (!hospital_id) return;
    getHospitalInfo(hospital_id)
      .then(data => {
        setAvailableBeds(String(data.available_beds ?? ''));
        setIcuBeds(String(data.icu_beds ?? ''));
        setVentilators(String(data.ventilators ?? ''));
        setAmbulances(String(data.ambulances ?? ''));
        setCrowdLevel((data.crowd_level as CrowdLevel) || 'Low');
        setEmergencyStatus((data.emergency_status as EmergencyStatus) || 'Normal');
        if (data.last_updated) setLastSaved(new Date(data.last_updated).toLocaleString('en-IN'));
      })
      .catch(() => setError('Could not load current resource data.'))
      .finally(() => setLoading(false));
  }, [hospital_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await updateResources(hospital_id, {
        available_beds:   Number(availableBeds),
        icu_beds:         Number(icuBeds),
        ventilators:      Number(ventilators),
        ambulances:       Number(ambulances),
        crowd_level:      crowdLevel,
        emergency_status: emergencyStatus,
      });
      setSuccess('Resources updated successfully!');
      setLastSaved(new Date(res.last_updated).toLocaleString('en-IN'));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">Real-Time Resource & Crowd Management</h1>
        <p className="text-slate-500 text-lg font-medium leading-normal">Update your facility's operational status instantly to aid emergency dispatchers.</p>
      </div>

      {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2"><AlertTriangle size={16}/>{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2"><CheckCircle size={16}/>{success}</div>}

      {/* Resource Availability */}
      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Package size={24} />
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Resource Availability</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Beds */}
          <label className="flex flex-col gap-2">
            <span className="text-slate-700 text-xs font-black uppercase tracking-wider">Available Beds</span>
            <div className="relative">
              <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="number" min="0"
                value={availableBeds}
                onChange={e => setAvailableBeds(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 h-14 pl-12 pr-4 focus:ring-primary focus:border-primary font-bold"
              />
            </div>
          </label>
          {/* ICU Beds */}
          <label className="flex flex-col gap-2">
            <span className="text-slate-700 text-xs font-black uppercase tracking-wider">ICU Beds</span>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="number" min="0"
                value={icuBeds}
                onChange={e => setIcuBeds(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 h-14 pl-12 pr-4 focus:ring-primary focus:border-primary font-bold"
              />
            </div>
          </label>
          {/* Ventilators */}
          <label className="flex flex-col gap-2">
            <span className="text-slate-700 text-xs font-black uppercase tracking-wider">Ventilators</span>
            <div className="relative">
              <RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="number" min="0"
                value={ventilators}
                onChange={e => setVentilators(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 h-14 pl-12 pr-4 focus:ring-primary focus:border-primary font-bold"
              />
            </div>
          </label>
          {/* Ambulances */}
          <label className="flex flex-col gap-2">
            <span className="text-slate-700 text-xs font-black uppercase tracking-wider">Available Ambulances</span>
            <div className="relative">
              <Ambulance className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="number" min="0"
                value={ambulances}
                onChange={e => setAmbulances(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 h-14 pl-12 pr-4 focus:ring-primary focus:border-primary font-bold"
              />
            </div>
          </label>
        </div>
      </section>

      {/* Crowd Level */}
      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Users size={24} />
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Current Crowd Level</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.entries(CROWD_CONFIG) as [CrowdLevel, typeof CROWD_CONFIG.Low][]).map(([level, cfg]) => {
            const Icon = cfg.icon;
            const active = crowdLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setCrowdLevel(level)}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                  active
                    ? `${cfg.color.border} ${cfg.color.bg} ring-4 ${cfg.color.ring}`
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                }`}
              >
                <Icon className={active ? cfg.color.text : 'text-slate-300'} size={32} />
                <span className={`font-black uppercase tracking-widest ${active ? cfg.color.text : 'text-slate-400'}`}>{level}</span>
                <span className={`text-[10px] text-center leading-tight font-medium ${active ? cfg.color.subtext : 'text-slate-400'}`}>{cfg.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Emergency Capacity Status */}
      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <AlertTriangle size={24} />
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Emergency Capacity Status</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {EMERGENCY_OPTIONS.map(status => (
            <button
              key={status}
              type="button"
              onClick={() => setEmergencyStatus(status)}
              className={`py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-sm transition-all ${
                emergencyStatus === status
                  ? status === 'Critical' ? 'bg-rose-50 border-rose-500 text-rose-600'
                  : status === 'High'     ? 'bg-orange-50 border-orange-500 text-orange-600'
                  :                         'bg-emerald-50 border-emerald-500 text-emerald-600'
                  : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-2">
        <p className="text-slate-400 text-xs italic font-medium">
          {lastSaved ? `Last saved: ${lastSaved}` : 'Not yet saved'}
        </p>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-primary text-slate-900 font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-60"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
          {saving ? 'Saving…' : 'Update Status'}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold pt-8 border-t border-slate-100">
        <ShieldCheck size={16} />
        SECURE END-TO-END ENCRYPTED DASHBOARD
      </div>
    </form>
  );
}
