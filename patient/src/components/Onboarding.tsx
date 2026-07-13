
import React from 'react';
import { motion } from 'motion/react';

interface OnboardingProps {
  onNext: () => void;
  onSkip: () => void;
}

export default function Onboarding({ onNext, onSkip }: OnboardingProps) {
  return (
    <div className="h-screen w-full bg-background-light dark:bg-background-dark flex flex-col overflow-hidden max-w-md mx-auto">
      <header className="flex items-center justify-between px-6 pt-12 pb-4 w-full z-10">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="CHIKITSAK logo" className="h-8 w-8 rounded-lg drop-shadow-sm" />
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">CHIKITSAK</span>
        </div>
        <button 
          onClick={onSkip}
          className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
        >
          Skip
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full px-6 relative">
        <div className="w-full aspect-square max-h-[400px] relative mb-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center opacity-50">
            <div className="w-64 h-64 bg-primary/10 rounded-full blur-3xl absolute -top-4 -left-4"></div>
            <div className="w-64 h-64 bg-primary/20 rounded-full blur-2xl absolute top-10 right-10"></div>
          </div>
          <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-sm p-8 flex items-center justify-center">
            <img 
              alt="AI Brain" 
              className="w-full h-full object-contain drop-shadow-xl" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd4EMJJonCXADmkiglXg3k0vna8Rr2F9eBafYWif3QybMdw3aWvFPCH7AtoYqXTKy0qL6O23D1BN8gSKxCwT3X1yVvPsXWkHhuCq1EM4_CPK1g57jnoVgn0xCO0CX-BIX2DXpbTJqAstCHf1SbLA9GPidd8__Vc2HQdIBX-epMn0Cmy4BS4_Xh8joALDpJ0ZYNWidG638hYWWS1l90hQanQMi_cXHmrqMsGwtYdAMgvS06s1IeL46oLqXgZdbgv9EUvC7JsGphKok"
            />
          </div>
        </div>

        <div className="text-center space-y-4 max-w-xs mx-auto z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
            <span className="material-symbols-outlined text-primary-dark dark:text-primary text-sm">psychology</span>
            <span className="text-xs font-semibold text-primary-dark dark:text-primary uppercase tracking-wide">Smart Triage</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            AI Predicts <br/><span className="text-primary-dark dark:text-primary">Priority</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Our intelligent system analyzes your symptoms in real-time to determine urgency levels instantly.
          </p>
        </div>
      </main>

      <footer className="w-full px-6 pb-10 pt-4">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary/30"></div>
            <div className="h-2 w-8 rounded-full bg-primary shadow-lg shadow-primary/30"></div>
            <div className="h-2 w-2 rounded-full bg-primary/30"></div>
          </div>
          <button 
            onClick={onNext}
            className="w-full group relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-900 dark:bg-primary p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            <span className="text-base font-bold text-white dark:text-slate-900 mr-2">Next</span>
            <span className="material-symbols-outlined text-white dark:text-slate-900 transition-transform group-hover:translate-x-1 text-sm font-bold">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
