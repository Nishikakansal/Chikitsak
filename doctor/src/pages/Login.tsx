import React, { useState } from 'react';
import { 
  Badge as BadgeIcon, 
  Lock as LockIcon, 
  LogIn, 
  User, 
  Hospital,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { hashPassword } from '../utils/hash';
import { loginHospital, storeUser } from '../services/api';

export default function LoginPage() {
  const [role, setRole] = useState('hospital');
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const hashedPassword = await hashPassword(password);
      const user = await loginHospital(id.trim(), hashedPassword);
      storeUser({
        hospital_id: user.hospital_id,
        name:        user.name,
        email:       user.email,
        role:        user.role,
      });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
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
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 p-8 bg-white rounded-3xl shadow-2xl border border-primary/20"
          >
            <div className="relative w-48 h-48 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 rounded-full"
              />
              <Hospital size={120} className="text-primary relative z-10" />
              <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 100 100">
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  d="M 10,50 L 35,50 L 42,30 L 50,75 L 58,20 L 65,50 L 90,50" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </motion.div>
          
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter uppercase">CHIKITSAK</h2>
          <p className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4 opacity-80">Powering the future of healthcare</p>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Intelligent Healthcare Management</h3>
          <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
            A unified platform for patients and hospitals to manage health records, appointments, and medical diagnostics with military-grade security.
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[480px] bg-white p-8 rounded-3xl shadow-xl border border-slate-100"
        >
          <div className="text-center mb-8">
            <h1 className="text-slate-900 text-3xl font-black tracking-tight mb-2">Hospital Staff Login</h1>
            <p className="text-slate-500 font-medium">Secure access to the Chikitsak dashboard</p>
          </div>

          {/* Role Toggle */}
          <div className="flex p-1.5 mb-8 rounded-2xl bg-slate-100">
            <button 
              type="button"
              onClick={() => { setRole('patient'); setError(''); }}
              className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                role === 'patient' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <User size={18} className="mr-2" />
              Patient
            </button>
            <button 
              type="button"
              onClick={() => { setRole('hospital'); setError(''); }}
              className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                role === 'hospital' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <Hospital size={18} className="mr-2" />
              Hospital
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold mb-4 border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-slate-700 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <BadgeIcon size={14} />
                Hospital ID
              </label>
              <input 
                type="text" 
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g., HOSP-2024-001"
                className="w-full rounded-xl border-slate-200 bg-white text-slate-900 h-12 px-4 focus:ring-primary focus:border-primary font-bold transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-700 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <LockIcon size={14} />
                  Password
                </label>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border-slate-200 bg-white text-slate-900 h-12 px-4 focus:ring-primary focus:border-primary font-bold transition-all"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-slate-900 font-black py-4 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              New facility? <Link to="/register" className="text-primary hover:underline">Register an account</Link>
            </p>
          </div>
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
