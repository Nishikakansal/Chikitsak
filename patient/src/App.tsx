import React, { useState } from 'react';
import { Screen, Hospital, TriageResult } from './types';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import Auth from './components/Auth';
import Home from './components/Home';
import HospitalList from './components/HospitalList';
import HospitalDetails from './components/HospitalDetails';
import Navigation from './components/Navigation';
import TriageInput from './components/TriageInput';
import TriageResultScreen from './components/TriageResult';
import Profile from './components/Profile';
import Settings from './components/Settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('SPLASH');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  const navigate = (newScreen: Screen) => {
    setScreen(newScreen);
    window.scrollTo(0, 0);
  };

  const handleHospitalClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    navigate('HOSPITAL_DETAILS');
  };

  const handleTriageResult = (result: TriageResult) => {
    setTriageResult(result);
    navigate('TRIAGE_RESULT');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'SPLASH':
        return <SplashScreen onComplete={() => navigate('ONBOARDING')} />;
      case 'ONBOARDING':
        return <Onboarding onNext={() => navigate('LOGIN')} onSkip={() => navigate('LOGIN')} />;
      case 'LOGIN':
      case 'SIGNUP':
        return <Auth onLogin={() => navigate('HOME')} onEmergency={() => navigate('TRIAGE_INPUT')} />;
      case 'HOME':
        return (
          <Home
            onServiceClick={(id) => id === 'ambulance' ? navigate('HOSPITAL_LIST') : navigate('HOME')}
            onEmergency={() => navigate('TRIAGE_INPUT')}
            onProfile={() => navigate('PROFILE')}
          />
        );
      case 'TRIAGE_INPUT':
        return (
          <TriageInput
            onBack={() => navigate('HOME')}
            onResult={handleTriageResult}
          />
        );
      case 'TRIAGE_RESULT':
        return (
          <TriageResultScreen
            result={triageResult}
            onFindHospital={() => navigate('HOSPITAL_LIST')}
            onBack={() => navigate('TRIAGE_INPUT')}
          />
        );
      case 'HOSPITAL_LIST':
        return (
          <HospitalList
            severity={triageResult?.severity ?? null}
            onHospitalClick={handleHospitalClick}
            onBack={() => navigate(triageResult ? 'TRIAGE_RESULT' : 'HOME')}
          />
        );
      case 'HOSPITAL_DETAILS':
        return selectedHospital ? (
          <HospitalDetails
            hospital={selectedHospital}
            onBack={() => navigate('HOSPITAL_LIST')}
            onNavigate={() => navigate('NAVIGATION')}
          />
        ) : null;
      case 'NAVIGATION':
        return selectedHospital ? (
          <Navigation hospital={selectedHospital} onBack={() => navigate('HOSPITAL_DETAILS')} />
        ) : null;
      case 'PROFILE':
        return <Profile />;
      case 'SETTINGS':
        return <Settings onLogout={() => navigate('LOGIN')} />;
      default:
        return <Home onServiceClick={() => {}} onEmergency={() => navigate('TRIAGE_INPUT')} onProfile={() => {}} />;
    }
  };

  return (
    <Layout currentScreen={screen} onNavigate={navigate}>
      {renderScreen()}
    </Layout>
  );
}
