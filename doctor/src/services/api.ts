import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach hospital_id to every request automatically ─────────────────────
api.interceptors.request.use((config) => {
  const user = getStoredUser();
  if (user?.hospital_id) {
    config.headers['X-Hospital-ID'] = user.hospital_id;
  }
  return config;
});

// ── Session helpers ───────────────────────────────────────────────────────
export interface HospitalUser {
  hospital_id: string;
  name: string;
  email: string;
  role: string;
}

export function getStoredUser(): HospitalUser | null {
  try {
    const raw = sessionStorage.getItem('chikitsak_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: HospitalUser) {
  sessionStorage.setItem('chikitsak_user', JSON.stringify(user));
}

export function clearUser() {
  sessionStorage.removeItem('chikitsak_user');
}

// ── Auth ──────────────────────────────────────────────────────────────────
export async function loginHospital(hospital_id: string, hashedPassword: string) {
  const res = await api.post('/api/login', { hospital_id, password: hashedPassword });
  return res.data as HospitalUser & { message: string };
}

export async function registerHospital(payload: {
  hospital_id: string;
  name: string;
  password: string;
  email: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const res = await api.post('/api/register', payload);
  return res.data;
}

// ── Hospital Profile (Settings) ──────────────────────────────────────────
export async function getHospitalProfile(hospital_id: string) {
  const res = await api.get(`/api/hospital/${hospital_id}/profile`);
  return res.data;
}

export async function updateHospitalProfile(
  hospital_id: string,
  payload: { name?: string; email?: string; location?: string; phone?: string; tagline?: string; latitude?: number | null; longitude?: number | null }
) {
  const res = await api.put(`/api/hospital/${hospital_id}/profile`, payload);
  // Also update session storage if name/email changed
  const currentUser = getStoredUser();
  if (currentUser) {
    if (payload.name) currentUser.name = payload.name;
    if (payload.email) currentUser.email = payload.email;
    storeUser(currentUser);
  }
  return res.data;
}

// ── Hospital Info (Resources + Doctors) ──────────────────────────────────
export async function getHospitalInfo(hospital_id: string) {
  const res = await api.get(`/api/hospital/${hospital_id}/info`);
  return res.data;
}

export async function updateResources(
  hospital_id: string,
  payload: {
    available_beds?: number;
    icu_beds?: number;
    ventilators?: number;
    ambulances?: number;
    crowd_level?: string;
    emergency_status?: string;
  }
) {
  const res = await api.put(`/api/hospital/${hospital_id}/resources`, payload);
  return res.data;
}

// ── Doctors ───────────────────────────────────────────────────────────────
export async function getDoctors(hospital_id: string) {
  const res = await api.get(`/api/hospital/${hospital_id}/doctors`);
  return res.data.doctors as Doctor[];
}

export interface Doctor {
  doctor_id: string;
  name: string;
  specialization: string;
  email: string;
  status: 'On Duty' | 'Off Duty' | 'Break';
  added_at: string;
}

export async function addDoctor(
  hospital_id: string,
  doctor: Omit<Doctor, 'doctor_id' | 'added_at'>
) {
  const res = await api.post(`/api/hospital/${hospital_id}/doctors`, doctor);
  return res.data;
}

export async function updateDoctor(
  hospital_id: string,
  doctor_id: string,
  updates: Partial<Omit<Doctor, 'doctor_id' | 'added_at'>>
) {
  const res = await api.put(`/api/hospital/${hospital_id}/doctors/${doctor_id}`, updates);
  return res.data;
}

export async function deleteDoctor(hospital_id: string, doctor_id: string) {
  const res = await api.delete(`/api/hospital/${hospital_id}/doctors/${doctor_id}`);
  return res.data;
}

export default api;
