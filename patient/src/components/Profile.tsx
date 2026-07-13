import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [userName, setUserName] = useState('Patient');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.name) setUserName(u.name);
        if (u.email) setUserEmail(u.email);
      }
    } catch (_) {}
  }, []);

  const initials = userName.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

  return (
    <div className="flex flex-col h-full bg-[#f8fafb]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-8 pb-4 sticky top-0 z-10 bg-[#f8fafb]">
        <h1 className="text-[20px] font-bold tracking-tight text-slate-900">Medical Profile</h1>
        <button className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 transition-colors text-[#088a8a]">
          <span className="material-symbols-outlined text-[22px]">edit</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">

        {/* Profile card */}
        <div className="px-5 mb-5">
          <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#0cd8d8] to-[#088a8a] flex items-center justify-center">
                <span className="text-[28px] font-black text-white">{initials}</span>
              </div>
              <div className="absolute bottom-0 right-0 h-7 w-7 bg-emerald-500 rounded-full border-[3px] border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[14px]">check</span>
              </div>
            </div>

            <h2 className="text-[20px] font-bold text-slate-900 mb-0.5">{userName}</h2>
            {userEmail && <p className="text-[13px] text-slate-400 font-medium">{userEmail}</p>}

            {/* Blood Group */}
            <div className="mt-5 w-full pt-5 border-t border-slate-100 flex justify-center">
              <div className="flex flex-col items-center px-8 py-3 bg-[#e6f8f7] rounded-2xl border border-[#0cd8d8]/20">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#088a8a] mb-1">Blood Group</span>
                <span className="text-[28px] font-black text-[#088a8a]">—</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Not set</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Emergency Contacts</h3>
            <button className="text-[12px] font-bold text-[#088a8a] hover:underline">Add New</button>
          </div>

          {/* Placeholder if no contacts */}
          <div className="flex flex-col items-center py-8 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[28px] text-slate-300">person_add</span>
            </div>
            <p className="text-[14px] font-semibold text-slate-500">No emergency contacts added</p>
            <p className="text-[12px] text-slate-400 mt-1">Add contacts for quick access during emergencies</p>
            <button className="mt-4 px-5 py-2.5 rounded-xl bg-[#0cd8d8] text-white font-bold text-[13px] shadow-md shadow-[#0cd8d8]/20">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Contact
              </span>
            </button>
          </div>
        </div>

        {/* Medical ID */}
        <div className="px-5 pb-12">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Medical ID</p>
            <p className="text-[14px] font-bold text-[#088a8a]">CHK-{Math.floor(Math.random() * 900000 + 100000)}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
