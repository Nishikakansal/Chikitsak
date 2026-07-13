
export type Screen = 
  | 'SPLASH' 
  | 'ONBOARDING' 
  | 'LOGIN' 
  | 'SIGNUP' 
  | 'HOME' 
  | 'HOSPITAL_LIST' 
  | 'HOSPITAL_DETAILS' 
  | 'NAVIGATION' 
  | 'TRIAGE_INPUT'
  | 'TRIAGE_RESULT' 
  | 'PROFILE' 
  | 'SETTINGS';

/** Matches the MongoDB Hospitals collection schema returned by /api/hospitals/ranked */
export interface Hospital {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  distance_km: number | null;
  eta_min: number | null;
  beds_available: number;
  icu_available: number;
  ventilators_available: number;
  doctors_on_duty: number;
  crowd_level: number;        // 0.0 (empty) to 1.0 (full)
  specializations: string[];
  emergency: boolean;
  priority_score: number;     // 0–100, computed by cost function
}

export interface TriageResult {
  severity: 'CRITICAL' | 'MEDIUM' | 'LOW';
  summary: string;
  probable_condition: string;
  action_required: string;
  symptoms: string;
  confidence?: number;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  medicalId: string;
  emergencyContacts: Array<{
    name: string;
    relation: string;
    initials: string;
    color: string;
  }>;
}
