import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  History,
  FileText
} from 'lucide-react';

const StatCard = ({ label, value, subtext, colorClass }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
    <h3 className={`text-3xl font-black ${colorClass}`}>{value}</h3>
    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{subtext}</p>
  </div>
);

export default function Patients() {
  const [patients] = useState([
    { id: '#PAT-4902', name: 'Aayushi Raj', age: 24, gender: 'Female', condition: 'Cardiac Arrest', status: 'Critical', lastVisit: 'Today, 10:30 AM' },
    { id: '#PAT-4905', name: 'Rahul Sharma', age: 32, gender: 'Male', condition: 'Multiple Fractures', status: 'Stable', lastVisit: 'Today, 11:15 AM' },
    { id: '#PAT-4881', name: 'Priya Patel', age: 45, gender: 'Female', condition: 'Post-Op Recovery', status: 'Recovering', lastVisit: 'Yesterday' },
    { id: '#PAT-4876', name: 'Amit Singh', age: 29, gender: 'Male', condition: 'Severe Migraine', status: 'Discharged', lastVisit: '2 days ago' },
    { id: '#PAT-4870', name: 'Sneha Gupta', age: 38, gender: 'Female', condition: 'Type 2 Diabetes', status: 'Stable', lastVisit: '1 week ago' },
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-slate-500 font-medium">Manage patient records, medical history, and admissions.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 text-sm font-black rounded-xl hover:bg-slate-50 transition-all uppercase tracking-wider">
            <History size={18} />
            History
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-900 text-sm font-black rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all uppercase tracking-wider">
            <UserPlus size={18} />
            New Admission
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value="1,284" subtext="All time records" colorClass="text-slate-900" />
        <StatCard label="Currently Admitted" value="156" subtext="In-patient care" colorClass="text-primary" />
        <StatCard label="Critical Cases" value="12" subtext="Requires monitoring" colorClass="text-red-500" />
        <StatCard label="Discharged Today" value="08" subtext="Last 24 hours" colorClass="text-emerald-500" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID, or condition..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold hover:bg-slate-50 transition-colors uppercase tracking-wider">
            <Filter size={14} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold hover:bg-slate-50 transition-colors uppercase tracking-wider">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Patient Info</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Visit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((pat, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{pat.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {pat.id} • {pat.age}Y • {pat.gender}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{pat.condition}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      pat.status === 'Critical' ? 'bg-red-50 text-red-600' :
                      pat.status === 'Stable' ? 'bg-emerald-50 text-emerald-600' :
                      pat.status === 'Recovering' ? 'bg-blue-50 text-blue-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {pat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-slate-500">{pat.lastVisit}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                        <FileText size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Page <span className="text-slate-900">1</span> of <span className="text-slate-900">128</span>
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
            <ChevronLeft size={18} />
          </button>
          <button className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
