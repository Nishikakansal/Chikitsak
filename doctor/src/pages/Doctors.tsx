import React, { useEffect, useState } from 'react';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Clock, 
  Trash2, 
  Edit,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { 
  getDoctors, 
  addDoctor, 
  updateDoctor, 
  deleteDoctor, 
  Doctor, 
  getStoredUser 
} from '../services/api';

export default function DoctorsPage() {
  const user = getStoredUser();
  const hospital_id = user?.hospital_id || '';

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentDoctorId, setCurrentDoctorId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    email: '',
    status: 'On Duty' as Doctor['status']
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [hospital_id]);

  const fetchDoctors = async () => {
    if (!hospital_id) return;
    try {
      setLoading(true);
      const data = await getDoctors(hospital_id);
      setDoctors(data || []);
    } catch (err) {
      setError('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'add' | 'edit', doc?: Doctor) => {
    setModalMode(mode);
    setSaving(false);
    setError('');
    
    if (mode === 'edit' && doc) {
      setCurrentDoctorId(doc.doctor_id);
      setFormData({
        name: doc.name,
        specialization: doc.specialization,
        email: doc.email,
        status: doc.status
      });
    } else {
      setCurrentDoctorId(null);
      setFormData({
        name: '',
        specialization: '',
        email: '',
        status: 'On Duty'
      });
    }
    
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modalMode === 'add') {
        await addDoctor(hospital_id, formData);
      } else if (modalMode === 'edit' && currentDoctorId) {
        await updateDoctor(hospital_id, currentDoctorId, formData);
      }
      setIsModalOpen(false);
      fetchDoctors();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save doctor details');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doctor_id: string) => {
    if (!window.confirm('Are you sure you want to remove this doctor?')) return;
    try {
      await deleteDoctor(hospital_id, doctor_id);
      fetchDoctors();
    } catch (err) {
      alert('Failed to delete doctor');
    }
  };

  const handleStatusToggle = async (doc: Doctor) => {
    try {
      const newStatus = doc.status === 'On Duty' ? 'Off Duty' : 'On Duty';
      await updateDoctor(hospital_id, doc.doctor_id, { status: newStatus });
      fetchDoctors();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Medical Staff</h1>
          <p className="text-slate-500 font-medium">Manage your doctors and their availability</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal('add')}
          className="bg-primary text-slate-900 px-5 py-2.5 rounded-xl font-black shadow-lg shadow-primary/20 hover:brightness-110 flex items-center gap-2 transition-all uppercase tracking-widest text-xs"
        >
          <Plus size={16} />
          Add Doctor
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Doctors</p>
            <p className="text-3xl font-black text-slate-900">{doctors.length}</p>
          </div>
          <div className="size-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <Stethoscope size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">On Duty</p>
            <p className="text-3xl font-black text-emerald-600">
              {doctors.filter(d => d.status === 'On Duty').length}
            </p>
          </div>
          <div className="size-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Off Duty / Break</p>
            <p className="text-3xl font-black text-amber-500">
              {doctors.filter(d => d.status !== 'On Duty').length}
            </p>
          </div>
          <div className="size-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Grid of Doctors */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {doctors.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 border-dashed">
            <Stethoscope className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Doctors Added</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">You haven't added any medical staff to this hospital yet.</p>
            <button 
              onClick={() => handleOpenModal('add')}
              className="bg-primary/10 text-primary px-6 py-2 rounded-xl font-bold hover:bg-primary/20 transition-colors uppercase tracking-widest text-xs inline-flex items-center gap-2"
            >
              <Plus size={16} /> Add First Doctor
            </button>
          </div>
        ) : (
          doctors.map((doc) => (
            <div key={doc.doctor_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="size-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl uppercase">
                    {doc.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight">Dr. {doc.name.replace(/^Dr\.?\s*/i, '')}</h3>
                    <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">{doc.specialization}</p>
                  </div>
                </div>
                
                {/* Actions Dropdown */}
                <div className="relative group/dropdown">
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-10 py-2">
                    <button 
                      onClick={() => handleOpenModal('edit', doc)}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary flex items-center gap-2"
                    >
                      <Edit size={16} /> Edit Details
                    </button>
                    <button 
                      onClick={() => handleStatusToggle(doc)}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary flex items-center gap-2"
                    >
                      <Clock size={16} /> Toggle Duty Status
                    </button>
                    <button 
                      onClick={() => handleDelete(doc.doctor_id)}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Remove Doctor
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Mail size={14} className="text-slate-400" />
                  </div>
                  <span className="text-slate-600 font-medium truncate">{doc.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Clock size={14} className="text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">Status:</span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                      doc.status === 'On Duty' ? 'bg-emerald-100 text-emerald-700' :
                      doc.status === 'Off Duty' ? 'bg-slate-100 text-slate-600' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {modalMode === 'add' ? 'Add New Doctor' : 'Edit Doctor Details'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Jane Doe"
                  className="w-full rounded-xl border-slate-200 bg-white text-sm p-3 font-bold focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Specialization</label>
                <input 
                  type="text" required
                  value={formData.specialization}
                  onChange={e => setFormData({...formData, specialization: e.target.value})}
                  placeholder="e.g., Cardiologist, General Physician"
                  className="w-full rounded-xl border-slate-200 bg-white text-sm p-3 font-bold focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="doctor@hospital.com"
                  className="w-full rounded-xl border-slate-200 bg-white text-sm p-3 font-bold focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                  className="w-full rounded-xl border-slate-200 bg-white text-sm p-3 font-bold focus:ring-primary focus:border-primary"
                >
                  <option value="On Duty">On Duty</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Break">Break</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-black tracking-widest text-xs uppercase rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-primary text-slate-900 font-black tracking-widest text-xs uppercase rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
