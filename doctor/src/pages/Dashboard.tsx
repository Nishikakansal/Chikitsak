import React, { useEffect, useState } from 'react';
import { 
  Bed, Activity, Wind, Users, Stethoscope, 
  Download, Calendar as CalendarIcon, AlertCircle, Ambulance, ChevronRight, RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { getHospitalInfo, getStoredUser } from '../services/api';

interface HospitalInfo {
  available_beds: number;
  icu_beds: number;
  ventilators: number;
  ambulances: number;
  crowd_level: string;
  emergency_status: string;
  doctors: Array<{ doctor_id: string; name: string; specialization: string; status: string }>;
  last_updated: string;
}

const MetricCard = ({ icon: Icon, label, value, colorClass }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-xl ${colorClass}`}>
        <Icon size={20} />
      </div>
    </div>
    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
    <h3 className="text-2xl font-black mt-1 text-slate-900">{value ?? '—'}</h3>
  </div>
);

const crowdColor: Record<string, string> = {
  Low:    'text-emerald-600 bg-emerald-50 border-emerald-200',
  Medium: 'text-amber-600 bg-amber-50 border-amber-200',
  High:   'text-rose-600 bg-rose-50 border-rose-200',
};

export default function Dashboard() {
  const [info, setInfo] = useState<HospitalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getStoredUser();

  const fetchData = async () => {
    if (!user?.hospital_id) {
      setError('Not logged in.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getHospitalInfo(user.hospital_id);
      setInfo(data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onDutyDoctors = info?.doctors?.filter(d => d.status === 'On Duty') ?? [];
  const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Hospital Overview</h2>
          <p className="text-slate-500 mt-1 font-medium">
            Real-time monitoring for <span className="font-black text-slate-900">{user?.name || 'your facility'}</span>
          </p>
          {info?.last_updated && (
            <p className="text-xs text-slate-400 mt-1">Last updated: {new Date(info.last_updated).toLocaleString('en-IN')}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <CalendarIcon size={16} />
            {todayStr}
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 transition-all uppercase tracking-wider"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold">{error}</div>
      )}

      {/* Metrics Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricCard icon={Bed}        label="Available Beds"  value={info?.available_beds}  colorClass="bg-blue-50 text-blue-600" />
          <MetricCard icon={Activity}   label="ICU Beds"        value={info?.icu_beds}         colorClass="bg-emerald-50 text-emerald-600" />
          <MetricCard icon={Wind}       label="Ventilators"     value={info?.ventilators}      colorClass="bg-cyan-50 text-cyan-600" />
          <MetricCard icon={Ambulance}  label="Ambulances"      value={info?.ambulances}       colorClass="bg-orange-50 text-orange-600" />
          <MetricCard icon={Stethoscope} label="Doctors On Duty" value={onDutyDoctors.length}  colorClass="bg-primary/10 text-slate-900" />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Crowd & Emergency Status */}
        <div className="xl:col-span-2 space-y-6">
          <h3 className="text-xl font-black flex items-center gap-2 text-slate-900">
            <AlertCircle className="text-red-500" size={24} />
            Facility Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Users size={14} /> Crowd Level
              </p>
              <span className={`inline-block px-4 py-2 rounded-xl border text-lg font-black ${crowdColor[info?.crowd_level || 'Low'] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                {info?.crowd_level || '—'}
              </span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <AlertCircle size={14} /> Emergency Status
              </p>
              <span className={`inline-block px-4 py-2 rounded-xl border text-lg font-black ${
                info?.emergency_status === 'Critical' ? 'text-rose-700 bg-rose-50 border-rose-200' :
                info?.emergency_status === 'High'     ? 'text-orange-700 bg-orange-50 border-orange-200' :
                'text-emerald-700 bg-emerald-50 border-emerald-200'
              }`}>
                {info?.emergency_status || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Active Doctors Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900">Doctors On Duty</h3>
            <a href="/doctors" className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
              Manage <ChevronRight size={14} />
            </a>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />)}
            </div>
          ) : onDutyDoctors.length === 0 ? (
            <p className="text-slate-400 text-sm font-medium text-center py-8">No doctors currently on duty.</p>
          ) : (
            <div className="space-y-4">
              {onDutyDoctors.slice(0, 5).map((doc) => (
                <div key={doc.doctor_id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{doc.specialization}</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    ON DUTY
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
