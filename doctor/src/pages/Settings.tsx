import React, { useEffect, useState } from 'react';
import { 
  Building2, Phone, Mail, MapPin, Save, Loader2, AlertTriangle, CheckCircle, Hospital, Compass
} from 'lucide-react';
import { getHospitalProfile, updateHospitalProfile, getStoredUser, clearUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const SettingSection = ({ title, icon: Icon, children }: any) => (
  <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
    <div className="flex items-center gap-2 text-primary">
      <Icon size={20} />
      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h3>
    </div>
    {children}
  </section>
);

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const hospital_id = user?.hospital_id || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    phone: '',
    tagline: '',
    latitude: '' as string | number,
    longitude: '' as string | number
  });

  useEffect(() => {
    if (!hospital_id) return;
    getHospitalProfile(hospital_id)
      .then(data => {
        setFormData({
          name: data.name || '',
          email: data.email || '',
          location: data.location || '',
          phone: data.phone || '',
          tagline: data.tagline || '',
          latitude: data.latitude || '',
          longitude: data.longitude || ''
        });
      })
      .catch(() => setError('Could not load hospital profile.'))
      .finally(() => setLoading(false));
  }, [hospital_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload: any = { ...formData };
      if (payload.latitude === '') payload.latitude = null;
      if (payload.longitude === '') payload.longitude = null;
      await updateHospitalProfile(hospital_id, payload);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setSaving(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));
        setSuccess('Coordinates updated fetched device. Remember to save settings.');
        setTimeout(() => setSuccess(''), 3000);
        setSaving(false);
      },
      (err) => {
        setError('Could not fetch location. Please ensure location services are enabled.');
        setSaving(false);
      },
      { timeout: 10000 }
    );
  };

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hospital Settings</h1>
          <p className="text-slate-500 font-medium text-lg">Configure your profile, contact info, and system preferences.</p>
        </div>
        <button 
          type="button" 
          onClick={handleLogout}
          className="px-6 py-2 border border-red-200 text-red-600 bg-red-50 font-black rounded-xl text-xs hover:bg-red-100 transition-colors uppercase tracking-widest"
        >
          Logout
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2"><AlertTriangle size={16}/>{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2"><CheckCircle size={16}/>{success}</div>}

      <div className="space-y-8">
        {/* Hospital Profile */}
        <SettingSection title="Hospital Profile Details" icon={Building2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex items-center gap-6 pb-6 border-b border-slate-100">
              <div className="size-24 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                <Hospital className="text-primary" size={32} />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider">Hospital Registration ID</h4>
                <p className="text-2xl font-black text-primary tracking-wider">{hospital_id}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">This ID cannot be changed.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hospital Name</label>
              <input 
                name="name" type="text" required
                value={formData.name} onChange={handleChange}
                className="rounded-xl border-slate-200 bg-slate-50 text-sm p-3 font-bold focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tagline / Mission</label>
              <input 
                name="tagline" type="text"
                value={formData.tagline} onChange={handleChange}
                placeholder="e.g., Dedicated to healing, committed to care."
                className="rounded-xl border-slate-200 bg-slate-50 text-sm p-3 font-bold focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </SettingSection>

        {/* Contact Information */}
        <SettingSection title="Contact Information" icon={Phone}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Emergency Helpline / Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  name="phone" type="tel"
                  value={formData.phone} onChange={handleChange}
                  placeholder="+91 1800 555 0199"
                  className="w-full pl-10 rounded-xl border-slate-200 bg-slate-50 text-sm p-3 font-bold focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  name="email" type="email" required
                  value={formData.email} onChange={handleChange}
                  className="w-full pl-10 rounded-xl border-slate-200 bg-slate-50 text-sm p-3 font-bold focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Street Address / Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                <textarea 
                  name="location" rows={2}
                  value={formData.location} onChange={handleChange}
                  placeholder="Full hospital address"
                  className="w-full pl-10 rounded-xl border-slate-200 bg-slate-50 text-sm p-3 font-bold focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Geolocation Section */}
        <SettingSection title="Geolocation / Routing" icon={Compass}>
          <div className="flex flex-col gap-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm font-bold text-blue-900 border-b border-blue-200 pb-2 mb-2">Hospital Coordinates</p>
              <p className="text-xs text-blue-800">
                These coordinates are used by emergency routing systems (like the Chikitsak Patient App) to direct ambulances to your facility.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latitude</label>
                <input 
                  name="latitude" type="number" step="any"
                  value={formData.latitude} onChange={handleChange}
                  placeholder="e.g., 22.5726"
                  className="rounded-xl border-slate-200 bg-slate-50 text-sm p-3 font-bold focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Longitude</label>
                <input 
                  name="longitude" type="number" step="any"
                  value={formData.longitude} onChange={handleChange}
                  placeholder="e.g., 88.3639"
                  className="rounded-xl border-slate-200 bg-slate-50 text-sm p-3 font-bold focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div>
              <button 
                type="button" onClick={handleUpdateLocation}
                className="px-6 py-2 border border-slate-200 bg-white font-black rounded-xl text-xs hover:bg-slate-50 transition-colors tracking-widest uppercase shadow-sm flex items-center gap-2"
              >
                <MapPin size={14} /> Update using Device Location
              </button>
            </div>
          </div>
        </SettingSection>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
          <button 
            type="submit" disabled={saving}
            className="px-8 py-3 bg-primary text-slate-900 font-black rounded-xl text-xs hover:brightness-110 shadow-lg shadow-primary/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </form>
  );
}
