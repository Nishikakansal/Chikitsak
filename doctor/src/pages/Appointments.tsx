import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

const AppointmentCard = ({ patient, doctor, time, type, status }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
          {patient.charAt(0)}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">{patient}</h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Patient</p>
        </div>
      </div>
      <button className="text-slate-400 hover:text-slate-600">
        <MoreVertical size={16} />
      </button>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
        <Calendar size={14} className="text-primary" />
        <span>Today, Oct 24</span>
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
        <Clock size={14} className="text-primary" />
        <span>{time}</span>
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
        <div className="w-3.5 h-3.5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500">D</div>
        <span>{doctor}</span>
      </div>
    </div>

    <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{type}</span>
      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
        status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
        status === 'Pending' ? 'bg-amber-50 text-amber-600' :
        'bg-red-50 text-red-600'
      }`}>
        {status}
      </span>
    </div>
  </div>
);

export default function Appointments() {
  const [activeTab, setActiveTab] = useState('Upcoming');

  const appointments = [
    { patient: 'Aayushi Raj', doctor: 'Dr. Arpit Verma', time: '10:30 AM', type: 'Checkup', status: 'Confirmed' },
    { patient: 'Rahul Sharma', doctor: 'Dr. Michael Chen', time: '11:15 AM', type: 'Follow-up', status: 'Pending' },
    { patient: 'Priya Patel', doctor: 'Dr. Sarah Khan', time: '12:00 PM', type: 'Consultation', status: 'Confirmed' },
    { patient: 'Amit Singh', doctor: 'Dr. Priya Singh', time: '02:30 PM', type: 'Emergency', status: 'Confirmed' },
    { patient: 'Sneha Gupta', doctor: 'Dr. Elena Rodriguez', time: '03:45 PM', type: 'Routine', status: 'Cancelled' },
    { patient: 'Vikram Malhotra', doctor: 'Dr. Arpit Verma', time: '04:30 PM', type: 'Checkup', status: 'Confirmed' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 font-medium">Schedule and manage patient visits and consultations.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-900 text-sm font-black rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all uppercase tracking-wider">
          <Plus size={18} />
          Book Appointment
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
            <h4 className="text-2xl font-black text-slate-900">24</h4>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
            <h4 className="text-2xl font-black text-slate-900">12</h4>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancelled</p>
            <h4 className="text-2xl font-black text-slate-900">03</h4>
          </div>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200">
        <div className="flex gap-8">
          {['Upcoming', 'Completed', 'Cancelled'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-black uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((apt, i) => (
          <AppointmentCard 
            key={i} 
            patient={apt.patient}
            doctor={apt.doctor}
            time={apt.time}
            type={apt.type}
            status={apt.status}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <button className="flex items-center gap-1 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
          <ChevronLeft size={16} /> Previous
        </button>
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-lg bg-primary text-slate-900 flex items-center justify-center text-xs font-black">1</span>
          <span className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 cursor-pointer">2</span>
          <span className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 cursor-pointer">3</span>
        </div>
        <button className="flex items-center gap-1 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
