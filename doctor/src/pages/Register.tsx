import React, { useState } from 'react';
import { 
  Badge as BadgeIcon, 
  Lock as LockIcon, 
  UserPlus, 
  Hospital,
  Loader2,
  Building,
  CheckCircle2,
  Copy,
  Mail,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { hashPassword } from '../utils/hash';
import { registerHospital } from '../services/api';

export default function RegisterPage() {
  const [isLoading, setIsLoading]       = useState(false);
  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [location, setLocation]         = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPwd, setConfirmPwd]     = useState('');
  const [error, setError]               = useState('');
  const [registeredId, setRegisteredId] = useState<string | null>(null);
  const [copied, setCopied]             = useState(false);
  const navigate = useNavigate();

  const generateHospitalId = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `HOSP-${year}-${rand}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPwd) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    // Try to get geolocation
    let lat: number | null = null;
    let lng: number | null = null;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch (georrror) {
      console.warn("Could not get location automatically", georrror);
    }

    try {
      const hospital_id    = generateHospitalId();
      const hashedPassword = await hashPassword(password);

      await registerHospital({
        hospital_id,
        name:     name.trim(),
        password: hashedPassword,
        email:    email.trim(),
        location: location.trim(),
        latitude: lat,
        longitude: lng,
      });

      setRegisteredId(hospital_id);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (registeredId) {
      navigator.clipboard.writeText(registeredId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background-light">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary rounded-full blur-[80px]"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center text-center p-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8 p-8 bg-white rounded-3xl shadow-2xl border border-primary/20"
          >
            <div className="relative w-48 h-48 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 rounded-full"
              />
              <Hospital size={120} className="text-primary relative z-10" />
            </div>
          </motion.div>
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter uppercase">CHIKITSAK</h2>
          <p className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4 opacity-80">Powering the future of healthcare</p>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Register Your Facility</h3>
          <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
            Join the Chikitsak network to manage real-time hospital resources and help patients find the best care during emergencies.
          </p>
        </div>
      </div>

      {/* Right: Form or Success */}
      <div className="flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[480px] bg-white p-8 rounded-3xl shadow-xl border border-slate-100 my-8"
        >
          {registeredId ? (
            /* ── Success Screen ── */
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Registration Successful!</h2>
              <p className="text-slate-600 mb-6">
                Your hospital has been registered. Save your Hospital ID below — you'll need it to log in.
              </p>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 relative group">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Your Hospital ID</p>
                <p className="text-3xl font-black text-primary tracking-wider">{registeredId}</p>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 text-slate-400 hover:text-primary transition-colors flex flex-col items-center"
                >
                  <Copy size={20} />
                  {copied && <span className="text-[10px] font-bold text-primary mt-1 absolute -bottom-4">Copied!</span>}
                </button>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center uppercase tracking-widest"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            /* ── Registration Form ── */
            <>
              <div className="text-center mb-8">
                <h1 className="text-slate-900 text-3xl font-black tracking-tight mb-2">Hospital Registration</h1>
                <p className="text-slate-500 font-medium">Create your hospital account to get started</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100">
                    {error}
                  </div>
                )}

                {/* Hospital Name */}
                <div className="space-y-2">
                  <label className="text-slate-700 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Building size={14} /> Hospital Name
                  </label>
                  <input
                    type="text" required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., City General Hospital"
                    className="w-full rounded-xl border-slate-200 bg-white text-slate-900 h-12 px-4 focus:ring-primary focus:border-primary font-bold transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-slate-700 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Mail size={14} /> Email Address
                  </label>
                  <input
                    type="email" required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="hospital@example.com"
                    className="w-full rounded-xl border-slate-200 bg-white text-slate-900 h-12 px-4 focus:ring-primary focus:border-primary font-bold transition-all"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-slate-700 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} /> Location / City
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g., Mumbai, Maharashtra"
                    className="w-full rounded-xl border-slate-200 bg-white text-slate-900 h-12 px-4 focus:ring-primary focus:border-primary font-bold transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-slate-700 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <LockIcon size={14} /> Password
                  </label>
                  <input
                    type="password" required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl border-slate-200 bg-white text-slate-900 h-12 px-4 focus:ring-primary focus:border-primary font-bold transition-all"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-slate-700 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <LockIcon size={14} /> Confirm Password
                  </label>
                  <input
                    type="password" required
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border-slate-200 bg-white text-slate-900 h-12 px-4 focus:ring-primary focus:border-primary font-bold transition-all"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-blue-800 text-sm">
                  <BadgeIcon className="shrink-0 mt-0.5" size={18} />
                  <p>Your unique <strong>Hospital ID</strong> will be automatically generated and shown after registration.</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-slate-900 font-black py-4 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest mt-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <><UserPlus size={20} /> Register Hospital</>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  Already registered? <Link to="/" className="text-primary hover:underline">Sign In here</Link>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-6 text-center lg:text-right pointer-events-none">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
          © 2024 CHIKITSAK Health Solutions. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
